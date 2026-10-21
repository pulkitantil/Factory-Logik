import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const submitContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        message,
        status: 'NEW',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our support team will get in touch within 2 business hours.',
      contact,
    });
  } catch (error: any) {
    console.error('submitContactMessage error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit contact message' });
  }
};

export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, messages });
  } catch (error: any) {
    console.error('getContactMessages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
};
