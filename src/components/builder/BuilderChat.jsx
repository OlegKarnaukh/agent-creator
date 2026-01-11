import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';
import { sendConstructorMessage } from '@/components/api/constructorApi';

export default function BuilderChat({ onAgentUpdate, agentData }) {
    const [userId, setUserId] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Привет! Я помогу создать вашего персонального AI-агента. Для начала расскажите, какой у вас бизнес и чем занимается ваша компания?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Получаем ID текущего пользователя
        const fetchUser = async () => {
            try {
                const user = await base44.auth.me();
                setUserId(user.id);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !userId) return;

        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // ✅ Отправляем весь массив сообщений в Railway API
            const result = await sendConstructorMessage(userId, updatedMessages);
            
            // ✅ Проверяем формат ответа Railway
            if (result.status === 'agent_ready' && result.agent_data) {
                // Агент готов!
                const { 
                    agent_name, 
                    business_type, 
                    description,      // ✅ ДОБАВЛЕНО
                    instructions,     // ✅ ДОБАВЛЕНО
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
                
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: finalMessage
                }]);

                // ✅ ИСПРАВЛЕНО: Передаём description и instructions
                onAgentUpdate({ 
                    name: agent_name,
                    business_type: business_type,
                    description: description || business_type,  // ✅ ДОБАВЛЕНО (fallback на business_type)
                    instructions: instructions || '',           // ✅ ДОБАВЛЕНО
                    knowledge_base: typeof knowledge_base === 'string' 
                        ? knowledge_base 
                        : JSON.stringify(knowledge_base, null, 2),
                    avatar_url: avatarUrl,
                    external_agent_id: agentId,
                    status: 'draft'
                });
                
            } else if (result.response) {
                // Обычный ответ мета-агента (агент ещё не готов)
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: result.response 
                }]);
            } else {
                // Неизвестный формат
                console.error('Unexpected API response format:', result);
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: '❌ Произошла ошибка при обработке ответа. Попробуйте ещё раз.' 
                }]);
            }
            
        } catch (error) {
            console.error('❌ Error calling constructor API:', error);
            
            // Показываем ошибку пользователю
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `❌ Ошибка соединения с сервером. Пожалуйста, попробуйте ещё раз.\n\n${error.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput(`[Загружен файл: ${file.name}]`);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                    msg.role === 'user'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-800'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
                        <div className="bg-slate-100 rounded-2xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                <span className="text-sm text-slate-500">Думаю...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
                    />
                    <button
                        onClick={handleFileClick}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <Paperclip className="w-5 h-5 text-slate-500" />
                    </button>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Напишите сообщение..."
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="rounded-full bg-slate-900 hover:bg-slate-800 h-9 w-9"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
