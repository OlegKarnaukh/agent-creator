import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Phone, MoreVertical, Play, Pause, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CreateCampaignDialog from '@/components/campaigns/CreateCampaignDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig = {
    'черновик': { color: 'bg-slate-100 text-slate-700', icon: '📝' },
    'активна': { color: 'bg-green-100 text-green-700', icon: '🟢' },
    'на паузе': { color: 'bg-yellow-100 text-yellow-700', icon: '⏸️' },
    'завершена': { color: 'bg-blue-100 text-blue-700', icon: '✓' }
};

export default function Campaigns() {
    const navigate = useNavigate();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('все');

    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: () => base44.entities.CallCampaign.list('-created_date')
    });

    const filteredCampaigns = statusFilter === 'все' 
        ? campaigns 
        : campaigns.filter(c => c.статус === statusFilter);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Кампании прозвона</h1>
                            <p className="text-slate-600">Автоматический обзвон клиентов через AI-сотрудника</p>
                        </div>
                        <Button 
                            onClick={() => setCreateDialogOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Новая кампания
                        </Button>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48 bg-white">
                                <SelectValue placeholder="Все статусы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="все">Все статусы</SelectItem>
                                <SelectItem value="активна">Активные</SelectItem>
                                <SelectItem value="черновик">Черновики</SelectItem>
                                <SelectItem value="на паузе">На паузе</SelectItem>
                                <SelectItem value="завершена">Завершенные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {filteredCampaigns.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
                    >
                        <Phone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Нет кампаний прозвона
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Создайте первую кампанию для автоматического обзвона клиентов
                        </p>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать кампанию
                        </Button>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                            Название
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                            Статус
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                            AI-сотрудник
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                            Прогресс
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                            Конверсия
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                            Минуты
                                        </th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCampaigns.map((campaign, idx) => {
                                        const progress = campaign.всего_контактов > 0 
                                            ? (campaign.обработано / campaign.всего_контактов) * 100 
                                            : 0;
                                        const conversion = campaign.обработано > 0 
                                            ? ((campaign.успешных / campaign.обработано) * 100).toFixed(1) 
                                            : '0.0';

                                        return (
                                            <motion.tr
                                                key={campaign.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(createPageUrl(`CampaignDetails?id=${campaign.id}`))}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">
                                                        {campaign.название}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={statusConfig[campaign.статус].color}>
                                                        {statusConfig[campaign.статус].icon} {campaign.статус}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {campaign.ai_сотрудник}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Progress value={progress} className="w-24" />
                                                        <span className="text-sm text-slate-600 whitespace-nowrap">
                                                            {campaign.обработано} / {campaign.всего_контактов}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-slate-900">
                                                        {conversion}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {campaign.израсходовано_минут} мин
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <CreateCampaignDialog 
                    open={createDialogOpen} 
                    onOpenChange={setCreateDialogOpen}
                />
            </div>
        </div>
    );
}