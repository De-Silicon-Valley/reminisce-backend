
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// Image creation validation schema
const createImageSchema = Joi.object({
	albumName: Joi.string().required(),
	pictureURL: Joi.string().uri().required(),
	uploadedBy: Joi.string().required(),
});

export const validateCreateImageSchema = (req: Request, res: Response, next: NextFunction) => {
	const { error } = createImageSchema.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request body" });
	next();
};

// Validation for getImages (albumName param)
const albumNameParamSchema = Joi.object({
	albumName: Joi.string().required(),
});

export const validateAlbumNameParam = (req: Request, res: Response, next: NextFunction) => {
	const { error } = albumNameParamSchema.validate(req.params);
	if (error) return res.status(400).json({ msg: "Invalid albumName parameter" });
	next();
};

// Validation for deleteImage (id param)
const idParamSchema = Joi.object({
	id: Joi.string().length(24).hex().required(), // MongoDB ObjectId
});

export const validateImageIdParam = (req: Request, res: Response, next: NextFunction) => {
	const { error } = idParamSchema.validate(req.params);
	if (error) return res.status(400).json({ msg: "Invalid image id parameter" });
	next();
};



