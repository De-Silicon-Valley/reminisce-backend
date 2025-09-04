import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// Album creation validation schema
const createAlbumSchema = Joi.object({
	albumName: Joi.string().required(),
	workspaceName: Joi.string().optional(),
	department: Joi.string().optional(),
	departmentId: Joi.string().optional(),
}).custom((value, helpers) => {
	// Custom validation to ensure at least one of workspaceName, department, or departmentId is provided
	if (!value.workspaceName && !value.department && !value.departmentId) {
		return helpers.error('any.invalid', { 
			message: 'At least one of workspaceName, department, or departmentId is required' 
		});
	}
	return value;
}, 'validate-required-fields');

export const validateCreateAlbumSchema = (req: Request, res: Response, next: NextFunction) => {

	const { error } = createAlbumSchema.validate(req.body);
	if (error) {
		return res.status(400).json({ 
			msg: "Invalid payload in the request body",
			details: error.details[0].message,
			received: req.body,
			expected: {
				albumName: 'string (required)',
				workspaceName: 'string (optional)',
				department: 'string (optional)',
				departmentId: 'string (optional)',
				note: 'At least one of workspaceName, department, or departmentId is required'
			}
		});
	}
	
	next();
};

// Album update validation schema (all fields optional for PATCH/PUT)
const updateAlbumSchema = Joi.object({
	albumName: Joi.string().optional(),
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
