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
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        passwordHash,
        role: data.role ?? 'reporter',
      },
    });

    const token = signToken({ sub: user.id, role: user.role, isAnonymous: false });
    return { token, user: { id: user.id, name: user.name, role: user.role } };
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
