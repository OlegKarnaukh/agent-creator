import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
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
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [isResending, setIsResending] = useState(false);

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
                const currentUser = await base44.auth.me();
                await syncUser(currentUser);
                toast.success('Успешный вход!');
                navigate(createPageUrl('Dashboard'));
            } else {
                try {
                    await base44.auth.register({
                        email: formData.email,
                        password: formData.password,
                        full_name: formData.full_name
                    });
                } catch (registerError) {
                    if (registerError.message?.includes('email') || registerError.message?.includes('verification')) {
                        setEmailConfirmationRequired(true);
                        toast.info('Проверьте почту для подтверждения');
                        setIsLoading(false);
                        return;
                    }
                    throw registerError;
                }

                await base44.auth.login({
                    email: formData.email,
                    password: formData.password
                });
                const currentUser = await base44.auth.me();
                await syncUser(currentUser);
                toast.success('Аккаунт создан!');
                navigate(createPageUrl('Dashboard'));
            }
        } catch (error) {
            toast.error(error.message || 'Ошибка при авторизации');
        } finally {
            setIsLoading(false);
        }
    };

    const syncUser = async (user) => {
        try {
            await fetch('https://neuro-seller-production.up.railway.app/api/v1/users/ensure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    full_name: user.full_name || user.email.split('@')[0],
                    base44_id: user.id
                })
            });
        } catch (error) {
            console.error('Sync error:', error);
        }
    };

    const handleToggle = () => {
        setIsLogin(!isLogin);
        setFormData({ email: '', password: '', full_name: '' });
        setErrors({});
        setEmailConfirmationRequired(false);
        setVerificationCode('');
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        console.log('Попытка верификации с кодом:', verificationCode);
        
        if (verificationCode.length !== 6) {
            toast.error('Код должен состоять из 6 цифр');
            return;
        }

        setIsVerifying(true);
        setVerificationError('');
        try {
            console.log('Вызов base44.auth.verifyEmail()...');
            await base44.auth.verifyEmail(verificationCode);
            console.log('Верификация успешна!');
            
            console.log('Попытка входа после верификации...');
            await base44.auth.login({
                email: formData.email,
                password: formData.password
            });
            const currentUser = await base44.auth.me();
            console.log('Пользователь получен:', currentUser);
            
            await syncUser(currentUser);
            
            toast.success('Email подтвержден!');
            navigate(createPageUrl('Dashboard'));
        } catch (error) {
            console.error('Ошибка при верификации:', error);
            const errorMsg = error.message || 'Неверный код подтверждения';
            setVerificationError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        console.log('Повторная отправка кода на:', formData.email);
        setIsResending(true);
        setVerificationError('');
        try {
            console.log('Вызов base44.auth.resendVerificationCode()...');
            await base44.auth.resendVerificationCode(formData.email);
            console.log('Код повторно отправлен');
            toast.success('Код повторно отправлен на почту');
            setVerificationCode('');
        } catch (error) {
            console.error('Ошибка при повторной отправке:', error);
            const errorMsg = error.message || 'Не удалось отправить код повторно';
            setVerificationError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">NeuroSeller</h1>
                        <p className="text-slate-600 text-sm">
                            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">
                                    Имя
                                </label>
                                <Input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="Ваше имя"
                                    className="bg-slate-50 border-slate-200"
                                    disabled={isLoading}
                                />
                                {errors.full_name && (
                                    <p className="text-red-600 text-xs mt-1">{errors.full_name}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Эл. почта
                            </label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="ваш@email.com"
                                className="bg-slate-50 border-slate-200"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Пароль
                            </label>
                            <Input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Минимум 6 символов"
                                className="bg-slate-50 border-slate-200"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                                    Загрузка...
                                </>
                            ) : (
                                isLogin ? 'Войти' : 'Создать аккаунт'
                            )}
                        </Button>
                    </form>

                    {emailConfirmationRequired && (
                        <form onSubmit={handleVerifyEmail} className="mt-6 space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-700 text-sm text-center font-medium">
                                    Введите код из письма
                                </p>
                            </div>
                            <Input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength="6"
                                className="bg-slate-50 border-slate-200 text-center tracking-widest text-lg font-semibold"
                                disabled={isVerifying}
                            />
                            <Button
                                type="submit"
                                disabled={isVerifying || verificationCode.length !== 6}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                                        Подтверждение...
                                    </>
                                ) : (
                                    'Подтвердить'
                                )}
                            </Button>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm block mx-auto mt-3"
                            >
                                Вернуться к входу
                            </button>
                        </form>
                    )}

                    {!emailConfirmationRequired && (
                        <div className="mt-6 text-center">
                            <p className="text-slate-600 text-sm">
                                {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                                <button
                                    type="button"
                                    onClick={handleToggle}
                                    disabled={isLoading}
                                    className="text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors"
                                >
                                    {isLogin ? 'Регистрация' : 'Войти'}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}