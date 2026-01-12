import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CreditCard, TrendingUp, Calendar, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

const planFeatures = {
    free: {
        name: 'Free',
        tokens: 100000,
        price: '0₽',
        features: ['100K токенов/месяц', '1 агент', 'Базовая поддержка']
    },
    starter: {
        name: 'Starter',
        tokens: 500000,
        price: '2 990₽',
        features: ['500K токенов/месяц', '3 агента', 'Email поддержка']
    },
    pro: {
        name: 'Pro',
        tokens: 2000000,
        price: '9 990₽',
        features: ['2M токенов/месяц', '10 агентов', 'Приоритетная поддержка']
    },
    enterprise: {
        name: 'Enterprise',
        tokens: 10000000,
        price: 'По запросу',
        features: ['10M+ токенов/месяц', 'Безлимит агентов', 'Персональный менеджер']
    }
};

export default function Billing() {
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me(),
    });

    const { data: billingRecords = [] } = useQuery({
        queryKey: ['billing', user?.id],
        queryFn: () => base44.entities.Billing.filter({ user_id: user.id }),
        enabled: !!user,
    });

    const currentBilling = useMemo(() => {
        if (!billingRecords.length) {
            return {
                plan: 'free',
                tokens_used: 0,
                tokens_limit: 100000,
                period_start: startOfMonth(new Date()).toISOString(),
                period_end: endOfMonth(new Date()).toISOString()
            };
        }
        return billingRecords[0];
    }, [billingRecords]);

    const usagePercent = (currentBilling.tokens_used / currentBilling.tokens_limit) * 100;
    const planInfo = planFeatures[currentBilling.plan];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Биллинг и тарифы</h1>
                    <p className="text-slate-500 mt-2">Управление подпиской и расходом токенов</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Текущий тариф
                                </CardTitle>
                                <CreditCard className="w-4 h-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{planInfo.name}</div>
                                <p className="text-sm text-slate-500 mt-1">{planInfo.price}/месяц</p>
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
                                    Использовано токенов
                                </CardTitle>
                                <Zap className="w-4 h-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {currentBilling.tokens_used.toLocaleString()}
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                    из {currentBilling.tokens_limit.toLocaleString()}
                                </p>
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
                                    Расчётный период
                                </CardTitle>
                                <Calendar className="w-4 h-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium text-slate-900">
                                    {format(new Date(currentBilling.period_start), 'd MMM', { locale: ru })} - {' '}
                                    {format(new Date(currentBilling.period_end), 'd MMM', { locale: ru })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Использование токенов</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">
                                            {usagePercent.toFixed(1)}% использовано
                                        </span>
                                        <span className="text-sm text-slate-500">
                                            {(currentBilling.tokens_limit - currentBilling.tokens_used).toLocaleString()} осталось
                                        </span>
                                    </div>
                                    <Progress value={usagePercent} className="h-3" />
                                </div>
                                
                                {usagePercent > 80 && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-800">
                                            ⚠️ Вы использовали более 80% лимита токенов. Рекомендуем обновить тариф.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(planFeatures).map(([key, plan], idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                        >
                            <Card className={`${currentBilling.plan === key ? 'ring-2 ring-slate-900' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    <div className="text-2xl font-bold text-slate-900 mt-2">
                                        {plan.price}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start">
                                                <span className="mr-2">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    {currentBilling.plan === key && (
                                        <div className="mt-4 px-3 py-2 bg-slate-900 text-white text-center rounded-lg text-sm font-medium">
                                            Текущий тариф
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}