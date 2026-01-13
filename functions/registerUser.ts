import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const { email, password, fullName } = await req.json();

        if (!email || !password || !fullName) {
            return Response.json(
                { error: 'Email, пароль и имя обязательны' },
                { status: 400 }
            );
        }

        const base44 = createClientFromRequest(req);

        // Проверяем есть ли уже такой юзер
        const existingUsers = await base44.asServiceRole.entities.User.list();
        const userExists = existingUsers.some(u => u.email === email);
        
        if (userExists) {
            return Response.json(
                { error: 'Этот email уже зарегистрирован' },
                { status: 409 }
            );
        }

        // Создаем нового пользователя в системе
        // Используем сервис-роль для создания юзера без авторизации
        const newUser = await base44.asServiceRole.entities.User.create({
            email,
            full_name: fullName,
            // Пароль хранится отдельно в системе аутентификации
        });

        // Регистрируем пароль в системе аутентификации
        // Это отдельный шаг, поскольку пароли управляются отдельно
        await base44.asServiceRole.auth.setUserPassword(newUser.id, password);

        return Response.json({ 
            success: true, 
            user: { id: newUser.id, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            return Response.json(
                { error: 'Этот email уже зарегистрирован' },
                { status: 409 }
            );
        }
        
        return Response.json(
            { error: error.message || 'Ошибка регистрации' },
            { status: 500 }
        );
    }
});