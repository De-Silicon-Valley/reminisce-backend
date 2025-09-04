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
			workspace: adminDepartmentId, // Keep as string for backward compatibility
			departmentId: new ObjectId(adminDepartmentId),
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
	// Use admin's department ObjectId from JWT token
	const adminDepartmentId = (req as any).departmentId;
	
	console.log('🔍 Delete - Admin departmentId:', adminDepartmentId);
	console.log('🔍 Delete - Reference number:', req.body.referenceNumber);
	
	// Delete student by reference number and workspace (consistent with other operations)
	let deleteResult = await dataSource.getRepository(Student).delete({
		referenceNumber: req.body.referenceNumber,
		workspace: adminDepartmentId,
	});
	
	console.log('🔍 Delete - Workspace delete result:', deleteResult.affected);
	
	// If no student found with workspace field, try departmentId as ObjectId
	if (deleteResult.affected === 0) {
		deleteResult = await dataSource.getRepository(Student).delete({
			referenceNumber: req.body.referenceNumber,
			departmentId: new ObjectId(adminDepartmentId),
		});
		console.log('🔍 Delete - ObjectId delete result:', deleteResult.affected);
	}
	
	// If still no student found, try departmentId as string
	if (deleteResult.affected === 0) {
		deleteResult = await dataSource.getRepository(Student).delete({
			referenceNumber: req.body.referenceNumber,
			departmentId: adminDepartmentId,
		});
		console.log('🔍 Delete - String delete result:', deleteResult.affected);
	}
	
	if (deleteResult.affected === 0) {
		return res.status(404).send({ msg: "Student not found or not authorized to delete." });
	}

	return res.status(204).send({ msg: "Student record deleted successfully." });
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

// POST /api/student/public - Public endpoint for client-side access using workspace ID
export const getStudentsByWorkspace = async (req: Request, res: Response) => {
	try {
		const { workspace } = req.body;
		
		if (!workspace) {
			return res.status(400).json({
				success: false,
				msg: "Workspace ID is required"
			});
		}
		
		console.log("🔍 getStudentsByWorkspace - Workspace ID:", workspace);
		
		// Find students by workspace field
		let students = await dataSource.getRepository(Student).find({
			where: { workspace: workspace }
		});
		
		console.log("🔍 getStudentsByWorkspace - Students found with workspace field:", students.length);
		
		// If no students found by workspace field, try departmentId as ObjectId
		if (students.length === 0) {
			console.log("🔍 getStudentsByWorkspace - No students found with workspace, trying departmentId as ObjectId");
			students = await dataSource.getRepository(Student).find({
				where: { departmentId: new ObjectId(workspace) }
			});
			console.log("🔍 getStudentsByWorkspace - Students found with departmentId ObjectId:", students.length);
		}
		
		// If still no students found, try departmentId as string
		if (students.length === 0) {
			console.log("🔍 getStudentsByWorkspace - No students found with ObjectId, trying departmentId as string");
			students = await dataSource.getRepository(Student).find({
				where: { departmentId: workspace }
			});
			console.log("🔍 getStudentsByWorkspace - Students found with departmentId string:", students.length);
		}
		
		return res.status(200).json({
			success: true,
			data: students
		});
	} catch (error) {
		console.error('Error fetching students by workspace:', error);
		return res.status(500).json({
			success: false,
			msg: "Failed to fetch students",
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
};

export const getAllStudentDataInworkspace = async (req: Request, res: Response) => {
	try {
		// Use admin's department ObjectId from JWT token
		const adminDepartmentId = (req as any).departmentId;
		console.log('🔍 Student Controller - Admin department ID:', adminDepartmentId);
		
		// Query for students - prioritize workspace field since departmentId is corrupted
		// The students have correct department ID in workspace field, not departmentId field
		let students = await dataSource.getRepository(Student).find({ 
			where: { workspace: adminDepartmentId }
		});
		console.log('Students found with workspace field:', students.length);
		if (students.length > 0) {
			console.log('🔍 Student Controller - Sample student:', {
				_id: students[0]._id,
				workspace: students[0].workspace,
				referenceNumber: students[0].referenceNumber
			});
		}
		
		// If no students found with workspace field, try departmentId as ObjectId
		if (students.length === 0) {
			students = await dataSource.getRepository(Student).find({ 
				where: { departmentId: new ObjectId(adminDepartmentId) }
			});
			console.log('Students found with ObjectId format:', students.length);
		}
		
		// If still no students found, try departmentId as string
		if (students.length === 0) {
			students = await dataSource.getRepository(Student).find({ 
				where: { departmentId: adminDepartmentId }
			});
			console.log('Students found with string format:', students.length);
		}
		
		if (!students || students.length === 0) {
			console.log('🔍 Student Controller - No students found, returning 404');
			return res.status(404).send("No student found");
		}
		console.log('🔍 Student Controller - Returning students:', students.length);
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
	// Use departmentId from JWT token (set by verifyJWTToken middleware)
	const adminDepartmentId = (req as any).departmentId; // This is now the department ObjectId as string

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
				workspace: adminDepartmentId, // Keep as string for backward compatibility
				departmentId: new ObjectId(adminDepartmentId),
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

// PUT /api/student/update-profile - Update student profile by reference number
export const updateStudentProfile = async (req: Request, res: Response) => {
    try {
        const { referenceNumber, departmentSlug, name, nickname, image, phoneNumber, quote } = req.body;
        
        if (!referenceNumber || !departmentSlug) {
            return res.status(400).json({ 
                success: false, 
                msg: "Reference number and department slug are required" 
            });
        }

        if (!name || !nickname || !image || !phoneNumber || !quote) {
            return res.status(400).json({ 
                success: false, 
                msg: "All profile fields are required: name, nickname, image, phoneNumber, quote" 
            });
        }

        // Get department by slug to get workspace
        const { Department } = await import("../models/department.model");
        const department = await dataSource.getRepository(Department).findOne({ 
            where: { slug: departmentSlug } 
        });
        
        if (!department) {
            return res.status(404).json({ 
                success: false, 
                msg: "Department not found" 
            });
        }

        // Find student by reference number and workspace
        let student = await dataSource.getRepository(Student).findOne({ 
            where: { 
                referenceNumber: referenceNumber,
                workspace: department._id.toString()
            } 
        });

        // Fallback: try to find by departmentId as ObjectId
        if (!student) {
            student = await dataSource.getRepository(Student).findOne({ 
                where: { 
                    referenceNumber: referenceNumber,
                    departmentId: department._id
                } 
            });
        }

        if (!student) {
            return res.status(404).json({ 
                success: false, 
                msg: "Student with this reference number not found in this department" 
            });
        }

        // Update student profile
        student.name = name;
        student.nickname = nickname;
        student.image = image;
        student.phoneNumber = phoneNumber;
        student.quote = quote;
        student.updatedAt = new Date();

        await dataSource.getRepository(Student).save(student);

        return res.status(200).json({ 
            success: true, 
            msg: "Profile updated successfully",
            data: student
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            msg: "Failed to update profile", 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};
