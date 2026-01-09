import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, MessageSquare, Phone, Globe, Send } from "lucide-react";

export default function ConfigurePanel({ agentData, onAgentUpdate }) {
    const channels = [
        { id: 'telegram', name: 'Telegram', icon: Send, color: 'bg-blue-500' },
        { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
        { id: 'phone', name: 'Телефония', icon: Phone, color: 'bg-purple-500' },
        { id: 'website', name: 'Виджет на сайт', icon: Globe, color: 'bg-orange-500' },
    ];

    const handleChannelToggle = (channelId, enabled) => {
        const currentChannels = agentData.channels || [];
        let updatedChannels;
        
        if (enabled) {
            updatedChannels = [...currentChannels, { type: channelId, enabled: true, config: {} }];
        } else {
            updatedChannels = currentChannels.filter(c => c.type !== channelId);
        }
        
        onAgentUpdate({ channels: updatedChannels });
    };

    const isChannelEnabled = (channelId) => {
        return agentData.channels?.some(c => c.type === channelId && c.enabled);
    };

    return (
        <div className="p-6 space-y-8 overflow-y-auto h-full">
            {/* Avatar & Name */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Профиль агента</h3>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">
                            {agentData.avatar_url ? (
                                <img src={agentData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-slate-400" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label className="text-xs text-slate-500">Имя агента</Label>
                        <Input
                            value={agentData.name || ''}
                            onChange={(e) => onAgentUpdate({ name: e.target.value })}
                            placeholder="Виктория"
                            className="h-10"
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
                <Label className="text-xs text-slate-500">Описание</Label>
                <Textarea
                    value={agentData.description || ''}
                    onChange={(e) => onAgentUpdate({ description: e.target.value })}
                    placeholder="Опишите, чем занимается агент..."
                    className="min-h-[80px] resize-none"
                />
            </div>

            {/* Instructions */}
            <div className="space-y-3">
                <Label className="text-xs text-slate-500">Системные инструкции</Label>
                <Textarea
                    value={agentData.instructions || ''}
                    onChange={(e) => onAgentUpdate({ instructions: e.target.value })}
                    placeholder="Вы — профессиональный консультант компании..."
                    className="min-h-[120px] resize-none font-mono text-xs"
                />
            </div>

            {/* Channels */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Каналы связи</h3>
                
                <div className="space-y-3">
                    {channels.map((channel) => (
                        <div
                            key={channel.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${channel.color}`}>
                                    <channel.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                            </div>
                            <Switch
                                checked={isChannelEnabled(channel.id)}
                                onCheckedChange={(checked) => handleChannelToggle(channel.id, checked)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Knowledge Base */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">База знаний</h3>
                <Textarea
                    value={agentData.knowledge_base || ''}
                    onChange={(e) => onAgentUpdate({ knowledge_base: e.target.value })}
                    placeholder="Добавьте информацию о компании, услугах, ценах..."
                    className="min-h-[150px] resize-none text-sm"
                />
                <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить файлы
                </Button>
            </div>
        </div>
    );
}