import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function PhoneConnect({ agentId, onSuccess }) {
    const [provider, setProvider] = useState('twilio');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [accountSid, setAccountSid] = useState('');
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        if (!phoneNumber || !apiKey) {
            toast.error('Заполните все обязательные поля');
            return;
        }

        setConnecting(true);
        try {
            const webhookSecret = Math.random().toString(36).substring(2, 15);
            const webhookUrl = `${window.location.origin}/api/functions/phoneWebhook?agent_id=${agentId}&secret=${webhookSecret}`;

            const credentials = {
                provider,
                phone_number: phoneNumber,
                api_key: apiKey,
                ...(provider === 'twilio' && { 
                    api_secret: apiSecret,
                    account_sid: accountSid 
                })
            };

            await base44.entities.Channel.create({
                agent_id: agentId,
                type: 'phone',
                credentials,
                status: 'active',
                webhook_url: webhookUrl,
                webhook_secret: webhookSecret,
                metadata: {
                    provider,
                    phone_number: phoneNumber
                }
            });

            toast.success('Телефония успешно подключена!');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error connecting phone:', error);
            toast.error('Ошибка подключения: ' + error.message);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Провайдер телефонии</Label>
                <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="asterisk">Asterisk</SelectItem>
                        <SelectItem value="custom">Другой провайдер</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Номер телефона</Label>
                <Input
                    placeholder="+7 (900) 123-45-67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
            </div>

            {provider === 'twilio' && (
                <>
                    <div className="space-y-2">
                        <Label>Account SID</Label>
                        <Input
                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            value={accountSid}
                            onChange={(e) => setAccountSid(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Auth Token</Label>
                        <Input
                            type="password"
                            placeholder="your_auth_token"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                        />
                    </div>
                </>
            )}

            <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                    type="password"
                    placeholder="Ваш API ключ"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                <p className="font-medium mb-2">Инструкция:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Получите API ключи у вашего провайдера</li>
                    <li>Настройте webhook в панели провайдера</li>
                    <li>Укажите данные выше и нажмите "Подключить"</li>
                </ol>
            </div>

            <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-slate-900 hover:bg-slate-800"
            >
                {connecting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Подключение...
                    </>
                ) : (
                    <>
                        <Phone className="w-4 h-4 mr-2" />
                        Подключить телефонию
                    </>
                )}
            </Button>
        </div>
    );
}