import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, reviews });
  } catch (error: any) {
    console.error('getProductReviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews' });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating, and comment are required.' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        title,
        comment,
        verifiedPurchase: true,
      },
    });

    // Update average rating & count on product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = (
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    ).toFixed(1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating),
        numReviews: allReviews.length,
      },
    });

    return res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error: any) {
    console.error('createReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};
