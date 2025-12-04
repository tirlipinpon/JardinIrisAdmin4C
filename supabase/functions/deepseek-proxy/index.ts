/// <reference path="./deno.d.ts" />

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

const buildCorsHeaders = (origin: string | null): Record<string, string> => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});

const respondWithCors = (body: BodyInit | null, init: ResponseInit = {}, origin: string | null = null): Response => {
  const headers = new Headers(init.headers ?? {});
  Object.entries(buildCorsHeaders(origin)).forEach(([key, value]) => headers.set(key, value));
  if (body !== null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return new Response(body, { ...init, headers });
};

const parseJsonSafely = (payload: string): unknown => {
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return respondWithCors(null, { status: 204 }, origin);
  }

  if (!DEEPSEEK_API_KEY) {
    return respondWithCors(
      JSON.stringify({ error: 'DEEPSEEK_API_KEY is not configured in Supabase secrets.' }),
      { status: 500 },
      origin,
    );
  }

  try {
    const requestBody = await req.text();

    if (!requestBody) {
      return respondWithCors(
        JSON.stringify({ error: 'Request body is required.' }),
        { status: 400 },
        origin,
      );
    }

    const requestId = req.headers.get('x-request-id');
    const deepseekHeaders = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    });

    if (requestId) {
      deepseekHeaders.set('X-Request-ID', requestId);
    }

    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: deepseekHeaders,
      body: requestBody,
    });

    const deepseekPayload = await deepseekResponse.text();
    const parsedPayload = parseJsonSafely(deepseekPayload);

    if (!deepseekResponse.ok) {
      const errorBody =
        typeof parsedPayload === 'string'
          ? { error: parsedPayload }
          : parsedPayload;

      return respondWithCors(
        JSON.stringify({
          error: `DeepSeek API Error: ${deepseekResponse.status} ${deepseekResponse.statusText}`,
          details: errorBody,
        }),
        { status: deepseekResponse.status },
        origin,
      );
    }

    const successBody =
      typeof parsedPayload === 'string'
        ? { data: parsedPayload }
        : parsedPayload;

    return respondWithCors(JSON.stringify(successBody), { status: 200 }, origin);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in deepseek-proxy:', errorMessage);
    return respondWithCors(JSON.stringify({ error: errorMessage }), { status: 500 }, origin);
  }
});

