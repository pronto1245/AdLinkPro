import { Router } from 'express';
import { TeamController } from '../controllers/teamController';
import { validate } from '../middleware/validation';

const router = Router();

// Public invitation routes (no authentication required)
router.post('/invitations/:token/accept',
  validate.acceptInvitation(),
  TeamController.acceptInvitation
);

router.post('/invitations/:token/decline',
  TeamController.declineInvitation
);

export { router as invitationRoutes };
