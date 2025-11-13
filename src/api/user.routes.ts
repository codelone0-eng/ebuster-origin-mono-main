import { Router } from 'express';
import { upsertUserProfile, getUserProfile, uploadAvatar, removeAvatar, updateUserActivity, incrementDownloads, getUserBanInfo, generate2FASecret, verify2FASetup, disable2FA, getLoginHistory, logoutAllDevices, requestPasswordChangeOtp, confirmPasswordChange } from './user.controller';
import { optionalAuthenticateUser, authenticateUser } from './auth.middleware';
import multer from 'multer';

const router = Router();

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/profile', optionalAuthenticateUser, getUserProfile);
router.get('/ban-info', optionalAuthenticateUser, getUserBanInfo);
router.post('/upsert', upsertUserProfile);
router.post('/remove-avatar', removeAvatar);

// Middleware для обработки ошибок multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.post('/upload-avatar', upload.single('avatar'), handleMulterError, uploadAvatar);

// Отслеживание активности
router.post('/activity', authenticateUser, updateUserActivity);
router.post('/increment-downloads', authenticateUser, incrementDownloads);

// 2FA
router.post('/2fa/generate-secret', authenticateUser, generate2FASecret);
router.post('/2fa/verify-setup', authenticateUser, verify2FASetup);
router.post('/2fa/disable', authenticateUser, disable2FA);

// Security & Sessions
router.get('/login-history', authenticateUser, getLoginHistory);
router.post('/logout-all-devices', authenticateUser, logoutAllDevices);

// Password Change with OTP
router.post('/password/request-otp', authenticateUser, requestPasswordChangeOtp);
router.post('/password/confirm-change', authenticateUser, confirmPasswordChange);

export default router;


