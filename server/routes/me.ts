import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authorization';

const meRouter = Router();

meRouter.get('/', authenticateToken, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default meRouter;
