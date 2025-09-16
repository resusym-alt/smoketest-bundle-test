# スモークテスト用コードひな形（Render向け）

このバンドルには、最小構成の 3 サービスが含まれます：

1) stripe_liff_demo … 課金ページ（Stripe Checkout）
2) line_bot_paywall_demo … LINE Bot（「書式DL」→ 課金誘導 / 有料判定）
3) stripe_revenue_webhook_min … Webhookで user_plans を active に更新

## 手順（超要約）
- 各フォルダで `npm i` → `.env.example` を `.env` にコピーして値を設定 → `node server.js`
- Render では「Start Command」を `node server.js` に設定
- `line_bot_paywall_demo` の LIFF_SUBSCRIBE_URL を **stripe_liff_demo** のURLに合わせてください
- Stripe ダッシュボードで Webhook に **stripe_revenue_webhook_min** の `/webhook` を登録

## 補足
- 本番では収益台帳・解約アンケート・Slack通知・ダッシュボード等のパックに差し替え推奨
