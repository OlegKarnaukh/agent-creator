import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    LayoutDashboard, 
    MessageSquare, 
    Bot, 
    Zap, 
    CreditCard,
    BarChart3,
    Lightbulb
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const navigation = [
    { name: 'Статистика', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Агенты', page: 'Agents', icon: Bot },
    { name: 'Диалоги', page: 'Conversations', icon: MessageSquare },
    { name: 'Каналы', page: 'Channels', icon: Zap },
    { name: 'Биллинг', page: 'Billing', icon: CreditCard },
    { name: 'Аналитика', page: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ user }) {
    const location = useLocation();
    const currentPath = location.pathname;
    const [ideaDialogOpen, setIdeaDialogOpen] = useState(false);
    const [ideaText, setIdeaText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const isActive = (page) => {
        return currentPath === createPageUrl(page) || currentPath === `/${page}`;
    };

    const handleSendIdea = async () => {
        if (!ideaText.trim()) {
            toast.error('Пожалуйста, введите вашу идею');
            return;
        }

        setIsSending(true);
        try {
            await base44.integrations.Core.SendEmail({
                to: 'ideas@neuroseller.com',
                subject: `Новая идея от ${user?.email || 'пользователя'}`,
                body: `Пользователь: ${user?.full_name || 'Аноним'} (${user?.email || 'нет email'})\n\nИдея:\n${ideaText}`
            });
            toast.success('Спасибо за вашу идею!');
            setIdeaText('');
            setIdeaDialogOpen(false);
        } catch (error) {
            toast.error('Ошибка отправки. Попробуйте позже.');
        } finally {
            setIsSending(false);
        }
    };

    const filteredNavigation = navigation;

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-hidden">
            <div className="p-6 border-b border-slate-200 shrink-0">
                <h1 className="text-xl font-bold text-slate-900">NeuroSeller</h1>
                <p className="text-xs text-slate-500 mt-1">AI Агенты для бизнеса</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {filteredNavigation.map((item) => {
                    const active = isActive(item.page);
                    return (
                        <Link
                            key={item.name}
                            to={createPageUrl(item.page)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                active
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="shrink-0 border-t border-slate-200">
                <button
                    onClick={() => setIdeaDialogOpen(true)}
                    className="w-full p-4 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left"
                >
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium text-slate-700">Предложить идею</span>
                </button>

                {user && (
                    <Link to={createPageUrl('Settings')} className="p-4 bg-slate-50 hover:bg-slate-100 transition-colors block">
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold shrink-0">
                                {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {user.full_name || 'Пользователь'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            <Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Предложить идею</DialogTitle>
                        <DialogDescription>
                            Расскажите нам, как мы можем улучшить платформу
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Опишите вашу идею..."
                            value={ideaText}
                            onChange={(e) => setIdeaText(e.target.value)}
                            className="min-h-32"
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIdeaDialogOpen(false)}
                                disabled={isSending}
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSendIdea}
                                disabled={isSending}
                            >
                                {isSending ? 'Отправка...' : 'Отправить'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}