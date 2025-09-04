import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// Album creation validation schema
const createAlbumSchema = Joi.object({
	albumName: Joi.string().required(),
	coverImage: Joi.string().uri().optional(),
	workspaceName: Joi.string().optional(),
	department: Joi.string().optional(),
	departmentId: Joi.string().optional(),
});

export const validateCreateAlbumSchema = (req: Request, res: Response, next: NextFunction) => {

	const { error } = createAlbumSchema.validate(req.body);
	if (error) {
		return res.status(400).json({ 
			msg: "Invalid payload in the request body",
			details: error.details[0].message,
			received: req.body,
			expected: {
				albumName: 'string (required)',
				coverImage: 'string (optional)',
				workspaceName: 'string (optional)',
				department: 'string (optional)',
				departmentId: 'string (optional)',
				note: 'Department information will be automatically set from JWT token'
			}
		});
	}
	
	next();
};

// Album update validation schema (all fields optional for PATCH/PUT)
const updateAlbumSchema = Joi.object({
	albumName: Joi.string().optional(),
	coverImage: Joi.string().uri().optional(),
	workspaceName: Joi.string().optional(),
	department: Joi.string().optional(),
	departmentId: Joi.string().optional(),
});

export const validateUpdateAlbumSchema = (req: Request, res: Response, next: NextFunction) => {
	const { error } = updateAlbumSchema.validate(req.body);
	if (error) {
		console.log('Album update validation error:', error.details);
		return res.status(400).json({ 
			msg: "Invalid payload in the request body",
			details: error.details[0].message 
		});
	}
	next();
};
