import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      icon: cat.icon,
      featured: cat.featured,
      productCount: cat._count.products,
    }));

    return res.json({ success: true, categories: formatted });
  } catch (error: any) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
};
