import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { dataSource } from "../dataSource";
import { Admin } from "../models/admin.model";
import { SALT, SECRET } from "../utils/constants";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
	try {
		const admin = await dataSource.getRepository(Admin).create({
			username: req.body.username,
			password: bcrypt.hashSync(req.body.password, SALT),
		});

		if (!admin) return res.status(400).send("Unable to create user");

		await dataSource.getRepository(Admin).save(admin);

		return res.status(201).send({
			msg: "Signed up successfully!",
			username: admin.username,
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
