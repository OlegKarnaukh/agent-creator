// Components/builder/BuilderChat

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

// ============================================================
// КОНСТАНТЫ
// ============================================================

const STORAGE_KEY_PREFIX = 'neuro_seller_conversation_';
const USER_ID_KEY = 'neuro_seller_user_id';
const API_BASE = 'https://neuro-seller-production.up.railway.app/api/v1';

// ✅ Статические аватарки по умолчанию
const DEFAULT_AVATAR_VICTORIA = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Victoria&style=circle&backgroundColor=fef3c7&hair=longHair&hairColor=auburn&accessories=prescription02&clothingColor=3c4f5c&top=longHairStraight&accessoriesColor=262e33&facialHairColor=auburn&clothesColor=262e33&graphicType=skull&eyeType=happy&eyebrowType=default&mouthType=smile&skinColor=light';

const DEFAULT_AVATAR_ALEXANDER = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander&style=circle&backgroundColor=c0aede&hair=shortHairShortWaved&hairColor=brown&accessories=prescription01&clothingColor=black&top=shortHairShortWaved&accessoriesColor=262e33&facialHairColor=black&clothesColor=heather&graphicType=bat&eyeType=default&eyebrowType=default&mouthType=default&skinColor=light';

// ============================================================
// API HELPERS
// ============================================================

