import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const rawUsername = req.body?.username;
    const rawPassword = req.body?.password;
    const rawId = req.body?.id;

    const username = typeof rawUsername === 'string' ? rawUsername.trim() : undefined;
    const password = typeof rawPassword === 'string' ? rawPassword.trim() : '';
    const id = typeof rawId === 'string' ? rawId.trim() : undefined;

    let user;

    // Admin login
    if (username === 'admin' && password === 'admin123') {
      user = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (!user) {
        // Create default admin if not exists
        user = await prisma.user.create({
          data: {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            role: 'ADMIN'
          }
        });
      }
    } else {
      // Candidate login
      user = await prisma.user.findUnique({
        where: { id: id }
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
