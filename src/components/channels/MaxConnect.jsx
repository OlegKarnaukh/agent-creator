import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function MaxConnect({ agentId, onSuccess }) {
    const [selectedAgentId, setSelectedAgentId] = useState(agentId || '');
    const [botToken, setBotToken] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);

    const { data: agents = [] } = useQuery({
        queryKey: ['active-agents'],
        queryFn: () => base44.entities.Agent.filter({ status: 'active' }),
    });

    const handleConnect = async () => {
        if (!selectedAgentId) {
            setError('Выберите агента');
            return;
        }

        if (!botToken.trim()) {
            setError('Введите токен бота');
            return;
        }

        setShowVerificationDialog(true);
    };

    const handleConnectConfirm = async () => {
        setIsConnecting(true);
        setError(null);
        setShowVerificationDialog(false);

        try {
            const selectedAgent = agents.find(a => a.id === selectedAgentId);
            if (!selectedAgent?.external_agent_id) {
                throw new Error('У агента отсутствует external_agent_id');
            }

            // Отправляем запрос на Railway API
            const response = await fetch(
                'https://neuro-seller-production.up.railway.app/api/v1/channels/connect',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agent_id: selectedAgent.external_agent_id,
                        channel_type: 'max',
                        credentials: {
                            bot_token: botToken
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка подключения');
            }

            const result = await response.json();

            // Сохраняем канал в БД Base44
            await base44.entities.Channel.create({
                agent_id: selectedAgentId,
                type: 'max',
                credentials: {
                    bot_token: botToken
                },
                status: 'active',
                webhook_url: result.webhook_url,
                metadata: {
                    railway_channel_id: result.id,
                    connection_status: result.status
                }
            });

            toast.success('Max бот подключён!');
            onSuccess?.();
        } catch (err) {
            setError(err.message);
            toast.error('Ошибка: ' + err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Подключить Max бота</h3>
                <p className="text-sm text-slate-500 mb-4">
                    1. Получите токен бота на <a href="https://business.max.ru" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">business.max.ru</a><br/>
                    2. Скопируйте полученный токен<br/>
                    3. Выберите агента и вставьте токен ниже
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="agent_select">Агент</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите агента" />
                    </SelectTrigger>
                    <SelectContent>
                        {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bot_token">Токен бота</Label>
                <Input
                    id="bot_token"
                    type="text"
                    placeholder="Введите токен Max бота"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    disabled={isConnecting}
                />
                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            <Button
                onClick={handleConnect}
                disabled={isConnecting || !botToken.trim() || !selectedAgentId}
                className="w-full"
            >
                {isConnecting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Подключаем...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Подключить бота
                    </>
                )}
            </Button>
        </div>
    );
}