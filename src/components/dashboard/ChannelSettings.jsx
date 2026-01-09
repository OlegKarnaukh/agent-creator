import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Send, Globe, Settings, ExternalLink } from 'lucide-react';

const channels = [
    {
        id: 'telegram',
        name: 'Telegram',
        icon: Send,
        color: 'bg-blue-500',
        description: 'Подключите бота к Telegram'
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: MessageSquare,
        color: 'bg-green-500',
        description: 'Интеграция с WhatsApp Business'
    },
    {
        id: 'phone',
        name: 'Телефония',
        icon: Phone,
        color: 'bg-purple-500',
        description: 'Голосовой AI-ассистент'
    },
    {
        id: 'website',
        name: 'Виджет на сайт',
        icon: Globe,
        color: 'bg-orange-500',
        description: 'Чат-виджет для вашего сайта'
    },
];

export default function ChannelSettings({ agent }) {
    const enabledChannels = agent?.channels || [];

    const isChannelEnabled = (channelId) => {
        return enabledChannels.some(c => c.type === channelId && c.enabled);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Каналы связи</h3>
                <Button variant="ghost" size="sm" className="text-slate-500">
                    <Settings className="w-4 h-4 mr-1" />
                    Настройки
                </Button>
            </div>
            <div className="p-4 space-y-3">
                {channels.map((channel, idx) => {
                    const isEnabled = isChannelEnabled(channel.id);
                    
                    return (
                        <motion.div
                            key={channel.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-4 rounded-xl border transition-all ${
                                isEnabled 
                                    ? 'border-slate-200 bg-white' 
                                    : 'border-dashed border-slate-200 bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${channel.color}`}>
                                        <channel.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800 text-sm">
                                                {channel.name}
                                            </span>
                                            {isEnabled && (
                                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                                    Активен
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">{channel.description}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant={isEnabled ? "outline" : "default"}
                                    size="sm"
                                    className={isEnabled ? "" : "bg-slate-900 hover:bg-slate-800"}
                                >
                                    {isEnabled ? (
                                        <>
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Открыть
                                        </>
                                    ) : (
                                        'Подключить'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}