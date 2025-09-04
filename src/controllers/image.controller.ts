import e, { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { ObjectId } from "mongodb";
import { Image } from "../models/image.model";
import { Admin } from "typeorm";



export const createImage = async (req: Request, res: Response) => {
    try {
        console.log('🔍 createImage - Request body:', req.body);
        console.log('🔍 createImage - Request headers:', req.headers);
        
        const { albumName, albumId, pictureURL, uploadedBy, referenceNumber, departmentSlug } = req.body;
        
        console.log('🔍 createImage - Extracted fields:', { 
            albumName, 
            albumId,
            pictureURL, 
            uploadedBy, 
            referenceNumber, 
            departmentSlug 
        });
        
        if (!albumName || !albumId || !pictureURL || !uploadedBy || !referenceNumber) {
            console.log('🔍 createImage - Validation failed:', {
                albumName: !!albumName,
                albumId: !!albumId,
                pictureURL: !!pictureURL,
                uploadedBy: !!uploadedBy,
                referenceNumber: !!referenceNumber
            });
            return res.status(400).json({
                success: false,
                msg: "All fields are required: albumName, albumId, pictureURL, uploadedBy, referenceNumber"
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

        // Verify reference number exists in department
        const { Student } = await import("../models/student.model");
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

        // Create image with workspace info
        const image = await dataSource.getRepository(Image).create({
            albumName,
            albumId: new ObjectId(albumId),
            pictureURL,
            uploadedBy,
            referenceNumber,
            departmentId: department._id,
            workspace: department._id.toString()
        });

        if (!image) {
            return res.status(400).json({
                success: false,
                msg: "Unable to upload image"
            });
        }

        await dataSource.getRepository(Image).save(image);

        return res.status(201).json({
            success: true,
            msg: "Image uploaded successfully",
            data: image
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Failed to upload image",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


export const getImages = async (req: Request, res: Response) => {
    try {
        const { albumId } = req.params;
        const adminDepartmentId = (req as any).departmentId; // From JWT middleware
        
        console.log('🔍 getImages - Album ID:', albumId);
        console.log('🔍 getImages - Admin Department ID:', adminDepartmentId);
        
        if (!albumId) {
            return res.status(400).json({
                success: false,
                msg: "Album ID is required"
            });
        }

        if (!adminDepartmentId) {
            return res.status(401).json({
                success: false,
                msg: "Admin department information not found"
            });
        }

        // Find images for the album that belong to the admin's department
        const images = await dataSource.getRepository(Image).find({
            where: { 
                albumId: new ObjectId(albumId),
                workspace: adminDepartmentId
            },
        });
        
        console.log('🔍 getImages - Found images:', images.length);
        console.log('🔍 getImages - Images data:', images);
        
        return res.status(200).json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('🔍 getImages - Error:', error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch images",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getImagesPublic = async (req: Request, res: Response) => {
    try {
        const { albumId } = req.params;
        
        console.log('🔍 getImagesPublic - Album ID:', albumId);
        
        if (!albumId) {
            return res.status(400).json({
                success: false,
                msg: "Album ID is required"
            });
        }

        // Find images for the album (public access - no department filtering)
        const images = await dataSource.getRepository(Image).find({
            where: { 
                albumId: new ObjectId(albumId)
            },
        });
        
        console.log('🔍 getImagesPublic - Found images:', images.length);
        console.log('🔍 getImagesPublic - Images data:', images);
        
        return res.status(200).json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('🔍 getImagesPublic - Error:', error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch images",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminDepartmentId = (req as any).departmentId; // From JWT middleware
        
        if (!id) {
            return res.status(400).json({
                success: false,
                msg: "Image ID is required"
            });
        }

        if (!adminDepartmentId) {
            return res.status(401).json({
                success: false,
                msg: "Admin department information not found"
            });
        }

        // First, find the image to check if it belongs to the admin's department
        const image = await dataSource.getRepository(Image).findOne({
            where: { _id: new ObjectId(id) }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                msg: "Image not found"
            });
        }

        // Check if the image belongs to the admin's department
        if (image.workspace !== adminDepartmentId) {
            return res.status(403).json({
                success: false,
                msg: "You can only delete images from your department"
            });
        }

        // Delete the image
        const result = await dataSource.getRepository(Image).delete(new ObjectId(id));
        
        if (result.affected === 0) {
            return res.status(404).json({
                success: false,
                msg: "Image not found"
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Image deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Failed to delete image",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
