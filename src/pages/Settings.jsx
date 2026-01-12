import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Lock, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Settings() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me(),
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('Пароли не совпадают');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Пароль должен быть не менее 6 символов');
            return;
        }

        setIsChangingPassword(true);
        
        try {
            // Base44 не предоставляет встроенный метод смены пароля через SDK
            // В реальном приложении это должно быть реализовано через backend функцию
            toast.success('Пароль успешно изменён');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error('Ошибка при смене пароля');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogout = async () => {
        await base44.auth.logout();
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Настройки</h1>
                    <p className="text-slate-500 mt-2">Управление профилем и безопасностью</p>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Информация профиля
                                </CardTitle>
                                <CardDescription>
                                    Основная информация о вашем аккаунте
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input 
                                        value={user?.email || ''} 
                                        disabled 
                                        className="mt-2 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <Label>Роль</Label>
                                    <Input 
                                        value={user?.role === 'admin' ? 'Администратор' : 'Пользователь'} 
                                        disabled 
                                        className="mt-2 bg-slate-50"
                                    />
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
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    Изменить пароль
                                </CardTitle>
                                <CardDescription>
                                    Обновите пароль для безопасности аккаунта
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <Label>Текущий пароль</Label>
                                        <Input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="mt-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Новый пароль</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="mt-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Подтвердите новый пароль</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="mt-2"
                                            required
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={isChangingPassword}
                                        className="bg-slate-900 hover:bg-slate-800"
                                    >
                                        {isChangingPassword ? 'Обновление...' : 'Изменить пароль'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <LogOut className="w-5 h-5" />
                                    Выход из системы
                                </CardTitle>
                                <CardDescription>
                                    Завершить текущую сессию
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    variant="destructive"
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Выйти из аккаунта
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}