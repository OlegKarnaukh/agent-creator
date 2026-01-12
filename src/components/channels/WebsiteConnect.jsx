import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Globe, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function WebsiteConnect({ agentId, onSuccess }) {
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [widgetColor, setWidgetColor] = useState('#0ea5e9');
    const [widgetPosition, setWidgetPosition] = useState('bottom-right');
    const [greeting, setGreeting] = useState('Здравствуйте! Чем могу помочь?');
    const [connecting, setConnecting] = useState(false);
    const [widgetCode, setWidgetCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleConnect = async () => {
        if (!websiteUrl) {
            toast.error('Укажите URL сайта');
            return;
        }

        setConnecting(true);
        try {
            const webhookSecret = Math.random().toString(36).substring(2, 15);
            const webhookUrl = `${window.location.origin}/api/functions/websiteWebhook?agent_id=${agentId}&secret=${webhookSecret}`;
            
            const widgetId = `widget_${Math.random().toString(36).substring(2, 10)}`;

            const credentials = {
                website_url: websiteUrl,
                widget_id: widgetId,
                widget_color: widgetColor,
                widget_position: widgetPosition,
                greeting_message: greeting
            };

            await base44.entities.Channel.create({
                agent_id: agentId,
                type: 'website',
                credentials,
                status: 'active',
                webhook_url: webhookUrl,
                webhook_secret: webhookSecret,
                metadata: {
                    website_url: websiteUrl,
                    widget_id: widgetId
                }
            });

            const code = `<!-- AI Agent Widget -->
<script>
  (function() {
    var widget = document.createElement('script');
    widget.src = '${window.location.origin}/widget.js';
    widget.setAttribute('data-agent-id', '${agentId}');
    widget.setAttribute('data-widget-id', '${widgetId}');
    widget.setAttribute('data-color', '${widgetColor}');
    widget.setAttribute('data-position', '${widgetPosition}');
    document.head.appendChild(widget);
  })();
</script>`;

            setWidgetCode(code);
            toast.success('Виджет успешно подключён!');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error connecting website:', error);
            toast.error('Ошибка подключения: ' + error.message);
        } finally {
            setConnecting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(widgetCode);
        setCopied(true);
        toast.success('Код скопирован!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            {!widgetCode ? (
                <>
                    <div className="space-y-2">
                        <Label>URL вашего сайта</Label>
                        <Input
                            placeholder="https://example.com"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Цвет виджета</Label>
                            <Input
                                type="color"
                                value={widgetColor}
                                onChange={(e) => setWidgetColor(e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Позиция</Label>
                            <select
                                value={widgetPosition}
                                onChange={(e) => setWidgetPosition(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                            >
                                <option value="bottom-right">Справа внизу</option>
                                <option value="bottom-left">Слева внизу</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Приветственное сообщение</Label>
                        <Textarea
                            placeholder="Здравствуйте! Чем могу помочь?"
                            value={greeting}
                            onChange={(e) => setGreeting(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <Button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="w-full bg-slate-900 hover:bg-slate-800"
                    >
                        {connecting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Создание виджета...
                            </>
                        ) : (
                            <>
                                <Globe className="w-4 h-4 mr-2" />
                                Создать виджет
                            </>
                        )}
                    </Button>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium mb-2">✓ Виджет успешно создан!</p>
                        <p className="text-sm text-green-700">Скопируйте код ниже и вставьте его перед закрывающим тегом &lt;/body&gt; на вашем сайте.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Код для вставки</Label>
                        <div className="relative">
                            <Textarea
                                value={widgetCode}
                                readOnly
                                rows={8}
                                className="font-mono text-xs bg-slate-50"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopy}
                                className="absolute top-2 right-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Скопировано
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3 mr-1" />
                                        Копировать
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}