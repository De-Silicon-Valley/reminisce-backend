import { Router } from "express";
import * as controller from "../controllers/report.controller";
import { verifyStudentReferenceNumber } from "../middleware/verifyReferenceNumber";
import { verifyJWTToken } from "../middleware/verifyToken";
import { validateObjectId } from "../middleware/validateObjectId";
import { validateReport } from "../middleware/validateReport";
import { studentRecordAndReportLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/", [verifyStudentReferenceNumber, studentRecordAndReportLimiter], controller.createReport);

// only admins can see reports
router.get("/", verifyJWTToken, controller.getReports);
router.get("/:id", verifyJWTToken, controller.getReports); // get report by id

router.patch("/:id/close", [verifyJWTToken, validateObjectId, validateReport], controller.closeReport);

export default router;
