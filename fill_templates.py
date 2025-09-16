#!/usr/bin/env python3
import json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def load_config():
  path = ROOT / "config.json"
  if not path.exists():
    raise SystemExit("config.json が見つかりません。config.json.example をコピーして値を埋めてください。")
  with path.open(encoding="utf-8") as f:
    return json.load(f)

def write_env(path, mapping):
  lines = []
  for k, v in mapping.items():
    lines.append(f"{k}={v}")
  path.write_text("\n".join(lines) + "\n", encoding="utf-8")
  print("wrote", path)

def main():
  cfg = load_config()
  env = cfg.get("env","test")
  dom = cfg["domain"][env]
  st = cfg["stripe"]
  sp = cfg["supabase"]
  ln = cfg["line"]
  stg = cfg.get("storage", {})
  slack = cfg.get("slack", {})

  # stripe_liff_demo/.env
  stripe_liff_env = {
    "STRIPE_SECRET_KEY": st["secret_key"],
    "PRICE_STANDARD": st["price_standard"],
    "PRICE_PREMIUM": st["price_premium"],
    "SUCCESS_URL": f"https://lp.{dom['base']}/success",
    "CANCEL_URL": f"https://lp.{dom['base']}/cancel",
    "PORT": "3000"
  }
  write_env(ROOT/"stripe_liff_demo/.env", stripe_liff_env)

  # line_bot_paywall_demo/.env
  bot_env = {
    "LINE_CHANNEL_ACCESS_TOKEN": ln["channel_access_token"],
    "LINE_CHANNEL_SECRET": ln["channel_secret"],
    "SUPABASE_URL": sp["url"],
    "SUPABASE_SERVICE_ROLE_KEY": sp["service_role_key"],
    "LIFF_SUBSCRIBE_URL": f"https://{dom['pay']}/",
    "LIFF_CANCEL_URL": f"https://{dom['cancel']}/cancel.html",
    "AWS_REGION": stg.get("region",""),
    "AWS_ACCESS_KEY_ID": stg.get("access_key_id",""),
    "AWS_SECRET_ACCESS_KEY": stg.get("secret_access_key",""),
    "S3_BUCKET": stg.get("bucket",""),
    "PORT": "3001"
  }
  write_env(ROOT/"line_bot_paywall_demo/.env", bot_env)

  # stripe_revenue_webhook_min/.env
  webhook_env = {
    "STRIPE_SECRET_KEY": st["secret_key"],
    "STRIPE_WEBHOOK_SECRET": st["webhook_secret"],
    "SUPABASE_URL": sp["url"],
    "SUPABASE_SERVICE_ROLE_KEY": sp["service_role_key"],
    "PORT": "3200"
  }
  write_env(ROOT/"stripe_revenue_webhook_min/.env", webhook_env)

  # patch LIFF_ID in stripe_liff_demo/public/index.html
  idx = (ROOT/"stripe_liff_demo/public/index.html").read_text(encoding="utf-8")
  idx = re.sub(r"LIFF_ID_TEST_SUBSCRIBE", ln["liff_subscribe_id"], idx)
  (ROOT/"stripe_liff_demo/public/index.html").write_text(idx, encoding="utf-8")
  print("patched LIFF_ID in public/index.html")

  # Summary
  print("\n完了：.env を生成し、LIFF ID を差し替えました。")
  print("次の手順：各ディレクトリで `npm i` → `node server.js` / Renderデプロイ")
  print(f"- pay: https://{dom['pay']}")
  print(f"- bot: https://{dom['bot']}")
  print(f"- notify: https://{dom['notify']}")

if __name__ == '__main__':
  main()
