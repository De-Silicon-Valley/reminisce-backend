import { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Department } from "../models/department.model";
import { Student } from "../models/student.model";
import { Event } from "../models/events.model";
import { Album } from "../models/album.model";
import { Image } from "../models/image.model";
import { In } from "typeorm";
import { ObjectId } from "mongodb";

// import { Request, Response } from "express";
// import { dataSource } from "../dataSource";
// import { Department } from "../models/department.model";

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const adminId = (req as unknown as { userId: string }).userId;

    // generate slug from name
    const rawSlug = req.body.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-"); // "Accounting Department" → "accounting-department"

    const existing = await dataSource
      .getRepository(Department)
      .findOne({ where: { slug: rawSlug } });

    if (existing) {
      return res.status(409).send({ msg: "Department slug already exists." });
    }

    const dept = dataSource.getRepository(Department).create({
      name: req.body.name,
      code: req.body.code,
      slug: rawSlug,
      adminId,
    });

    const saved = await dataSource.getRepository(Department).save(dept);

    return res.status(201).send({
      msg: "Department created successfully.",
      slug: saved.slug,
    });
  } catch (error) {
    return res.status(500).send({ msg: error instanceof Error ? error.message : error });
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

export const getDepartmentStatistics = async (req: Request, res: Response) => {
  try {
    // Use admin's department ObjectId from JWT token
    const adminDepartmentId = (req as any).departmentId;
    
    // First, get the department to verify it exists
    const dept = await dataSource
      .getRepository(Department)
      .findOne({ where: { _id: new ObjectId(adminDepartmentId) } });

    if (!dept) {
      return res.status(404).send({ msg: "Department not found." });
    }

    // Get department name, code, and slug for reference
    const departmentName = dept.name;
    const departmentCode = dept.code;
    const slug = dept.slug;

    // Count total users (students) in this department - prioritize workspace field
    console.log('🔍 Department Stats - Admin department ID:', adminDepartmentId);
    let totalUsers = await dataSource
      .getRepository(Student)
      .count({ where: { workspace: adminDepartmentId } });
    console.log('🔍 Department Stats - Students found with workspace field:', totalUsers);
    
    // If no students found with workspace field, try departmentId as ObjectId
    if (totalUsers === 0) {
      totalUsers = await dataSource
        .getRepository(Student)
        .count({ where: { departmentId: new ObjectId(adminDepartmentId) } });
      console.log('🔍 Department Stats - Students found with ObjectId:', totalUsers);
    }
    
    // If still no students found, try departmentId as string
    if (totalUsers === 0) {
      totalUsers = await dataSource
        .getRepository(Student)
        .count({ where: { departmentId: adminDepartmentId } });
      console.log('🔍 Department Stats - Students found with string:', totalUsers);
    }

    // Count active events (ongoing and upcoming) in this department
    const totalActiveEvents = await dataSource
      .getRepository(Event)
      .count({ 
        where: { 
          status: In(["ongoing", "upcoming"]),
          workspace: adminDepartmentId
        } 
      });

    // Count albums in this department
    const totalAlbums = await dataSource
      .getRepository(Album)
      .count({ where: { workspace: adminDepartmentId } });

    // Count images in this department efficiently
    // Get album names first, then count images in a single query
    const departmentAlbums = await dataSource
      .getRepository(Album)
      .find({ 
        where: { workspace: adminDepartmentId },
        select: ["albumName"] 
      });

    let totalImagesInDepartment = 0;
    if (departmentAlbums.length > 0) {
      const albumNames = departmentAlbums.map(album => album.albumName);
      
      // Use TypeORM's In operator for efficient counting
      const imageCount = await dataSource
        .getRepository(Image)
        .count({ 
          where: { 
            albumName: In(albumNames) 
          } 
        });
      totalImagesInDepartment = imageCount;
    }

    return res.status(200).send({
      department: {
        name: departmentName,
        code: departmentCode,
        slug: slug
      },
      statistics: {
        totalUsers,
        activeEvents: totalActiveEvents,
        totalAlbums,
        totalImages: totalImagesInDepartment
      }
    });

  } catch (error) {
    console.error("Error getting department statistics:", error);
    return res.status(500).send({ 
      msg: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};
