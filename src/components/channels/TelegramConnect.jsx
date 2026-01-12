import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TelegramConnect({ agentId, onSuccess }) {
    const [botToken, setBotToken] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const handleConnect = async () => {
        if (!botToken.trim()) {
            setError('Введите токен бота');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // Проверяем токен через Telegram API
            const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
            const data = await response.json();

            if (!data.ok) {
                throw new Error('Неверный токен бота');
            }

            const botInfo = data.result;

            // Генерируем уникальный webhook URL
            const webhookSecret = Math.random().toString(36).substring(7);
            const webhookUrl = `${Deno.env.get('RAILWAY_API_URL') || 'https://neuro-seller-production.up.railway.app'}/api/v1/channels/telegram/webhook/${agentId}`;

            // Устанавливаем webhook в Telegram
            const setWebhookResponse = await fetch(
                `https://api.telegram.org/bot${botToken}/setWebhook`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: webhookUrl,
                        secret_token: webhookSecret,
                        allowed_updates: ['message', 'callback_query']
                    })
                }
            );

            const webhookData = await setWebhookResponse.json();

            if (!webhookData.ok) {
                throw new Error('Не удалось установить webhook');
            }

            // Сохраняем канал в БД
            await base44.entities.Channel.create({
                agent_id: agentId,
                type: 'telegram',
                credentials: {
                    bot_token: botToken
                },
                status: 'active',
                webhook_url: webhookUrl,
                webhook_secret: webhookSecret,
                metadata: {
                    bot_username: botInfo.username,
                    bot_name: botInfo.first_name,
                    bot_id: botInfo.id
                }
            });

            toast.success(`Telegram бот @${botInfo.username} подключен!`);
            onSuccess?.();
        } catch (err) {
            setError(err.message);
            toast.error('Ошибка подключения: ' + err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Подключить Telegram бота</h3>
                <p className="text-sm text-slate-500 mb-4">
                    1. Создайте бота через <a href="https://t.me/BotFather" target="_blank" className="text-blue-600 hover:underline">@BotFather</a><br/>
                    2. Скопируйте полученный токен<br/>
                    3. Вставьте токен ниже
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bot_token">Токен бота</Label>
                <Input
                    id="bot_token"
                    type="text"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
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
                disabled={isConnecting || !botToken.trim()}
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