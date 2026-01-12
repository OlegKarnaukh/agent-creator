import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import AgentCard from '@/components/dashboard/AgentCard';

export default function Agents() {
    const navigate = useNavigate();

    const { data: agents = [], isLoading } = useQuery({
        queryKey: ['agents'],
        queryFn: () => base44.entities.Agent.list('-created_date'),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">AI Агенты</h1>
                        <p className="text-slate-500 mt-1">Управление виртуальными ассистентами</p>
                    </div>
                    <Button
                        onClick={() => navigate(createPageUrl('AgentBuilder'))}
                        className="bg-slate-900 hover:bg-slate-800 rounded-full px-6"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Создать агента
                    </Button>
                </div>

                {agents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6">
                            <Plus className="w-8 h-8 text-slate-400" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {agents.map((agent) => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                onClick={() => navigate(`${createPageUrl('Channels')}?agentId=${agent.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}