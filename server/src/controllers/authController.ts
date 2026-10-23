
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

// Helper: Send Customer Registration / Verification OTP
const sendCustomerOtp = async (
  email: string,
  purpose: 'REGISTRATION' | 'VERIFICATION',
  additionalData?: { name?: string; passwordHash?: string; phone?: string }
) => {
  const normalizedEmail = normalizeEmail(email);

  // Check 60-second cooldown from the most recent challenge
  const latestChallenge = await prisma.userAuthChallenge.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (latestChallenge) {
    const elapsedMs = Date.now() - new Date(latestChallenge.createdAt).getTime();
    if (elapsedMs < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - elapsedMs) / 1000);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    }
  }

  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');

  // Invalidate previous unused challenges for this email and purpose
  await prisma.userAuthChallenge.updateMany({
    where: {
      email: normalizedEmail,
      purpose,
      consumedAt: { isSet: false },
    },
    data: { consumedAt: new Date() },
  });

  const challenge = await prisma.userAuthChallenge.create({
    data: {
      email: normalizedEmail,
      otpHash: hashOtp(otp),
      purpose,
      name: additionalData?.name,
      password: additionalData?.passwordHash,
      phone: additionalData?.phone,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    },
  });

  try {
    const mailer = createMailer();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'info3factorylogik@gmail.com';

    await mailer.sendMail({
      from: `"Factorylogik and Controls" <${fromAddress}>`,
      to: normalizedEmail,
      subject: purpose === 'REGISTRATION'
        ? 'Factorylogik and Controls — Email Verification Code'
        : 'Factorylogik and Controls — Verification Code',
      text: `Hello,\n\nYour 6-digit email verification code for Factorylogik and Controls is:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this verification, please safely ignore this email.\n\nBest regards,\nFactorylogik and Controls Team\nJaipur, Rajasthan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; rounded-2xl; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #111111; margin: 0; font-size: 20px; font-weight: 800;">FACTORYLOGIK <span style="color: #FF5A1F;">&amp; CONTROLS</span></h2>
            <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0;">Industrial Automation Products &amp; Services • Jaipur, Rajasthan</p>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #f3f4f6;">
            <p style="color: #374151; font-size: 14px; margin-top: 0;">Here is your 6-digit email verification code:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #111111; background: #ffffff; padding: 12px 24px; display: inline-block; border-radius: 8px; border: 1px dashed #d1d5db; margin: 8px 0;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 24px;">If you did not create an account with Factorylogik and Controls, please disregard this email.</p>
        </div>
      `,
    });

    return challenge;
  } catch (error) {
    // Invalidate challenge immediately if mail delivery failed so unverified attempt isn't left hanging
    await prisma.userAuthChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    throw error;
  }
};

// CUSTOMER AUTHENTICATION — Step 1: Initiate Registration & Send OTP
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email Address, and Password are required.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Send 6-digit OTP to customer's email
    await sendCustomerOtp(normalizedEmail, 'REGISTRATION', {
      name: name.trim(),
      passwordHash: hashedPassword,
      phone: phone?.trim() || null,
    });

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      email: normalizedEmail,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
    });
  } catch (error: any) {
    console.error('Register/Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to send verification code. Please check your email or try again.',
    });
  }
};

// CUSTOMER AUTHENTICATION — Step 2: Verify OTP and Activate/Create Account
export const verifyCustomerRegistrationOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const cleanedOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanedOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code must be exactly 6 digits.',
      });
    }

    // Find the latest active challenge for this email
    const challenge = await prisma.userAuthChallenge.findFirst({
      where: {
        email: normalizedEmail,
        consumedAt: { isSet: false },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'No active verification code found. Please request a new one.',
      });
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      await prisma.userAuthChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    if (challenge.attempts >= 5) {
      await prisma.userAuthChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      });
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      });
    }

    const providedHash = hashOtp(cleanedOtp);
    if (providedHash !== challenge.otpHash) {
      await prisma.userAuthChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = 5 - (challenge.attempts + 1);
      return res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt(s) remaining.`
          : 'Invalid verification code. Maximum attempts exceeded. Please request a new code.',
      });
    }

    // OTP is valid! Invalidate the challenge immediately to prevent reuse
    await prisma.userAuthChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    // Check if user record already exists
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Mark existing unverified user as verified
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          ...(challenge.password ? { password: challenge.password } : {}),
          ...(challenge.name ? { name: challenge.name } : {}),
        },
      });
    } else {
      if (!challenge.name || !challenge.password) {
        return res.status(400).json({
          success: false,
          message: 'Registration session expired. Please register again.',
        });
      }

      user = await prisma.user.create({
        data: {
          name: challenge.name,
          email: normalizedEmail,
          password: challenge.password,
          phone: challenge.phone,
          role: 'USER',
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      await prisma.cart.create({ data: { userId: user.id } });
    }

    // Generate authenticated JWT session
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to Factorylogik and Controls.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Verify registration OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during verification.',
    });
  }
};

// CUSTOMER AUTHENTICATION — Step 3: Resend OTP
export const resendCustomerOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // Retrieve previous registration details from latest challenge if available
    const lastChallenge = await prisma.userAuthChallenge.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please sign in directly.',
      });
    }

    const purpose = existingUser ? 'VERIFICATION' : (lastChallenge?.purpose as any || 'REGISTRATION');

    await sendCustomerOtp(normalizedEmail, purpose, {
      name: lastChallenge?.name || existingUser?.name,
      passwordHash: lastChallenge?.password || existingUser?.password,
      phone: lastChallenge?.phone || existingUser?.phone || undefined,
    });

    return res.json({
      success: true,
      message: `A new 6-digit code has been sent to ${normalizedEmail}.`,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || 'Failed to resend code.',
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

    // If existing account has not verified its email, require email verification before granting access
    if (user.isVerified === false) {
      try {
        await sendCustomerOtp(user.email, 'VERIFICATION', {
          name: user.name,
          phone: user.phone || undefined,
        });
      } catch (mailErr: any) {
        console.error('Failed to auto-send verification OTP on login:', mailErr?.message);
      }

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Your email address is not verified yet. A 6-digit verification code has been sent to your email.',
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
        isVerified: user.isVerified,
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
