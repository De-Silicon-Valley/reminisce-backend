import { Router } from "express";
import { EventController } from '../controllers/events.controller';
import { validateCreateEventSchema, validateUpdateEventSchema, validateEventIdParam } from '../middleware/validateEventsSchema';
import { verifyJWTToken } from "../middleware/verifyToken";

const router = Router();
const eventController = new EventController();

// GET routes - no token required
router.get('/stats', eventController.getEventStats);
router.get('/', eventController.getAllEvents);
router.get('/department/:department', eventController.getEventsByDepartment);
router.get('/:id', validateEventIdParam, eventController.getEventById);

// Public routes for client-side access using workspace ID
router.post('/public', eventController.getEventsByWorkspace);

// POST, PUT, DELETE routes - token required
router.post('/', verifyJWTToken, validateCreateEventSchema, eventController.createEvent);
router.put('/:id', verifyJWTToken, validateEventIdParam, validateUpdateEventSchema, eventController.updateEvent);
router.delete('/:id', verifyJWTToken, validateEventIdParam, eventController.deleteEvent);

export default router;

