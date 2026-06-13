import axios from "axios";

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  "https://your-n8n-instance.com/webhook/ats-cv-scan";

export async function analyzeCV({ file, jobTitle, jobDescription }) {
  const formData = new FormData();
  formData.append("cv", file);
  formData.append("jobTitle", jobTitle);
  formData.append("jobDescription", jobDescription);

  const response = await axios.post(N8N_WEBHOOK_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });

  return response.data;
}

export default { analyzeCV };