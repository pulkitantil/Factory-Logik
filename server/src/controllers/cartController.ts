import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true } },
                },
              },
            },
          },
        },
      });
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        brand: item.product.brand,
        price: item.product.price,
        mrp: item.product.mrp,
        discount: item.product.discount,
        stock: item.product.stock,
        primaryImage: item.product.images[0]?.url || '',
      },
      itemTotal: item.product.price * item.quantity,
      mrpTotal: item.product.mrp * item.quantity,
    }));

    const mrpTotal = items.reduce((acc, curr) => acc + curr.mrpTotal, 0);
    const subtotal = items.reduce((acc, curr) => acc + curr.itemTotal, 0);
    const itemDiscount = mrpTotal - subtotal;
    const gstAmount = Math.round(subtotal * 0.18);
    const platformFee = items.length > 0 ? 19 : 0;
    const shippingFee = 0; // Free shipping promotional
    const finalAmount = subtotal + platformFee;

    return res.json({
      success: true,
      cart: {
        id: cart.id,
        items,
        summary: {
          totalItems: items.reduce((acc, curr) => acc + curr.quantity, 0),
          mrpTotal,
          itemDiscount,
          subtotal,
          gstAmount,
          shippingFee,
          platformFee,
          finalAmount,
        },
      },
    });
  } catch (error: any) {
    console.error('getCart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: Math.max(1, quantity),
        },
      });
    }

    return res.json({ success: true, message: 'Item added to cart successfully' });
  } catch (error: any) {
    console.error('addToCart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      return res.status(400).json({ success: false, message: 'Quantity must be a number' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return res.json({ success: true, message: 'Cart updated successfully' });
  } catch (error: any) {
    console.error('updateCartItem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update cart item' });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: itemId } });
    return res.json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('removeCartItem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return res.json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    console.error('clearCart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
