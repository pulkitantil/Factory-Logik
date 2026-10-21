
import 'dotenv/config';
import { randomInt, createHash } from 'node:crypto';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

if (!JWT_SECRET || !ADMIN_JWT_SECRET) {
  throw new Error('JWT_SECRET and ADMIN_JWT_SECRET must be configured.');
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const configuredAdminEmail = () =>
  process.env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase() || '';

const createMailer = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const hashOtp = (otp: string) =>
  createHash('sha256').update(otp).digest('hex');

const createAdminToken = (admin: {
  id: string;
  email: string;
  role: string;
  permissions: string;
}) =>
  jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      tokenType: 'admin',
    },
    ADMIN_JWT_SECRET!,
    { expiresIn: '2h' }
  );

const getConfiguredAdmin = async (email: string) => {
  if (!configuredAdminEmail() || email !== configuredAdminEmail()) {
    return null;
  }

  return prisma.admin.findUnique({ where: { email } });
};

const sendAdminOtp = async (
  email: string,
  purpose: 'SETUP' | 'LOGIN'
) => {
  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');

  // Invalidate previous unused challenges for this email and purpose.
  await prisma.adminAuthChallenge.updateMany({
    where: {
      email,
      purpose,
      consumedAt: { isSet: false },
    },
    data: { consumedAt: new Date() },
  });

  const challenge = await prisma.adminAuthChallenge.create({
    data: {
      email,
      otpHash: hashOtp(otp),
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  try {
    const mailer = createMailer();

    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_OTP_EMAIL,
      subject: purpose === 'SETUP'
        ? 'Voltrix Admin — Password Setup OTP'
        : 'Voltrix Admin — Login Verification OTP',
      text: `Your Voltrix admin verification code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
    });

    return challenge;
  } catch (error) {
    // Do not leave a usable challenge if email delivery fails.
    await prisma.adminAuthChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    throw error;
  }
};

// CUSTOMER AUTHENTICATION — preserved
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        role: 'USER',
      },
    });

    await prisma.cart.create({ data: { userId: user.id } });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        addresses: { orderBy: { isDefault: 'desc' } },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { items: true, tracking: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
};

// ADMIN: first-time password setup — request OTP
export const requestAdminSetupOtp = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const email =
      typeof req.body.email === 'string'
        ? normalizeEmail(req.body.email)
        : '';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const admin = await getConfiguredAdmin(email);

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin setup is not available for this account.',
      });
    }

    if (admin.passwordSetAt) {
      return res.status(409).json({
        success: false,
        message: 'Password is already configured. Use admin login.',
      });
    }

    if (!process.env.ADMIN_OTP_EMAIL) {
      return res.status(503).json({
        success: false,
        message: 'Admin OTP delivery is not configured.',
      });
    }

    const challenge = await sendAdminOtp(email, 'SETUP');

    return res.json({
      success: true,
      message: 'Setup OTP sent if email delivery is configured.',
      challengeId: challenge.id,
    });
  } catch (error) {
    console.error('Admin setup OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send setup OTP.',
    });
  }
};

// ADMIN: verify first-time setup OTP
export const verifyAdminSetupOtp = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { challengeId, otp } = req.body;

    if (
      typeof challengeId !== 'string' ||
      typeof otp !== 'string' ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid challenge ID and six-digit OTP are required.',
      });
    }

    const challenge = await prisma.adminAuthChallenge.findUnique({
      where: { id: challengeId },
    });

    if (
      !challenge ||
      challenge.purpose !== 'SETUP' ||
      challenge.consumedAt ||
      challenge.expiresAt <= new Date() ||
      challenge.attempts >= 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP is invalid or expired. Request a new code.',
      });
    }

    if (hashOtp(otp) !== challenge.otpHash) {
      await prisma.adminAuthChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    await prisma.adminAuthChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    const setupToken = jwt.sign(
      {
        id: challenge.id,
        email: challenge.email,
        tokenType: 'admin-password-setup',
      },
      ADMIN_JWT_SECRET!,
      { expiresIn: '10m' }
    );

    return res.json({
      success: true,
      message: 'OTP verified. Set your admin password.',
      setupToken,
    });
  } catch (error) {
    console.error('Admin setup verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify setup OTP.',
    });
  }
};

// ADMIN: set the initial password after OTP verification
export const completeAdminSetup = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const header = req.headers.authorization;
    const setupToken = header?.startsWith('Bearer ')
      ? header.slice(7)
      : '';

    if (!setupToken) {
      return res.status(401).json({
        success: false,
        message: 'Setup verification is required.',
      });
    }

    let claims: jwt.JwtPayload;

    try {
      const decoded = jwt.verify(setupToken, ADMIN_JWT_SECRET!);

      if (
        typeof decoded === 'string' ||
        decoded.tokenType !== 'admin-password-setup' ||
        typeof decoded.id !== 'string' ||
        typeof decoded.email !== 'string'
      ) {
        throw new Error('Invalid setup token.');
      }

      claims = decoded;
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Setup session is invalid or expired. Verify OTP again.',
      });
    }

    const { password } = req.body;

    if (
      typeof password !== 'string' ||
      password.length < 12 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 12 and 128 characters.',
      });
    }

    const challenge = await prisma.adminAuthChallenge.findUnique({
      where: { id: claims.id as string },
    });

    if (
      !challenge ||
      challenge.purpose !== 'SETUP' ||
      !challenge.consumedAt ||
      challenge.email !== claims.email
    ) {
      return res.status(401).json({
        success: false,
        message: 'Setup verification is no longer valid.',
      });
    }

    const admin = await getConfiguredAdmin(challenge.email);

    if (!admin || admin.passwordSetAt) {
      return res.status(409).json({
        success: false,
        message: 'Admin password has already been configured.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updated = await prisma.admin.updateMany({
      where: {
        id: admin.id,
        passwordSetAt: { isSet: false },
      },
      data: {
        password: hashedPassword,
        passwordSetAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      return res.status(409).json({
        success: false,
        message: 'Password setup could not be completed. Try logging in.',
      });
    }

    return res.json({
      success: true,
      message: 'Admin password set successfully. Log in to continue.',
    });
  } catch (error) {
    console.error('Admin password setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to set admin password.',
    });
  }
};

// ADMIN: verify password, then send login OTP
export const requestAdminLoginOtp = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const admin = await getConfiguredAdmin(normalizedEmail);

    if (
      !admin ||
      !admin.passwordSetAt ||
      !(await bcrypt.compare(password, admin.password))
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials or password setup is incomplete.',
      });
    }

    if (!process.env.ADMIN_OTP_EMAIL) {
      return res.status(503).json({
        success: false,
        message: 'Admin OTP delivery is not configured.',
      });
    }

    const challenge = await sendAdminOtp(normalizedEmail, 'LOGIN');

    return res.json({
      success: true,
      message: 'Verification code sent.',
      challengeId: challenge.id,
    });
  } catch (error) {
    console.error('Admin login OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to start admin login.',
    });
  }
};

// ADMIN: verify login OTP and issue the admin JWT
export const verifyAdminLoginOtp = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { challengeId, otp } = req.body;

    if (
      typeof challengeId !== 'string' ||
      typeof otp !== 'string' ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid challenge ID and six-digit OTP are required.',
      });
    }

    const challenge = await prisma.adminAuthChallenge.findUnique({
      where: { id: challengeId },
    });

    if (
      !challenge ||
      challenge.purpose !== 'LOGIN' ||
      challenge.consumedAt ||
      challenge.expiresAt <= new Date() ||
      challenge.attempts >= 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP is invalid or expired. Request a new code.',
      });
    }

    if (hashOtp(otp) !== challenge.otpHash) {
      await prisma.adminAuthChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    // Consume the challenge before issuing a token.
    const consumed = await prisma.adminAuthChallenge.updateMany({
      where: {
        id: challenge.id,
        consumedAt: { isSet: false },
        attempts: { lt: 5 },
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });

    if (consumed.count !== 1) {
      return res.status(400).json({
        success: false,
        message: 'OTP has already been used or expired.',
      });
    }

    const admin = await getConfiguredAdmin(challenge.email);

    if (!admin || !admin.passwordSetAt) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is not configured.',
      });
    }

    const token = createAdminToken(admin);

    return res.json({
      success: true,
      message: 'Admin authenticated successfully.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify admin login.',
    });
  }
};
