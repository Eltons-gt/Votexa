import { Router } from 'express';
import { revenueController } from './revenue.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();

router.use(tenantContext({ required: false }));

// GET /api/v1/revenue/organizer - Organizer financial dashboard metrics
router.get('/organizer', (req, res, next) => {
  revenueController.getOrganizerMetrics(req, res).catch(next);
});

// GET /api/v1/revenue/platform - Super admin global platform metrics
router.get('/platform', (req, res, next) => {
  revenueController.getPlatformMetrics(req, res).catch(next);
});

// GET /api/v1/revenue/allocations - List 25/75 revenue allocations
router.get('/allocations', (req, res, next) => {
  revenueController.listAllocations(req, res).catch(next);
});

// Backward-compatibility alias for root GET /api/v1/revenue
router.get('/', (req, res, next) => {
  revenueController.getOrganizerMetrics(req, res).catch(next);
});

export default router;
