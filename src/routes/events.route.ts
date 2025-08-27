import { Router } from "express";
import { EventController } from '../controllers/events.controller';
import { validateCreateEventSchema, validateUpdateEventSchema, validateEventIdParam } from '../middleware/validateEventsSchema';
import { verifyJWTToken } from "../middleware/verifyToken";

const router = Router();
const eventController = new EventController();

router.use(verifyJWTToken);


router.get('/events/stats', eventController.getEventStats);
router.get('/events', eventController.getAllEvents);
router.get('/events/:id', validateEventIdParam, eventController.getEventById);
router.post('/events', validateCreateEventSchema, eventController.createEvent);
router.put('/events/:id', validateEventIdParam, validateUpdateEventSchema, eventController.updateEvent);
router.delete('/events/:id', validateEventIdParam, eventController.deleteEvent);

export default router;

