import e, { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Album } from "../models/album.model";
import { Admin } from "typeorm";
import { ObjectId } from "mongodb";

export const createAlbum = async (req: Request, res: Response) => {
    try {
        console.log('Received album creation request:', req.body);
        console.log('Admin ID from token:', (req as any).userId);
        console.log('Request headers:', req.headers);
        
        const { albumName } = req.body;
        
        console.log('Extracted fields:', { albumName });
        
        if (!albumName) {
            console.log('Validation failed: missing album name');
            return res.status(400).json({ 
                msg: "Album name is required",
                received: { albumName }
            });
        }

        // Use departmentId from JWT token (set by verifyJWTToken middleware)
        const adminDepartmentId = (req as any).departmentId; // This is now the department ObjectId as string
        const adminId = (req as any).userId;
        
        console.log('JWT Token Info - Admin ID:', adminId);
        console.log('JWT Token Info - Department ID:', adminDepartmentId);
        
        if (!adminDepartmentId) {
            console.log('Error: No department ID found in JWT token');
            return res.status(400).json({ 
                msg: "Admin department information not found in token",
                received: { adminId, adminDepartmentId }
            });
        }
        
        const finalDepartmentId = new ObjectId(adminDepartmentId);
        const finalWorkspaceName = adminDepartmentId;
        
        console.log('Final department ID:', finalDepartmentId);
        console.log('Final workspace name:', finalWorkspaceName);

        const album = await dataSource.getRepository(Album).create({
            albumName,
            workspaceName: finalWorkspaceName,
            departmentId: finalDepartmentId,
            workspace: adminDepartmentId,
        });

        if (!album) {
            console.log('Failed to create album entity');
            return res.status(400).json({ msg: "Unable to create album." });
        }

        const savedAlbum = await dataSource.getRepository(Album).save(album);
        console.log('Album created successfully:', savedAlbum);

        return res.status(201).json({
            success: true,
            msg: "Album created successfully.",
            data: savedAlbum
        });
    } catch (error) {
        console.error('Error creating album:', error);
        return res.status(500).json({
            success: false,
            msg: "Failed to create album",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// POST /api/album/public - Public endpoint for client-side access using workspace ID
export const getAlbumsByWorkspace = async (req: Request, res: Response) => {
    try {
        const { workspace } = req.body;
        
        if (!workspace) {
            return res.status(400).json({
                success: false,
                msg: "Workspace ID is required"
            });
        }
        
        console.log("🔍 getAlbumsByWorkspace - Workspace ID:", workspace);
        
        // Find albums by workspace field
        let albums = await dataSource.getRepository(Album).find({
            where: { workspace: workspace }
        });
        
        console.log("🔍 getAlbumsByWorkspace - Albums found with workspace field:", albums.length);
        
        // If no albums found by workspace field, try departmentId as ObjectId
        if (albums.length === 0) {
            console.log("🔍 getAlbumsByWorkspace - No albums found with workspace, trying departmentId as ObjectId");
            albums = await dataSource.getRepository(Album).find({
                where: { departmentId: new ObjectId(workspace) }
            });
            console.log("🔍 getAlbumsByWorkspace - Albums found with departmentId ObjectId:", albums.length);
        }
        
        // If still no albums found, try departmentId as string
        if (albums.length === 0) {
            console.log("🔍 getAlbumsByWorkspace - No albums found with ObjectId, trying departmentId as string");
            albums = await dataSource.getRepository(Album).find({
                where: { departmentId: workspace }
            });
            console.log("🔍 getAlbumsByWorkspace - Albums found with departmentId string:", albums.length);
        }
        
        return res.status(200).json({
            success: true,
            data: albums
        });
    } catch (error) {
        console.error('Error fetching albums by workspace:', error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch albums",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getAlbums = async (req: Request, res: Response) => {
    try {
        // Use admin's department ObjectId from JWT token
        const adminDepartmentId = (req as any).departmentId;
        console.log("🔍 getAlbums - Admin department ID from JWT:", adminDepartmentId);
        
        // Find albums by admin's department using workspace field
        let albums = await dataSource.getRepository(Album).find({
            where: { workspace: adminDepartmentId }
        });
        
        console.log("🔍 getAlbums - Albums found with workspace field:", albums.length);
        console.log("🔍 getAlbums - Albums data:", albums);
        
        // If no albums found by workspace field, try departmentId as ObjectId
        if (albums.length === 0) {
            console.log("🔍 getAlbums - No albums found with workspace, trying departmentId as ObjectId");
            albums = await dataSource.getRepository(Album).find({
                where: { departmentId: new ObjectId(adminDepartmentId) }
            });
            console.log("🔍 getAlbums - Albums found with departmentId ObjectId:", albums.length);
        }
        
        // If still no albums found, try departmentId as string
        if (albums.length === 0) {
            console.log("🔍 getAlbums - No albums found with ObjectId, trying departmentId as string");
            albums = await dataSource.getRepository(Album).find({
                where: { departmentId: adminDepartmentId }
            });
            console.log("🔍 getAlbums - Albums found with departmentId string:", albums.length);
        }
        
        return res.status(200).json({
            success: true,
            data: albums
        });
    } catch (error) {
        console.error('Error fetching albums:', error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch albums",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


export const deleteAlbum = async (req: Request, res: Response) => {
    try {
        
        const result = await dataSource.getRepository(Album).delete(req.params.id);
        
        if (result.affected === 0) {
            return res.status(404).json({
                success: false,
                msg: "Album not found"
            });
        }
        
        console.log('Album deleted successfully');
        return res.status(200).json({
            success: true,
            msg: "Album deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Failed to delete album",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};




