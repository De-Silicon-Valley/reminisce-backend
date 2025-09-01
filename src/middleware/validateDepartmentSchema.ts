import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const createDepartmentSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  slug: Joi.string().optional(),
});

export const validateCreateDepartmentSchema = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createDepartmentSchema.validate(req.body);
  if (error)
    return res.status(400).json({ msg: "Invalid payload in the request body" });
  next();
};
