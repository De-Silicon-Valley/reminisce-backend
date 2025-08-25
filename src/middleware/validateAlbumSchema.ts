import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// Album creation validation schema
const createAlbumSchema = Joi.object({
	albumName: Joi.string().required(),
	workspaceName: Joi.string().required(),
});

export const validateCreateAlbumSchema = (req: Request, res: Response, next: NextFunction) => {
	const { error } = createAlbumSchema.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
	next();
};

// Album update validation schema (all fields optional for PATCH/PUT)
const updateAlbumSchema = Joi.object({
	albumName: Joi.string().optional(),
	workspaceName: Joi.string().optional(),
});

export const validateUpdateAlbumSchema = (req: Request, res: Response, next: NextFunction) => {
	const { error } = updateAlbumSchema.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
	next();
};
