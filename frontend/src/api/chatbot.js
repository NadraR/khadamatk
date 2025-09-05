import apiService from "../services/ApiService";

export async function sendChatbotMessage(message) {
    const payload = { message };
    const data = await apiService.post("/api/chat/bot/respond/", payload);
    return data; // { reply }
}


