export const ANON_MSG_LIMIT = 3;


export const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";


export const ALLOWED_MIME_TYPES = [
  "application/pdf", // pdf
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "text/plain", //text
  "text/csv", // CSV
  "text/markdown", // CSV
];