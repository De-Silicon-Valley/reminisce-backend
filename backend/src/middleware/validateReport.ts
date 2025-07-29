import { NextFunction, Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Report } from "../models/report.model";
import { ObjectId } from "mongodb";

export const validateReport = async (req: Request, res: Response, next: NextFunction) => {
	const validReport = await dataSource.getRepository(Report).findOne({
		where: { _id: new ObjectId(req.params.id) },
	});

	if (!validReport) {
		return res.status(404).send({ msg: "Report does not exist." });
	}

	if (!validReport.isActive) {
		return res.status(400).send({ msg: "Report has been closed" });
	}

	next();
};
