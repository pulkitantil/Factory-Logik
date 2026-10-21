import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { processNaturalLanguageQuery, AI_TOOLS } from '../services/aiService.js';
import prisma from '../lib/prisma.js';

export const handleAiChat = async (req: AuthRequest, res: Response) => {
  try {
    const { query, conversationId } = req.body;
    const userId = req.user?.id;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message query is required.' });
    }

    // Process query through tool-based AI engine
    const aiResponse = await processNaturalLanguageQuery(query, userId);

    // Save message history in database
    let activeConvoId = conversationId;
    if (!activeConvoId) {
      const convo = await prisma.aIConversation.create({
        data: {
          userId: userId || null,
          title: query.slice(0, 40) + '...',
        },
      });
      activeConvoId = convo.id;
    }

    // Save User message
    await prisma.aIChatMessage.create({
      data: {
        conversationId: activeConvoId,
        role: 'user',
        content: query,
      },
    });

    // Save Assistant message with tool calls & results
    await prisma.aIChatMessage.create({
      data: {
        conversationId: activeConvoId,
        role: 'assistant',
        content: aiResponse.reply,
        toolCalls: aiResponse.toolCalls ? JSON.stringify(aiResponse.toolCalls) : null,
      },
    });

    return res.json({
      success: true,
      conversationId: activeConvoId,
      ...aiResponse,
    });
  } catch (error: any) {
    console.error('handleAiChat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI assistant query',
      reply: 'Sorry, I encountered a temporary issue checking the store catalog. Please try again.',
    });
  }
};

export const getAiTools = (req: AuthRequest, res: Response) => {
  return res.json({ success: true, tools: AI_TOOLS });
};
