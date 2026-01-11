import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Paperclip } from 'lucide-react';
import { sendConstructorMessage } from '@/components/api/constructorApi';

// 🔑 Ключ для хранения истории в localStorage
const STORAGE_KEY = 'neuro_seller_constructor_history';

export default function BuilderChat({ onAgentUpdate, agentData }) {
    const [userId, setUserId] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Привет! Я AI-маркетолог, помогу создать агента-продавца, который будет закрывать клиентов в переписке 🎯\n\nРасскажи о своём бизнесе:\n- Чем занимаешься?\n- Что предлагаешь и по какой цене?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // 📂 Загружаем userId при монтировании
    useEffect(() => {
        const loadUserId = async () => {
            try {
                const user = await base44.auth.me();
                if (user?.id) {
                    setUserId(user.id);
                    console.log('✅ User ID loaded:', user.id);
                    
                    // Загружаем историю из localStorage
                    loadHistory(user.id);
                }
            } catch (error) {
                console.error('❌ Ошибка загрузки пользователя:', error);
            }
        };

        loadUserId();
    }, []);

    // 📚 Загрузка истории из localStorage или Backend
    const loadHistory = async (uid) => {
        try {
            const storageKey = `${STORAGE_KEY}_${uid}`;
            const savedHistory = localStorage.getItem(storageKey);
            
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);
                console.log('✅ История загружена из localStorage:', parsedHistory.length, 'сообщений');
                setMessages(parsedHistory);
                return;
            }
            
            // Если localStorage пуст — загружаем из Backend
            console.log('📡 Загружаем историю из Backend...');
            const response = await fetch(`https://neuro-seller-production.up.railway.app/api/v1/constructor/history/${uid}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    console.log('✅ История загружена из Backend:', data.messages.length, 'сообщений');
                    setMessages(data.messages);
                    // Сохраняем в localStorage для быстрого доступа
                    saveHistory(data.messages, uid);
                }
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки истории:', error);
        }
    };

    // 💾 Сохранение истории в localStorage
    const saveHistory = (msgs, uid = userId) => {
        if (!uid) return;
        
        try {
            const storageKey = `${STORAGE_KEY}_${uid}`;
            localStorage.setItem(storageKey, JSON.stringify(msgs));
            console.log('💾 История сохранена в localStorage');
        } catch (error) {
            console.error('❌ Ошибка сохранения истории:', error);
        }
    };

    // 📤 Отправка сообщения
    const handleSendMessage = async () => {
        if (!input.trim() || !userId || isLoading) return;

        const userMessage = { role: 'user', content: input.trim() };
        const updatedMessages = [...messages, userMessage];
        
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            console.log('📤 Отправка сообщения:', userMessage.content);
            
            const result = await sendConstructorMessage(userId, updatedMessages);
            
            console.log('📥 Получен ответ от Backend:', result);
            
            // 🎯 Обработка СОЗДАНИЯ агента (AGENT-READY)
            if (result.status === 'agent_ready' && result.agent_data) {
                console.log('✅ Agent created:', result.agent_id);
                console.log('Agent data:', result.agent_data);
                
                const { agent_name, business_type, description, instructions, knowledge_base } = result.agent_data;
                const agentId = result.agent_id;
                
                // Определяем аватар
                const lowerName = agent_name.toLowerCase();
                const isFemale = lowerName.includes('виктори') || 
                                lowerName.includes('анна') || 
                                lowerName.includes('мария') || 
                                lowerName.includes('елена');
                
                const avatarUrl = isFemale
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                
                // Финальное сообщение для пользователя
                const finalMessage = {
                    role: 'assistant',
                    content: `🎉 Отлично! Агент "${agent_name}" для "${business_type}" создан!\n\nТеперь:\n1️⃣ Протестируй агента в окне предпросмотра справа\n2️⃣ Нажми "Сохранить" для активации\n3️⃣ Настрой каналы связи (Telegram, WhatsApp)`
                };
                
                const finalMessages = [...updatedMessages, finalMessage];
                setMessages(finalMessages);
                
                // Сохраняем историю
                saveHistory(finalMessages);
                
                // Передаём данные агента родителю
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
            }
            // 🔄 Обработка ОБНОВЛЕНИЯ агента (AGENT-UPDATE)
            else if (result.status === 'agent_updated' && result.agent_data) {
                console.log('✅ Agent updated:', result.agent_id);
                console.log('Updated data:', result.agent_data);
                
                const { agent_name, business_type, description, instructions, knowledge_base } = result.agent_data;
                const agentId = result.agent_id;
                
                // Определяем аватар (используем существующий или пересоздаём)
                const lowerName = agent_name.toLowerCase();
                const isFemale = lowerName.includes('виктори') || 
                                lowerName.includes('анна') || 
                                lowerName.includes('мария') || 
                                lowerName.includes('елена');
                
                const avatarUrl = isFemale
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                
                // Финальное сообщение об обновлении
                const updateMessage = {
                    role: 'assistant',
                    content: `✅ Агент "${agent_name}" обновлён!\n\nИзменения применены. Можешь протестировать в окне предпросмотра →`
                };
                
                const finalMessages = [...updatedMessages, updateMessage];
                setMessages(finalMessages);
                
                // Сохраняем историю
                saveHistory(finalMessages);
                
                // Передаём обновлённые данные родителю
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
            }
            // 💬 Обычный ответ (продолжение диалога)
            else if (result.response) {
                const assistantMessage = { role: 'assistant', content: result.response };
                const finalMessages = [...updatedMessages, assistantMessage];
                setMessages(finalMessages);
                
                // Сохраняем историю
                saveHistory(finalMessages);
            }
            
        } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            const errorMessage = { 
                role: 'assistant', 
                content: '❌ Произошла ошибка. Попробуйте ещё раз.' 
            };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // 📂 Обработка файлов
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    // 📜 Автоскролл вниз
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
            {/* Сообщения */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                    message.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                                <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Поле ввода */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-end gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Расскажите о своём бизнесе..."
                        disabled={isLoading}
                        className="flex-1"
                    />

                    <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Прикреплённые файлы */}
                {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {files.map((file, index) => (
                            <div key={index} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {file.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
