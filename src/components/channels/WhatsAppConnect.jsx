import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppConnect({ agentId, onSuccess }) {
    const [phoneNumberId, setPhoneNumberId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [verifyToken, setVerifyToken] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const handleConnect = async () => {
        if (!phoneNumberId.trim() || !accessToken.trim()) {
            setError('Заполните все обязательные поля');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // Генерируем verify token если не указан
            const finalVerifyToken = verifyToken.trim() || Math.random().toString(36).substring(7);
            
            const webhookUrl = `${Deno.env.get('RAILWAY_API_URL') || 'https://neuro-seller-production.up.railway.app'}/api/v1/channels/whatsapp/webhook/${agentId}`;

            // Сохраняем канал в БД
            await base44.entities.Channel.create({
                agent_id: agentId,
                type: 'whatsapp',
                credentials: {
                    phone_number_id: phoneNumberId,
                    access_token: accessToken,
                    verify_token: finalVerifyToken
                },
                status: 'pending',
                webhook_url: webhookUrl,
                metadata: {
                    verify_token: finalVerifyToken
                }
            });

            toast.success('WhatsApp канал создан! Настройте webhook в Meta Business Suite.');
            toast.info(`Webhook URL: ${webhookUrl}`);
            toast.info(`Verify Token: ${finalVerifyToken}`);
            
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
                <h3 className="text-lg font-semibold mb-2">Подключить WhatsApp Business</h3>
                <p className="text-sm text-slate-500 mb-4">
                    1. Создайте приложение в <a href="https://developers.facebook.com/" target="_blank" className="text-blue-600 hover:underline">Meta for Developers</a><br/>
                    2. Добавьте WhatsApp Business API<br/>
                    3. Получите Phone Number ID и Access Token<br/>
                    4. Настройте webhook URL (будет показан после подключения)
                </p>
            </div>

            <div className="space-y-3">
                <div>
                    <Label htmlFor="phone_number_id">Phone Number ID *</Label>
                    <Input
                        id="phone_number_id"
                        type="text"
                        placeholder="123456789012345"
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                        disabled={isConnecting}
                    />
                </div>

                <div>
                    <Label htmlFor="access_token">Access Token *</Label>
                    <Input
                        id="access_token"
                        type="password"
                        placeholder="EAAxxxxxxxxxx..."
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        disabled={isConnecting}
                    />
                </div>

                <div>
                    <Label htmlFor="verify_token">Verify Token (опционально)</Label>
                    <Input
                        id="verify_token"
                        type="text"
                        placeholder="Будет сгенерирован автоматически"
                        value={verifyToken}
                        onChange={(e) => setVerifyToken(e.target.value)}
                        disabled={isConnecting}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Используется для верификации webhook в Meta Business Suite
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            <Button
                onClick={handleConnect}
                disabled={isConnecting || !phoneNumberId.trim() || !accessToken.trim()}
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
                        Подключить WhatsApp
                    </>
                )}
            </Button>
        </div>
    );
}