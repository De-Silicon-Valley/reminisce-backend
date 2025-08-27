import { Router } from "express";
import * as controller from "../controllers/student.controller";
import { verifyJWTToken } from "../middleware/verifyToken";
import {
	verifyExistingReferenceNumber,
	verifyStudentReferenceNumber,
} from "../middleware/verifyReferenceNumber";
import {
	validateCreateStudentSchema,
	validateStudentReferenceNumberPayloadSchema,
	validateUpdateStudentSchema,
	validateUpdateStudentSchemaByAdmin,
	validateworkspaceParameter,
} from "../middleware/validateStudentSchema";
import { validateObjectId } from "../middleware/validateObjectId";
import { studentRecordAndReportLimiter } from "../middleware/rateLimit";

const router = Router();

router.post(
	"/",
	verifyJWTToken,
	verifyExistingReferenceNumber,
	validateCreateStudentSchema,
	controller.createStudent
);

router.delete("/", [verifyJWTToken, verifyStudentReferenceNumber], controller.deleteStudentRecord);
router.get("/", controller.getAllStudentData);
router.get("/:workspace", validateworkspaceParameter, controller.getAllStudentDataInworkspace);
router.patch(
	"/",
	verifyStudentReferenceNumber,
	validateUpdateStudentSchema,
	studentRecordAndReportLimiter,
	controller.updateStudentDataHavingTheReferenceNumber
);
router.post(
	"/:workspace",
	verifyJWTToken,
	validateworkspaceParameter,
	validateStudentReferenceNumberPayloadSchema,
	controller.uplooadListOfStudentReferenceNumbersWithCorrespondingworkspace
);
router.patch(
	"/admin/:id",
	verifyJWTToken,
	validateObjectId,
	validateUpdateStudentSchemaByAdmin,
	controller.updateStudentDataByAdmin
);

export default router;
