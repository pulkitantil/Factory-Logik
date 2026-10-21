import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getTrackingInfo = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    if (!identifier || identifier.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Tracking or Order ID required' });
    }

    const cleanId = identifier.trim().toUpperCase();

    // Look up by tracking number or order number
    const tracking = await prisma.tracking.findFirst({
      where: {
        OR: [
          { trackingNumber: cleanId },
          { order: { orderNumber: cleanId } },
        ],
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            status: true,
            deliverySpeed: true,
            estimatedDelivery: true,
            finalAmount: true,
            paymentMethod: true,
            items: {
              select: {
                id: true,
                name: true,
                brand: true,
                image: true,
                price: true,
                quantity: true,
              },
            },
            address: {
              select: {
                fullName: true,
                city: true,
                state: true,
                postalCode: true,
              },
            },
          },
        },
        events: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: `No active shipment found matching ID '${cleanId}'. Please verify and retry.`,
      });
    }

    // Milestones mapping for visual tracker
    const allStages = [
      { key: 'ORDER_PLACED', label: 'Order Placed' },
      { key: 'CONFIRMED', label: 'Confirmed' },
      { key: 'PROCESSING', label: 'Processing' },
      { key: 'PACKAGED', label: 'Packaged' },
      { key: 'SHIPPED', label: 'Shipped' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
      { key: 'DELIVERED', label: 'Delivered' },
    ];

    const currentStatusIndex = allStages.findIndex((s) => s.key === tracking.currentStatus);

    return res.json({
      success: true,
      tracking: {
        trackingNumber: tracking.trackingNumber,
        carrier: tracking.carrier,
        currentStatus: tracking.currentStatus,
        currentCity: tracking.currentCity,
        estimatedDelivery: tracking.estimatedDate,
        updatedAt: tracking.updatedAt,
        events: tracking.events,
        order: tracking.order,
        milestones: allStages.map((stage, idx) => ({
          ...stage,
          completed: currentStatusIndex >= idx,
          current: currentStatusIndex === idx,
        })),
      },
    });
  } catch (error: any) {
    console.error('getTrackingInfo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tracking details' });
  }
};
