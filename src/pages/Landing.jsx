import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Zap, MessageSquare, TrendingUp, Clock, CheckCircle2, Send, Globe, Home, Users, Phone, AlertCircle, Settings, Plug, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    viewport: { once: true }
};

export default function Landing() {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleStartClick = async () => {
        try {
            const isAuthenticated = await base44.auth.isAuthenticated();
            if (isAuthenticated) {
                navigate(createPageUrl('Dashboard'));
            } else {
                navigate(createPageUrl('Auth') + '?mode=signup');
            }
        } catch (error) {
            navigate(createPageUrl('Auth') + '?mode=signup');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* HEADER */}
            <header className={`fixed top-0 w-full z-50 transition-all ${isScrolled ? 'bg-white border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69611ae203d0641b357eee81/174650a65_1edad0dedf741d1934ae71f5efc20db7_6a91ba24-a241-4a36-97cf-8bd7fd02304011.jpg" alt="NeuroSeller" className="h-8" />
                    <button onClick={handleStartClick} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-sm shadow-lg hover:shadow-xl">
                        Запустить бесплатно
                    </button>
                </div>
            </header>

            {/* HERO */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-slate-50 to-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10" />
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight"
                    >
                        Нейропродавец, который работает <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">24/7</span> – отвечает мгновенно и доводит до оплаты
                    </motion.h2>
                    <motion.p 
                        {...fadeInUp}
                        className="text-lg text-slate-600 mb-8 leading-relaxed"
                    >
                        Закрывает возражения, досконально знает продукт и не просит зарплату. Бесплатно навсегда для малого бизнеса.
                    </motion.p>
                    <motion.button 
                        {...fadeInUp}
                        onClick={handleStartClick}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg mb-12 shadow-lg hover:shadow-2xl hover:scale-105 transform"
                    >
                        Запустить бесплатно за 2 минуты
                    </motion.button>

                    {/* Stats Cards */}
                    <motion.div 
                        {...fadeInUp}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        {[
                            { label: 'Ответ клиенту', value: '3 сек' },
                            { label: 'Работает', value: '24/7' },
                            { label: 'Диалогов бесплатно', value: '300' },
                            { label: 'До запуска', value: '2 мин' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
                                <p className="text-slate-600 text-xs sm:text-sm mb-2">{stat.label}</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* PROBLEMS */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12"
                    >
                        Почему вашему бизнесу нужен <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">нейропродавец?</span>
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: 'Медленный ответ = потерянная заявка',
                                desc: 'Даже лучший менеджер не может ответить мгновенно. Пока он отвлёкся на минуту, клиент уже написал трём конкурентам',
                                metric: '80% уходят через 5 минут',
                                color: 'text-red-500'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Стоимость менеджера = 50-80К₽ в месяц',
                                desc: 'Зарплата, налоги, обучение, больничные. А нейропродавец обрабатывает в 100 раз больше заявок за 0-3К₽',
                                metric: 'Экономия до 90%',
                                color: 'text-green-500'
                            },
                            {
                                icon: Users,
                                title: 'Текучка кадров и человеческий фактор',
                                desc: 'Обучили менеджера 3 месяца — он ушёл. Плохое настроение, забыл скрипт, устал — клиент потерян',
                                metric: 'Обучение 2-4 месяца',
                                color: 'text-red-500'
                            }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div 
                                    key={i}
                                    {...fadeInUp}
                                    className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{item.desc}</p>
                                    <Badge className={item.color === 'text-red-500' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                                        {item.metric}
                                    </Badge>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* SOLUTION */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12"
                    >
                        Нейропродавец — ваш <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">идеальный сотрудник</span>
                    </motion.h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            'Отвечает за 3 секунды — Мгновенная реакция на каждую заявку',
                            'Прекрасно знает продукт — Изучает ваш сайт, прайс и документы за минуты',
                            'Владеет лучшими техниками продаж — Изучил все книги и мастер-классы по продажам',
                            'Всегда помнит скрипт — Никогда не забывает и не отклоняется от плана',
                            'Не болеет и не уходит в отпуск — Работает 365 дней в году',
                            'Не просит зарплату — Стоимость в 10 раз ниже менеджера'
                        ].map((feature, i) => {
                            const [title, desc] = feature.split(' — ');
                            return (
                                <motion.div 
                                    key={i}
                                    {...fadeInUp}
                                    className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-4 hover:shadow-md transition-shadow"
                                >
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                                        <p className="text-sm text-slate-600">{desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* COMPARISON TABLE */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12"
                    >
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Нейропродавец</span> vs Менеджер
                    </motion.h2>

                    <motion.div 
                        {...fadeInUp}
                        className="overflow-x-auto"
                    >
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-4 px-4 font-semibold text-slate-900">Параметр</th>
                                    <th className="text-center py-4 px-4 font-semibold text-slate-900">Нейропродавец</th>
                                    <th className="text-center py-4 px-4 font-semibold text-slate-900">Менеджер</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Скорость ответа', '3 секунды', '5-30 минут'],
                                    ['Стоимость', 'От 0₽/мес', 'От 50 000₽/мес'],
                                    ['Время работы', '24/7/365', '8 часов/день'],
                                    ['Обучение', '5 минут', '2-4 месяца'],
                                    ['Больничные/отпуск', 'Не болеет', '20-30 дней/год'],
                                    ['Человеческий фактор', 'Всегда по скрипту', 'Настроение, усталость'],
                                    ['Масштабируемость', 'Безграничная', 'Найм и обучение']
                                ].map((row, i) => (
                                    <tr key={i} className={`border-b border-slate-100 ${i % 2 ? 'bg-slate-50' : ''}`}>
                                        <td className="py-4 px-4 font-medium text-slate-900">{row[0]}</td>
                                        <td className="py-4 px-4 text-center text-emerald-600 font-medium">✓ {row[1]}</td>
                                        <td className="py-4 px-4 text-center text-red-600 font-medium">✗ {row[2]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4"
                    >
                        Запуск за <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">2 минуты</span>. Без программистов.
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        {[
                            { icon: Settings, title: 'Настройте поведение', desc: 'Опишите, что продаёте и как общаться с клиентами' },
                            { icon: Plug, title: 'Подключите каналы', desc: 'Telegram, WhatsApp, Авито, виджет на сайт' },
                            { icon: BookOpen, title: 'Загрузите базу знаний', desc: 'Прикрепите прайс, FAQ, каталог' }
                        ].map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div 
                                    key={i}
                                    {...fadeInUp}
                                    className="bg-white rounded-2xl border border-slate-100 p-8 text-center hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-slate-600 text-sm">{step.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div 
                        {...fadeInUp}
                        className="text-center mt-12"
                    >
                        <button onClick={handleStartClick} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform">
                            Попробовать бесплатно
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* CASES */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12"
                    >
                        Уже работает в <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">200+ компаниях</span>
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                metric: '+87%',
                                company: 'Сеть танцевальных студий Your Way',
                                result: 'Прибыль с 2,3 млн до 4,3 млн₽/мес'
                            },
                            {
                                metric: '46,6%',
                                company: 'Автопрокат в Казахстане',
                                result: 'Конверсия с 10% до 46,6%'
                            },
                            {
                                metric: '+100%',
                                company: 'Производство косметики',
                                result: 'Продажи с 420K до 840K₽/мес'
                            }
                        ].map((caseItem, i) => (
                            <motion.div 
                                key={i}
                                {...fadeInUp}
                                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-100 p-8 hover:shadow-lg transition-shadow"
                            >
                                <div className="text-4xl font-bold text-slate-900 mb-4">{caseItem.metric}</div>
                                <h3 className="font-semibold text-slate-900 mb-3">{caseItem.company}</h3>
                                <p className="text-slate-600 text-sm mb-6">{caseItem.result}</p>
                                <a href="#" className="text-slate-900 font-medium text-sm hover:text-slate-600">Читать кейс →</a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTEGRATIONS */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
                    >
                        Работает там, где ваши <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">клиенты</span>
                    </motion.h2>
                    <motion.p 
                        {...fadeInUp}
                        className="text-slate-600 mb-12 text-lg"
                    >
                        Один нейропродавец → все каналы связи
                    </motion.p>

                    <motion.div 
                        {...fadeInUp}
                        className="grid grid-cols-3 md:grid-cols-5 gap-6"
                    >
                        {[
                            { icon: Send, label: 'Telegram', color: 'bg-blue-500' },
                            { icon: MessageSquare, label: 'WhatsApp', color: 'bg-green-500' },
                            { icon: Home, label: 'Авито', color: 'bg-red-500' },
                            { icon: Globe, label: 'Виджет', color: 'bg-purple-500' },
                            { icon: Phone, label: 'Instagram', color: 'bg-pink-500' },
                            { icon: Users, label: 'ВКонтакте', color: 'bg-blue-600' },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col items-center gap-3 hover:shadow-lg hover:border-slate-200 transition-all">
                                    <div className={`${item.color} rounded-lg p-3 text-white`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* PRICING */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12"
                    >
                        Бесплатно <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">навсегда</span> для малого бизнеса
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8 items-end">
                        {[
                            {
                                name: 'FREE',
                                price: '0₽',
                                period: 'навсегда',
                                features: ['До 300 диалогов', '1 сотрудник', '1 канал', 'Базовая аналитика'],
                                button: 'Запустить бесплатно',
                                featured: true
                            },
                            {
                                name: 'Starter',
                                price: '2 990₽',
                                period: '/месяц',
                                features: ['5000 диалогов', '5 сотрудников', '5 каналов', 'Расширенная аналитика'],
                                button: 'Попробовать бесплатно',
                                featured: false
                            },
                            {
                                name: 'Pro',
                                price: '9 990₽',
                                period: '/месяц',
                                features: ['Все диалоги', '50 сотрудников', 'Все каналы + IP-телефония', 'Расширенная аналитика', 'CRM интеграция', 'Дожимающие серии', 'Приоритетная поддержка'],
                                button: 'Попробовать бесплатно',
                                featured: false
                            }
                        ].map((plan, i) => (
                            <motion.div 
                                key={i}
                                {...fadeInUp}
                                className={`rounded-2xl border p-8 transition-all ${
                                    plan.featured 
                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl ring-2 ring-green-500' 
                                        : 'border-slate-100 bg-white hover:shadow-lg'
                                }`}
                            >
                                {plan.featured && (
                                    <div className="mb-4 inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        Бесплатно навсегда
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-1 text-slate-900">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-sm text-slate-600">{plan.period}</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex gap-3">
                                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.featured ? 'text-green-600' : 'text-emerald-600'}`} />
                                            <span className="text-sm text-slate-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={handleStartClick}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                                    plan.featured 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg' 
                                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                }`}>
                                    {plan.button}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-3xl mx-auto">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12"
                    >
                        Часто задаваемые <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">вопросы</span>
                    </motion.h2>

                    <motion.div 
                        {...fadeInUp}
                    >
                        <Accordion type="single" collapsible className="space-y-4">
                            {[
                                {
                                    q: 'Нужны ли технические навыки для запуска?',
                                    a: 'Нет! Интерфейс максимально простой. Настроите нейропродавца за 2 минуты без программистов.'
                                },
                                {
                                    q: 'Как работает бесплатный тариф?',
                                    a: 'Бесплатный тариф включает до 300 диалогов в месяц, подключение 1 канала, базовую аналитику и круглосуточную поддержку. Никаких скрытых платежей — просто регистрируетесь и начинаете работать. Карта не требуется.'
                                },
                                {
                                    q: 'Можно ли обучить нейропродавца под мой бизнес?',
                                    a: 'Да! Загружаете базу знаний (прайс, описание услуг, FAQ), прописываете инструкции — и нейропродавец изучит всё за минуты. Можете в любой момент дообучать и корректировать его поведение через простой интерфейс.'
                                },
                                {
                                    q: 'Что будет, если превышу лимит в 300 диалогов?',
                                    a: 'Нейропродавец продолжит работать, но мы предложим перейти на платный тариф. Если не перейдёте сразу — ничего страшного, просто в следующем месяце лимит обновится. Никаких блокировок или штрафов.'
                                },
                                {
                                    q: 'Можно ли интегрировать с моей CRM?',
                                    a: 'Да! На тарифе PRO доступна интеграция с популярными CRM (AmoCRM, Битрикс24 и другие). Все диалоги автоматически логируются, а тёплые лиды передаются вашим менеджерам для закрытия сделки.'
                                },
                                {
                                    q: 'Нейропродавец заменит моих менеджеров?',
                                    a: 'Нейропродавец берёт на себя рутину: первичную обработку, квалификацию, ответы на типовые вопросы и простые продажи. Сложные сделки может передавать живым менеджерам. Это как помощник, который работает 24/7 и освобождает время для важных задач.'
                                }
                            ].map((faq, i) => (
                                <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-slate-100 rounded-xl px-6 py-4">
                                    <AccordionTrigger className="hover:no-underline py-0 font-semibold text-slate-900">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-slate-600 mt-4">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
                <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                    >
                        Запустите первого нейропродавца за <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">2 минуты</span>
                    </motion.h2>
                    <motion.p 
                        {...fadeInUp}
                        className="text-xl text-slate-300 mb-8"
                    >
                        Начните обрабатывать лиды мгновенно и увеличьте конверсию уже сегодня
                    </motion.p>
                    <motion.button 
                        {...fadeInUp}
                        onClick={handleStartClick}
                        className="px-8 py-4 bg-white text-slate-900 rounded-lg hover:bg-slate-50 transition-all font-semibold text-lg mb-6 shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                        Начать бесплатно
                    </motion.button>
                    <motion.p 
                        {...fadeInUp}
                        className="text-slate-400 text-sm"
                    >
                        Без привязки карты • Без программистов • Без обязательств
                    </motion.p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto text-center text-slate-600 text-sm">
                    © 2026 NEUROSELLER. Все права защищены.
                </div>
            </footer>
        </div>
    );
}