import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { JwtPayload } from '../middleware/auth';
import { UserRole } from '@prisma/client';

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export const authService = {
  async register(data: {
    name: string;
    phone: string;
    password: string;
    role?: UserRole;
  }) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw Object.assign(new Error('Phone already registered'), { status: 409 });

    const passwordHash = await bcrypt.hash(data.password, 12);
    const role = data.role ?? 'reporter';

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name: data.name, phone: data.phone, passwordHash, role },
      });

      // Auto-create a linked Officer record so the user appears in assignment lists.
      // Badge and district are placeholders — admin can update via PATCH /api/officers/:id.
      if (role === 'officer') {
        const badge = `TMP-${newUser.id.slice(-6).toUpperCase()}`;
        await tx.officer.create({
          data: {
            name: data.name,
            badge,
            district: 'Unassigned',
            region: 'Unassigned',
            role: 'social_worker',
            languages: ['English'],
            phone: data.phone,
            userId: newUser.id,
          },
        });
      }

      return newUser;
    });

    // Fetch the linked officer id (if created)
    const officer = role === 'officer'
      ? await prisma.officer.findUnique({ where: { userId: user.id }, select: { id: true } })
      : null;

    const token = signToken({ sub: user.id, role: user.role, isAnonymous: false });
    return {
      token,
      user: { id: user.id, name: user.name, role: user.role, officerId: officer?.id },
    };
  },

  async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { officer: { select: { id: true } } },
    });
    if (!user || !user.passwordHash) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const token = signToken({ sub: user.id, role: user.role, isAnonymous: false });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        officerId: user.officer?.id,
      },
    };
  },

  async loginAnonymous() {
    const user = await prisma.user.create({
      data: { isAnonymous: true, role: 'reporter' },
    });
    const token = signToken({ sub: user.id, role: 'reporter', isAnonymous: true });
    return { token, user: { id: user.id, role: 'reporter' as UserRole, isAnonymous: true } };
  },

  async savePushToken(userId: string, expoPushToken: string) {
    await prisma.user.update({ where: { id: userId }, data: { expoPushToken } });
  },
};
