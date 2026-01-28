import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Phone, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

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

export default function ContactDetailsSheet({ contact, onClose, campaignId }) {
    const queryClient = useQueryClient();
    const [expandedHistory, setExpandedHistory] = useState({});

    const { data: history = [] } = useQuery({
        queryKey: ['callHistory', contact?.id],
        queryFn: () => base44.entities.CallHistory.filter({ контакт_id: contact.id }),
        enabled: !!contact?.id
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.CallContact.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts', campaignId]);
            toast.success('Контакт обновлен');
        }
    });

    if (!contact) return null;

    const copyPhone = () => {
        navigator.clipboard.writeText(contact.телефон);
        toast.success('Телефон скопирован');
    };

    return (
        <Sheet open={!!contact} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-2xl">{contact.имя}</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Phone */}
                    <div>
                        <div className="text-sm text-slate-600 mb-2">Телефон</div>
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-medium text-slate-900">{contact.телефон}</div>
                            <Button variant="ghost" size="icon" onClick={copyPhone}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <div className="text-sm text-slate-600 mb-2">Статус</div>
                        <Select
                            value={contact.статус}
                            onValueChange={(value) => updateMutation.mutate({ id: contact.id, data: { статус: value } })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Fields */}
                    {contact.кастомное_поле_1 && (
                        <div>
                            <div className="text-sm text-slate-600 mb-2">Предыдущая покупка</div>
                            <div className="text-slate-900">{contact.кастомное_поле_1}</div>
                        </div>
                    )}

                    {contact.кастомное_поле_2 && (
                        <div>
                            <div className="text-sm text-slate-600 mb-2">Сумма заказа</div>
                            <div className="text-slate-900">{contact.кастомное_поле_2}</div>
                        </div>
                    )}

                    {/* Reason */}
                    {contact.причина_отказа && (
                        <div>
                            <div className="text-sm text-slate-600 mb-2">Причина отказа</div>
                            <Badge variant="outline">{contact.причина_отказа.replace(/_/g, ' ')}</Badge>
                        </div>
                    )}

                    {/* Comment */}
                    <div>
                        <div className="text-sm text-slate-600 mb-2">Комментарий</div>
                        <Textarea
                            value={contact.комментарий || ''}
                            onChange={(e) => updateMutation.mutate({ id: contact.id, data: { комментарий: e.target.value } })}
                            placeholder="Добавьте комментарий..."
                            className="min-h-24"
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                        <div>
                            <div className="text-sm text-slate-600">Попыток дозвона</div>
                            <div className="text-xl font-semibold text-slate-900">{contact.попыток_дозвона}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-600">Длительность</div>
                            <div className="text-xl font-semibold text-slate-900">
                                {contact.длительность_разговора ? `${Math.floor(contact.длительность_разговора / 60)} мин` : '—'}
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">История звонков</h3>
                        {history.length === 0 ? (
                            <p className="text-slate-600 text-center py-8">Нет истории звонков</p>
                        ) : (
                            <div className="space-y-3">
                                {history.map(call => (
                                    <div key={call.id} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <Badge className={statusConfig[call.результат]?.color || 'bg-slate-100 text-slate-700'}>
                                                    {call.результат}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {new Date(call.дата_время).toLocaleString('ru-RU')}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-slate-600">
                                                Длительность: {Math.floor(call.длительность / 60)} мин
                                            </div>
                                            {call.запись_url && (
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Play className="w-3 h-3" />
                                                    Прослушать
                                                </Button>
                                            )}
                                        </div>
                                        {call.транскрипция && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => setExpandedHistory({
                                                        ...expandedHistory,
                                                        [call.id]: !expandedHistory[call.id]
                                                    })}
                                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                                                >
                                                    {expandedHistory[call.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    Транскрипция
                                                </button>
                                                {expandedHistory[call.id] && (
                                                    <div className="mt-2 p-3 bg-slate-50 rounded text-sm text-slate-700 whitespace-pre-line">
                                                        {call.транскрипция}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1 gap-2">
                            <Phone className="w-4 h-4" />
                            Позвонить сейчас
                        </Button>
                        <Button variant="outline" className="flex-1">
                            Открыть в CRM
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}