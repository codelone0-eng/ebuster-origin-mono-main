import { Router } from 'express';
import { authenticateUser } from './auth.middleware';
import {
  getUserTickets,
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  addMessage,
  getTicketMessages,
  getTicketStats,
  getSupportTeams
} from './tickets-new.controller';

const router = Router();

// Публичные роуты (требуют аутентификации)
router.get('/', authenticateUser, getUserTickets); // Получить тикеты текущего пользователя
router.get('/all', authenticateUser, getAllTickets); // Получить все тикеты (админ/агент)
router.get('/stats', authenticateUser, getTicketStats); // Статистика (админ/агент)
router.get('/teams', authenticateUser, getSupportTeams); // Список команд
router.get('/:id', authenticateUser, getTicket); // Получить один тикет
router.post('/', authenticateUser, createTicket); // Создать тикет
router.patch('/:id', authenticateUser, updateTicket); // Обновить тикет (админ/агент)
router.post('/:id/messages', authenticateUser, addMessage); // Добавить сообщение
router.get('/:id/messages', authenticateUser, getTicketMessages); // Получить сообщения
// TODO: Implement uploadAttachment handler for ticket attachments
// router.post('/:ticketId/attachments', authenticateUser, uploadAttachment);
// router.post('/:ticketId/messages/:messageId/attachments', authenticateUser, uploadAttachment);

export default router;
