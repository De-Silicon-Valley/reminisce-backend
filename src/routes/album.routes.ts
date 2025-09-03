import { Router } from "express";
import * as controller from "../controllers/album.controller";
import { validateCreateAlbumSchema, validateUpdateAlbumSchema } from "../middleware/validateAlbumSchema";
import { verifyJWTToken } from "../middleware/verifyToken";

const router = Router();

// GET routes - no token required
router.get("/getalbums/:workspaceName", controller.getAlbums);

// POST, DELETE routes - token required
router.post("/createalbum", verifyJWTToken, validateCreateAlbumSchema, controller.createAlbum);
router.delete("/deletealbum/:id", verifyJWTToken, controller.deleteAlbum);

export default router;
