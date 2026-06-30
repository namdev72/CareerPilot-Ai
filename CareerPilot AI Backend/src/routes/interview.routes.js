import express from "express";
import authUser from "../middlewares/auth.middleware.js";
import {generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
} from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";


const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.route("/").post(authUser,upload.single("resume"),generateInterViewReportController);


/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.route("/report/:interviewId").get(authUser,getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.route("/").get(authUser,getAllInterviewReportsController)

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */

interviewRouter.route("/resume/pdf/:interviewReportId").post(authUser,generateResumePdfController)


export default interviewRouter;