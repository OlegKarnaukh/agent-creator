// ========================================
// FINAL VERSION: Components/builder/BuilderChat
// Дата: 2026-01-11
// Изменения:
// - Упрощенные URL аватарок (DiceBear v9)
// - Принимает conversationId как проп
// - Исправлена detectAgentStatus
// - knowledge_base передается как объект
// ========================================

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

// Константы
const STORAGE_KEY_PREFIX = 'neuro_seller_conversation_';
const USER_ID_KEY = 'neuro_seller_user_id';
const API_BASE = 'https://neuro-seller-production.up.railway.app/api/v1';

// Упрощенные аватарки по умолчанию
const DEFAULT_AVATAR_VICTORIA = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Victoria';
const DEFAULT_AVATAR_ALEXANDER = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander';

// API Helpers
const sendConstructorMessage = async (userId, messages, conversationId = null) => {
  const payload = {
    user_id: userId,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  };

  if (conversationId) {
    payload.conversation_id = conversationId;
  }

  const response = await fetch(`${API_BASE}/constructor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

const loadConversationHistory = async (conversationId) => {
  const response = await fetch(`${API_BASE}/constructor/history/${conversationId}`);
  if (!response.ok) {
    throw new Error(`Failed to load history: ${response.status}`);
  }
  return response.json();
};

// Утилиты для Markdown
const cleanMarkdown = (text) => {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
};

const renderMarkdown = (text) => {
  const cleaned = cleanMarkdown(text);
  return <span dangerouslySetInnerHTML={{ __html: cleaned }} />;
};

export default function BuilderChat({ conversationId: propConversationId, onAgentUpdate }) {
  const [userId, setUserId] = useState(null);
  const [conversationId, setConversationId] = useState(propConversationId || null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState('draft');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Инициализация чата
  useEffect(() => {
    initializeChat();
  }, [propConversationId]);

  const initializeChat = async () => {
    await loadUserId();
    
    const convId = propConversationId || conversationId;
    
    if (convId) {
      setConversationId(convId);
      await loadHistory(convId);
    } else {
      const greeting = {
        role: 'assistant',
        content: 'Привет! 👋 Я помогу создать вашего AI-агента для продаж.\n\n**Давайте начнем!** Расскажите:\n• Какой у вас бизнес?\n• Какие услуги или товары вы предлагаете?\n• Какие у вас цены?'
      };
      setMessages([greeting]);
      setAgentStatus('draft');
    }
  };

  const loadUserId = async () => {
    let id = localStorage.getItem(USER_ID_KEY);
    
    if (!id) {
      try {
        if (window.base44?.auth?.me) {
          const user = await window.base44.auth.me();
          id = user.id;
        }
      } catch (error) {
        console.error('Failed to load user from Base44:', error);
      }
      
      if (!id) {
        id = `temp-user-${Date.now()}`;
      }
      
      localStorage.setItem(USER_ID_KEY, id);
    }
    
    setUserId(id);
  };

  const loadHistory = async (convId) => {
    try {
      const history = await loadConversationHistory(convId);
      
      if (history.messages && history.messages.length > 0) {
        setMessages(history.messages);
        const status = detectAgentStatus(history.messages);
        setAgentStatus(status);
      }
    } catch (error) {
      console.error('Failed to load history, trying localStorage:', error);
      
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${convId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed.messages || []);
          setAgentStatus(parsed.status || 'draft');
        } catch (parseError) {
          console.error('Failed to parse stored history:', parseError);
        }
      }
    }
  };

  // Улучшенная функция определения статуса агента
  const detectAgentStatus = (msgs) => {
    const lastAssistantMessages = msgs
      .filter(m => m.role === 'assistant')
      .slice(-3);

    for (const msg of lastAssistantMessages.reverse()) {
      const content = msg.content.toLowerCase();
      
      if (content.includes('---agent-ready---') || 
          content.includes('агент готов к тестированию') ||
          content.includes('можете протестировать')) {
        return 'test';
      }
      
      if (content.includes('---agent-update---') ||
          content.includes('обновил') ||
          content.includes('изменения внесены')) {
        return 'active';
      }
    }

    return 'draft';
  };

  const saveHistory = (msgs, convId, status) => {
    if (convId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${convId}`, JSON.stringify({
        messages: msgs,
        status: status,
        updated_at: new Date().toISOString()
      }));
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !userId) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await sendConstructorMessage(userId, updatedMessages, conversationId);

      // Обновляем conversation_id, если получили новый
      if (result.conversation_id && !conversationId) {
        setConversationId(result.conversation_id);
        
        // Обновляем URL с новым conversationId
        const url = new URL(window.location);
        url.searchParams.set('conversationId', result.conversation_id);
        window.history.pushState({}, '', url);
      }

      // Обработка статуса agent_ready (агент создан)
      if (result.status === 'agent_ready' && result.agent_data) {
        const { agent_name, business_type, description, instructions, knowledge_base } = result.agent_data;
        
        // Выбираем аватарку по имени
        const avatar_url = agent_name.toLowerCase().includes('виктори')
          ? DEFAULT_AVATAR_VICTORIA
          : DEFAULT_AVATAR_ALEXANDER;

        const successMessage = {
          role: 'assistant',
          content: result.response || `✅ Отлично! Агент **${agent_name}** создан и готов к тестированию.\n\nВы можете перейти во вкладку **Настроить** для редактирования или протестировать агента в **Предпросмотре**.`
        };

        const finalMessages = [...updatedMessages, successMessage];
        setMessages(finalMessages);
        setAgentStatus('test');

        if (onAgentUpdate) {
          onAgentUpdate({
            name: agent_name,
            avatar_url,
            business_type,
            description: description || '',
            instructions: instructions || '',
            knowledge_base: knowledge_base || {},
            status: 'test',
            external_agent_id: result.agent_id
          });
        }

        saveHistory(finalMessages, result.conversation_id || conversationId, 'test');
      }
      // Обработка статуса agent_updated (агент обновлен)
      else if (result.status === 'agent_updated' && result.agent_data) {
        const { agent_name, business_type, description, instructions, knowledge_base } = result.agent_data;

        const updateMessage = {
          role: 'assistant',
          content: result.response || `✅ Изменения сохранены! Агент **${agent_name}** обновлен.`
        };

        const finalMessages = [...updatedMessages, updateMessage];
        setMessages(finalMessages);

        if (onAgentUpdate) {
          onAgentUpdate({
            name: agent_name,
            business_type,
            description: description || '',
            instructions: instructions || '',
            knowledge_base: knowledge_base || {},
            status: agentStatus
          });
        }

        saveHistory(finalMessages, result.conversation_id || conversationId, agentStatus);
      }
      // Обычный ответ
      else {
        const assistantMessage = {
          role: 'assistant',
          content: result.response
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);

        const newStatus = detectAgentStatus(finalMessages);
        setAgentStatus(newStatus);

        saveHistory(finalMessages, result.conversation_id || conversationId, newStatus);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: '❌ Произошла ошибка при отправке сообщения. Попробуйте еще раз.'
      };

      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  return (
    <div className="flex flex-col h-full">
      {/* Status Banner */}
      {agentStatus !== 'draft' && (
        <div className={`px-4 py-2 text-sm ${
          agentStatus === 'test' ? 'bg-yellow-50 text-yellow-800' :
          agentStatus === 'active' ? 'bg-green-50 text-green-800' :
          'bg-gray-50 text-gray-800'
        }`}>
          <strong>Статус:</strong> {
            agentStatus === 'test' ? '🧪 Тестирование' :
            agentStatus === 'active' ? '✅ Активен' :
            '📝 Черновик'
          }
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-indigo-600' 
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {renderMarkdown(message.content)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              agentStatus === 'draft' 
                ? "Расскажите о вашем бизнесе..." 
                : "Введите сообщение..."
            }
            className="resize-none min-h-[44px] max-h-[200px]"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Debug Info */}
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <div>User ID: {userId || 'Loading...'}</div>
          <div>Conversation: {conversationId || 'New'}</div>
        </div>
      </div>
    </div>
  );
}