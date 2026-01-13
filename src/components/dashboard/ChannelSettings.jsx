import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MessageSquare, Phone, Send, Globe, Settings, ExternalLink, Home, Users, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import TelegramConnect from '@/components/channels/TelegramConnect';
import WhatsAppConnect from '@/components/channels/WhatsAppConnect';
import PhoneConnect from '@/components/channels/PhoneConnect';
import WebsiteConnect from '@/components/channels/WebsiteConnect';
import MaxConnect from '@/components/channels/MaxConnect';

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
    {
        id: 'avito',
        name: 'Avito',
        icon: Home,
        color: 'bg-red-500',
        description: 'Интеграция с Avito'
    },
    {
        id: 'vk',
        name: 'VK',
        icon: Users,
        color: 'bg-blue-600',
        description: 'Интеграция с VK'
    },
    {
        id: 'max',
        name: 'Max',
        icon: Zap,
        color: 'bg-yellow-500',
        description: 'Интеграция с Max'
    },
];

export default function ChannelSettings({ agent }) {
    const [connectDialog, setConnectDialog] = useState(null);
    const [disconnectDialog, setDisconnectDialog] = useState(null);
    const queryClient = useQueryClient();

    const { data: connectedChannels = [], refetch } = useQuery({
        queryKey: ['channels', agent?.id],
        queryFn: () => base44.entities.Channel.filter({ agent_id: agent?.id }),
        enabled: !!agent?.id,
    });

    const disconnectMutation = useMutation({
        mutationFn: async (channelId) => {
            const response = await fetch(
                `https://neuro-seller-production.up.railway.app/api/v1/channels/${channelId}`,
                { method: 'DELETE' }
            );
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка отключения');
            }
            
            return await response.json();
        },
        onSuccess: async (_, channelId) => {
            await base44.entities.Channel.delete(
                connectedChannels.find(c => c.metadata?.railway_channel_id === channelId)?.id
            );
            refetch();
            toast.success('Бот отключён');
            setDisconnectDialog(null);
        },
        onError: (error) => {
            toast.error('Ошибка: ' + error.message);
        }
    });

    const isChannelEnabled = (channelId) => {
        return connectedChannels.some(c => c.type === channelId && c.status === 'active');
    };

    const getChannelData = (channelId) => {
        return connectedChannels.find(c => c.type === channelId);
    };

    const handleConnect = (channelId) => {
        setConnectDialog(channelId);
    };

    const handleConnectionSuccess = () => {
        refetch();
        setConnectDialog(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Доступные каналы</h3>
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
                                {isEnabled ? (
                                    <Button 
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50"
                                        onClick={() => setDisconnectDialog(getChannelData(channel.id))}
                                        disabled={disconnectMutation.isPending}
                                    >
                                        {disconnectMutation.isPending ? (
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        ) : null}
                                        Отключить
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="default"
                                        size="sm"
                                        className="bg-slate-900 hover:bg-slate-800"
                                        onClick={() => handleConnect(channel.id)}
                                    >
                                        Подключить
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <Dialog open={!!connectDialog} onOpenChange={() => setConnectDialog(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {connectDialog === 'telegram' && 'Подключить Telegram'}
                            {connectDialog === 'whatsapp' && 'Подключить WhatsApp'}
                            {connectDialog === 'phone' && 'Подключить телефонию'}
                            {connectDialog === 'website' && 'Подключить виджет'}
                            {connectDialog === 'avito' && 'Подключить Avito'}
                            {connectDialog === 'vk' && 'Подключить VK'}
                            {connectDialog === 'max' && 'Подключить Max'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {connectDialog === 'telegram' && (
                        <TelegramConnect 
                            agentId={agent?.id} 
                            onSuccess={handleConnectionSuccess}
                        />
                    )}
                    {connectDialog === 'whatsapp' && (
                        <WhatsAppConnect 
                            agentId={agent?.id} 
                            onSuccess={handleConnectionSuccess}
                        />
                    )}
                    {connectDialog === 'phone' && (
                        <PhoneConnect 
                            agentId={agent?.id} 
                            onSuccess={handleConnectionSuccess}
                        />
                    )}
                    {connectDialog === 'website' && (
                        <WebsiteConnect 
                            agentId={agent?.id} 
                            onSuccess={handleConnectionSuccess}
                        />
                    )}
                    {['avito', 'vk', 'max'].includes(connectDialog) && (
                        <div className="p-4 text-center text-slate-600">
                            <p className="text-sm">Скоро будет доступно</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!disconnectDialog} onOpenChange={() => setDisconnectDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отключить {disconnectDialog?.type === 'telegram' ? 'Telegram' : 'канал'}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Бот будет отключен от системы. Вы сможете подключить его позже.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3">
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => disconnectMutation.mutate(disconnectDialog?.metadata?.railway_channel_id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Отключить
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}