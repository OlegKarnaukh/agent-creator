import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from 'lucide-react';
import { sendConstructorMessage } from '@/components/api/constructorApi';

const STORAGE_KEY = 'neuro_seller_constructor_history';
const USER_ID_KEY = 'neuro_seller_user_id';
const AGENT_DATA_KEY = 'neuro_seller_agent_data'; // 🔑 Ключ для данных агента

export default function BuilderChat({ onAgentUpdate, agentData }) {
    const [userId, setUserId] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Здравствуйте! Я помогу создать AI-агента для вашего бизнеса, который будет конвертировать лиды в продажи через переписку.\n\nДля начала расскажите:\n- Какой у вас бизнес?\n- Какие услуги или товары предлагаете?\n- Какие цены?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Загружаем или создаём userId
    useEffect(() => {
        const loadUser = async () => {
            try {
                console.log('🔍 Loading user...');
                
                let savedUserId = localStorage.getItem(USER_ID_KEY);
                
                if (savedUserId) {
                    console.log('✅ User ID from localStorage:', savedUserId);
                    setUserId(savedUserId);
                    loadHistory(savedUserId);
                    return;
                }
                
                if (typeof window !== 'undefined' && window.base44) {
                    const user = await window.base44.auth.me();
                    console.log('✅ User loaded from Base44:', user);
                    
                    if (user?.id) {
                        setUserId(user.id);
                        localStorage.setItem(USER_ID_KEY, user.id);
                        loadHistory(user.id);
                        return;
                    }
                }
                
                const tempId = 'temp-user-' + Math.random().toString(36).substr(2, 9);
                console.log('⚠️ Created temp user ID:', tempId);
                setUserId(tempId);
                localStorage.setItem(USER_ID_KEY, tempId);
                
            } catch (error) {
                console.error('❌ Error loading user:', error);
                const tempId = 'temp-user-' + Math.random().toString(36).substr(2, 9);
                setUserId(tempId);
                localStorage.setItem(USER_ID_KEY, tempId);
            }
        };
        
        loadUser();
    }, []);

    // Загрузка истории
    const loadHistory = async (uid) => {
        try {
            const storageKey = `${STORAGE_KEY}_${uid}`;
            const saved = localStorage.getItem(storageKey);
            
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('✅ History from localStorage:', parsed.length);
                setMessages(parsed);
                
                // 🔥 НОВОЕ: Восстанавливаем данные агента из истории
                restoreAgentFromHistory(parsed, uid);
                return;
            }
            
            const response = await fetch(
                `https://neuro-seller-production.up.railway.app/api/v1/constructor/history/${uid}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.messages?.length > 0) {
                    console.log('✅ History from Backend:', data.messages.length);
                    setMessages(data.messages);
                    saveHistory(data.messages, uid);
                    
                    // 🔥 НОВОЕ: Восстанавливаем данные агента из истории
                    restoreAgentFromHistory(data.messages, uid);
                }
            }
        } catch (error) {
            console.error('❌ Error loading history:', error);
        }
    };

    // 🔥 НОВАЯ ФУНКЦИЯ: Восстановление агента из истории
    const restoreAgentFromHistory = (msgs, uid) => {
        try {
            // Проверяем localStorage на сохранённые данные агента
            const agentStorageKey = `${AGENT_DATA_KEY}_${uid}`;
            const savedAgentData = localStorage.getItem(agentStorageKey);
            
            if (savedAgentData) {
                const agentData = JSON.parse(savedAgentData);
                console.log('✅ Restored agent from localStorage:', agentData);
                onAgentUpdate(agentData);
                return;
            }
            
            // Если нет в localStorage, проверяем историю сообщений
            // Ищем последнее сообщение с созданием/обновлением агента
            const agentCreatedMessage = msgs.find(msg => 
                msg.role === 'assistant' && 
                (msg.content.includes('🎉 Агент') || msg.content.includes('✅ Агент'))
            );
            
            if (agentCreatedMessage) {
                console.log('⚠️ Agent was created but data not saved. Need to re-create.');
            }
        } catch (error) {
            console.error('❌ Error restoring agent:', error);
        }
    };

    // Сохранение истории
    const saveHistory = (msgs, uid = userId) => {
        if (!uid) return;
        try {
            const storageKey = `${STORAGE_KEY}_${uid}`;
            localStorage.setItem(storageKey, JSON.stringify(msgs));
            console.log('💾 History saved');
        } catch (error) {
            console.error('❌ Error saving history:', error);
        }
    };

    // 🔥 НОВАЯ ФУНКЦИЯ: Сохранение данных агента
    const saveAgentData = (agentData, uid = userId) => {
        if (!uid) return;
        try {
            const agentStorageKey = `${AGENT_DATA_KEY}_${uid}`;
            localStorage.setItem(agentStorageKey, JSON.stringify(agentData));
            console.log('💾 Agent data saved');
        } catch (error) {
            console.error('❌ Error saving agent data:', error);
        }
    };

    // Рендеринг Markdown (только bold)
    const renderMarkdown = (text) => {
        const parts = [];
        let lastIndex = 0;
        const regex = /\*\*(.+?)\*\*/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }
            
            parts.push({
                type: 'bold',
                content: match[1]
            });
            
            lastIndex = regex.lastIndex;
        }
        
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }
        
        return parts;
    };

    // Отправка сообщения
    const handleSendMessage = async () => {
        if (!input.trim() || !userId || isLoading) return;

        console.log('📤 Sending message...');
        
        const userMessage = { role: 'user', content: input.trim() };
        const updatedMessages = [...messages, userMessage];
        
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const result = await sendConstructorMessage(userId, updatedMessages);
            console.log('📥 Response:', result);
            
            // СОЗДАНИЕ агента
            if (result.status === 'agent_ready' && result.agent_data) {
                console.log('✅ Agent created:', result.agent_id);
                
                const { agent_name, business_type, description, instructions, knowledge_base } = result.agent_data;
                
                const isFemale = agent_name.toLowerCase().includes('виктори');
                const avatarUrl = isFemale
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                
                const finalMessage = {
                    role: 'assistant',
                    content: `🎉 Агент "${agent_name}" создан!\n\n1️⃣ Протестируй справа\n2️⃣ Нажми "Сохранить"\n3️⃣ Настрой каналы`
                };
                
                const finalMessages = [...updatedMessages, finalMessage];
                setMessages(finalMessages);
                saveHistory(finalMessages);
                
                const agentUpdateData = {
                    name: agent_name,
                    business_type: business_type,
                    description: description || business_type,
                    instructions: instructions || '',
                    knowledge_base: typeof knowledge_base === 'string' ? knowledge_base : JSON.stringify(knowledge_base, null, 2),
                    avatar_url: avatarUrl,
                    external_agent_id: result.agent_id,
                    status: 'draft'
                };
                
                // 🔥 НОВОЕ: Сохраняем данные агента
                saveAgentData(agentUpdateData);
                
                onAgentUpdate(agentUpdateData);
            }
            // ОБНОВЛЕНИЕ агента
            else if (result.status === 'agent_updated' && result.agent_data) {
                console.log('✅ Agent updated:', result.agent_id);
                
                const { agent_name, business_type, description, instructions, knowledge_base } = result.agent_data;
                
                const isFemale = agent_name.toLowerCase().includes('виктори');
                const avatarUrl = isFemale
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                
                const updateMessage = {
                    role: 'assistant',
                    content: `✅ Агент "${agent_name}" обновлён!`
                };
                
                const finalMessages = [...updatedMessages, updateMessage];
                setMessages(finalMessages);
                saveHistory(finalMessages);
                
                const agentUpdateData = {
                    name: agent_name,
                    business_type: business_type,
                    description: description || business_type,
                    instructions: instructions || '',
                    knowledge_base: typeof knowledge_base === 'string' ? knowledge_base : JSON.stringify(knowledge_base, null, 2),
                    avatar_url: avatarUrl,
                    external_agent_id: result.agent_id,
                    status: 'draft'
                };
                
                // 🔥 НОВОЕ: Сохраняем обновлённые данные агента
                saveAgentData(agentUpdateData);
                
                onAgentUpdate(agentUpdateData);
            }
            // Обычный ответ
            else if (result.response) {
                const assistantMessage = { role: 'assistant', content: result.response };
                const finalMessages = [...updatedMessages, assistantMessage];
                setMessages(finalMessages);
                saveHistory(finalMessages);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            const errorMessage = { 
                role: 'assistant', 
                content: `❌ Ошибка: ${error.message}` 
            };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Автоматическая подстройка высоты textarea
    const handleInputChange = (e) => {
        setInput(e.target.value);
        
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    // Обработка Enter и Shift+Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Автоскролл
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
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
                                <div className="text-sm whitespace-pre-wrap">
                                    {message.content.split('\n').map((line, lineIndex) => (
                                        <React.Fragment key={lineIndex}>
                                            {renderMarkdown(line).map((part, partIndex) => (
                                                part.type === 'bold' ? (
                                                    <strong key={partIndex}>{part.content}</strong>
                                                ) : (
                                                    <span key={partIndex}>{part.content}</span>
                                                )
                                            ))}
                                            {lineIndex < message.content.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Думаю...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-end gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Расскажите о своём бизнесе... (Shift+Enter для новой строки)"
                        disabled={isLoading || !userId}
                        className="flex-1 min-h-[44px] max-h-[200px] resize-none"
                        rows={1}
                    />

                    <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !input.trim() || !userId}
                        className="shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
