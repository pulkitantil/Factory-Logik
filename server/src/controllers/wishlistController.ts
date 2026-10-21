import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true } },
            category: true,
          },
        },
      },
    });

    const formatted = items.map((w) => ({
      id: w.id,
      productId: w.productId,
      product: {
        id: w.product.id,
        name: w.product.name,
        slug: w.product.slug,
        brand: w.product.brand,
        price: w.product.price,
        mrp: w.product.mrp,
        discount: w.product.discount,
        rating: w.product.rating,
        stock: w.product.stock,
        primaryImage: w.product.images[0]?.url || '',
      },
    }));

    return res.json({ success: true, wishlist: formatted });
  } catch (error: any) {
    console.error('getWishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wishlist' });
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from wishlist', isWishlisted: false });
    } else {
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      return res.json({ success: true, message: 'Added to wishlist', isWishlisted: true });
    }
  } catch (error: any) {
    console.error('toggleWishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update wishlist' });
  }
};
