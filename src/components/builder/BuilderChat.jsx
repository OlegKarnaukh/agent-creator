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
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const messagesForApi = [...messages, userMessage].map(m => ({
                role: m.role,
                content: m.content
            }));
            
            const result = await sendConstructorMessage(userId, messagesForApi);
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: result.response 
            }]);

            if (result.status === 'agent_ready' && result.agent_data) {
                const { agent_name, business_type, knowledge_base } = result.agent_data;
                const agentId = result.agent_id;
                
                const isFemale = agent_name.toLowerCase().includes('виктори') || 
                                 agent_name.toLowerCase().includes('анна') || 
                                 agent_name.toLowerCase().includes('мария') ||
                                 agent_name.toLowerCase().includes('елена');
                
                const avatarUrl = isFemale
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

                onAgentUpdate({ 
                    name: agent_name,
                    business_type: business_type,
                    knowledge_base: knowledge_base,
                    avatar_url: avatarUrl,
                    external_agent_id: agentId,
                    status: 'active'
                });
            }
        } catch (error) {
            console.error('Error calling constructor API:', error);
            
            const messageCount = messages.filter(m => m.role === 'user').length;
            let response = '';
            let updates = {};

            if (messageCount === 0) {
                response = `Отлично! Теперь давайте выберем имя и образ для вашего агента. Предлагаю варианты:\n\n👩 **Виктория** — профессиональный и дружелюбный образ\n👨 **Александр** — деловой и уверенный стиль\n\nКакой образ больше подходит вашему бизнесу?`;
                updates = { business_type: currentInput };
            } else if (messageCount === 1) {
                const isVictoria = currentInput.toLowerCase().includes('виктори') || currentInput.toLowerCase().includes('1') || currentInput.toLowerCase().includes('девушк');
                const name = isVictoria ? 'Виктория' : 'Александр';
                const avatar = isVictoria 
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                
                response = `Прекрасный выбор! ${name} будет представлять вашу компанию.\n\nТеперь загрузите материалы для обучения агента:\n• Прайс-листы\n• FAQ\n• Описание услуг\n• Скрипты продаж\n\nИспользуйте кнопку 📎 для загрузки файлов или просто опишите основную информацию текстом.`;
                updates = { name, avatar_url: avatar };
            } else if (messageCount === 2) {
                response = `Отлично! Я сохранил эту информацию в базу знаний агента.\n\n✅ Агент готов к работе!\n\nТеперь вы можете:\n1. Протестировать агента в окне предпросмотра справа\n2. Настроить каналы связи (Telegram, WhatsApp)\n3. Запустить агента\n\nХотите что-то добавить или изменить?`;
                updates = { knowledge_base: currentInput, status: 'active' };
            } else {
                response = 'Понял! Я обновил настройки агента. Что-то ещё хотите изменить?';
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            
            if (Object.keys(updates).length > 0) {
                onAgentUpdate(updates);
            }
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