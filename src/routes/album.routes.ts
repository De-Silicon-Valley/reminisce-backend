import { Router } from "express";
import * as controller from "../controllers/album.controller";
import { validateCreateAlbumSchema, validateUpdateAlbumSchema } from "../middleware/validateAlbumSchema";
import { verifyJWTToken } from "../middleware/verifyToken";

const router = Router();

// Protect all album routes with JWT authentication
router.use(verifyJWTToken);

router.post("/createalbum", validateCreateAlbumSchema, controller.createAlbum);
router.get("/getalbums/:workspaceName", controller.getAlbums);
router.delete("/deletealbum/:id", controller.deleteAlbum);

export default router;
