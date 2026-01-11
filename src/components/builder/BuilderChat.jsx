if (result.status === 'agent_ready' && result.agent_data) {
    // Агент готов!
    const { 
        agent_name, 
        business_type, 
        description,
        instructions,
        knowledge_base 
    } = result.agent_data;
    const agentId = result.agent_id;
    
    console.log('✅ Agent created:', agentId);
    console.log('Agent data:', result.agent_data);
    
    // Определяем аватар по имени
    const isFemale = agent_name.toLowerCase().includes('виктори') || 
                     agent_name.toLowerCase().includes('анна') || 
                     agent_name.toLowerCase().includes('мария') ||
                     agent_name.toLowerCase().includes('елена');
    
    const avatarUrl = isFemale
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

    // Формируем финальное сообщение для пользователя
    const finalMessage = `🎉 Отлично! Агент "${agent_name}" для "${business_type}" создан!\n\nТеперь вы можете:\n1. Протестировать агента в окне предпросмотра справа\n2. Нажать "Сохранить" для активации\n3. Настроить каналы связи (Telegram, WhatsApp)`;
    
    const finalMessages = [...updatedMessages, { 
        role: 'assistant', 
        content: finalMessage
    }];
    
    setMessages(finalMessages);
    saveHistory(finalMessages); // ✅ Сохраняем историю НАВСЕГДА

    // Передаём данные агента в родительский компонент
    onAgentUpdate({ 
        name: agent_name,
        business_type: business_type,
        description: description || business_type,
        instructions: instructions || '',
        knowledge_base: typeof knowledge_base === 'string' 
            ? knowledge_base 
            : JSON.stringify(knowledge_base, null, 2),
        avatar_url: avatarUrl,
        external_agent_id: agentId,
        status: 'draft'
    });
    
    // ✅ УДАЛЕНО: Больше НЕ очищаем историю!
    
} else if (result.response) {
    // ... остальной код
}
