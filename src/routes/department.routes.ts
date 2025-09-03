import { Router } from "express";
import * as controller from "../controllers/department.controller";
import { verifyJWTToken } from "../middleware/verifyToken";
import { validateCreateDepartmentSchema } from "../middleware/validateDepartmentSchema";
// no id-based lookups for departments; slug is used instead

const router = Router();

// only admins can create
router.post(
  "/",
  [verifyJWTToken, validateCreateDepartmentSchema],
  controller.createDepartment
);
// public list
router.get("/", controller.listDepartments);

// get by slug
router.get("/:slug", controller.getDepartmentBySlug);

// get department statistics (requires admin authentication)
router.get("/:slug/statistics", [verifyJWTToken], controller.getDepartmentStatistics);

export default router;
