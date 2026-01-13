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
        const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
        
        if (existingUsers.length > 0) {
            return Response.json(
                { error: 'Этот email уже зарегистрирован' },
                { status: 409 }
            );
        }

        // Создаем пользователя через встроенный метод
        const user = await base44.asServiceRole.auth.createUser({
            email,
            password,
            full_name: fullName
        });

        return Response.json({ 
            success: true, 
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Registration error:', error.message, error);
        
        // Если юзер уже существует
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