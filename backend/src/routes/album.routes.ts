import { Router } from "express";
import * as controller from "../controllers/album.controller";
import { validateAdminLoginAndSignUpSchema } from "../middleware/validateAdminSchema";
import { validateCreateAlbumSchema, validateUpdateAlbumSchema } from "../middleware/validateAlbumSchema";
import { signInAndSignUpLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/createalbum", validateCreateAlbumSchema, controller.createAlbum);
router.get("/getalbums/:workspaceName", controller.getAlbums);
router.delete("/deletealbum/:id", controller.deleteAlbum);

export default router;
