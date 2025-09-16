// server.js (stripe_revenue_webhook_min)
// 最小構成：checkout.session.completed を受けて user_plans を active に更新
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.sendStatus(400);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const plan = s.metadata?.plan || 'standard';
      const lineUserId = s.client_reference_id || null;
      // user_plans を active にする（存在すれば更新、なければ作成）
      const payload = {
        line_user_id: lineUserId,
        plan,
        status: 'active',
        current_period_end: null
      };
      // upsert 代替（line_user_id の最新1件を更新）
      const { data, error } = await supabase
        .from('user_plans')
        .select('id')
        .eq('line_user_id', lineUserId)
        .limit(1);
      if (error) console.warn(error);
      if (data && data.length) {
        await supabase.from('user_plans').update(payload).eq('line_user_id', lineUserId);
      } else {
        await supabase.from('user_plans').insert(payload);
      }
      console.log('user_plans updated for', lineUserId);
    }
  } catch (e) {
    console.error('handler error:', e);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log('stripe_revenue_webhook_min on http://localhost:'+PORT));
