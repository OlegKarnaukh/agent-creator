import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Auth() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: ''
    });
    const [errors, setErrors] = useState({});

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!validateEmail(formData.email)) {
            newErrors.email = 'Некорректный email';
        }
        if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть минимум 6 символов';
        }
        if (!isLogin && !formData.full_name.trim()) {
            newErrors.full_name = 'Введите имя';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await base44.auth.login({
                    email: formData.email,
                    password: formData.password
                });
                toast.success('Успешный вход!');
                navigate(createPageUrl('Dashboard'));
            } else {
                await base44.auth.register({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name
                });
                toast.success('Аккаунт создан! Перенаправление...');
                navigate(createPageUrl('AgentBuilder'));
            }
        } catch (error) {
            toast.error(error.message || 'Ошибка при авторизации');
            console.error('Auth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = () => {
        setIsLogin(!isLogin);
        setFormData({ email: '', password: '', full_name: '' });
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">NeuroSeller</h1>
                        <p className="text-slate-300 text-sm">
                            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Имя
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        placeholder="Ваше имя"
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-blue-500"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.full_name && (
                                    <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Эл. почта
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="ваш@email.com"
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Пароль
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Минимум 6 символов"
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Загрузка...
                                </>
                            ) : (
                                isLogin ? 'Войти' : 'Создать аккаунт'
                            )}
                        </Button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-300 text-sm">
                            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                            <button
                                type="button"
                                onClick={handleToggle}
                                disabled={isLoading}
                                className="text-blue-400 hover:text-blue-300 font-semibold ml-1 transition-colors"
                            >
                                {isLogin ? 'Регистрация' : 'Войти'}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}