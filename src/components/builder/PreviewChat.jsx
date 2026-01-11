// ========================================
// FINAL VERSION: Components/builder/PreviewChat
// Дата: 2026-01-11
// Изменения:
// - Упрощенные URL аватарок
// - Fallback на иконку User при ошибке загрузки
// ========================================

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

// Упрощенные аватарки по умолчанию
const DEFAULT_AVATAR_VICTORIA = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Victoria';
const DEFAULT_AVATAR_ALEXANDER = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander';

export default function PreviewChat({ agentData }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Инициализация чата с приветственным сообщением
  useEffect(() => {
    if (agentData?.name) {
      const greeting = {
        role: 'assistant',
        content: `Здравствуйте! Меня зовут ${agentData.name}. Чем могу помочь?`,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [agentData?.name]);

  // Определяем аватарку
  const getAvatarUrl = () => {
    if (agentData?.avatar_url) {
      return agentData.avatar_url;
    }
    const isVictoria = agentData?.name?.toLowerCase().includes('виктори');
    return isVictoria ? DEFAULT_AVATAR_VICTORIA : DEFAULT_AVATAR_ALEXANDER;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Симуляция ответа агента
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: `Спасибо за ваш вопрос! Я ${agentData?.name || 'агент'}, и я здесь, чтобы помочь вам. Это тестовый режим — реальные ответы будут доступны после сохранения агента.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
          {!avatarError && getAvatarUrl() ? (
            <img
              src={getAvatarUrl()}
              alt={agentData?.name || 'Agent'}
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <User className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {agentData?.name || 'Ваш агент'}
          </h3>
          {agentData?.business_type && (
            <p className="text-sm text-gray-600 truncate">
              {agentData.business_type}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ● Онлайн
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {!avatarError && getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl()}
                        alt="Agent"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                )}
                <div className={`px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
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
            <div className="flex gap-2 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {!avatarError && getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Agent"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="px-4 py-2 rounded-2xl bg-gray-100">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
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
              agentData?.name 
                ? `Напишите сообщение ${agentData.name}...`
                : "Протестируйте агента..."
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
        <p className="text-xs text-gray-500 mt-2">
          💡 Это тестовый режим. Реальные ответы будут после сохранения агента.
        </p>
      </div>
    </div>
  );
}
