import apiService from "../services/ApiService";

export async function sendChatbotMessage(message, lang, currentState = 'start') {
    const payload = { message, lang, current_state: currentState };
    const data = await apiService.post("/api/chat/bot/respond/", payload);
    return data; // { reply, next_state }
}


