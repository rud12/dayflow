import { Router } from 'express';
import { loginController, signupController, refreshTokenController, logoutController } from '../controllers/auth.controller';
import { validate } from '../middleware/validator';
import { loginSchema, signupSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', validate(loginSchema), loginController);
router.post('/signup', validate(signupSchema), signupController);
router.post('/refresh', validate(refreshTokenSchema), refreshTokenController);
router.post('/logout', authenticate, logoutController);

export default router;

