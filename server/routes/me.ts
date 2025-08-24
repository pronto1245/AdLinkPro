import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const meRouter = Router();

meRouter.get('/', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default meRouter;
