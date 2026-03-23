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

// Реалистичные демо-данные для российской SaaS платформы (~1200 пользователей)
const DEMO = {
    mrr: 487200,           // ₽ в месяц
    totalUsers: 1247,
    freeUsers: 743,
    starterUsers: 312,     // 990 ₽/мес
    proUsers: 152,         // 4990 ₽/мес
    enterpriseUsers: 40,   // 19990 ₽/мес
    activationRate: 40.4,
    churnRate: 3.2,
    avgTokensPerUser: 47300,
    agentsPerUser: 1.8,
    arppu: 973,            // avg revenue per paying user
    // Рост пользователей по дням марта 2026 (23 дня)
    growthData: [
        { date: '1', users: 464, revenue: 180 },
        { date: '2', users: 491, revenue: 191 },
        { date: '3', users: 488, revenue: 189 },
        { date: '4', users: 523, revenue: 203 },
        { date: '5', users: 567, revenue: 220 },
        { date: '6', users: 554, revenue: 215 },
        { date: '7', users: 601, revenue: 233 },
        { date: '8', users: 639, revenue: 248 },
        { date: '9', users: 628, revenue: 244 },
        { date: '10', users: 674, revenue: 262 },
        { date: '11', users: 721, revenue: 280 },
        { date: '12', users: 758, revenue: 294 },
        { date: '13', users: 743, revenue: 288 },
        { date: '14', users: 812, revenue: 315 },
        { date: '15', users: 869, revenue: 337 },
        { date: '16', users: 903, revenue: 350 },
        { date: '17', users: 891, revenue: 346 },
        { date: '18', users: 967, revenue: 375 },
        { date: '19', users: 1034, revenue: 401 },
        { date: '20', users: 1018, revenue: 395 },
        { date: '21', users: 1112, revenue: 431 },
        { date: '22', users: 1189, revenue: 461 },
        { date: '23', users: 1247, revenue: 487 },
    ]
};

export default function Analytics() {
    const navigate = useNavigate();

    const planDistribution = [
        { name: 'Free', value: DEMO.freeUsers, color: '#64748b' },
        { name: 'Starter', value: DEMO.starterUsers, color: '#0ea5e9' },
        { name: 'Pro', value: DEMO.proUsers, color: '#8b5cf6' },
        { name: 'Enterprise', value: DEMO.enterpriseUsers, color: '#f59e0b' }
    ];

    const stats = [
        {
            title: 'Месячный доход (MRR)',
            value: `₽${DEMO.mrr.toLocaleString()}`,
            icon: DollarSign,
            color: 'green',
            subtitle: `${DEMO.starterUsers + DEMO.proUsers + DEMO.enterpriseUsers} платящих клиентов`
        },
        {
            title: 'Всего пользователей',
            value: DEMO.totalUsers.toLocaleString(),
            icon: Users,
            color: 'blue',
            subtitle: `${DEMO.freeUsers} на бесплатном тарифе`
        },
        {
            title: 'Activation Rate',
            value: `${DEMO.activationRate}%`,
            icon: TrendingUp,
            color: 'blue',
            subtitle: `${DEMO.starterUsers + DEMO.proUsers + DEMO.enterpriseUsers} из ${DEMO.totalUsers} конвертировались`
        },
        {
            title: 'Churn Rate',
            value: `${DEMO.churnRate}%`,
            icon: Users,
            color: 'orange',
            subtitle: 'Ежемесячный отток подписчиков'
        }
    ];

    const growthData = DEMO.growthData;

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-100"
                    >
                        <p className="text-sm text-blue-700 mb-2">Токенов на пользователя</p>
                        <p className="text-4xl font-bold text-blue-900">{DEMO.avgTokensPerUser.toLocaleString()}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-100"
                    >
                        <p className="text-sm text-purple-700 mb-2">Агентов на пользователя</p>
                        <p className="text-4xl font-bold text-purple-900">{DEMO.agentsPerUser}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-100"
                    >
                        <p className="text-sm text-green-700 mb-2">Средний доход с платящего</p>
                        <p className="text-4xl font-bold text-green-900">₽{DEMO.arppu.toLocaleString()}</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}