import { Router } from 'express';
import { 
  getUserTickets, 
  getAllTickets, 
  createTicket, 
  updateTicket, 
  addComment,
  getTicketComments 
} from './tickets.controller';
import { authenticateUser } from './auth.middleware';

const router = Router();

router.get('/', authenticateUser, getUserTickets);
router.get('/user', authenticateUser, getUserTickets);
router.get('/all', authenticateUser, getAllTickets);
router.post('/', authenticateUser, createTicket);
router.put('/:id', authenticateUser, updateTicket);
router.post('/comments', authenticateUser, addComment);
router.get('/:ticketId/comments', authenticateUser, getTicketComments);

export default router;
