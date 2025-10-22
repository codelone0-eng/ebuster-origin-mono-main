import { Router } from 'express';
import {
  getUserReferralCode,
  getUserReferralStats,
  getUserReferrals,
  applyReferralCode,
  getAllReferralCodes,
  updateReferralCode,
  getAllReferralUses,
  getReferralSystemStats,
  initializeReferralCodes
} from './referral.controller';

const router = Router();

// Пользовательские роуты
router.get('/user/:userId/code', getUserReferralCode);
router.get('/user/:userId/stats', getUserReferralStats);
router.get('/user/:userId/referrals', getUserReferrals);
router.post('/apply', applyReferralCode);

// Админские роуты
router.get('/admin/codes', getAllReferralCodes);
router.put('/admin/codes/:id', updateReferralCode);
router.get('/admin/uses', getAllReferralUses);
router.get('/admin/stats', getReferralSystemStats);
router.post('/admin/initialize', initializeReferralCodes);

export default router;
