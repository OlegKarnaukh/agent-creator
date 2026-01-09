const BASE_URL = 'https://neuro-seller-production.up.railway.app';

/**
 * Отправка сообщения в чат конструктора
 * @param {string} userId - ID пользователя
 * @param {string} message - Текст сообщения
 * @param {Array} files - Массив файлов (опционально)
 * @returns {Promise<{response: string, agent_created: boolean, agent_id: string}>}
 */
export async function sendConstructorMessage(userId, message, files = []) {
    const response = await fetch(`${BASE_URL}/api/constructor-chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            message: message,
            files: files
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

/**
 * Тестирование агента (отправка сообщения в preview)
 * @param {string} agentId - ID агента
 * @param {string} message - Текст сообщения
 * @returns {Promise<{response: string, agent_name: string}>}
 */
export async function testAgent(agentId, message) {
    const response = await fetch(`${BASE_URL}/api/test-agent`, {
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
 * Сохранение агента
 * @param {string} agentId - ID агента
 * @returns {Promise<{success: boolean, redirect_url: string}>}
 */
export async function saveAgent(agentId) {
    const response = await fetch(`${BASE_URL}/api/save-agent`, {
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