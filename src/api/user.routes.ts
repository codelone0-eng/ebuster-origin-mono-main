import { Router } from 'express';
import { upsertUserProfile, getUserProfile, uploadAvatar, removeAvatar } from './user.controller';
import { optionalAuthenticateUser } from './auth.middleware';
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

export default router;


