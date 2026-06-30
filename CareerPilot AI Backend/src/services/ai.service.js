import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import puppeteer from "puppeteer";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// ==========================
// Interview Report Schema
// ==========================

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),

  title: z.string(),
});

// ==========================
// Resume PDF Schema
// ==========================

const resumePdfSchema = z.object({
  html: z.string(),
});

// ==========================
// Interview Report Generator
// ==========================

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert technical interviewer and career coach.

Analyze the following candidate.

=========================
RESUME
=========================
${resume}

=========================
SELF DESCRIPTION
=========================
${selfDescription}

=========================
JOB DESCRIPTION
=========================
${jobDescription}

Return ONLY valid JSON.

Do NOT return markdown.

Return ONLY this JSON format:

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": [
        "",
        ""
      ]
    }
  ],
  "title": ""
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    console.log("Raw Response:\n");
    console.log(text);

    const report = JSON.parse(text);

    const validated = interviewReportSchema.safeParse(report);

    if (!validated.success) {
      console.log("Schema Validation Failed");
      console.log(validated.error.format());
      return null;
    }

    console.log("Schema Validation Passed");

    return report;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// ==========================
// Convert HTML to PDF
// ==========================

async function generatePdfFromHtml(html) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      bottom: "20px",
      left: "20px",
      right: "20px",
    },
  });

  await browser.close();

  return pdfBuffer;
}

// ==========================
// Resume PDF Generator
// ==========================

async function generateResumePdf({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are a senior resume writer and ATS resume designer.

Your task is to generate ONLY a complete HTML document that will later be converted into a PDF using Puppeteer.

The resume MUST look like it was written by an experienced software engineer preparing for internships at Google, Amazon, Microsoft, Atlassian, Adobe, Uber or similar companies.

The output MUST NOT look AI generated.

=========================
CANDIDATE INFORMATION
=========================

Current Resume

${resume}

Self Description

${selfDescription}

Target Job Description

${jobDescription}

=========================
OBJECTIVE
=========================

Rewrite the resume specifically for the target job.

Improve wording.

Improve bullet points.

Highlight relevant technologies.

Remove weak or repetitive content.

Keep everything truthful.

Do not invent fake experience.

=========================
LAYOUT REQUIREMENTS
=========================

Generate COMPLETE HTML.

Use inline CSS only.

Use A4 page.

Professional typography.

Font:
Inter, Segoe UI, Calibri, Arial

Body font:
11px

Name:
30px
Bold
Centered

Section heading:
16px
Bold
Bottom border

Project title:
Bold

Technology stack:
Italic

Bullet spacing:
6px

Section spacing:
18px

Paragraph spacing:
6px

Page margins:
40px

Maximum width:
760px

Center the resume.

No large empty spaces.

No tables.

No colorful backgrounds.

Use only black, dark gray and subtle blue.

Avoid excessive bold text.

Dates should be right aligned.

Education should be compact.

Projects should consume the majority of the page.

Technical skills should be grouped.

Certificates should be one line each.

Languages at bottom.

If GitHub or LinkedIn exist,
display small icons beside them.

=========================
PROJECT SECTION
=========================

Projects should follow this exact structure.

Project Name

Technology Stack (italic)

• Achievement

• Achievement

• Achievement

• Achievement

Every bullet should begin with a strong action verb.

Examples

Designed

Implemented

Optimized

Developed

Integrated

Built

Reduced

Automated

Improved

=========================
SUMMARY
=========================

Write a concise summary.

Maximum 4 lines.

Mention

Backend

Problem Solving

System Design

Scalable Applications

Generative AI if relevant

=========================
SKILLS
=========================

Group skills.

Programming Languages

Frontend

Backend

Databases

DevOps

Cloud

AI

Tools

=========================
IMPORTANT
=========================

The resume MUST fit within ONE PAGE whenever possible.

If unavoidable,
maximum TWO pages.

Avoid unnecessary text.

Avoid generic filler.

Maintain excellent whitespace.

Everything must align properly.

Generate pixel-perfect HTML suitable for Puppeteer PDF generation.

Return ONLY valid JSON.

{
  "html":"<!DOCTYPE html>...</html>"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    console.log("Raw Resume Response:\n");
    console.log(text);

    const jsonContent = JSON.parse(text);

    const validated = resumePdfSchema.safeParse(jsonContent);

    if (!validated.success) {
      console.log("Resume Schema Validation Failed");
      console.log(validated.error.format());
      return null;
    }

    console.log("Resume Schema Validation Passed");

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export {
  generateInterviewReport,
  generateResumePdf,
};