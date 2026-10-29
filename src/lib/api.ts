import { auth } from './firebase';
export async function privateFetch(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Entre com Google para acessar seus documentos e provas.');
  const token = await user.getIdToken();
  const headers = new Headers(options.headers); headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers });
}
export async function openPrivateFile(url: string) {
  const response = await privateFetch(url);
  if (!response.ok) throw new Error('Não foi possível abrir o documento.');
  const objectUrl = URL.createObjectURL(await response.blob());
  const a = document.createElement('a'); a.href = objectUrl; a.target = '_blank'; a.rel = 'noopener'; a.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
