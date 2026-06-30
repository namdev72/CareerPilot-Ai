import { createRequire } from "module";
const { PDFParse } = createRequire(import.meta.url)("pdf-parse");

import {generateInterviewReport,generateResumePdf} from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        // Check if a file was uploaded
        console.log("[generateInterViewReportController] req.file:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "MISSING");
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume PDF."
            });
        }

        // Parse the PDF using pdf-parse (PDFParse class requires Uint8Array, not Buffer)
        console.log("[generateInterViewReportController] Parsing PDF buffer...");
        const parser = new PDFParse(Uint8Array.from(req.file.buffer));
        const resumeContent = await parser.getText();


        const { selfDescription, jobDescription } = req.body;

        console.log("[generateInterViewReportController] PDF parsed, text length:", resumeContent.text?.length);
        console.log("[generateInterViewReportController] selfDescription:", selfDescription?.substring(0, 100));
        console.log("[generateInterViewReportController] jobDescription:", jobDescription?.substring(0, 100));

        // Generate AI report
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });

        // Save to database
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to generate interview report.",
            error: error.message
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req,res){
    const {interviewId}=req.params
    const interviewReport=await interviewReportModel.findOne({_id:interviewId,user:req.user.id})
    if(!interviewReport)
    {
        return res.status(404).json({
            message:"Interview report not found"
        })
    }

    res.status(200).json({
        message:"Interview report feteched successfully",
        interviewReport
    })
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params
    console.log("[generateResumePdfController] Generating PDF for report:", interviewReportId)

    try {
        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport
        console.log("[generateResumePdfController] resume length:", resume?.length, "| selfDescription length:", selfDescription?.length)

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        if (!pdfBuffer) {
            return res.status(500).json({ message: "AI failed to generate resume HTML. Please try again." })
        }

        console.log("[generateResumePdfController] PDF generated, size:", pdfBuffer.length, "bytes")

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)

    } catch (error) {
        console.error("[generateResumePdfController] Error:", error.message)
        res.status(500).json({
            message: "Failed to generate resume PDF.",
            error: error.message
        })
    }
}

export {generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController}