import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const loginSchemaForAdmin = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
});

const signupSchemaForAdmin = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
	departmentName: Joi.string().required(),
	departmentCode: Joi.string().required(),
});

export const validateAdminLoginAndSignUpSchema = (req: Request, res: Response, next: NextFunction) => {
	// Debug logging
	console.log('Validation middleware - Request body:', req.body);
	console.log('Validation middleware - Request method:', req.method);
	console.log('Validation middleware - Request path:', req.path);
	console.log('Validation middleware - Request body type:', typeof req.body);
	console.log('Validation middleware - Request body keys:', Object.keys(req.body || {}));
	
	// Check if this is a signup request (has department fields) or signin request
	const hasDepartmentFields = req.body.departmentName || req.body.departmentCode;
	console.log('Validation middleware - Has department fields:', hasDepartmentFields);
	console.log('Validation middleware - departmentName:', req.body.departmentName);
	console.log('Validation middleware - departmentCode:', req.body.departmentCode);
	
	let schema;
	if (hasDepartmentFields) {
		// This is a signup request
		console.log('Validation middleware - Using signup schema');
		schema = signupSchemaForAdmin;
	} else {
		// This is a signin request
		console.log('Validation middleware - Using login schema');
		schema = loginSchemaForAdmin;
	}
	
	console.log('Validation middleware - Schema to validate against:', schema.describe());
	
	const { error } = schema.validate(req.body);
	if (error) {
		console.log('Validation middleware - Validation error:', error.details);
		return res.status(400).json({ msg: "Admin signup: Invalid payload in the request parameters" });
	}
	console.log('Validation middleware - Validation passed');
	next();
};