async function sendConstructorMessage(userId, messages, conversationId = null) {
  const body = {
    user_id: userId,
    messages: messages
  };
  
  // Если есть conversation_id → передаём
  if (conversationId) {
    body.conversation_id = conversationId;
  }
  
  const response = await fetch(`${API_BASE}/constructor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}

async function loadConversationHistory(conversationId) {
  const response = await fetch(`${API_BASE}/constructor/history/${conversationId}`);
  
  if (!response.ok) {
    console.warn(`⚠️ Не удалось загрузить историю conversation ${conversationId}`);
    return [];
  }
  
  const data = await response.json();
  return data.messages || [];
}

// ============================================================
// УТИЛИТЫ
// ============================================================

function cleanMarkdown(text) {
  if (!text) return text;
  
  // Удаляем Markdown форматирование, но оставляем жирный текст
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // **bold** → <strong>
    .replace(/\*(.+?)\*/g, '$1')  // *italic* → обычный текст
    .replace(/`(.+?)`/g, '$1');   // `code` → обычный текст
}

function renderMarkdown(text) {
  const html = cleanMarkdown(text);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ============================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================

export default function BuilderChat({ conversationId: propConversationId, onAgentUpdate }) {
  const [userId, setUserId] = useState(null);
  const [conversationId, setConversationId] = useState(propConversationId);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null); // draft, test, active
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ============================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================================

  useEffect(() => {
    initializeChat();
  }, [propConversationId]);

  async function initializeChat() {
    console.log('🔍 Инициализация чата...', { propConversationId });
    
    // 1. Загружаем userId
    const uid = await loadUserId();
    setUserId(uid);
    
    // 2. Используем conversation_id из props (URL)
    const convId = propConversationId;
    setConversationId(convId);
    
    // 3. Загружаем историю
    if (convId) {
      await loadHistory(convId, uid);
    } else {
      // Новый агент — начальное сообщение
      setMessages([
        {
          role: 'assistant',
          content: `Привет! 👋 Я помогу создать вашего AI-агента для продаж.

**Расскажите о вашем бизнесе:**
• Чем занимаетесь?
• Что предлагаете и по какой цене?`
        }
      ]);
      setAgentStatus(null);
    }
  }

  async function loadUserId() {
    // Пробуем загрузить из localStorage
    let uid = localStorage.getItem(USER_ID_KEY);
    
    if (uid) {
      console.log('✅ User ID from localStorage:', uid);
      return uid;
    }
    
    // Пробуем получить из Base44
    try {
      if (window.base44 && window.base44.auth) {
        const user = await window.base44.auth.me();
        if (user && user.id) {
          uid = user.id;
          localStorage.setItem(USER_ID_KEY, uid);
          console.log('✅ User ID from Base44:', uid);
          return uid;
        }
      }
    } catch (error) {
      console.warn('⚠️ Не удалось загрузить user через Base44:', error);
    }
    
    // Создаём временный ID
    uid = 'temp-user-' + Date.now();
    localStorage.setItem(USER_ID_KEY, uid);
    console.log('⚠️ Создан временный User ID:', uid);
    
    return uid;
  }

  async function loadHistory(convId, uid) {
    console.log(`📖 Загрузка истории conversation: ${convId}`);
    
    try {
      // Пробуем загрузить с backend
      const historyMessages = await loadConversationHistory(convId);
      
      if (historyMessages.length > 0) {
        console.log(`✅ История загружена: ${historyMessages.length} сообщений`);
        setMessages(historyMessages);
        saveHistoryToStorage(convId, historyMessages);
        
        // Определяем статус агента из истории
        detectAgentStatus(historyMessages);
        return;
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки истории:', error);
    }
    
    // Если не удалось загрузить — пробуем localStorage
    const storageKey = `${STORAGE_KEY_PREFIX}${convId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log(`📦 История из localStorage: ${parsed.length} сообщений`);
        setMessages(parsed);
        detectAgentStatus(parsed);
      } catch (error) {
        console.error('❌ Ошибка парсинга истории:', error);
      }
    }
  }

  function detectAgentStatus(msgs) {
    // ✅ Исправленная логика определения статуса
    
    // Ищем последний статус агента в истории
    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];
      
      if (msg.role === 'assistant') {
        const content = msg.content.toLowerCase();
        
        // Проверяем маркеры статусов
        if (content.includes('🎉') && content.includes('готов к тестированию')) {
          setAgentStatus('test');
          return;
        }
        
        if (content.includes('✅ агент обновлён')) {
          setAgentStatus('test');
          return;
        }
        
        if (content.includes('агент активен') || content.includes('🟢')) {
          setAgentStatus('active');
          return;
        }
      }
    }
    
    // Если ничего не нашли — проверяем, есть ли сообщения пользователя
    const hasUserMessages = msgs.some(m => m.role === 'user');
    
    if (hasUserMessages) {
      setAgentStatus('draft');
    } else {
      setAgentStatus(null);
    }
  }

  function saveHistoryToStorage(convId, msgs) {
    if (!convId) return;
    
    const storageKey = `${STORAGE_KEY_PREFIX}${convId}`;
    localStorage.setItem(storageKey, JSON.stringify(msgs));
  }

  // ============================================================
  // ОТПРАВКА СООБЩЕНИЯ
  // ============================================================

  async function handleSendMessage(e) {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading || !userId) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Добавляем сообщение пользователя
    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(updatedMessages);
    
    setIsLoading(true);
    
    try {
      console.log('📤 Отправка сообщения...', { userId, conversationId });
      
      const result = await sendConstructorMessage(userId, updatedMessages, conversationId);
      
      console.log('📥 Ответ от Backend:', result);
      
      // Если получили новый conversation_id (первое сообщение)
      if (result.conversation_id && !conversationId) {
        const newConvId = result.conversation_id;
        setConversationId(newConvId);
        
        // Обновляем URL
        const newUrl = `/AgentBuilder?conversationId=${newConvId}`;
        window.history.replaceState({}, '', newUrl);
        console.log('🔗 URL обновлён:', newUrl);
      }
      
      // Обработка ответа
      if (result.status === 'agent_ready' && result.agent_data) {
        // Агент создан (draft → test)
        handleAgentReady(result, updatedMessages);
      } else if (result.status === 'agent_updated' && result.agent_data) {
        // Агент обновлён
        handleAgentUpdated(result, updatedMessages);
      } else {
        // Обычный ответ
        const finalMessages = [
          ...updatedMessages,
          { role: 'assistant', content: result.response }
        ];
        setMessages(finalMessages);
        saveHistoryToStorage(conversationId || result.conversation_id, finalMessages);
      }
      
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
      const errorMessages = [
        ...updatedMessages,
        { role: 'assistant', content: '❌ Ошибка отправки сообщения. Попробуйте ещё раз.' }
      ];
      setMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAgentReady(result, updatedMessages) {
    const agent_data = result.agent_data;
    
    // ✅ Определяем аватарку (статическая по умолчанию)
    const avatarUrl = agent_data.agent_name.toLowerCase().includes('виктори')
      ? DEFAULT_AVATAR_VICTORIA
      : DEFAULT_AVATAR_ALEXANDER;
    
    // Сообщение в чат
    const successMessage = {
      role: 'assistant',
      content: `🎉 **Агент создан и готов к тестированию!**

Ваш агент **${agent_data.agent_name}** готов к работе.
Протестируйте его в разделе "Предпросмотр" →

Если хотите что-то изменить — просто напишите мне!`
    };
    
    const finalMessages = [...updatedMessages, successMessage];
    setMessages(finalMessages);
    saveHistoryToStorage(conversationId || result.conversation_id, finalMessages);
    
    // Обновляем статус
    setAgentStatus('test');
    
    // Передаём данные агента в родительский компонент
    if (onAgentUpdate) {
      onAgentUpdate({
        name: agent_data.agent_name,
        business_type: agent_data.business_type,
        description: agent_data.description,
        instructions: agent_data.instructions,
        knowledge_base: agent_data.knowledge_base, // ✅ Объект
        avatar_url: avatarUrl,
        external_agent_id: result.agent_id,
        status: 'test'
      });
    }
  }

  function handleAgentUpdated(result, updatedMessages) {
    const agent_data = result.agent_data;
    
    // ✅ Определяем аватарку
    const avatarUrl = agent_data.agent_name.toLowerCase().includes('виктори')
      ? DEFAULT_AVATAR_VICTORIA
      : DEFAULT_AVATAR_ALEXANDER;
    
    // Сообщение в чат
    const successMessage = {
      role: 'assistant',
      content: '✅ **Агент обновлён!** Изменения сразу применены.'
    };
    
    const finalMessages = [...updatedMessages, successMessage];
    setMessages(finalMessages);
    saveHistoryToStorage(conversationId || result.conversation_id, finalMessages);
    
    // Передаём обновлённые данные
    if (onAgentUpdate) {
      onAgentUpdate({
        name: agent_data.agent_name,
        business_type: agent_data.business_type,
        description: agent_data.description,
        instructions: agent_data.instructions,
        knowledge_base: agent_data.knowledge_base, // ✅ Объект
        avatar_url: avatarUrl,
        external_agent_id: result.agent_id,
        status: 'test'
      });
    }
  }

  // ============================================================
  // UI HANDLERS
  // ============================================================

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }

  useEffect(() => {
    // Автоскролл вниз
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Автоматическое растяжение textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Статус агента */}
      {agentStatus && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: agentStatus === 'draft' ? '#fef3c7' : agentStatus === 'test' ? '#dbeafe' : '#d1fae5',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '14px',
          color: '#374151'
        }}>
          {agentStatus === 'draft' && '🟡 Агент в разработке...'}
          {agentStatus === 'test' && '🔵 Агент готов к тестированию'}
          {agentStatus === 'active' && '🟢 Агент активен'}
        </div>
      )}
      
      {/* Список сообщений */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#f9fafb'
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? '#3b82f6' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#111827',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {renderMarkdown(msg.content)}
            </div>
          </div>
        ))}
        
        {/* Индикатор загрузки */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Думаю...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Форма ввода */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
            disabled={isLoading || !userId}
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '200px',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || !userId}
            style={{
              padding: '12px 20px',
              backgroundColor: isLoading || !inputValue.trim() ? '#d1d5db' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isLoading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        
        {/* Дебаг информация */}
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
          User ID: {userId || 'загрузка...'} | Conversation: {conversationId || 'новый'}
        </div>
      </form>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}