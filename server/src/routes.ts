import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import organizationsRoutes from './modules/organizations/organizations.routes.js';
import organizationMembersRoutes from './modules/organization-members/organization-members.routes.js';
import electionsRoutes from './modules/elections/elections.routes.js';
import candidatesRoutes from './modules/candidates/candidates.routes.js';
import votersRoutes from './modules/voters/voters.routes.js';
import ballotRoutes from './modules/ballot/ballot.routes.js';
import votingRoutes from './modules/voting/voting.routes.js';
import packagesRoutes from './modules/packages/packages.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import walletsRoutes from './modules/wallets/wallets.routes.js';
import revenueRoutes from './modules/revenue/revenue.routes.js';
import ledgerRoutes from './modules/financial-ledger/financial-ledger.routes.js';
import refundsRoutes from './modules/refunds/refunds.routes.js';
import payoutsRoutes from './modules/payouts/payouts.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/organizations', organizationsRoutes);
apiRouter.use('/organization-members', organizationMembersRoutes);
apiRouter.use('/elections', electionsRoutes);
apiRouter.use('/candidates', candidatesRoutes);
apiRouter.use('/voters', votersRoutes);
apiRouter.use('/ballots', ballotRoutes);
apiRouter.use('/voting', votingRoutes);
apiRouter.use('/packages', packagesRoutes);
apiRouter.use('/payments', paymentsRoutes);
apiRouter.use('/wallets', walletsRoutes);
apiRouter.use('/revenue', revenueRoutes);
apiRouter.use('/ledger', ledgerRoutes);
apiRouter.use('/refunds', refundsRoutes);
apiRouter.use('/payouts', payoutsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/reports', reportsRoutes);
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;

