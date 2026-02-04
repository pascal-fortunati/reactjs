import jwt from 'jsonwebtoken';

// Middleware d'authentification basé sur JWT
export function requireAuth(req, res, next) {
  const header = typeof req.headers?.authorization === 'string' ? req.headers.authorization : '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET manquant' });
  }

  try {
    const payload = jwt.verify(token, secret);
    const userId = typeof payload?.sub === 'string' ? payload.sub : null;
    if (!userId) return res.status(401).json({ error: 'Token invalide' });

    req.user = {
      id: userId,
      email: typeof payload?.email === 'string' ? payload.email : undefined,
    };

    return next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}