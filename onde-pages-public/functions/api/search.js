const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}});
export async function onRequestGet({request, env}) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const token = url.searchParams.get('pageToken') || '';
  if (!q || q.length > 180 || token.length > 512) return json({error:'Recherche invalide'}, 400);
  if (!env.YOUTUBE_API_KEY) return json({error:'La recherche n’est pas encore configurée par le propriétaire'}, 503);
  const cacheUrl = new URL('/__search_cache', url.origin);
  cacheUrl.searchParams.set('q', q.toLocaleLowerCase('fr'));
  cacheUrl.searchParams.set('pageToken', token);
  const cacheKey = new Request(cacheUrl.toString());
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;
  // Optional Cloudflare rate-limiter binding; not enabled by default.
  if (env.SEARCH_RATE_LIMITER) {
    const {success} = await env.SEARCH_RATE_LIMITER.limit({key: request.headers.get('CF-Connecting-IP') || 'unknown'});
    if (!success) return json({error:'Trop de recherches. Réessaie dans un instant.'}, 429);
  }
  const params = new URLSearchParams({part:'snippet',type:'video',videoEmbeddable:'true',videoCategoryId:'10',maxResults:'12',q,key:env.YOUTUBE_API_KEY});
  if(token) params.set('pageToken',token);
  try {
    const upstream = await fetch('https://www.googleapis.com/youtube/v3/search?' + params);
    const data = await upstream.json();
    if (!upstream.ok) {
      const reason = data.error?.errors?.[0]?.reason;
      return json({error: reason === 'quotaExceeded' || reason === 'dailyLimitExceeded' ? 'Quota YouTube épuisé pour le moment' : 'Service YouTube indisponible ou configuration à vérifier'}, 503);
    }
    const body = {items:(data.items || []).map(x=>({id:x.id,snippet:{title:x.snippet.title,channelTitle:x.snippet.channelTitle,thumbnails:x.snippet.thumbnails}})),nextPageToken:data.nextPageToken || ''};
    const response = new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=900','X-Content-Type-Options':'nosniff'}});
    await caches.default.put(cacheKey,response.clone());
    return response;
  } catch {return json({error:'Connexion à YouTube impossible pour le moment'},502)}
}
