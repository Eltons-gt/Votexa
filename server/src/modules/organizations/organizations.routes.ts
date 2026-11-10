import { Router } from 'express';
import { OrganizationsController } from './organizations.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const controller = new OrganizationsController();

router.get('/', authenticate, (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/', authenticate, (req, res, next) => {
  controller.create(req, res).catch(next);
});

router.get('/:id', authenticate, (req, res, next) => {
  controller.getById(req, res).catch(next);
});

export default router;

