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
        try {
            const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
            
            if (existingUsers.length > 0) {
                return Response.json(
                    { error: 'Этот email уже зарегистрирован' },
                    { status: 409 }
                );
            }
        } catch (e) {
            console.error('Check user error:', e.message);
        }

        // Отправляем запрос на встроенный API регистрации
        const APP_ID = Deno.env.get('BASE44_APP_ID');
        
        const registerResponse = await fetch('https://auth.base44.io/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                app_id: APP_ID,
                email,
                password,
                full_name: fullName
            })
        });

        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            return Response.json(
                { error: error.message || 'Ошибка регистрации' },
                { status: registerResponse.status }
            );
        }

        const user = await registerResponse.json();

        return Response.json({ 
            success: true, 
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        return Response.json(
            { error: error.message || 'Ошибка регистрации' },
            { status: 500 }
        );
    }
});