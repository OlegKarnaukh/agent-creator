import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Referrals() {
    const [copied, setCopied] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const { data: user, refetch: refetchUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const userData = await base44.auth.me();
            
            // Если нет реферального кода - генерируем
            if (!userData.referral_code) {
                const code = Math.random().toString(36).substring(2, 10).toUpperCase();
                await base44.auth.updateMe({ referral_code: code });
                return { ...userData, referral_code: code };
            }
            
            return userData;
        }
    });

    const { data: referrals = [] } = useQuery({
        queryKey: ['referrals'],
        queryFn: async () => {
            if (!user?.id) return [];
            const users = await base44.entities.User.list();
            return users.filter(u => u.referred_by === user.id);
        },
        enabled: !!user?.id
    });

    const { data: payments = [] } = useQuery({
        queryKey: ['referralPayments'],
        queryFn: async () => {
            if (!user?.id) return [];
            return await base44.entities.ReferralPayment.filter({ referrer_id: user.id });
        },
        enabled: !!user?.id
    });

    const referralUrl = user?.referral_code 
        ? `${window.location.origin}?ref=${user.referral_code}`
        : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        toast.success('Ссылка скопирована!');
        setTimeout(() => setCopied(false), 2000);
    };

    const totalEarnings = payments.reduce((sum, p) => sum + (p.commission_amount || 0), 0);
    const activeReferrals = referrals.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Партнерская программа</h1>
                    <p className="text-slate-600">Приглашайте друзей и получайте 20% от их оплат</p>
                </motion.div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Заработано
                                </CardTitle>
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {totalEarnings.toLocaleString('ru-RU')} ₽
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Приглашено пользователей
                                </CardTitle>
                                <Users className="w-5 h-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {activeReferrals}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Ваша комиссия
                                </CardTitle>
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">20%</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Referral Link */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Ваша реферальная ссылка</CardTitle>
                            <CardDescription>
                                Поделитесь этой ссылкой с друзьями. Вы получите 20% от всех их платежей
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <Input
                                    value={referralUrl}
                                    readOnly
                                    className="flex-1 font-mono text-sm"
                                />
                                <Button onClick={copyToClipboard} className="gap-2">
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Скопировано
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Копировать
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Referrals List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Приглашенные пользователи ({activeReferrals})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {referrals.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">
                                        Вы еще никого не пригласили. Поделитесь ссылкой!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {referrals.map((referral) => {
                                        const userPayments = payments.filter(
                                            p => p.referred_user_id === referral.id
                                        );
                                        const userEarnings = userPayments.reduce(
                                            (sum, p) => sum + (p.commission_amount || 0), 
                                            0
                                        );

                                        return (
                                            <div
                                                key={referral.id}
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                                                        {referral.email?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {referral.full_name || 'Пользователь'}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {referral.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-emerald-600">
                                                        +{userEarnings.toLocaleString('ru-RU')} ₽
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Ваш доход
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}