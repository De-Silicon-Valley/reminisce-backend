import { Router } from "express";
import { EventController } from '../controllers/events.controller';
import { validateCreateEventSchema, validateUpdateEventSchema, validateEventIdParam } from '../middleware/validateEventsSchema';
import { verifyJWTToken } from "../middleware/verifyToken";

const router = Router();
const eventController = new EventController();

router.use(verifyJWTToken);


router.get('/stats', eventController.getEventStats);
router.get('/', eventController.getAllEvents);
router.get('/:id', validateEventIdParam, eventController.getEventById);
router.post('/', validateCreateEventSchema, eventController.createEvent);
router.put('/:id', validateEventIdParam, validateUpdateEventSchema, eventController.updateEvent);
router.delete('/:id', validateEventIdParam, eventController.deleteEvent);

export default router;

