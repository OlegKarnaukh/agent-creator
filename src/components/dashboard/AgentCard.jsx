import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, TrendingUp, User, Send, Phone, Globe, Archive, RotateCcw } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentCard({ agent, onClick, isSelected, isArchived }) {
    const [showDialog, setShowDialog] = useState(false);
    const queryClient = useQueryClient();

    const archiveMutation = useMutation({
        mutationFn: () => base44.entities.Agent.update(agent.id, { status: 'archived' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            toast.success('Агент архивирован');
            setShowDialog(false);
        },
    });

    const restoreMutation = useMutation({
        mutationFn: () => base44.entities.Agent.update(agent.id, { status: agent.status === 'archived' ? 'active' : agent.status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            toast.success('Агент восстановлен');
        },
    });
    const statusColors = {
        draft: 'bg-slate-100 text-slate-600',
        active: 'bg-emerald-100 text-emerald-700',
        paused: 'bg-amber-100 text-amber-700',
    };

    const statusLabels = {
        draft: 'Черновик',
        active: 'Активен',
        paused: 'На паузе',
    };

    const channelIcons = {
        telegram: { icon: Send, color: 'text-blue-500' },
        whatsapp: { icon: MessageSquare, color: 'text-green-500' },
        phone: { icon: Phone, color: 'text-purple-500' },
        website: { icon: Globe, color: 'text-orange-500' },
    };

    const { data: connectedChannels = [] } = useQuery({
        queryKey: ['agent-channels', agent.id],
        queryFn: () => base44.entities.Channel.filter({ agent_id: agent.id, status: 'active' }),
        enabled: !!agent.id,
    });

    return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -2 }}
                    onClick={onClick}
                    className={`bg-white rounded-2xl border cursor-pointer transition-all ${
                        isArchived 
                            ? 'p-3 border-slate-100 hover:border-slate-200'
                            : `p-5 ${isSelected 
                            ? 'border-slate-900 shadow-lg shadow-slate-200/50' 
                            : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`
                    }`}
                >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {agent.avatar_url ? (
                        <img 
                            src={agent.avatar_url} 
                            alt={agent.name}
                            className={`rounded-xl object-cover ${isArchived ? 'w-8 h-8' : 'w-12 h-12'}`}
                        />
                    ) : (
                        <div className={`rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ${isArchived ? 'w-8 h-8' : 'w-12 h-12'}`}>
                            <User className={`text-slate-400 ${isArchived ? 'w-4 h-4' : 'w-5 h-5'}`} />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-slate-800">{agent.name}</h3>
                        {!isArchived && <p className="text-xs text-slate-500">{agent.business_type || 'Бизнес'}</p>}
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Редактировать</DropdownMenuItem>
                        <DropdownMenuItem>Дублировать</DropdownMenuItem>
                        {isArchived ? (
                            <DropdownMenuItem onClick={() => restoreMutation.mutate()}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Восстановить
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDialog(true);
                                }} 
                                className="text-amber-600"
                            >
                                <Archive className="w-4 h-4 mr-2" />
                                Архивировать
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {!isArchived && (
                <>
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Badge className={statusColors[agent.status || 'draft']}>
                                {statusLabels[agent.status || 'draft']}
                            </Badge>
                        </div>

                        {connectedChannels.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {connectedChannels.map((channel) => {
                                    const ChannelIcon = channelIcons[channel.type]?.icon || MessageSquare;
                                    const iconColor = channelIcons[channel.type]?.color || 'text-slate-500';
                                    return (
                                        <div 
                                            key={channel.id}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200"
                                        >
                                            <ChannelIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                                            <span className="text-xs text-slate-600 capitalize">{channel.type}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {connectedChannels.length === 0 && (
                            <div className="text-xs text-slate-400">Нет подключённых каналов</div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-slate-500">
                            <MessageSquare className="w-4 h-4" />
                            <span>{agent.stats?.total_conversations || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>{agent.stats?.conversion_rate || 0}%</span>
                        </div>
                    </div>
                </>
            )}

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Архивировать агента?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Агент «{agent.name}» будет перемещён в архив. Вы сможете восстановить его позже.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3">
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.stopPropagation();
                                archiveMutation.mutate();
                                setShowDialog(false);
                            }}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Архивировать
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}