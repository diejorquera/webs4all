// Worker de webs4all.cl: atiende /api/contact; el resto lo sirven los assets estáticos (dist/).
import { handleContact } from './contact.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') {
      if (request.method === 'POST') return handleContact(request, env);
      return new Response(JSON.stringify({ ok: false, error: 'Método no permitido.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
