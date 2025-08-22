import e, { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { ObjectId } from "mongodb";
import { Image } from "../models/image.model";
import { Admin } from "typeorm";



export const createImage = async (req: Request, res: Response) => {
    const image = await dataSource.getRepository(Image).create({
        albumName: req.body.albumName,
        pictureURL: req.body.pictureURL,
        uploadedBy: req.body.uploadedBy,
    });

    if (!image) {
        return res.status(400).send({ msg: "Unable to upload image." });
    }

    await dataSource.getRepository(Image).save(image);

    return res.status(201).send({
        msg: "Image created successfully.",
    });
};//on create of image increase the count of the number of images


export const getImages = async (req: Request, res: Response) => {
    try {
        const images = await dataSource.getRepository(Image).find({
            where: { albumName: req.params.albumName },
        });
        if (!images) {
            return res.status(404).send("No images found");
        }
        return res.status(200).send(images);
    } catch (error) {
        return res.status(500).send({
            msg: error,
        });
    }
};

export const deleteImage = async (req: Request, res: Response) => {
    try {
        const result = await dataSource.getRepository(Image).delete(req.params.id);
        if (result.affected === 0) {
            return res.status(404).send("Image not found");
        }
        return res.status(200).send("Image deleted successfully");
    } catch (error) {
        return res.status(500).send({
            msg: error,
        });
    }
};
