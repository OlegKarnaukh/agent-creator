import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { saveAgent } from '@/components/api/constructorApi';

import BuilderChat from '@/components/builder/BuilderChat';
import ConfigurePanel from '@/components/builder/ConfigurePanel';
import PreviewChat from '@/components/builder/PreviewChat';

export default function AgentBuilder() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create');
    const [isSaving, setIsSaving] = useState(false);
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
    };

    const handleSave = async () => {
        if (!agentData.name) return;
        
        setIsSaving(true);
        try {
            // Если есть external_agent_id, сначала вызываем API сохранения
            if (agentData.external_agent_id) {
                try {
                    const apiResult = await saveAgent(agentData.external_agent_id);
                    console.log('Agent saved on external API:', apiResult);
                } catch (apiError) {
                    console.error('Error saving to external API:', apiError);
                    // Продолжаем сохранение в локальной БД даже если внешний API упал
                }
            }

            // Сохраняем в локальной базе данных
            const savedAgent = await base44.entities.Agent.create(agentData);
            navigate(createPageUrl('Dashboard') + `?agentId=${savedAgent.id}`);
        } catch (error) {
            console.error('Error saving agent:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
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
                    
                    <Button
                        onClick={handleSave}
                        disabled={!agentData.name || isSaving}
                        className="bg-slate-900 hover:bg-slate-800 rounded-full px-6 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-73px)]">
                    {/* Left Column - Create/Configure */}
                    <div className="border-r border-slate-200 bg-white flex flex-col">
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
                            className="flex-1 overflow-hidden"
                        >
                            {activeTab === 'create' ? (
                                <BuilderChat 
                                    onAgentUpdate={handleAgentUpdate}
                                    agentData={agentData}
                                />
                            ) : (
                                <ConfigurePanel 
                                    agentData={agentData}
                                    onAgentUpdate={handleAgentUpdate}
                                />
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column - Preview */}
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
