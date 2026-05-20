function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

async function readJson(request) {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return null;
  }
}

function checkPassword(body, env) {
  const required = env.DATA_PASSWORD || '';
  if (!required) return true;
  return body && body.password === required;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return jsonResponse(405, { success: false, ok: false, message: 'Метод не разрешён' });
  }

  const body = await readJson(request);
  if (!body) return jsonResponse(400, { success: false, ok: false, message: 'Некорректный JSON' });
  if (!checkPassword(body, env)) return jsonResponse(401, { success: false, ok: false, message: 'Неверный пароль облака' });

  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return jsonResponse(500, {
      success: false,
      ok: false,
      message: 'В Cloudflare не задана переменная TELEGRAM_BOT_TOKEN'
    });
  }

  const chatId = String(body.chatId || '').trim();
  const text = String(body.text || '');

  if (!chatId) return jsonResponse(400, { success: false, ok: false, message: 'Не указан Telegram ID' });
  if (!text) return jsonResponse(400, { success: false, ok: false, message: 'Пустое сообщение' });

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    })
  });

  const result = await telegramResponse.json().catch(() => ({ ok: false, description: 'Telegram вернул не JSON' }));

  if (!telegramResponse.ok || !result.ok) {
    return jsonResponse(telegramResponse.status || 500, {
      success: false,
      ok: false,
      message: result.description || 'Telegram API error',
      description: result.description || 'Telegram API error'
    });
  }

  return jsonResponse(200, { success: true, ok: true, result });
}
