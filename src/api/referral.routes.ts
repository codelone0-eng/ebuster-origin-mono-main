import { Router } from 'express';
import { authenticateUser } from './auth.middleware';
import {
  getUserReferralCode,
  getUserReferralStats,
  getUserReferrals,
  getUserReferralPayouts,
  applyReferralCode,
  getAllReferralCodes,
  updateReferralCode,
  getAllReferralUses,
  getReferralSystemStats,
  initializeReferralCodes,
  regenerateAllReferralCodes
} from './referral.controller';

const router = Router();

// Пользовательские роуты (требуют аутентификацию)
router.get('/user/:userId/code', authenticateUser, getUserReferralCode);
router.get('/user/:userId/stats', authenticateUser, getUserReferralStats);
router.get('/user/:userId/referrals', authenticateUser, getUserReferrals);
router.get('/user/:userId/payouts', authenticateUser, getUserReferralPayouts);
router.post('/apply', authenticateUser, applyReferralCode);

// Админские роуты
router.get('/admin/codes', getAllReferralCodes);
router.put('/admin/codes/:id', updateReferralCode);
router.get('/admin/uses', getAllReferralUses);
router.get('/admin/stats', getReferralSystemStats);
router.post('/admin/initialize', initializeReferralCodes);
router.post('/admin/regenerate', regenerateAllReferralCodes);

export default router;
