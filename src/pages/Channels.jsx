import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import ChannelSettings from '@/components/dashboard/ChannelSettings';

export default function Channels() {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const agentIdParam = urlParams.get('agentId');
    
    const [selectedAgent, setSelectedAgent] = useState(null);

    const { data: agents = [], isLoading } = useQuery({
        queryKey: ['agents'],
        queryFn: () => base44.entities.Agent.list('-created_date'),
    });

    useEffect(() => {
        if (agents.length > 0) {
            if (agentIdParam) {
                const agent = agents.find(a => a.id === agentIdParam);
                setSelectedAgent(agent || agents[0]);
            } else {
                setSelectedAgent(agents[0]);
            }
        }
    }, [agents, agentIdParam]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (agents.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Нет агентов</h2>
                        <p className="text-slate-500 mb-6">Сначала создайте агента</p>
                        <Button
                            onClick={() => navigate(createPageUrl('Agents'))}
                            className="bg-slate-900 hover:bg-slate-800"
                        >
                            Перейти к агентам
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(createPageUrl('Agents'))}
                            className="rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Каналы связи</h1>
                            <p className="text-slate-500 mt-1">
                                {selectedAgent ? `Настройка каналов для ${selectedAgent.name}` : 'Выберите агента'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedAgent?.id || ''}
                            onChange={(e) => {
                                const agent = agents.find(a => a.id === e.target.value);
                                setSelectedAgent(agent);
                            }}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedAgent && (
                    <div className="max-w-4xl">
                        <ChannelSettings agent={selectedAgent} />
                    </div>
                )}
            </div>
        </div>
    );
}