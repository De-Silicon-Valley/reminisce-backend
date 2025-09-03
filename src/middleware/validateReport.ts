import { NextFunction, Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Report } from "../models/report.model";
import { ObjectId } from "mongodb";

export const validateReport = async (req: Request, res: Response, next: NextFunction) => {
	const validReport = await dataSource.getRepository(Report).findOne({
		where: { _id: new ObjectId(req.params.id) },
	});

	if (!validReport) {
		return res.status(404).json({ 
			success: false,
			msg: "Report does not exist." 
		});
	}

	// Store the report in the request for use in controllers
	(req as any).report = validReport;
	next();
};
