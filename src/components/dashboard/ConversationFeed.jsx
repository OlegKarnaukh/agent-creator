import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Send, Globe, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const channelIcons = {
    telegram: Send,
    whatsapp: MessageSquare,
    phone: Phone,
    website: Globe,
};

const channelColors = {
    telegram: 'bg-blue-500',
    whatsapp: 'bg-green-500',
    phone: 'bg-purple-500',
    website: 'bg-orange-500',
};

const sentimentColors = {
    positive: 'bg-emerald-100 text-emerald-700',
    neutral: 'bg-slate-100 text-slate-700',
    negative: 'bg-red-100 text-red-700',
};

export default function ConversationFeed({ conversations = [] }) {
    if (conversations.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">Пока нет активных диалогов</p>
                <p className="text-slate-400 text-xs mt-1">Диалоги появятся здесь автоматически</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Активные диалоги</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {conversations.map((conv, idx) => {
                    const ChannelIcon = channelIcons[conv.channel] || MessageSquare;
                    const lastMessage = conv.messages?.[conv.messages.length - 1];
                    
                    return (
                        <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${channelColors[conv.channel]}`}>
                                    <ChannelIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-slate-800 text-sm truncate">
                                            {conv.customer_name || 'Клиент'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {conv.sentiment && (
                                                <Badge variant="secondary" className={sentimentColors[conv.sentiment]}>
                                                    {conv.sentiment === 'positive' ? '😊' : conv.sentiment === 'negative' ? '😟' : '😐'}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                2м
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">
                                        {lastMessage?.content || 'Новый диалог'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}