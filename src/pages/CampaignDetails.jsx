import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, CheckCircle2, Upload, Download, Search } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import UploadContactsDialog from '@/components/campaigns/UploadContactsDialog';
import ContactDetailsSheet from '@/components/campaigns/ContactDetailsSheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const statusConfig = {
    'ожидает': { color: 'bg-slate-100 text-slate-700', label: 'Ожидает' },
    'в_процессе': { color: 'bg-blue-100 text-blue-700', label: 'В процессе' },
    'успех': { color: 'bg-green-100 text-green-700', label: 'Успех' },
    'интерес': { color: 'bg-cyan-100 text-cyan-700', label: 'Интерес' },
    'перезвонить': { color: 'bg-yellow-100 text-yellow-700', label: 'Перезвонить' },
    'отказ': { color: 'bg-red-100 text-red-700', label: 'Отказ' },
    'недозвон': { color: 'bg-slate-100 text-slate-600', label: 'Недозвон' },
    'автоответчик': { color: 'bg-purple-100 text-purple-700', label: 'Автоответчик' },
    'некорректный_номер': { color: 'bg-orange-100 text-orange-700', label: 'Некорректный' }
};

const COLORS = {
    'успех': '#10b981',
    'интерес': '#06b6d4',
    'перезвонить': '#f59e0b',
    'отказ': '#ef4444',
    'недозвон': '#94a3b8',
    'ожидает': '#e2e8f0'
};

export default function CampaignDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const campaignId = new URLSearchParams(location.search).get('id');

    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('все');

    const { data: campaign } = useQuery({
        queryKey: ['campaign', campaignId],
        queryFn: async () => {
            const campaigns = await base44.entities.CallCampaign.list();
            return campaigns.find(c => c.id === campaignId);
        },
        enabled: !!campaignId
    });

    const { data: contacts = [] } = useQuery({
        queryKey: ['contacts', campaignId],
        queryFn: () => base44.entities.CallContact.filter({ кампания_id: campaignId }),
        enabled: !!campaignId
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, статус }) => base44.entities.CallCampaign.update(id, { статус }),
        onSuccess: () => {
            queryClient.invalidateQueries(['campaign', campaignId]);
            queryClient.invalidateQueries(['campaigns']);
        }
    });

    if (!campaign) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
            </div>
        );
    }

    // Calculate stats
    const statusDistribution = contacts.reduce((acc, contact) => {
        acc[contact.статус] = (acc[contact.статус] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(statusDistribution).map(([key, value]) => ({
        name: statusConfig[key]?.label || key,
        value,
        color: COLORS[key] || '#94a3b8'
    }));

    const reasonsData = contacts
        .filter(c => c.причина_отказа)
        .reduce((acc, contact) => {
            const reason = contact.причина_отказа;
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {});

    const barData = Object.entries(reasonsData).map(([key, value]) => ({
        name: key.replace(/_/g, ' '),
        value
    }));

    const progress = campaign.всего_контактов > 0 
        ? (campaign.обработано / campaign.всего_контактов) * 100 
        : 0;

    const conversion = campaign.обработано > 0 
        ? ((campaign.успешных / campaign.обработано) * 100).toFixed(1) 
        : '0.0';

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.имя?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contact.телефон?.includes(searchQuery);
        const matchesStatus = statusFilter === 'все' || contact.статус === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Назад
                    </Button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {campaign.название}
                            </h1>
                            <p className="text-slate-600">AI-сотрудник: {campaign.ai_сотрудник}</p>
                        </div>
                        <div className="flex gap-3">
                            {campaign.статус === 'черновик' && (
                                <Button
                                    onClick={() => updateStatusMutation.mutate({ id: campaign.id, статус: 'активна' })}
                                    className="gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    Запустить
                                </Button>
                            )}
                            {campaign.статус === 'активна' && (
                                <Button
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate({ id: campaign.id, статус: 'на паузе' })}
                                    className="gap-2"
                                >
                                    <Pause className="w-4 h-4" />
                                    Пауза
                                </Button>
                            )}
                            {campaign.статус === 'на паузе' && (
                                <Button
                                    onClick={() => updateStatusMutation.mutate({ id: campaign.id, статус: 'активна' })}
                                    className="gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    Продолжить
                                </Button>
                            )}
                            {(campaign.статус === 'активна' || campaign.статус === 'на паузе') && (
                                <Button
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate({ id: campaign.id, статус: 'завершена' })}
                                    className="gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Завершить
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Всего контактов
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    {campaign.всего_контактов}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Обработано
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900 mb-2">
                                    {campaign.обработано}
                                </div>
                                <Progress value={progress} className="h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Конверсия
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {conversion}%
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Израсходовано минут
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    {campaign.израсходовано_минут}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Распределение по статусам</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-slate-500">
                                        Нет данных для отображения
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Причины отказов</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {barData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={barData} layout="vertical">
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={120} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-slate-500">
                                        Нет данных об отказах
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Schedule */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Расписание</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Время работы</div>
                                    <div className="text-lg font-semibold text-slate-900">
                                        {campaign.расписание_начало} — {campaign.расписание_конец} (МСК)
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Дни недели</div>
                                    <div className="flex gap-2">
                                        {campaign.дни_недели?.map(day => (
                                            <Badge key={day} variant="outline">{day}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Период</div>
                                    <div className="text-lg font-semibold text-slate-900">
                                        {campaign.дата_старта} {campaign.дата_окончания && `— ${campaign.дата_окончания}`}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Contacts Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Контакты ({contacts.length})</CardTitle>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Экспорт
                                    </Button>
                                    <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                                        <Upload className="w-4 h-4" />
                                        Загрузить базу
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Поиск по имени или телефону..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Все статусы" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="все">Все статусы</SelectItem>
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {filteredContacts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-600">
                                        {contacts.length === 0 
                                            ? 'Загрузите базу контактов для начала прозвона'
                                            : 'Контакты не найдены'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Имя</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Телефон</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Предыдущая покупка</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Статус</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Попыток</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Длительность</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Последний звонок</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredContacts.map(contact => (
                                                <tr
                                                    key={contact.id}
                                                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                                    onClick={() => setSelectedContact(contact)}
                                                >
                                                    <td className="px-4 py-3 font-medium text-slate-900">{contact.имя}</td>
                                                    <td className="px-4 py-3 text-slate-600">{contact.телефон}</td>
                                                    <td className="px-4 py-3 text-slate-600">{contact.кастомное_поле_1}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={statusConfig[contact.статус]?.color}>
                                                            {statusConfig[contact.статус]?.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{contact.попыток_дозвона}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {contact.длительность_разговора ? `${Math.floor(contact.длительность_разговора / 60)} мин` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {contact.последний_звонок ? new Date(contact.последний_звонок).toLocaleDateString('ru-RU') : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <UploadContactsDialog
                    open={uploadDialogOpen}
                    onOpenChange={setUploadDialogOpen}
                    campaignId={campaignId}
                />

                <ContactDetailsSheet
                    contact={selectedContact}
                    onClose={() => setSelectedContact(null)}
                    campaignId={campaignId}
                />
            </div>
        </div>
    );
}