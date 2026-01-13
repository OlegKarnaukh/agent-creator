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

        // Используем встроенный метод Base44 для приглашения пользователя
        // Это создает пользователя с указанными данными
        try {
            const invitedUser = await base44.asServiceRole.users.inviteUser(email, 'user');
            
            // Пытаемся установить пароль для нового пользователя
            // Для приглашенных пользователей нужно установить пароль отдельно
            // Поэтому используем другой подход - создаем через auth API
        } catch (inviteError) {
            console.log('Invite error (expected):', inviteError.message);
        }

        // Проверяем есть ли юзер с таким email
        const allUsers = await base44.asServiceRole.entities.User.list();
        const existingUser = allUsers.find(u => u.email === email);
        
        if (existingUser) {
            return Response.json(
                { error: 'Этот email уже зарегистрирован' },
                { status: 409 }
            );
        }

        // Если юзер не найден, создаем его напрямую в Entity
        const newUser = await base44.asServiceRole.entities.User.create({
            email,
            full_name: fullName
        });

        return Response.json({ 
            success: true, 
            user: { id: newUser.id, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        
        if (error.message?.includes('already exists') || error.message?.includes('duplicate') || error.message?.includes('Email')) {
            return Response.json(
                { error: 'Этот email уже зарегистрирован' },
                { status: 409 }
            );
        }
        
        return Response.json(
            { error: 'Ошибка регистрации. Попробуйте ещё раз' },
            { status: 500 }
        );
    }
});