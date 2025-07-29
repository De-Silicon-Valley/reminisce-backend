import { Response, Request, NextFunction } from "express";
import { dataSource } from "../dataSource";
import { Student } from "../models/student.model";

export const verifyStudentReferenceNumber = async (req: Request, res: Response, next: NextFunction) => {
	const referenceNumber = req.body.referenceNumber;

	if (!referenceNumber) {
		return res.status(403).send({
			msg: "No reference number provided",
		});
	}

	// if(referenceNumber.length !== 8){
	//     return res.status(403).send({
	//         message: "Invalid reference number"
	//     })
	// }
	const foundReferenceNumber = await dataSource
		.getRepository(Student)
		.findOne({ where: { referenceNumber: referenceNumber } });

	if (!foundReferenceNumber) {
		return res.status(403).send({
			msg: "Invalid reference number",
		});
	}

	// req.studentId = foundReferenceNumber.id

	next();
};

export const verifyExistingReferenceNumber = async (req: Request, res: Response, next: NextFunction) => {
	const referenceNumber = req.body.referenceNumber;

	if (!referenceNumber) {
		return res.status(403).send({
			msg: "No reference number provided",
		});
	}

	const foundReferenceNumber = await dataSource
		.getRepository(Student)
		.findOne({ where: { referenceNumber: referenceNumber } });

	if (foundReferenceNumber) {
		return res.status(403).send({
			msg: "Reference number already exists",
		});
	}

	next();
};
