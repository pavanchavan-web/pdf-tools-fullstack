const API_BASE = "https://pdf-tools-fullstack-backend.onrender.com/api";

export async function warmUpBackend() {
  try {
    await fetch(`${API_BASE}/health`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    // silent fail — this is only a warm-up
  }
}
