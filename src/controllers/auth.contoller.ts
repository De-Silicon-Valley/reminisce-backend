import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { dataSource } from "../dataSource";
import { Admin } from "../models/admin.model";
import { Department } from "../models/department.model";
import { SALT, SECRET } from "../utils/constants";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export const signup = async (req: Request, res: Response) => {
	try {
		// Create department first
		// Generate slug from department name
		const rawSlug = req.body.departmentName
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "-");

		// Check if slug already exists
		const existingDept = await dataSource
			.getRepository(Department)
			.findOne({ where: { slug: rawSlug } });

		if (existingDept) {
			return res.status(409).send({ msg: "Department slug already exists." });
		}

		// Check if department code already exists
		const existingCode = await dataSource
			.getRepository(Department)
			.findOne({ where: { code: req.body.departmentCode } });

		if (existingCode) {
			return res.status(409).send({ msg: "Department code already exists." });
		}

		// Create department first
		const dept = dataSource.getRepository(Department).create({
			name: req.body.departmentName,
			code: req.body.departmentCode,
			slug: rawSlug,
		});

		const savedDept = await dataSource.getRepository(Department).save(dept);

		// Create admin linked to department
		const admin = await dataSource.getRepository(Admin).create({
			username: req.body.username,
			password: bcrypt.hashSync(req.body.password, SALT),
			departmentId: savedDept._id, // Link admin to department using department ObjectId
		});

		if (!admin) return res.status(400).send("Unable to create user");

		const savedAdmin = await dataSource.getRepository(Admin).save(admin);

		// Update department with admin ID
		savedDept.adminId = savedAdmin._id.toString();
		await dataSource.getRepository(Department).save(savedDept);

		// Generate JWT token since user just provided password
		const token = jwt.sign({ id: savedAdmin._id, departmentId: savedAdmin.departmentId.toString() }, SECRET, {
			expiresIn: 5184000,
		});

		return res.status(201).send({
			msg: "Admin and department created successfully!",
			token: token,
			tokenType: "x-access-token",
			username: admin.username,
			departmentId: savedDept._id.toString(),
			departmentCode: savedDept.code,
			departmentSlug: savedDept.slug,
			departmentName: savedDept.name,
			department: {
				id: savedDept._id.toString(),
				code: savedDept.code,
				name: savedDept.name,
				slug: savedDept.slug,
			},
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};

export const signin = async (req: Request, res: Response) => {
	try {
		const admin = await dataSource.getRepository(Admin).findOneBy({
			username: req.body.username,
		});
		if (!admin) return res.status(404).send("Invalid credentials");

		if (!admin.isActive) return res.status(401).send("Account not activated");

		// check password
		const passwordIsValid = bcrypt.compareSync(req.body.password, admin.password);

		if (!passwordIsValid) return res.status(404).send("Invalid credentials");

		// Get department information
		const department = await dataSource.getRepository(Department).findOneBy({
			_id: new ObjectId(admin.departmentId),
		});

		if (!department) {
			return res.status(500).send("Department not found for admin");
		}

		const token = jwt.sign({ id: admin._id, departmentId: admin.departmentId.toString() }, SECRET, {
			expiresIn: 5184000,
		});

		return res.status(200).send({
			token: token,
			tokenType: "x-access-token",
			user: {
				username: admin.username,
				departmentId: admin.departmentId.toString(),
			},
			department: {
				id: department._id.toString(),
				code: department.code,
				name: department.name,
				slug: department.slug,
			},
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
