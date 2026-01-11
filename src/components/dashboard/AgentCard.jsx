import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, TrendingUp, User } from 'lucide-react';
import { createPageUrl } from "@/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ✅ Статические аватарки по умолчанию
const DEFAULT_AVATAR_VICTORIA = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Victoria&style=circle&backgroundColor=fef3c7&hair=longHair&hairColor=auburn&accessories=prescription02&clothingColor=3c4f5c&top=longHairStraight&accessoriesColor=262e33&facialHairColor=auburn&clothesColor=262e33&graphicType=skull&eyeType=happy&eyebrowType=default&mouthType=smile&skinColor=light';

const DEFAULT_AVATAR_ALEXANDER = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander&style=circle&backgroundColor=c0aede&hair=shortHairShortWaved&hairColor=brown&accessories=prescription01&clothingColor=black&top=shortHairShortWaved&accessoriesColor=262e33&facialHairColor=black&clothesColor=heather&graphicType=bat&eyeType=default&eyebrowType=default&mouthType=default&skinColor=light';

export default function AgentCard({ agent, onClick, isSelected }) {
    const navigate = useNavigate();
    
    const statusColors = {
        draft: 'bg-amber-100 text-amber-700',
        test: 'bg-blue-100 text-blue-700',
        active: 'bg-emerald-100 text-emerald-700',
        paused: 'bg-slate-100 text-slate-600',
    };

    const statusLabels = {
        draft: '🟡 Черновик',
        test: '🔵 Тестирование',
        active: '🟢 Активен',
        paused: '🟠 На паузе',
    };
    
    // ✅ Определяем аватарку: загруженная или по умолчанию
    const avatarUrl = agent.avatar_url || (
        agent.name?.toLowerCase().includes('виктори')
            ? DEFAULT_AVATAR_VICTORIA
            : DEFAULT_AVATAR_ALEXANDER
    );

    function handleEdit(e) {
        e.stopPropagation();
        
        if (agent.conversation_id) {
            // ✅ Переход в конструктор с conversation_id
            const url = createPageUrl('AgentBuilder');
            navigate(`${url}?conversationId=${agent.conversation_id}`);
        } else {
            alert('Этот агент был создан в старой версии. Conversation ID отсутствует.');
        }
    }
    
    async function handlePause(e) {
        e.stopPropagation();
        
        try {
            if (agent.status === 'active') {
                await fetch(
                    `https://neuro-seller-production.up.railway.app/api/v1/agents/${agent.id}/pause`,
                    { method: 'POST' }
                );
            } else if (agent.status === 'paused') {
                await fetch(
                    `https://neuro-seller-production.up.railway.app/api/v1/agents/${agent.id}/resume`,
                    { method: 'POST' }
                );
            }
            
            // Перезагрузить данные
            window.location.reload();
        } catch (error) {
            console.error('Ошибка управления агентом:', error);
            alert('Ошибка. Попробуйте ещё раз.');
        }
    }
    
    async function handleDelete(e) {
        e.stopPropagation();
        
        if (!confirm(`Удалить агента "${agent.name}"?`)) return;
        
        try {
            await fetch(
                `https://neuro-seller-production.up.railway.app/api/v1/agents/${agent.id}`,
                { method: 'DELETE' }
            );
            
            window.location.reload();
        } catch (error) {
            console.error('Ошибка удаления агента:', error);
            alert('Ошибка. Попробуйте ещё раз.');
        }
    }

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
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100">
                        <img 
                            src={avatarUrl} 
                            alt={agent.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback если аватарка не загрузилась
                                e.target.src = DEFAULT_AVATAR_VICTORIA;
                            }}
                        />
                    </div>
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
                        <DropdownMenuItem onClick={handleEdit}>
                            Редактировать
                        </DropdownMenuItem>
                        {agent.status === 'active' && (
                            <DropdownMenuItem onClick={handlePause}>
                                Поставить на паузу
                            </DropdownMenuItem>
                        )}
                        {agent.status === 'paused' && (
                            <DropdownMenuItem onClick={handlePause}>
                                Возобновить
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            Удалить
                        </DropdownMenuItem>
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