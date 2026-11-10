import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, requirePlatformRole } from '../../middleware/auth.js';
import { PlatformRole } from '@votexa/shared';

const router = Router();

// Protect all admin endpoints with authentication and platform role requirement
router.use(authenticate);
router.use(requirePlatformRole([PlatformRole.SUPER_ADMIN, PlatformRole.SUPPORT_ADMIN]));

// 1. Platform Overview
router.get('/overview', (req, res, next) => {
  adminController.getOverview(req, res).catch(next);
});

// 2. Organization Management
router.get('/organizations', (req, res, next) => {
  adminController.listOrganizations(req, res).catch(next);
});

router.patch('/organizations/:id/status', (req, res, next) => {
  adminController.updateOrganizationStatus(req, res).catch(next);
});

// 3. User Management
router.get('/users', (req, res, next) => {
  adminController.listUsers(req, res).catch(next);
});

router.patch('/users/:id/role', (req, res, next) => {
  adminController.updateUserRole(req, res).catch(next);
});

// 4. Election Moderation
router.get('/elections', (req, res, next) => {
  adminController.listAllElections(req, res).catch(next);
});

router.patch('/elections/:id/moderate', (req, res, next) => {
  adminController.moderateElection(req, res).catch(next);
});

// 5. Commission Management
router.get('/commissions', (req, res, next) => {
  adminController.getCommissionSettings(req, res).catch(next);
});

router.post('/commissions', (req, res, next) => {
  adminController.updateCommissionRate(req, res).catch(next);
});

// 6. Audit & Security Event Monitoring
router.get('/audit-logs', (req, res, next) => {
  adminController.listAuditLogs(req, res).catch(next);
});

router.get('/security-events', (req, res, next) => {
  adminController.listSecurityEvents(req, res).catch(next);
});

// 7. Reporting Generation Dispatcher
router.post('/reports', (req, res, next) => {
  adminController.generateReport(req, res).catch(next);
});

export default router;
