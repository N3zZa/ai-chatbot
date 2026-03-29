export const ANON_MSG_LIMIT = 3;


export const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "http://localhost:3000";


export const ALLOWED_MIME_TYPES = [
  "application/pdf", // pdf
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "text/plain", //text
  "text/csv", // CSV
  "text/markdown", // CSV
];
export const ALLOWED_MIME_TYPES_SET = new Set(ALLOWED_MIME_TYPES);