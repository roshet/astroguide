const API_BASE_URL = "https://astroguide-production-f6e1.up.railway.app";

export async function sendChatMessage(
  message: string,
  level: "beginner" | "advanced",
  history: { role: "user" | "assistant"; content: string}[]
) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      level,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch response from server");
  }

  return response.json();
}
