import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users, TrendingUp, Zap, Loader2, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import StatCard from '@/components/dashboard/StatCard';
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const navigate = useNavigate();

    const { data: agents = [], isLoading: agentsLoading } = useQuery({
        queryKey: ['agents'],
        queryFn: () => base44.entities.Agent.list('-created_date'),
    });

    const { data: allConversations = [] } = useQuery({
        queryKey: ['all_conversations'],
        queryFn: () => base44.entities.Conversation.list('-created_date'),
    });

    // Вычисляем общую статистику
    const totalStats = {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        totalConversations: allConversations.length,
        todayConversations: allConversations.filter(c => {
            const today = new Date();
            const convDate = new Date(c.created_date);
            return convDate.toDateString() === today.toDateString();
        }).length,
        activeConversations: allConversations.filter(c => c.status === 'active').length,
        avgConversionRate: agents.length > 0 
            ? (agents.reduce((sum, a) => sum + (a.stats?.conversion_rate || 0), 0) / agents.length).toFixed(1)
            : 0,
        totalChannels: agents.reduce((sum, a) => sum + (a.channels?.filter(c => c.enabled).length || 0), 0)
    };

    // График диалогов по месяцам
    const monthlyConversations = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const monthName = date.toLocaleString('ru-RU', { month: 'short' });
        const count = allConversations.filter(c => {
            const convDate = new Date(c.created_date);
            return convDate.getMonth() === date.getMonth() && convDate.getFullYear() === date.getFullYear();
        }).length;
        return { month: monthName, conversations: count };
    });

    const stats = [
        { 
            title: 'Всего агентов', 
            value: totalStats.totalAgents,
            icon: Bot,
            color: 'blue',
            subtitle: `${totalStats.activeAgents} активных`
        },
        { 
            title: 'Диалогов сегодня', 
            value: totalStats.todayConversations,
            icon: MessageSquare,
            color: 'purple',
            trend: 12,
            subtitle: `${totalStats.activeConversations} активных`
        },
        { 
            title: 'Средняя конверсия', 
            value: `${totalStats.avgConversionRate}%`,
            icon: TrendingUp,
            color: 'green',
            trend: 5
        },
        { 
            title: 'Активных каналов', 
            value: totalStats.totalChannels,
            icon: Zap,
            color: 'orange'
        },
    ];

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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Статистика</h1>
                        <p className="text-slate-500 mt-1">Общий обзор работы AI-агентов</p>
                    </div>
                </div>

                {agents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6">
                            <Bot className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Создайте первого агента</h2>
                        <p className="text-slate-500 mb-6 text-center max-w-md">
                            AI-агенты будут общаться с вашими клиентами 24/7 через любые каналы связи
                        </p>
                        <Button
                            onClick={() => navigate(createPageUrl('AgentBuilder'))}
                            className="bg-slate-900 hover:bg-slate-800 rounded-full px-8 py-6 text-lg"
                        >
                            Создать агента
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <StatCard {...stat} />
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl p-6 border border-slate-200"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Диалоги по месяцам</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyConversations}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1e293b', 
                                            border: 'none', 
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="conversations" 
                                        stroke="#7c3aed" 
                                        dot={{ fill: '#7c3aed', r: 4 }}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}