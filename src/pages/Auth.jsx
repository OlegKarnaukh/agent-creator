import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Auth() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await base44.auth.signIn(email, password);
            
            // Синхронизируем пользователя с Railway
            try {
                await base44.functions.invoke('syncUserWithRailway');
            } catch (syncError) {
                console.error('Railway sync error:', syncError);
                toast.error('Ошибка синхронизации');
            }
            
            const user = await base44.auth.me();
            
            // Проверяем есть ли агенты
            const agents = await base44.entities.Agent.list();
            
            if (agents.length > 0) {
                navigate(createPageUrl('Dashboard'));
            } else {
                navigate(createPageUrl('AgentBuilder'));
            }
        } catch (err) {
            setError(err.message || 'Ошибка входа. Проверьте email и пароль');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Используем встроенную регистрацию Base44
            await base44.auth.redirectToSignUp(createPageUrl('AgentBuilder'));
        } catch (err) {
            setError(err.message || 'Ошибка регистрации');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                    {/* Logo */}
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69611ae203d0641b357eee81/174650a65_1edad0dedf741d1934ae71f5efc20db7_6a91ba24-a241-4a36-97cf-8bd7fd02304011.jpg" alt="NeuroSeller" className="w-16 h-16 mx-auto mb-6" />

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
                        {isSignUp ? 'Создайте аккаунт' : 'Добро пожаловать'}
                    </h1>
                    <p className="text-slate-600 text-center mb-8">
                        {isSignUp ? 'Начните работать с NeuroSeller' : 'Войдите, чтобы продолжить'}
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">
                                    Полное имя
                                </label>
                                <Input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Иван Иванов"
                                    required
                                    className="h-11"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ваш@email.com"
                                    required
                                    className="pl-10 h-11"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Пароль
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="pl-10 h-11"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 mt-6"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isSignUp ? 'Создать аккаунт' : 'Войти'}
                        </Button>
                    </form>

                    {/* Toggle Sign Up / Sign In */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-600 text-sm">
                            {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                }}
                                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                            >
                                {isSignUp ? 'Войти' : 'Создать'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    © 2026 NeuroSeller. Все права защищены.
                </p>
            </div>
        </div>
    );
}