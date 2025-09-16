// server.js (stripe_liff_demo)
// npm i
// node server.js
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Checkoutセッション作成
app.post('/create-checkout-session', async (req, res) => {
  try {
    const plan = (req.body?.plan || 'standard').toLowerCase();
    const price = plan === 'premium' ? process.env.PRICE_PREMIUM : process.env.PRICE_STANDARD;
    const clientRef = req.body?.lineUserId || 'anonymous';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: process.env.SUCCESS_URL || 'https://example.com/success',
      cancel_url: process.env.CANCEL_URL || 'https://example.com/cancel',
      line_items: [{ price, quantity: 1 }],
      client_reference_id: clientRef,
      // 後段のWebhookで plan を拾えるように metadata に入れる
      metadata: { plan }
    });
    res.json({ ok: true, url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'create_session_failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('stripe_liff_demo on http://localhost:'+PORT));
