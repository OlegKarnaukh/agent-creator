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

        // Используем встроенный API Base44 для регистрации напрямую
        // Это обходит встроенную страницу регистрации
        const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID');
        
        const signUpResponse = await fetch('https://api.base44.com/auth/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-App-ID': BASE44_APP_ID,
            },
            body: JSON.stringify({
                email,
                password,
                full_name: fullName
            })
        });

        if (!signUpResponse.ok) {
            const error = await signUpResponse.json();
            
            if (signUpResponse.status === 409) {
                return Response.json(
                    { error: 'Этот email уже зарегистрирован' },
                    { status: 409 }
                );
            }
            
            return Response.json(
                { error: error.message || 'Ошибка регистрации' },
                { status: signUpResponse.status }
            );
        }

        const user = await signUpResponse.json();

        return Response.json({ 
            success: true, 
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        return Response.json(
            { error: 'Ошибка регистрации. Попробуйте ещё раз' },
            { status: 500 }
        );
    }
});