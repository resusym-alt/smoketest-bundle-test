// bot_server.js (line_bot_paywall_demo)
import 'dotenv/config';
import express from 'express';
import { Client, middleware } from '@line/bot-sdk';
import { createClient } from '@supabase/supabase-js';

const app = express();
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const line = new Client(config);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

app.post('/webhook', middleware(config), async (req, res) => {
  const events = req.body.events;
  await Promise.all(events.map(handleEvent));
  res.json({ ok: true });
});

async function handleEvent(event){
  if (event.type !== 'message' || event.message.type !== 'text') return;
  const userId = event.source?.userId;
  const text = (event.message.text || '').trim();

  if (text.match(/^(書式DL|ダウンロード|download)$/i)) {
    // 課金チェック
    const { data } = await supabase
      .from('user_plans')
      .select('status,plan')
      .eq('line_user_id', userId)
      .order('updated_at', { ascending:false })
      .limit(1);
    const active = data && data[0] && data[0].status === 'active';

    if (active) {
      // 実装簡略化：実際はS3署名URLを返す
      return line.replyMessage(event.replyToken, {
        type:'text',
        text:'有効会員です。ダウンロードリンク：\nhttps://example.com/your-signed-url (擬似)'
      });
    } else {
      const url = process.env.LIFF_SUBSCRIBE_URL || 'https://example.com/subscribe';
      return line.replyMessage(event.replyToken, {
        type: 'flex',
        altText: 'ご利用にはお申し込みが必要です',
        contents: {
          type: 'bubble',
          body: {
            type: 'box', layout: 'vertical', spacing: '12px',
            contents: [
              { type:'text', text:'有料プランのご案内', weight:'bold', size:'lg' },
              { type:'text', text:'書式のダウンロードにはご契約が必要です。', size:'sm', wrap:true },
              { type:'button', style:'primary', action:{ type:'uri', label:'申し込む（テスト）', uri: url } }
            ]
          }
        }
      });
    }
  } else if (text.match(/^(解約)$/)) {
    const url = process.env.LIFF_CANCEL_URL || 'https://cancel.test-domain.com/cancel.html';
    return line.replyMessage(event.replyToken, {
      type:'text',
      text:`解約はこちら（アンケート後、ポータルへ遷移）：\n${url}`
    });
  } else {
    return line.replyMessage(event.replyToken, { type:'text', text:'「書式DL」と送るとダウンロード案内をします。' });
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('line_bot_paywall_demo on http://localhost:'+PORT));
