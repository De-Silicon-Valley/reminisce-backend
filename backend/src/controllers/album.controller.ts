import e, { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Album } from "../models/album.model";
import { Admin } from "typeorm";

export const createAlbum = async (req: Request, res: Response) => {
    const album = await dataSource.getRepository(Album).create({
        albumName: req.body.albumName,
        workspaceName: req.body.workspaceName,
    });

    if (!album) {
        return res.status(400).send({ msg: "Unable to create album." });
    }

    await dataSource.getRepository(Album).save(album);

    return res.status(201).send({
        msg: "Album created successfully.",
    });
};


export const getAlbums = async (req: Request, res: Response) => {
    try{
        console.log("Fetching albums for workspace:", req.params.workspaceName);
        const albums = await dataSource.getRepository(Album).find({where:{workspaceName:req.params.workspaceName}});
        
        if(!albums){
            return res.status(404).send("No albums found");
        }
        return res.status(200).send(albums);
    } catch (error) {
        return res.status(500).send({
            msg: error,
        });
    }
};


export const deleteAlbum = async (req: Request, res: Response) => {
    try {
        const result = await dataSource.getRepository(Album).delete(req.params.id);
        if (result.affected === 0) {
            return res.status(404).send("Album not found");
        }
        return res.status(200).send("Album deleted successfully");
    } catch (error) {
        return res.status(500).send({
            msg: error,
        });
    }
};




