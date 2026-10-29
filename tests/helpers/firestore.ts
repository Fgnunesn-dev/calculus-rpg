export function fakeFirestore() {
  const documents = new Map<string, any>();
  const requests: { url: string; token: string; method: string }[] = [];
  const transport: typeof fetch = async (input, init) => {
    const url = String(input), token = new Headers(init?.headers).get('Authorization')?.replace('Bearer ', '') || '';
    const owner = decodeURIComponent(url.match(/\/users\/([^/:]+)(?:\/|:)/)?.[1] || '');
    const method = init?.method || 'GET'; requests.push({ url, token, method });
    if (owner !== token) return Response.json({ error: 'private-provider-details' }, { status: 403 });
    if (url.endsWith(':runQuery')) {
      const query = JSON.parse(String(init?.body)).structuredQuery;
      const prefix = url.replace(':runQuery', '') + '/' + query.from[0].collectionId + '/';
      return Response.json([...documents.entries()].filter(([name]) => name.startsWith(prefix)).sort((a, b) => b[1].createdAt.stringValue.localeCompare(a[1].createdAt.stringValue)).slice(0, query.limit).map(([name, fields]) => ({ document: { name, fields } })));
    }
    if (method === 'PATCH') { const value = JSON.parse(String(init?.body)); documents.set(url, value.fields); return Response.json(value); }
    if (method === 'DELETE') { documents.delete(url); return new Response(null, { status: 204 }); }
    return Response.json({ error: 'not-found' }, { status: 404 });
  };
  return { transport, requests, documents };
}
