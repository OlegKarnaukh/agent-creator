import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, TrendingUp, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AgentCard({ agent, onClick, isSelected }) {
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
            onClick={onClick}
            className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${
                isSelected 
                    ? 'border-slate-900 shadow-lg shadow-slate-200/50' 
                    : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
            }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {agent.avatar_url ? (
                        <img 
                            src={agent.avatar_url} 
                            alt={agent.name}
                            className="w-12 h-12 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-slate-800">{agent.name}</h3>
                        <p className="text-xs text-slate-500">{agent.business_type || 'Бизнес'}</p>
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
                        <DropdownMenuItem className="text-red-600">Удалить</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <Badge className={statusColors[agent.status || 'draft']}>
                    {statusLabels[agent.status || 'draft']}
                </Badge>
                {agent.channels?.length > 0 && (
                    <Badge variant="outline" className="text-slate-500">
                        {agent.channels.filter(c => c.enabled).length} каналов
                    </Badge>
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
        </motion.div>
    );
}