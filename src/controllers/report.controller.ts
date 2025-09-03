import { Request, Response } from "express";
import { dataSource } from "../dataSource";
import { Report } from "../models/report.model";
import { Student } from "../models/student.model";
import { ObjectId } from "mongodb";

export const createReport = async (req: Request, res: Response) => {
	try {
		
		const { title, content, referenceNumber, workspaceName } = req.body;

		if (!title || !content || !referenceNumber || !workspaceName) {
			return res.status(400).json({
				success: false,
				msg: "All fields are required: title, content, referenceNumber, workspaceName"
			});
		}

		// Check if student exists and is onboarded in this department
		const studentRepository = dataSource.getRepository(Student);
		const student = await studentRepository.findOne({
			where: { 
				referenceNumber: referenceNumber,
				workspace: workspaceName
			}
		});

		if (!student) {
			return res.status(404).json({
				success: false,
				msg: "Student not found or not onboarded in this department"
			});
		}

		// Create report with student info from database
		const report = await dataSource.getRepository(Report).create({
			title,
			content,
			workspaceName,
			studentName: student.name || 'Unknown',
			studentEmail: 'No email', // Student model doesn't have email field
			referenceNumber: student.referenceNumber
		});

		if (!report) {
			return res.status(400).json({
				success: false,
				msg: "Unable to create report"
			});
		}

		const savedReport = await dataSource.getRepository(Report).save(report);

		return res.status(201).json({
			success: true,
			msg: "Report created successfully",
			data: savedReport
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			msg: "Failed to create report",
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
};

export const getReports = async (req: Request, res: Response) => {
	try {
		console.log('Getting reports, admin ID:', (req as any).userId);
		console.log('Data source initialized:', dataSource.isInitialized);
		console.log('Report entity available:', !!dataSource.getRepository(Report));
		
		let condition = { where: {} };

		if (req.params.id) {
			condition = {
				where: { _id: new ObjectId(req.params.id) },
			};
		}

		const reports = await dataSource.getRepository(Report).find(condition);

		return res.status(200).json({
			success: true,
			data: reports
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			msg: "Failed to get reports",
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
};

// export const getActiveReports =async (params:type) => {

// }

export const toggleReportStatus = async (req: Request, res: Response) => {
	try {
		console.log('Toggling report status, ID:', req.params.id);
		console.log('Admin ID:', (req as any).userId);
		
		const report = await dataSource.getRepository(Report).findOne({
			where: { _id: new ObjectId(req.params.id) }
		});
		
		if (!report) {
			return res.status(404).json({
				success: false,
				msg: "Report not found"
			});
		}
		
		// Toggle the resolved status
		const newResolvedStatus = !report.resolved;
		
		const result = await dataSource.getRepository(Report).update(
			{ _id: new ObjectId(req.params.id) }, 
			{ resolved: newResolvedStatus }
		);
		
		if (result.affected === 0) {
			return res.status(500).json({
				success: false,
				msg: "Failed to update report status"
			});
		}
		
		console.log(`Report ${newResolvedStatus ? 'resolved' : 'marked as unresolved'} successfully`);
		return res.status(200).json({
			success: true,
			msg: `Report ${newResolvedStatus ? 'resolved' : 'marked as unresolved'} successfully`,
			data: { resolved: newResolvedStatus }
		});
	} catch (error) {
		console.error('Error toggling report status:', error);
		return res.status(500).json({
			success: false,
			msg: "Failed to toggle report status",
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
};

export const deleteReport = async (req: Request, res: Response) => {
	try {
		console.log('Deleting report with ID:', req.params.id);
		console.log('Admin ID:', (req as any).userId);
		
		// Use the report from middleware if available
		const report = (req as any).report;
		if (!report) {
			return res.status(404).json({
				success: false,
				msg: "Report not found"
			});
		}
		
		const result = await dataSource.getRepository(Report).delete(req.params.id);
		
		if (result.affected === 0) {
			return res.status(500).json({
				success: false,
				msg: "Failed to delete report"
			});
		}
		
		console.log('Report deleted successfully');
		return res.status(200).json({
			success: true,
			msg: "Report deleted permanently"
		});
	} catch (error) {
		console.error('Error deleting report:', error);
		return res.status(500).json({
			success: false,
			msg: "Failed to delete report",
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
};
