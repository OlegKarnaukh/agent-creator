Deno.serve(async (req) => {
    try {
        const { email, password, fullName } = await req.json();

        if (!email || !password || !fullName) {
            return Response.json(
                { error: 'Email, пароль и имя обязательны' },
                { status: 400 }
            );
        }

        // Регистрируем пользователя напрямую через встроенный механизм Base44
        // Используем fetch к встроенному API регистрации
        const APP_ID = Deno.env.get('BASE44_APP_ID');
        const response = await fetch('https://auth.base44.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_id: APP_ID,
                email,
                password,
                full_name: fullName
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409 || data.message?.includes('already')) {
                return Response.json(
                    { error: 'Этот email уже зарегистрирован' },
                    { status: 409 }
                );
            }
            return Response.json(
                { error: data.message || 'Ошибка регистрации' },
                { status: response.status }
            );
        }

        return Response.json({ 
            success: true, 
            user: { id: data.id, email: data.email }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        return Response.json(
            { error: 'Ошибка регистрации. Попробуйте ещё раз' },
            { status: 500 }
        );
    }
});