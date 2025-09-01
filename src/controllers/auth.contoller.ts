import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { dataSource } from "../dataSource";
import { Admin } from "../models/admin.model";
import { Department } from "../models/department.model";
import { SALT, SECRET } from "../utils/constants";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
	try {
		// Create admin first
		const admin = await dataSource.getRepository(Admin).create({
			username: req.body.username,
			password: bcrypt.hashSync(req.body.password, SALT),
		});

		if (!admin) return res.status(400).send("Unable to create user");

		const savedAdmin = await dataSource.getRepository(Admin).save(admin);

		// Create department (required)
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

		// Create department
		const dept = dataSource.getRepository(Department).create({
			name: req.body.departmentName,
			code: req.body.departmentCode,
			slug: rawSlug,
			adminId: savedAdmin._id.toString(),
		});

		const savedDept = await dataSource.getRepository(Department).save(dept);

		return res.status(201).send({
			msg: "Admin and department created successfully!",
			username: admin.username,
			departmentSlug: savedDept.slug,
			departmentName: savedDept.name,
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

		const token = jwt.sign({ id: admin._id }, SECRET, {
			expiresIn: 5184000,
		});

		return res.status(200).send({
			token: token,
			tokenType: "x-access-token",
			user: {
				username: admin.username,
			},
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
