import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getActiveCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderValue: true,
        maxDiscount: true,
        expiryDate: true,
      },
    });

    return res.json({ success: true, coupons });
  } catch (error: any) {
    console.error('getActiveCoupons error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve coupons' });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || typeof cartTotal !== 'number') {
      return res.status(400).json({ success: false, message: 'Coupon code and cart total are required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // FIXED
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, cartTotal);

    return res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error: any) {
    console.error('validateCoupon error:', error);
    return res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
};
