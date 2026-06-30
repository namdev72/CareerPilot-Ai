import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            console.log("[useInterview] Calling generateInterviewReport API...")
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            console.log("[useInterview] API response:", response)
            setReport(response.interviewReport)
        } catch (error) {
            console.error("[useInterview] generateReport error:", error?.response?.data || error.message || error)
        } finally {
            setLoading(false)
        }

        // Guard: return null if the API call failed (response is null)
        return response ? response.interviewReport : null
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        // NOTE: deliberately NOT calling setLoading(true) here — PDF download
        // is a background action and should not blank the interview page.
        console.log("[useInterview] getResumePdf called for:", interviewReportId)
        try {
            const response = await generateResumePdf({ interviewReportId })
            console.log("[useInterview] PDF blob received, size:", response?.size)
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            // Clean up DOM and revoke object URL
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            console.log("[useInterview] PDF download triggered successfully")
        }
        catch (error) {
            console.error("[useInterview] getResumePdf error:", error?.response?.data || error.message || error)
            alert("Failed to generate resume PDF. Please try again.")
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}