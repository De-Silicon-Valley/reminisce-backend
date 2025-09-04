import { Router } from "express";
import * as controller from "../controllers/image.controller";
import { verifyJWTToken } from "../middleware/verifyToken";

import {
	validateCreateImageSchema,
	validateAlbumNameParam,
	validateImageIdParam
} from "../middleware/validateImageSchema";

const router = Router();

router.post("/uploadimage", validateCreateImageSchema, controller.createImage); // on create of image increase the count of the number of images
router.post("/public/upload", controller.createImage); // Public route for student uploads
router.get("/getimages/:albumId", verifyJWTToken, controller.getImages); // Admin route with JWT
router.get("/public/getimages/:albumId", controller.getImagesPublic); // Public route for client-side
router.get("/count", verifyJWTToken, controller.getTotalImageCount); // Get total image count for department
router.delete("/deleteimage/:id", verifyJWTToken, validateImageIdParam, controller.deleteImage);

export default router;
