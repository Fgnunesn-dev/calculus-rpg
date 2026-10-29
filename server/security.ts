import { Request, Response, NextFunction } from 'express';
export function rateLimit(maximum: number, windowMs: number, clock = Date.now) {
  const windows = new Map<string, { count: number; until: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = clock(), key = res.locals.uid || req.ip || 'unknown';
    let entry = windows.get(key);
    if (!entry || entry.until <= now) {
      if (windows.size >= 10000) for (const [id, value] of windows) { if (value.until <= now) windows.delete(id); }
      if (windows.size >= 10000) { res.status(503).json({ error: 'Servidor ocupado. Tente novamente mais tarde.' }); return; }
      entry = { count: 0, until: now + windowMs }; windows.set(key, entry);
    }
    if (++entry.count > maximum) { res.setHeader('Retry-After', String(Math.ceil((entry.until - now) / 1000))); res.status(429).json({ error: 'Limite de uso atingido. Aguarde antes de tentar novamente.' }); return; }
    next();
  };
}
export function matchesFileType(buffer: Buffer, mime: string) {
  if (mime === 'application/pdf') return buffer.subarray(0, 5).toString() === '%PDF-';
  if (mime === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  return ['image/jpeg', 'image/jpg'].includes(mime) && buffer.length >= 4 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
}
export function checkUpload(req: Request, res: Response, next: NextFunction) {
  if (req.file && !matchesFileType(req.file.buffer, req.file.mimetype)) { res.status(400).json({ error: 'O conteúdo não corresponde a um PDF, JPG ou PNG válido.' }); return; }
  next();
}
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://*.google.com; frame-src https://*.firebaseapp.com https://accounts.google.com https://*.google.com; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com; frame-ancestors 'self'");
  next();
}
