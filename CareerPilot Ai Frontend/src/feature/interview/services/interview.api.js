import axios from "axios";

const api=axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
})

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)

    // Only append file if one was selected
    if (resumeFile) {
        console.log("[interview.api] Appending resume file:", resumeFile.name, resumeFile.size, "bytes", resumeFile.type)
        formData.append("resume", resumeFile)
    } else {
        console.warn("[interview.api] No resume file provided")
    }

    console.log("[interview.api] Sending POST /api/interview/ with FormData")

    // IMPORTANT: Do NOT set Content-Type manually.
    // axios auto-sets 'multipart/form-data; boundary=...' when the body is FormData.
    // Setting it manually removes the boundary and breaks multer on the server.
    const response = await api.post("/api/interview/", formData)

    console.log("[interview.api] Response:", response.data)
    return response.data
}

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}