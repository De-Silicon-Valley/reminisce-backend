import e, { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Album } from "../models/album.model";
import { Admin } from "typeorm";

export const createAlbum = async (req: Request, res: Response) => {
    try {
        console.log('Received album creation request:', req.body);
        console.log('Admin ID from token:', (req as any).userId);
        console.log('Request headers:', req.headers);
        
        const { albumName, workspaceName, department } = req.body;
        
        console.log('Extracted fields:', { albumName, workspaceName, department });
        
        if (!albumName || (!workspaceName && !department)) {
            console.log('Validation failed: missing required fields');
            return res.status(400).json({ 
                msg: "Album name and workspace/department are required",
                received: { albumName, workspaceName, department }
            });
        }

        // Use department if provided, otherwise fall back to workspaceName
        const finalWorkspaceName = department || workspaceName;
        const adminId = (req as any).userId;
        
        console.log('Final workspace name:', finalWorkspaceName);

        const album = await dataSource.getRepository(Album).create({
            albumName,
            workspaceName: finalWorkspaceName,
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


export const getAlbums = async (req: Request, res: Response) => {
    try {
        console.log("Fetching albums for workspace:", req.params.workspaceName);
        
        const albums = await dataSource.getRepository(Album).find({
            where: { workspaceName: req.params.workspaceName }
        });
        
        
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




