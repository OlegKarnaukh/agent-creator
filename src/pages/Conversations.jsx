import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Phone, Send, Globe, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const channelIcons = {
    telegram: Send,
    whatsapp: MessageSquare,
    phone: Phone,
    website: Globe,
};

const channelColors = {
    telegram: 'bg-blue-100 text-blue-700',
    whatsapp: 'bg-green-100 text-green-700',
    phone: 'bg-purple-100 text-purple-700',
    website: 'bg-orange-100 text-orange-700',
};

const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-slate-100 text-slate-800',
    negative: 'bg-red-100 text-red-800',
};

export default function Conversations() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [channelFilter, setChannelFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => base44.entities.Conversation.list('-created_date'),
    });

    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: () => base44.entities.Agent.list(),
    });

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = !searchQuery || 
            conv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.customer_phone?.includes(searchQuery);
        const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter;
        const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
        const matchesAgent = agentFilter === 'all' || conv.agent_id === agentFilter;
        return matchesSearch && matchesChannel && matchesStatus && matchesAgent;
    });

    const getAgentName = (agentId) => {
        const agent = agents.find(a => a.id === agentId);
        return agent?.name || 'Агент';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-900 mb-4">Диалоги</h1>
                    
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Поиск по имени или телефону..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Select value={channelFilter} onValueChange={setChannelFilter}>
                            <SelectTrigger className="flex-1 min-w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все каналы</SelectItem>
                                <SelectItem value="telegram">Telegram</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="phone">Телефония</SelectItem>
                                <SelectItem value="website">Сайт</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="flex-1 min-w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все статусы</SelectItem>
                                <SelectItem value="active">Активные</SelectItem>
                                <SelectItem value="completed">Завершённые</SelectItem>
                                <SelectItem value="transferred">Переданные</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={agentFilter} onValueChange={setAgentFilter}>
                            <SelectTrigger className="flex-1 min-w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все агенты</SelectItem>
                                {agents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                        {agent.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Нет диалогов</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredConversations.map((conv) => {
                                const Icon = channelIcons[conv.channel] || MessageSquare;
                                const lastMessage = conv.messages?.[conv.messages.length - 1];
                                
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                                            selectedConversation?.id === conv.id ? 'bg-slate-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${channelColors[conv.channel]}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-slate-900 truncate">
                                                        {conv.customer_name || conv.customer_phone || 'Клиент'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {format(new Date(conv.created_date), 'HH:mm', { locale: ru })}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-sm text-slate-500 truncate mb-2">
                                                    {lastMessage?.content || 'Нет сообщений'}
                                                </p>
                                                
                                                <div className="flex items-center gap-2">
                                                    {conv.sentiment && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${sentimentColors[conv.sentiment]}`}>
                                                            {conv.sentiment === 'positive' ? 'Позитивный' : 
                                                             conv.sentiment === 'negative' ? 'Негативный' : 'Нейтральный'}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-400">
                                                        {getAgentName(conv.agent_id)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        {selectedConversation.customer_name || selectedConversation.customer_phone || 'Клиент'}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        {selectedConversation.customer_phone} • {getAgentName(selectedConversation.agent_id)}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedConversation.status === 'active' ? 'bg-green-100 text-green-700' :
                                    selectedConversation.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {selectedConversation.status === 'active' ? 'Активный' :
                                     selectedConversation.status === 'completed' ? 'Завершён' : 'Передан оператору'}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {selectedConversation.messages?.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                        msg.role === 'user'
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white border border-slate-200 text-slate-800'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        {msg.timestamp && (
                                            <p className={`text-xs mt-1 ${
                                                msg.role === 'user' ? 'text-slate-400' : 'text-slate-500'
                                            }`}>
                                                {format(new Date(msg.timestamp), 'HH:mm', { locale: ru })}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Выберите диалог для просмотра</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}