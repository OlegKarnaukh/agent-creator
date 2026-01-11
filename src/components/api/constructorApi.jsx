const BASE_URL = 'https://neuro-seller-production.up.railway.app';

/**
 * Отправка сообщения в чат конструктора
 * @param {string} userId - ID пользователя
 * @param {Array} messages - Массив сообщений [{role: 'user', content: '...'}, ...]
 * @param {string|null} conversationId - ID беседы (для продолжения диалога)
 * @returns {Promise<{response?: string, status?: string, agent_id?: string, agent_data?: object, conversation_id?: string}>}
 */
export async function sendConstructorMessage(userId, messages, conversationId = null) {
    const body = {
        user_id: userId,
        messages: messages  // Формат: [{role: 'user', content: 'текст'}, ...]
    };

    // Добавляем conversation_id только если он есть
    if (conversationId) {
        body.conversation_id = conversationId;
    }

    const response = await fetch(`${BASE_URL}/api/v1/constructor/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Railway может вернуть либо обычный ответ, либо agent_ready
    // Обычный ответ: { response: "...", conversation_id: "..." }
    // Агент готов: { status: "agent_ready", agent_id: "...", agent_data: {...}, conversation_id: "..." }

    return data;
}

/**
 * Тестирование агента (отправка сообщения в preview)
 * @param {string} agentId - ID агента
 * @param {string} message - Текст сообщения
 * @returns {Promise<{response: string, agent_name: string}>}
 */
export async function testAgent(agentId, message) {
    const response = await fetch(`${BASE_URL}/api/v1/agents/test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            agent_id: agentId,
            message: message
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

/**
 * Сохранение агента (активация)
 * @param {string} agentId - ID агента
 * @returns {Promise<{success: boolean, redirect_url: string}>}
 */
export async function saveAgent(agentId) {
    const response = await fetch(`${BASE_URL}/api/v1/agents/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            agent_id: agentId
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}
