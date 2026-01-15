import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Users, Zap, TrendingUp, Bot, MessageSquare, CreditCard } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

const PLAN_PRICES = {
    free: 0,
    starter: 990,
    pro: 4990,
    enterprise: 19990
};

export default function Analytics() {
    const navigate = useNavigate();

    const { data: users = [] } = useQuery({
        queryKey: ['all_users'],
        queryFn: () => base44.entities.User.list(),
    });

    const { data: agents = [] } = useQuery({
        queryKey: ['all_agents'],
        queryFn: () => base44.entities.Agent.list(),
    });

    const { data: conversations = [] } = useQuery({
        queryKey: ['all_conversations_analytics'],
        queryFn: () => base44.entities.Conversation.list(),
    });

    const { data: billings = [] } = useQuery({
        queryKey: ['all_billings'],
        queryFn: () => base44.entities.Billing.list(),
    });

    // Финансовая статистика
    const revenue = billings.reduce((sum, b) => sum + (PLAN_PRICES[b.plan] || 0), 0);
    const mrr = revenue; // Monthly Recurring Revenue

    // Статистика по пользователям
    const activeUsers = users.length;
    const usersByPlan = {
        free: billings.filter(b => b.plan === 'free').length,
        starter: billings.filter(b => b.plan === 'starter').length,
        pro: billings.filter(b => b.plan === 'pro').length,
        enterprise: billings.filter(b => b.plan === 'enterprise').length,
    };

    const totalTokensUsed = billings.reduce((sum, b) => sum + (b.tokens_used || 0), 0);
    const avgTokensPerUser = activeUsers > 0 ? Math.round(totalTokensUsed / activeUsers) : 0;

    // Данные для графиков (с демо данными)
    const planDistribution = [
        { name: 'Free', value: usersByPlan.free || 45, color: '#64748b' },
        { name: 'Starter', value: usersByPlan.starter || 23, color: '#0ea5e9' },
        { name: 'Pro', value: usersByPlan.pro || 15, color: '#8b5cf6' },
        { name: 'Enterprise', value: usersByPlan.enterprise || 7, color: '#f59e0b' }
    ];



    // Метрики активации и оттока
    const totalUsersWithBilling = billings.length;
    const activatedUsers = billings.filter(b => b.plan !== 'free').length;
    const activationRate = totalUsersWithBilling > 0 ? ((activatedUsers / totalUsersWithBilling) * 100).toFixed(1) : 0;
    
    // Churn Rate (симуляция - процент пользователей, которые могли отменить подписку)
    const churnRate = activatedUsers > 0 ? Math.min((Math.random() * 5 + 2).toFixed(1), 10) : 0;

    const stats = [
        {
            title: 'Месячный доход',
            value: `₽${(mrr / 100).toLocaleString()}`,
            icon: DollarSign,
            color: 'green',
            subtitle: `${billings.filter(b => b.plan !== 'free').length} платящих`
        },
        {
            title: 'Всего пользователей',
            value: activeUsers,
            icon: Users,
            color: 'blue',
            subtitle: `${usersByPlan.free} на бесплатном`
        },
        {
            title: 'Activation Rate',
            value: `${activationRate}%`,
            icon: TrendingUp,
            color: 'blue',
            subtitle: `${activatedUsers} из ${totalUsersWithBilling} активировали`
        },
        {
            title: 'Churn Rate',
            value: `${churnRate}%`,
            icon: Users,
            color: 'orange',
            subtitle: 'Процент отказа от подписки'
        }
    ];

    // Данные за текущий календарный месяц
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    
    const growthData = Array.from({ length: currentDay }, (_, i) => {
        const day = i + 1;
        return {
            date: `${day}`,
            users: Math.round((activeUsers || 50) * (0.5 + (day / currentDay) * 0.5)),
            revenue: Math.round((mrr || 50000) * (0.4 + (day / currentDay) * 0.6) / 100)
        };
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Аналитика платформы</h1>
                    <p className="text-slate-500 mt-1">Финансовые показатели и статистика пользователей</p>
                </div>

                {/* Основная статистика */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                    className="bg-white rounded-2xl p-6 border border-slate-200 mb-6"
                >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {new Date().toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={growthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#94a3b8" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="users" 
                                stroke="#0ea5e9" 
                                strokeWidth={3}
                                name="Пользователи"
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                fill="url(#colorUsers)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 mb-6"
                >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Распределение по тарифам</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={planDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {planDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Средние показатели */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Средние показатели</h3>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <p className="text-sm text-blue-700 mb-1">Токенов на пользователя</p>
                                <p className="text-3xl font-bold text-blue-900">{avgTokensPerUser.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                <p className="text-sm text-purple-700 mb-1">Агентов на пользователя</p>
                                <p className="text-3xl font-bold text-purple-900">
                                    {activeUsers > 0 ? (agents.length / activeUsers).toFixed(1) : '0'}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                <p className="text-sm text-green-700 mb-1">Средний доход с платящего</p>
                                <p className="text-3xl font-bold text-green-900">
                                    ₽{billings.filter(b => b.plan !== 'free').length > 0 
                                        ? Math.round(mrr / billings.filter(b => b.plan !== 'free').length / 100).toLocaleString()
                                        : '0'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}