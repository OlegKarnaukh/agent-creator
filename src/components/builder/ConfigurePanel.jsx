import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, MessageSquare, Phone, Globe, Send, User, Loader2 } from "lucide-react";

// ✅ Статические аватарки по умолчанию
const DEFAULT_AVATAR_VICTORIA = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Victoria&style=circle&backgroundColor=fef3c7&hair=longHair&hairColor=auburn&accessories=prescription02&clothingColor=3c4f5c&top=longHairStraight&accessoriesColor=262e33&facialHairColor=auburn&clothesColor=262e33&graphicType=skull&eyeType=happy&eyebrowType=default&mouthType=smile&skinColor=light';

const DEFAULT_AVATAR_ALEXANDER = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander&style=circle&backgroundColor=c0aede&hair=shortHairShortWaved&hairColor=brown&accessories=prescription01&clothingColor=black&top=shortHairShortWaved&accessoriesColor=262e33&facialHairColor=black&clothesColor=heather&graphicType=bat&eyeType=default&eyebrowType=default&mouthType=default&skinColor=light';

export default function ConfigurePanel({ agentData, onAgentUpdate }) {
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    
    const channels = [
        { id: 'telegram', name: 'Telegram', icon: Send, color: 'bg-blue-500' },
        { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
        { id: 'phone', name: 'Телефония', icon: Phone, color: 'bg-purple-500' },
        { id: 'website', name: 'Виджет на сайт', icon: Globe, color: 'bg-orange-500' },
    ];

    const handleChannelToggle = (channelId, enabled) => {
        const currentChannels = agentData.channels || [];
        let updatedChannels;
        
        if (enabled) {
            updatedChannels = [...currentChannels, { type: channelId, enabled: true, config: {} }];
        } else {
            updatedChannels = currentChannels.filter(c => c.type !== channelId);
        }
        
        onAgentUpdate({ channels: updatedChannels });
    };

    const isChannelEnabled = (channelId) => {
        return agentData.channels?.some(c => c.type === channelId && c.enabled);
    };
    
    // ✅ Обработчик загрузки аватарки
    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }
        
        // Проверка размера (макс 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Размер файла не должен превышать 2 МБ');
            return;
        }
        
        setIsUploadingAvatar(true);
        
        try {
            // Вариант 1: Загрузка через Base44 Media Library
            if (window.base44 && window.base44.media) {
                const uploadedFile = await window.base44.media.upload(file);
                onAgentUpdate({ avatar_url: uploadedFile.url });
            } 
            // Вариант 2: Преобразование в Base64 (для простоты)
            else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    onAgentUpdate({ avatar_url: reader.result });
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Ошибка загрузки аватарки:', error);
            alert('Не удалось загрузить изображение. Попробуйте ещё раз.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };
    
    // ✅ Сброс на аватарку по умолчанию
    const handleResetAvatar = () => {
        const defaultAvatar = agentData.name?.toLowerCase().includes('виктори')
            ? DEFAULT_AVATAR_VICTORIA
            : DEFAULT_AVATAR_ALEXANDER;
        onAgentUpdate({ avatar_url: defaultAvatar });
    };
    
    // ✅ Преобразование knowledge_base для отображения
    const knowledgeBaseDisplay = typeof agentData.knowledge_base === 'object'
        ? JSON.stringify(agentData.knowledge_base, null, 2)
        : agentData.knowledge_base || '';

    return (
        <div className="p-6 space-y-8 overflow-y-auto h-full">
            {/* Avatar & Name */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Профиль агента</h3>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200">
                            {agentData.avatar_url ? (
                                <img 
                                    src={agentData.avatar_url} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                            )}
                        </div>
                        
                        {/* Кнопка загрузки */}
                        <label
                            htmlFor="avatar-upload"
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 hover:bg-slate-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors"
                        >
                            {isUploadingAvatar ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 text-white" />
                            )}
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                            className="hidden"
                        />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                        <Label className="text-xs text-slate-500">Имя агента</Label>
                        <Input
                            value={agentData.name || ''}
                            onChange={(e) => onAgentUpdate({ name: e.target.value })}
                            placeholder="Виктория"
                            className="h-10"
                        />
                        {agentData.avatar_url && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetAvatar}
                                className="text-xs text-slate-500 hover:text-slate-700"
                            >
                                Сбросить на аватарку по умолчанию
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
                <Label className="text-xs text-slate-500">Описание</Label>
                <Textarea
                    key={`description-${agentData.external_agent_id || 'new'}`}
                    value={agentData.description || ''}
                    onChange={(e) => onAgentUpdate({ description: e.target.value })}
                    placeholder="Опишите, чем занимается агент..."
                    className="min-h-[80px] resize-none"
                />
            </div>

            {/* Instructions */}
            <div className="space-y-3">
                <Label className="text-xs text-slate-500">Системные инструкции</Label>
                <Textarea
                    key={`instructions-${agentData.external_agent_id || 'new'}`}
                    value={agentData.instructions || ''}
                    onChange={(e) => onAgentUpdate({ instructions: e.target.value })}
                    placeholder="Вы — профессиональный консультант компании..."
                    className="min-h-[120px] resize-none font-mono text-xs"
                />
            </div>

            {/* Channels */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Каналы связи</h3>
                
                <div className="space-y-3">
                    {channels.map((channel) => (
                        <div
                            key={channel.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${channel.color}`}>
                                    <channel.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                            </div>
                            <Switch
                                checked={isChannelEnabled(channel.id)}
                                onCheckedChange={(checked) => handleChannelToggle(channel.id, checked)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Knowledge Base */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">База знаний</h3>
                <Textarea
                    value={knowledgeBaseDisplay}
                    onChange={(e) => {
                        // ✅ Пробуем распарсить как JSON, если не получается — сохраняем как строку
                        const value = e.target.value;
                        try {
                            const parsed = JSON.parse(value);
                            onAgentUpdate({ knowledge_base: parsed });
                        } catch (error) {
                            // Если не JSON — сохраняем как строку
                            onAgentUpdate({ knowledge_base: value });
                        }
                    }}
                    placeholder="Добавьте информацию о компании, услугах, ценах..."
                    className="min-h-[150px] resize-none text-sm"
                />
                <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить файлы
                </Button>
                <p className="text-xs text-slate-400">
                    Можно вводить текст или JSON-объект (автоматически определяется)
                </p>
            </div>
        </div>
    );
}