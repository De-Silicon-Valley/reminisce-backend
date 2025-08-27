import { NextFunction, Request, Response } from "express";

export const validateObjectId = async (req: Request, res: Response, next: NextFunction) => {
	const objectIdRegex = /^[0-9a-fA-F]{24}$/;
	if (!objectIdRegex.test(req.params.id)) {
		return res.status(400).send({ msg: "Invalid id." });
	}

	next();
};
