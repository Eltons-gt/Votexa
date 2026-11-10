import { Router } from 'express';
import { WalletsController } from './wallets.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new WalletsController();

router.use(authenticate);
router.use(tenantContext());

router.get('/my-wallet', (req, res, next) => {
  controller.getWallet(req, res).catch(next);
});

export default router;

