import express, { Request, Response } from 'express';
import { markMessagesAsSeen } from '../controllers/messageController';

const router = express.Router();

function asyncHandler(fn: any) {
  return function(req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ... existing routes ...

router.post('/seen', asyncHandler(markMessagesAsSeen));

export default router; 