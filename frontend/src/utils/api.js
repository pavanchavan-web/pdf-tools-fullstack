const API_BASE = "https://pdf-tools-fullstack.onrender.com/api";

/**
 * 🔹 LEGACY SUPPORT (DO NOT REMOVE)
 * Used by existing tools (merge, split, image-to-pdf, etc.)
 */
export async function postFile(endpoint, formData) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Backend error");
  }

  return await res.blob();
}

/**
 * 🔹 FUTURE JOB SYSTEM (Phase-2 ready)
 */
export async function postJob(endpoint, formData) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json(); // { jobId }
}

export async function getJobStatus(jobId) {
  const res = await fetch(`${API_BASE}/job/${jobId}`);
  if (!res.ok) throw new Error("Job fetch failed");
  return res.json();
}

export async function downloadResult(filePath) {
  const res = await fetch(
    `https://pdf-tools-fullstack.onrender.com/${filePath}`
  );
  if (!res.ok) throw new Error("Download failed");
  return await res.blob();
}
