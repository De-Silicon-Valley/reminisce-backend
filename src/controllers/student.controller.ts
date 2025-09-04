import { Response, Request } from "express";
import { dataSource } from "../dataSource";
import { Student } from "../models/student.model";
import { ObjectId } from "mongodb";

type StudentReferenceNumberPayload = {
	referenceNumbers: string[];
};

export const createStudent = async (req: Request, res: Response) => {
	try {
		// Use departmentId from JWT token (set by verifyJWTToken middleware)
		const adminDepartmentId = (req as any).departmentId; // This is now the department ObjectId as string
		
		const student = await dataSource.getRepository(Student).create({
			referenceNumber: req.body.referenceNumber,
			workspace: adminDepartmentId,
			departmentId: adminDepartmentId,
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

export const getAllStudentDataInworkspace = async (req: Request, res: Response) => {
	try {
		// Try to find by departmentId first, then fall back to workspace
		let students = await dataSource.getRepository(Student).find({ 
			where: { departmentId: req.params.workspace } 
		});
		
		// If no students found by departmentId, try workspace
		if (students.length === 0) {
			students = await dataSource.getRepository(Student).find({ 
				where: { workspace: req.params.workspace } 
			});
		}
		
		if (!students || students.length === 0) return res.status(404).send("No student found");
		return res.status(200).send(students);
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

export const uplooadListOfStudentReferenceNumbersWithCorrespondingworkspace = async (
	req: Request,
	res: Response
) => {
	const payload = req.body as StudentReferenceNumberPayload;
	const workspace = req.params.workspace;

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
				workspace: workspace,
				departmentId: workspace, // Use workspace as departmentId for now
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
