# スモークテスト用コード（値埋め自動化つき）

このフォルダは、先の `smoketest_code_bundle` をベースに、**config.json から一括で .env を生成**し、
LIFF ID などのプレースホルダを自動置換する仕組みを追加したものです。

## 使い方
1) `config.json.example` をコピーして `config.json` を作成、あなたの値で埋める
2) `python3 fill_templates.py` を実行
   - `stripe_liff_demo/.env` / `line_bot_paywall_demo/.env` / `stripe_revenue_webhook_min/.env` が生成
   - `stripe_liff_demo/public/index.html` の LIFF ID が置換されます
3) それぞれのフォルダで `npm i` → `node server.js`（Renderは Start Command に設定）

## config.json の主な項目
- `domain.test` / `domain.prod` … サブドメイン名を定義（pay/bot/notify/cancel）
- `stripe.secret_key` / `webhook_secret` / `price_*` … Stripe のキー/Price ID
- `supabase.url` / `service_role_key` … Supabase の接続情報
- `line.*` … LINEチャネルと LIFF ID
- `storage.*` … S3/GCS の署名URL配布用（任意）

## 注意
- このスモークテスト版のWebhookは **最小構成** です（台帳やPortalは未実装）。
  本番では、以前お渡ししたパック（収益台帳・解約アンケート・Slack通知など）と置き換えてください。
