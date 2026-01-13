import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Вызываем Railway API для синхронизации пользователя
        const railwayResponse = await fetch(
            'https://neuro-seller-production.up.railway.app/api/v1/users/ensure',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    full_name: user.full_name,
                    base44_id: user.id,
                }),
            }
        );

        if (!railwayResponse.ok) {
            console.error('Railway API error:', railwayResponse.status, railwayResponse.statusText);
            return Response.json(
                { error: 'Failed to sync with Railway' },
                { status: railwayResponse.status }
            );
        }

        const railwayUser = await railwayResponse.json();

        // Сохраняем external_user_id в User Entity
        await base44.auth.updateMe({
            external_user_id: railwayUser.id,
        });

        return Response.json({
            success: true,
            external_user_id: railwayUser.id,
            railwayUser,
        });
    } catch (error) {
        console.error('Sync error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});