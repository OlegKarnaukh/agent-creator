import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Users, TrendingUp, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

import StatCard from '@/components/dashboard/StatCard';
import AgentCard from '@/components/dashboard/AgentCard';
import ConversationFeed from '@/components/dashboard/ConversationFeed';
import ChannelSettings from '@/components/dashboard/ChannelSettings';

export default function Dashboard() {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const selectedAgentId = urlParams.get('agentId');
    
    const [selectedAgent, setSelectedAgent] = useState(null);

    const { data: agents = [], isLoading: agentsLoading } = useQuery({
        queryKey: ['agents'],
        queryFn: () => base44.entities.Agent.list('-created_date'),
    });

    const { data: conversations = [] } = useQuery({
        queryKey: ['conversations', selectedAgent?.id],
        queryFn: () => base44.entities.Conversation.filter({ agent_id: selectedAgent?.id }, '-created_date', 10),
        enabled: !!selectedAgent?.id,
    });

    useEffect(() => {
        if (agents.length > 0) {
            if (selectedAgentId) {
                const agent = agents.find(a => a.id === selectedAgentId);
                setSelectedAgent(agent || agents[0]);
            } else if (!selectedAgent) {
                setSelectedAgent(agents[0]);
            }
        }
    }, [agents, selectedAgentId]);

    const stats = selectedAgent ? [
        { 
            title: 'Диалогов сегодня', 
            value: selectedAgent.stats?.today_conversations || 0,
            icon: MessageSquare,
            color: 'blue',
            trend: 12
        },
        { 
            title: 'Всего диалогов', 
            value: selectedAgent.stats?.total_conversations || 0,
            icon: Users,
            color: 'purple'
        },
        { 
            title: 'Конверсия', 
            value: `${selectedAgent.stats?.conversion_rate || 0}%`,
            icon: TrendingUp,
            color: 'green',
            trend: 5
        },
        { 
            title: 'Активных каналов', 
            value: selectedAgent.channels?.filter(c => c.enabled).length || 0,
            icon: Zap,
            color: 'orange'
        },
    ] : [];

    if (agentsLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-8">
                {agents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6">
                            <Zap className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Создайте первого агента</h2>
                        <p className="text-slate-500 mb-6 text-center max-w-md">
                            AI-агенты будут общаться с вашими клиентами 24/7 через любые каналы связи
                        </p>
                        <Button
                            onClick={() => navigate(createPageUrl('AgentBuilder'))}
                            className="bg-slate-900 hover:bg-slate-800 rounded-full px-8 py-6 text-lg"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Создать агента
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                Ваши агенты
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {agents.map((agent) => (
                                    <AgentCard
                                        key={agent.id}
                                        agent={agent}
                                        isSelected={selectedAgent?.id === agent.id}
                                        onClick={() => setSelectedAgent(agent)}
                                    />
                                ))}
                            </div>
                        </div>

                        {selectedAgent && (
                            <>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                        Статистика — {selectedAgent.name}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {stats.map((stat, idx) => (
                                            <StatCard key={idx} {...stat} />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ConversationFeed conversations={conversations} />
                                    <ChannelSettings agent={selectedAgent} />
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex justify-end mt-8">
                    <Button
                        onClick={() => navigate(createPageUrl('AgentBuilder'))}
                        className="bg-slate-900 hover:bg-slate-800 rounded-full px-6"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Создать агента
                    </Button>
                </div>
            </div>
        </div>
    );
}