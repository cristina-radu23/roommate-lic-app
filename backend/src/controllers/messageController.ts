import { Request, Response } from 'express';
import Message from '../models/Message';
import { Op } from 'sequelize';

// ... existing code ...

export const markMessagesAsSeen = async (req: Request, res: Response) => {
  const { chatRoomId, userId } = req.body;
  console.log('[markMessagesAsSeen] called with chatRoomId:', chatRoomId, 'userId:', userId);
  if (!userId || !chatRoomId) {
    console.log('[markMessagesAsSeen] Missing userId or chatRoomId');
    return res.status(400).json({ message: 'userId and chatRoomId are required' });
  }
  try {
    const [updated] = await Message.update(
      { seen: true },
      {
        where: {
          chatRoomId,
          userId: { [Op.ne]: userId },
          seen: false,
        },
      }
    );
    console.log(`[markMessagesAsSeen] Updated ${updated} messages as seen`);
    res.status(200).json({ message: 'Messages marked as seen', updated });
  } catch (error) {
    console.error('[markMessagesAsSeen] Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 