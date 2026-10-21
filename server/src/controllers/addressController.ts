import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    return res.json({ success: true, addresses });
  } catch (error: any) {
    console.error('getAddresses error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve addresses' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = 'India',
      type = 'HOME',
      isDefault = false,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'All required address fields must be provided' });
    }

    if (isDefault) {
      // Unset existing defaults
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        type,
        isDefault,
      },
    });

    return res.status(201).json({ success: true, message: 'Address added successfully', address });
  } catch (error: any) {
    console.error('createAddress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create address' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: req.body,
    });

    return res.json({ success: true, message: 'Address updated successfully', address: updated });
  } catch (error: any) {
    console.error('updateAddress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    return res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error: any) {
    console.error('deleteAddress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};
