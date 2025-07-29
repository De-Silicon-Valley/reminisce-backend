import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const createStudentSchema = Joi.object({
	referenceNumber: Joi.string().required(),
	year: Joi.string().required(),
});

export const validateCreateStudentSchema = (req: Request, res: Response, next: NextFunction) => {
	const { error } = createStudentSchema.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
	next();
};

const updateStudentSchema = Joi.object({
	name: Joi.string().required(),
	nickname: Joi.string().optional(),
	image: Joi.string().required(),
	quote: Joi.string().required(),
	referenceNumber: Joi.string().required(),
});

export const validateUpdateStudentSchema = (req: Request, res: Response, next: NextFunction) => {
	const { error } = updateStudentSchema.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
	next();
};

// Define a Joi schema for validating the year parameter
const yearParamSchema = Joi.number().integer().min(2022).required();

export const validateYearParameter = (req: Request, res: Response, next: NextFunction) => {
	const { error } = yearParamSchema.validate(req.params.year);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request parameters" });
	next();
};

const studentReferenceNumberPayloadSchema = Joi.object({
	referenceNumbers: Joi.array()
		.items(Joi.string().required()) // Validate that each item is a required string
		.required(), // Ensure the array itself is required
});

export const validateStudentReferenceNumberPayloadSchema = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { error } = studentReferenceNumberPayloadSchema.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
	next();
};

const updateStudentSchemaByAdmin = Joi.object({
	name: Joi.string().optional(),
	nickname: Joi.string().optional(),
	image: Joi.string().optional(),
	quote: Joi.string().optional(),
	referenceNumber: Joi.string().optional(),
});

export const validateUpdateStudentSchemaByAdmin = (req: Request, res: Response, next: NextFunction) => {
	const { error } = updateStudentSchemaByAdmin.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
	next();
};
