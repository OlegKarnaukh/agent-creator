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

        // Используем встроенный Base44 auth API напрямую
        const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID');
        
        const registerResponse = await fetch('https://api.base44.com/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-App-ID': BASE44_APP_ID
            },
            body: JSON.stringify({
                email,
                password,
                full_name: fullName
            })
        });

        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            throw new Error(error.message || 'Ошибка регистрации');
        }

        const user = await registerResponse.json();

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