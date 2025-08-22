import { Router } from "express";
import * as controller from "../controllers/image.controller";

import {
	validateCreateImageSchema,
	validateAlbumNameParam,
	validateImageIdParam
} from "../middleware/validateImageSchema";

const router = Router();

router.post("/uploadimage", validateCreateImageSchema, controller.createImage); // on create of image increase the count of the number of images
router.get("/getimages/:albumName", validateAlbumNameParam, controller.getImages);
router.delete("/deleteimage/:id", validateImageIdParam, controller.deleteImage);

export default router;
