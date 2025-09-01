import { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Department } from "../models/department.model";

export const createDepartment = async (req: Request, res: Response) => {
  try {
    // req.userId is set by verifyJWTToken middleware
    const adminId = (req as unknown as { userId: string }).userId;

    // normalize and ensure slug uniqueness
    const rawSlug = String(req.body.slug || "")
      .trim()
      .toLowerCase();
    if (!rawSlug) return res.status(400).send({ msg: "Invalid slug." });

    const existing = await dataSource
      .getRepository(Department)
      .findOne({ where: { slug: rawSlug } });

    if (existing) {
      return res.status(409).send({ msg: "Department slug already exists." });
    }

    const dept = await dataSource.getRepository(Department).create({
      name: req.body.name,
      code: req.body.code,
      slug: rawSlug,
      adminId: adminId,
    });

    if (!dept)
      return res.status(400).send({ msg: "Unable to create department." });

    const saved = await dataSource.getRepository(Department).save(dept);

    // return the created slug to the caller
    return res
      .status(201)
      .send({ msg: "Department created successfully.", slug: saved.slug });
  } catch (error) {
    return res.status(500).send({ msg: error });
  }
};

export const listDepartments = async (req: Request, res: Response) => {
  try {
    const depts = await dataSource.getRepository(Department).find();
    return res.status(200).send(depts);
  } catch (error) {
    return res.status(500).send({ msg: error });
  }
};

// NOTE: id-based lookup removed; use slug-based lookup instead

export const getDepartmentBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const dept = await dataSource
      .getRepository(Department)
      .findOne({ where: { slug: slug } });

    if (!dept) return res.status(404).send({ msg: "Department not found." });
    return res.status(200).send(dept);
  } catch (error) {
    return res.status(500).send({ msg: error });
  }
};
