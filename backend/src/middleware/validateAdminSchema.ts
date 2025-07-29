import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const loginSchemaForAdmin = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
});

export const validateAdminLoginAndSignUpSchema = (req: Request, res: Response, next: NextFunction) => {
	const { error } = loginSchemaForAdmin.validate(req.body);
	if (error) return res.status(400).json({ msg: "Invalid payload in the request parameters" });
	next();
};
