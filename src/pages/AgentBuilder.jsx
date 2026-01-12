import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { saveAgent } from '@/components/api/constructorApi';

import BuilderChat from '@/components/builder/BuilderChat';
import ConfigurePanel from '@/components/builder/ConfigurePanel';
import PreviewChat from '@/components/builder/PreviewChat';

export default function AgentBuilder() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Привет! Я помогу создать вашего персонального AI-агента. Для начала расскажите, какой у вас бизнес и чем занимается ваша компания?'
        }
    ]);
    const [agentData, setAgentData] = useState({
        name: '',
        avatar_url: '',
        business_type: '',
        description: '',
        instructions: '',
        knowledge_base: '',
        channels: [],
        status: 'draft',
        external_agent_id: null,
        stats: {
            total_conversations: 0,
            today_conversations: 0,
            conversion_rate: 0
        }
    });

    const handleAgentUpdate = (updates) => {
        setAgentData(prev => ({ ...prev, ...updates }));
        // Отмечаем что есть несохранённые изменения (только если агент уже создан)
        if (agentData.id || agentData.external_agent_id) {
            setHasUnsavedChanges(true);
        }
    };

    const handleSave = async () => {
        if (!agentData.name) return;
        
        setIsSaving(true);
        setSaveSuccess(false);
        
        try {
            if (agentData.external_agent_id) {
                try {
                    const apiResult = await saveAgent(agentData.external_agent_id);
                    console.log('Agent saved on external API:', apiResult);
                } catch (apiError) {
                    console.error('Error saving to external API:', apiError);
                }
            }

            const savedAgent = await base44.entities.Agent.create(agentData);
            
            setAgentData(prev => ({ 
                ...prev, 
                status: 'active',
                id: savedAgent.id 
            }));
            
            setSaveSuccess(true);
            setHasUnsavedChanges(false);
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (error) {
            console.error('Error saving agent:', error);
            alert('❌ Ошибка при сохранении агента: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(createPageUrl('Dashboard'))}
                            className="rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Конструктор агентов</h1>
                            <p className="text-xs text-slate-500">Всё, у кого есть ссылка</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <AnimatePresence>
                            {hasUnsavedChanges && !saveSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-200"
                                >
                                    <span className="text-sm font-medium">Несохранённые изменения</span>
                                </motion.div>
                            )}
                            {saveSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200"
                                >
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">Агент сохранён!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            onClick={handleSave}
                            disabled={!agentData.name || isSaving || (!hasUnsavedChanges && (agentData.id || agentData.external_agent_id))}
                            className="bg-slate-900 hover:bg-slate-800 rounded-full px-6 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Сохранение...' : (agentData.id || agentData.external_agent_id) ? 'Обновить' : 'Сохранить'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-73px)]">
                    <div className="border-r border-slate-200 bg-white flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="bg-slate-100 p-1 rounded-xl">
                                    <TabsTrigger 
                                        value="create"
                                        className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        Создать
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="configure"
                                        className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        Настроить
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 overflow-y-auto"
                        >
                            {activeTab === 'create' ? (
                                <BuilderChat
                                    onAgentUpdate={handleAgentUpdate}
                                    agentData={agentData}
                                    messages={messages}
                                    setMessages={setMessages}
                                />
                            ) : (
                                <ConfigurePanel
                                    agentData={agentData}
                                    onAgentUpdate={handleAgentUpdate}
                                />
                            )}
                        </motion.div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-100 to-slate-50 flex flex-col">
                        <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
                            <h2 className="font-semibold text-slate-700">Предпросмотр</h2>
                        </div>

                        <div className="flex-1 p-6 flex items-center justify-center">
                            <div className="w-full max-w-md h-[600px] bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-200">
                                <PreviewChat agentData={agentData} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}