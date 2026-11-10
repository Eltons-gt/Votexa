import { Router } from 'express';
import { PackagesController } from './packages.controller.js';

const router = Router();
const controller = new PackagesController();

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

export default router;

