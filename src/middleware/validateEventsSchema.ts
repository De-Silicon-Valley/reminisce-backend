import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Event creation validation schema
const createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  venue: Joi.string().trim().min(3).max(255).required(),
  eventDate: Joi.date().iso().required(),
  department: Joi.string().trim().min(1).required()
});

export const validateCreateEventSchema = (req: Request, res: Response, next: NextFunction) => {

  
  const { error } = createEventSchema.validate(req.body);
  if (error) {
   
    return res.status(400).json({ msg: "Invalid payload in the request body", details: error.details });
  }
  next();
};

// Event update validation schema
const updateEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).optional(),
  description: Joi.string().trim().min(10).max(1000).optional(),
  venue: Joi.string().trim().min(3).max(255).optional(),
  eventDate: Joi.date().iso().optional(),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').optional(),
  department: Joi.string().trim().min(1).optional()
});

export const validateUpdateEventSchema = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateEventSchema.validate(req.body);
  if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
  next();
};

// Validation for event ID parameter
const eventIdParamSchema = Joi.object({
  id: Joi.string().length(24).hex().required() 
});

export const validateEventIdParam = (req: Request, res: Response, next: NextFunction) => {
  const { error } = eventIdParamSchema.validate(req.params);
  if (error) return res.status(400).json({ msg: "Invalid event id parameter" });
  next();
};