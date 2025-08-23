// Ленивые интеграции трекеров - не падают без ключей
export interface TrackerResponse {
  ok: boolean;
  skipped?: boolean;
  data?: unknown;
}

export async function sendPostbackToKeitaro(url: string, params: Record<string, unknown>): Promise<TrackerResponse> {
  if (!process.env.KEITARO_TOKEN) {
    console.warn('[TRACKER] KEITARO_TOKEN not set — skipping postback (noop)');
    return { ok: true, skipped: true };
  }

  try {
    // Реальный запрос к Keitaro
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KEITARO_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    return { ok: response.ok, _data: await response.json().catch(() => ({})) };
  } catch (error) {
    console.error('[TRACKER] Keitaro error:', error);
    return { ok: false };
  }
}

export async function sendPostbackToVoluum(url: string, _params: Record<string, unknown>): Promise<TrackerResponse> {
  if (!process.env.VOLUUM_TOKEN) {
    console.warn('[TRACKER] VOLUUM_TOKEN not set — skipping postback (noop)');
    return { ok: true, skipped: true };
  }

  try {
    // Реальный запрос к Voluum
    const response = await fetch(url, {
      method: 'GET', // Voluum обычно использует GET
      headers: {
        'Authorization': `Bearer ${process.env.VOLUUM_TOKEN}`
      }
    });

    return { ok: response.ok, _data: await response.text().catch(() => '') };
  } catch (error) {
    console.error('[TRACKER] Voluum error:', error);
    return { ok: false };
  }
}

export async function sendPostbackToBinom(url: string, _params: Record<string, unknown>): Promise<TrackerResponse> {
  if (!process.env.BINOM_TOKEN) {
    console.warn('[TRACKER] BINOM_TOKEN not set — skipping postback (noop)');
    return { ok: true, skipped: true };
  }

  try {
    // Реальный запрос к Binom
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.BINOM_TOKEN}`
      }
    });

    return { ok: response.ok, _data: await response.text().catch(() => '') };
  } catch (error) {
    console.error('[TRACKER] Binom error:', error);
    return { ok: false };
  }
}

export async function sendPostbackToRedtrack(url: string, params: Record<string, unknown>): Promise<TrackerResponse> {
  if (!process.env.REDTRACK_TOKEN) {
    console.warn('[TRACKER] REDTRACK_TOKEN not set — skipping postback (noop)');
    return { ok: true, skipped: true };
  }

  try {
    // Реальный запрос к RedTrack
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REDTRACK_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    return { ok: response.ok, _data: await response.json().catch(() => ({})) };
  } catch (error) {
    console.error('[TRACKER] RedTrack error:', error);
    return { ok: false };
  }
}

// Универсальная функция для любого постбека
export async function sendPostback(url: string, _params: Record<string, unknown> = {}): Promise<TrackerResponse> {
  if (!url) {
    console.warn('[POSTBACK] endpoint not configured');
    return { ok: true, skipped: true };
  }

  try {
    const response = await fetch(url, {
      method: 'GET', // По умолчанию GET для большинства трекеров
      headers: {
        'User-Agent': 'ArbiConnect-Postback/1.0'
      }
    });

    return { ok: response.ok, _data: await response.text().catch(() => '') };
  } catch (error) {
    console.error('[POSTBACK] Generic postback error:', error);
    return { ok: false };
  }
}
