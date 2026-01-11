import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from 'lucide-react';
import { sendConstructorMessage } from '@/components/api/constructorApi';

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
    const messagesEndRef = useRef(null);

    // Загружаем userId при монтировании
    useEffect(() => {
        const loadUser = async () => {
            try {
                console.log('🔍 Loading user...');
                
                // Используем window.base44 для доступа к API
                if (typeof window !== 'undefined' && window.base44) {
                    const user = await window.base44.auth.me();
                    console.log('✅ User loaded:', user);
                    
                    if (user?.id) {
                        setUserId(user.id);
                        loadHistory(user.id);
                    } else {
                        console.error('❌ User ID not found');
                        // Используем временный ID как fallback
                        setUserId('temp-user-' + Date.now());
                    }
                } else {
                    console.error('❌ window.base44 not found');
                    // Используем временный ID как fallback
                    setUserId('temp-user-' + Date.now());
                }
            } catch (error) {
                console.error('❌ Error loading user:', error);
                // Используем временный ID как fallback
                setUserId('temp-user-' + Date.now());
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
                }
            }
        } catch (error) {
            console.error('❌ Error loading history:', error);
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

    // Отправка сообщения
    const handleSendMessage = async () => {
        if (!input.trim() || !userId || isLoading) return;

        console.log('📤 Sending message...');
        
        const userMessage = { role: 'user', content: input.trim() };
        const updatedMessages = [...messages, userMessage];
        
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

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
                
                onAgentUpdate({
                    name: agent_name,
                    business_type: business_type,
                    description: description || business_type,
                    instructions: instructions || '',
                    knowledge_base: typeof knowledge_base === 'string' ? knowledge_base : JSON.stringify(knowledge_base, null, 2),
                    avatar_url: avatarUrl,
                    external_agent_id: result.agent_id,
                    status: 'draft'
                });
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
                
                onAgentUpdate({
                    name: agent_name,
                    business_type: business_type,
                    description: description || business_type,
                    instructions: instructions || '',
                    knowledge_base: typeof knowledge_base === 'string' ? knowledge_base : JSON.stringify(knowledge_base, null, 2),
                    avatar_url: avatarUrl,
                    external_agent_id: result.agent_id,
                    status: 'draft'
                });
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

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-end gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Расскажите о своём бизнесе..."
                        disabled={isLoading || !userId}
                        className="flex-1"
                    />

                    <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !input.trim() || !userId}
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
