import { Response, Request } from "express";
import { dataSource } from "../dataSource";
import { Student } from "../models/student.model";
import { ObjectId } from "mongodb";

type StudentReferenceNumberPayload = {
	referenceNumbers: string[];
};

export const createStudent = async (req: Request, res: Response) => {
	try {
		const student = await dataSource.getRepository(Student).create({
			referenceNumber: req.body.referenceNumber,
			year: req.body.year,
		});

		if (!student) return res.status(400).send("Unable to create student");

		await dataSource.getRepository(Student).save(student);
		return res.status(201).send({
			msg: "Student created successfully!",
		});
	} catch (error) {
		return res.status(500).send({
			msg: error,
		});
	}
};

export const deleteStudentRecord = async (req: Request, res: Response) => {
	await dataSource.getRepository(Student).delete({
		referenceNumber: req.body.referenceNumber,
	});

	return res.status(204).send({ msg: "Student record deleted succcesfully." });
};

export const getAllStudentData = async (req: Request, res: Response) => {
	try {
		const student = await dataSource.getRepository(Student).find();
		if (!student) return res.status(404).send("No student found");
		return res.status(200).send(student);
	} catch (error) {
		return res.status(500).send({
			msg: error,
		});
	}
};

export const getAllStudentDataInYear = async (req: Request, res: Response) => {
	try {
		const student = await dataSource.getRepository(Student).find({ where: { year: req.params.year } });
		if (!student) return res.status(404).send("No student found");
		return res.status(200).send(student);
	} catch (error) {
		// console.log(error)
		return res.status(500).send({
			msg: error,
		});
	}
};

export const updateStudentDataHavingTheReferenceNumber = async (req: Request, res: Response) => {
	try {
		const student = await dataSource.getRepository(Student).update(
			{ referenceNumber: req.body.referenceNumber },
			{
				name: req.body.name,
				nickname: req.body.nickname,
				image: req.body.image,
				quote: req.body.quote,
			}
		);
		if (student.affected === 0) {
			return res.status(400).send({ msg: "Details have already been taken" });
		}

		return res.status(201).send({
			msg: "Details taken successfully!",
		});
	} catch (error) {
		return res.status(500).send({
			msg: error,
		});
	}
};

export const uplooadListOfStudentReferenceNumbersWithCorrespondingYear = async (
	req: Request,
	res: Response
) => {
	const payload = req.body as StudentReferenceNumberPayload;
	const year = req.params.year;

	try {
		const alredyAddedReferenceNumbers: string[] = [];
		const unaddedReferenceNumbers: string[] = [];

		for (const referenceNumber of payload["referenceNumbers"]) {
			const studentExists = await dataSource
				.getRepository(Student)
				.findOne({ where: { referenceNumber: referenceNumber } });

			if (studentExists) {
				alredyAddedReferenceNumbers.push(referenceNumber);
				continue;
			}

			const student = await dataSource.getRepository(Student).create({
				referenceNumber: referenceNumber,
				year: year,
			});

			if (!student) unaddedReferenceNumbers.push(referenceNumber);

			await dataSource.getRepository(Student).save(student);
		}
		return res.status(201).send({
			msg: "References Added",
			unaddedReferenceNumbers: unaddedReferenceNumbers,
			alredyAddedReferenceNumbers: alredyAddedReferenceNumbers,
		});
	} catch (error) {
		return res.status(500).send({
			msg: error,
		});
	}
};

export const updateStudentDataByAdmin = async (req: Request, res: Response) => {
	const repository = dataSource.getRepository(Student);
	try {
		const existingRepository = await repository.findOne({ where: { _id: new ObjectId(req.params.id) } });
		if (!existingRepository) {
			return res.status(404).send({ msg: "Student does not exist." });
		}

		repository.merge(existingRepository, req.body);
		await repository.save(existingRepository);

		res.status(200).send({ msg: "Field updated." });
	} catch (error) {
		return res.status(500).send({
			msg: error,
		});
	}
};
