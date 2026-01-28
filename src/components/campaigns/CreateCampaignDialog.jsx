import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function CreateCampaignDialog({ open, onOpenChange }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        название: '',
        ai_сотрудник: '',
        расписание_начало: '10:00',
        расписание_конец: '19:00',
        дни_недели: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
        дата_старта: new Date().toISOString().split('T')[0],
        дата_окончания: ''
    });

    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: () => base44.entities.Agent.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CallCampaign.create(data),
        onSuccess: (campaign) => {
            queryClient.invalidateQueries(['campaigns']);
            toast.success('Кампания создана');
            onOpenChange(false);
            navigate(createPageUrl(`CampaignDetails?id=${campaign.id}`));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.название || !formData.ai_сотрудник) {
            toast.error('Заполните обязательные поля');
            return;
        }
        createMutation.mutate(formData);
    };

    const toggleDay = (day) => {
        setFormData(prev => ({
            ...prev,
            дни_недели: prev.дни_недели.includes(day)
                ? prev.дни_недели.filter(d => d !== day)
                : [...prev.дни_недели, day]
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Создание кампании</DialogTitle>
                    <DialogDescription>
                        Заполните основные параметры кампании прозвона
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Название кампании *</Label>
                        <Input
                            value={formData.название}
                            onChange={(e) => setFormData({ ...formData, название: e.target.value })}
                            placeholder="Например: Апгрейд на премиум"
                        />
                    </div>

                    <div>
                        <Label>AI-сотрудник *</Label>
                        <Select
                            value={formData.ai_сотрудник}
                            onValueChange={(value) => setFormData({ ...formData, ai_сотрудник: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите сотрудника" />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.name}>
                                        {agent.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="Виктория">Виктория</SelectItem>
                                <SelectItem value="Александр">Александр</SelectItem>
                                <SelectItem value="Дмитрий">Дмитрий</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Время работы с</Label>
                            <Input
                                type="time"
                                value={formData.расписание_начало}
                                onChange={(e) => setFormData({ ...formData, расписание_начало: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>до</Label>
                            <Input
                                type="time"
                                value={formData.расписание_конец}
                                onChange={(e) => setFormData({ ...formData, расписание_конец: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Дни недели</Label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        formData.дни_недели.includes(day)
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Дата старта</Label>
                            <Input
                                type="date"
                                value={formData.дата_старта}
                                onChange={(e) => setFormData({ ...formData, дата_старта: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Дата окончания (опционально)</Label>
                            <Input
                                type="date"
                                value={formData.дата_окончания}
                                onChange={(e) => setFormData({ ...formData, дата_окончания: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Создание...' : 'Создать'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}