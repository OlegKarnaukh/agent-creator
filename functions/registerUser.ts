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

        // Регистрируем пользователя через встроенный API
        const user = await base44.asServiceRole.auth.createUser({
            email,
            password,
            full_name: fullName
        });

        return Response.json({ 
            success: true, 
            user: { id: user.id, email: user.email, full_name: user.full_name }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json(
            { error: error.message || 'Ошибка регистрации' },
            { status: 500 }
        );
    }
});