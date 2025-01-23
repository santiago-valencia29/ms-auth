import {Router} from 'express';

const router = Router();

import { signIn, singUp, validateToken } from '../controllers/user.controller';

router.post('/signin',signIn)
router.post('/signup',singUp)
router.post('/validate-token',validateToken)


export default router;