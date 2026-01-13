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

        // Проверяем, существует ли уже такой пользователь
        const allUsers = await base44.asServiceRole.entities.User.list();
        if (allUsers.some(u => u.email === email)) {
            return Response.json(
                { error: 'Этот email уже зарегистрирован' },
                { status: 409 }
            );
        }

        // Регистрируем пользователя - просто создаем в системе
        const user = await base44.asServiceRole.users.inviteUser(email, 'user');

        return Response.json({ 
            success: true, 
            user: { id: user.id, email: user.email, full_name: fullName }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Проверяем конкретные ошибки
        const errorMsg = error.message || error.toString();
        if (errorMsg.includes('already') || errorMsg.includes('duplicate') || errorMsg.includes('409')) {
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