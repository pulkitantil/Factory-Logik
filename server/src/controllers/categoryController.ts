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



export const createCategory = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug: requestedSlug,
      description,
      image,
      icon,
      featured = false,
      displayOrder = 0,
    } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const normalizedName = name.trim();
    const slugSource =
      typeof requestedSlug === 'string' && requestedSlug.trim()
        ? requestedSlug.trim()
        : normalizedName;

    const slug = slugSource
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid category name or slug.',
      });
    }

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A category with this slug already exists.',
      });
    }

    const order = Number(displayOrder);

    if (!Number.isInteger(order) || order < 0) {
      return res.status(400).json({
        success: false,
        message: 'Display order must be a non-negative integer.',
      });
    }

    if (typeof featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Featured must be true or false.',
      });
    }

    for (const field of ['description', 'image', 'icon'] as const) {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        typeof req.body[field] !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be text.`,
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        slug,
        description: description?.trim() || null,
        image: image?.trim() || null,
        icon: icon?.trim() || null,
        featured,
        displayOrder: order,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: {
        ...category,
        productCount: 0,
      },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A category with this slug already exists.',
      });
    }

    console.error('createCategory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category.',
    });
  }
};
