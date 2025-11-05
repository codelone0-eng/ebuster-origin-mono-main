import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser
} from './roles.controller';
import { authenticateUser } from './auth.middleware';

const router = Router();

// Публичные роуты
router.get('/', getRoles); // Получить все активные роли
router.get('/:id', getRoleById); // Получить роль по ID

// Защищенные роуты (только админ)
router.post('/', authenticateUser, createRole); // Создать роль
router.put('/:id', authenticateUser, updateRole); // Обновить роль
router.delete('/:id', authenticateUser, deleteRole); // Удалить роль
router.post('/assign', authenticateUser, assignRoleToUser); // Назначить роль пользователю

export default router;
