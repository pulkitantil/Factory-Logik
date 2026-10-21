import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      search,
      sortBy = 'popularity',
      featured,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { active: true };

    if (category) {
      const isHex = /^[0-9a-fA-F]{24}$/.test(category as string);
      where.category = isHex
        ? { OR: [{ slug: category as string }, { id: category as string }] }
        : { slug: category as string };
    }

    if (brand) {
      const brands = (brand as string).split(',').map((b) => b.trim());
      where.brand = { in: brands };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating as string) };
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'popularity':
      default:
        orderBy = { numReviews: 'desc' };
        break;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { url: true, isPrimary: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format primary image
    const formatted = products.map((p) => {
      const primaryImage = p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || '';
      return {
        ...p,
        primaryImage,
        parsedSpecs: p.specifications ? JSON.parse(p.specifications) : {},
        parsedFeatures: p.features ? JSON.parse(p.features) : [],
      };
    });

    return res.json({
      success: true,
      products: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    console.error('getProducts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
};

export const getProductBySlugOrId = async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;

    const isHex = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const product = await prisma.product.findFirst({
      where: {
        ...(isHex ? { OR: [{ slug: slugOrId }, { id: slugOrId }] } : { slug: slugOrId }),
        active: true,
      },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        active: true,
      },
      take: 4,
      include: {
        images: true,
      },
    });

    const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

    return res.json({
      success: true,
      product: {
        ...product,
        primaryImage,
        parsedSpecs: product.specifications ? JSON.parse(product.specifications) : {},
        parsedFeatures: product.features ? JSON.parse(product.features) : [],
      },
      relatedProducts: relatedProducts.map((p) => ({
        ...p,
        primaryImage: p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || '',
      })),
    });
  } catch (error: any) {
    console.error('getProductBySlugOrId error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json({ success: true, suggestions: { products: [], categories: [], brands: [] } });
    }

    const query = q.trim();

    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [{ name: { contains: query } }, { brand: { contains: query } }, { sku: { contains: query } }],
          active: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          mrp: true,
          discount: true,
          images: { where: { isPrimary: true }, select: { url: true } },
        },
        take: 6,
      }),
      prisma.category.findMany({
        where: {
          OR: [{ name: { contains: query } }, { slug: { contains: query } }],
        },
        select: { id: true, name: true, slug: true },
        take: 4,
      }),
      prisma.product.findMany({
        where: {
          brand: { contains: query },
          active: true,
        },
        distinct: ['brand'],
        select: { brand: true },
        take: 4,
      }),
    ]);

    return res.json({
      success: true,
      suggestions: {
        products: products.map((p) => ({
          ...p,
          image: p.images[0]?.url || '',
        })),
        categories,
        brands: brands.map((b) => b.brand),
      },
    });
  } catch (error: any) {
    console.error('getSearchSuggestions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch suggestions' });
  }
};

export const compareProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    if (!ids || typeof ids !== 'string') {
      return res.status(400).json({ success: false, message: 'Product IDs required for comparison.' });
    }

    const idList = ids.split(',').map((id) => id.trim());
    const hexIds = idList.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
    const orConditions: any[] = [{ slug: { in: idList } }];
    if (hexIds.length > 0) {
      orConditions.push({ id: { in: hexIds } });
    }
    const products = await prisma.product.findMany({
      where: {
        OR: orConditions,
      },
      include: {
        images: true,
        category: true,
      },
    });

    const parsed = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      discount: p.discount,
      rating: p.rating,
      numReviews: p.numReviews,
      stock: p.stock,
      warranty: p.warranty,
      primaryImage: p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || '',
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
      features: p.features ? JSON.parse(p.features) : [],
    }));

    return res.json({ success: true, products: parsed });
  } catch (error: any) {
    console.error('compareProducts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compare products' });
  }
};
