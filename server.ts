import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Server-side Admin Configuration
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'beingmagrajpvt@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@beingmagraj21';

// In-memory active admin sessions: token -> { email, expiresAt }
const adminSessions = new Map<string, { email: string; expiresAt: number }>();

// Periodically clean up expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt < now) {
      adminSessions.delete(token);
    }
  }
}, 5 * 60 * 1000);

// API route: Return public admin config (ONLY safe public email, NEVER passwords or secrets)
app.get('/api/admin/config', (_req, res) => {
  res.json({
    adminEmail: ADMIN_EMAIL,
  });
});

// API route: Secure Server-side Admin Login
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const rawPassword = String(password);

    // Strict email check
    if (normalizedEmail !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Unapproved email address. Only the authorized administrator email may log in.',
      });
    }

    // Strict password verification on server
    const isPasswordValid = rawPassword === ADMIN_PASSWORD;

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Invalid administrator password.',
      });
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity

    adminSessions.set(token, {
      email: ADMIN_EMAIL,
      expiresAt,
    });

    return res.json({
      success: true,
      message: 'Admin authorization verified.',
      token,
      email: ADMIN_EMAIL,
      expiresAt,
    });
  } catch (err: any) {
    console.error('Admin authentication error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.',
    });
  }
});

// API route: Verify Session Token
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.query.token as string);

  if (!token) {
    return res.status(401).json({ authorized: false, message: 'No session token provided' });
  }

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({ authorized: false, message: 'Session expired or invalid' });
  }

  return res.json({
    authorized: true,
    email: session.email,
  });
});

// API route: Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.body?.token as string);

  if (token) {
    adminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Start Express server and attach Vite
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (dev: ${!isProd})`);
  });
}

startServer();
