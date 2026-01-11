import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { testAgent } from '@/components/api/constructorApi';

export default function PreviewChat({ agentData }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (agentData.name && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: `Здравствуйте! Меня зовут ${agentData.name}. Чем могу помочь?`
            }]);
        }
    }, [agentData.name]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            if (agentData.external_agent_id) {
                const result = await testAgent(agentData.external_agent_id, currentInput);
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: result.response 
                }]);
            } else {
                const responses = [
                    `Спасибо за ваш вопрос! На основе моей базы знаний могу сказать следующее...`,
                    `Отличный вопрос! Давайте разберём подробнее...`,
                    `Да, конечно! Я могу помочь вам с этим. ${agentData.knowledge_base ? 'Согласно нашей информации...' : 'Расскажите подробнее о вашей задаче.'}`,
                    `Понимаю вас. Позвольте уточнить несколько деталей...`
                ];
                
                const response = responses[Math.floor(Math.random() * responses.length)];
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            }
        } catch (error) {
            console.error('Error testing agent:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Извините, произошла ошибка. Попробуйте еще раз.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-slate-100 flex flex-col items-center">
                {agentData.avatar_url ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 shadow-lg">
                        <img src={agentData.avatar_url} alt="Agent" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mb-3 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                    </div>
                )}
                <h3 className="text-lg font-semibold text-slate-800">
                    {agentData.name || 'Ваш агент'}
                </h3>
                {agentData.business_type && (
                    <p className="text-xs text-slate-500 mt-1">{agentData.business_type}</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && !agentData.name && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">
                            Создайте агента в левой панели,<br />
                            чтобы протестировать его здесь
                        </p>
                    </div>
                )}

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
                                <span className="text-sm text-slate-500">{agentData.name || 'Агент'} печатает...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={agentData.name ? "Протестируйте агента..." : "Сначала создайте агента..."}
                        disabled={!agentData.name}
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || !agentData.name}
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