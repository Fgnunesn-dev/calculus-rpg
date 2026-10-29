import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';
import config from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp({ projectId: config.projectId }, 'api-auth');
export function createRequireUser(verify: (token: string) => Promise<{ uid: string }>) {
return async function requireUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Entre com Google para continuar.' }); return; }
  try {
    const token = await verify(header.slice(7));
    res.locals.uid = token.uid; next();
  } catch { res.status(401).json({ error: 'Sessão inválida ou expirada. Entre novamente.' }); }
}
}
export const requireUser = createRequireUser(token => getAuth(app).verifyIdToken(token));
