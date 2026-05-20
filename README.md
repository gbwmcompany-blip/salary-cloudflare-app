# Salary App — Cloudflare Pages version

Файлы проекта для Cloudflare Pages.

Структура:

```txt
index.html
package.json
functions/api/save-data.js
functions/api/load-data.js
functions/api/send-telegram.js
```

API:

- `/api/save-data` — сохранить данные в Cloudflare KV
- `/api/load-data` — загрузить данные из Cloudflare KV
- `/api/send-telegram` — отправить сообщение Telegram через Cloudflare Pages Function

Нужные переменные Cloudflare:

- `DATA_PASSWORD` — пароль для облака
- `TELEGRAM_BOT_TOKEN` — токен Telegram-бота

Нужный KV binding:

- Variable name: `SALARY_KV`
