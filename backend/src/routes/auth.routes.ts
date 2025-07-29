import { Router } from "express";
import * as controller from "../controllers/auth.contoller";
import { validateAdminLoginAndSignUpSchema } from "../middleware/validateAdminSchema";
import { signInAndSignUpLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/signup", validateAdminLoginAndSignUpSchema, signInAndSignUpLimiter, controller.signup);
router.post("/signin", validateAdminLoginAndSignUpSchema, signInAndSignUpLimiter, controller.signin);

export default router;
