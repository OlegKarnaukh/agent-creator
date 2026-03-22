import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        const agentId = url.searchParams.get('agent_id');
        const secret = url.searchParams.get('secret');

        if (!agentId || !secret) {
            return Response.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Валидация секрета
        const channels = await base44.asServiceRole.entities.Channel.filter({ 
            agent_id: agentId, 
            type: 'website' 
        });
        
        const channel = channels.find(c => c.webhook_secret === secret);
        if (!channel) {
            return Response.json({ error: 'Invalid secret' }, { status: 403 });
        }

        const body = await req.json();
        console.log('Website webhook received:', body);

        const { message, session_id, user_id } = body;

        if (!message || !session_id) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Поиск или создание диалога
        const existingConversations = await base44.asServiceRole.entities.Conversation.filter({
            agent_id: agentId,
            customer_phone: session_id, // используем session_id как идентификатор
            status: 'active'
        });

        let conversation;
        if (existingConversations.length > 0) {
            conversation = existingConversations[0];
            const messages = conversation.messages || [];
            messages.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });

            await base44.asServiceRole.entities.Conversation.update(conversation.id, {
                messages
            });
        } else {
            conversation = await base44.asServiceRole.entities.Conversation.create({
                agent_id: agentId,
                channel: 'website',
                customer_phone: session_id,
                customer_name: user_id || 'Посетитель сайта',
                messages: [{
                    role: 'user',
                    content: message,
                    timestamp: new Date().toISOString()
                }],
                status: 'active'
            });
        }

        // Вызов вашего Railway API для генерации ответа
        // TODO: интегрировать с реальным API агента
        const agentResponse = "Здравствуйте! Спасибо за ваше сообщение. Как я могу вам помочь?";

        // Обновление диалога с ответом агента
        const updatedMessages = [...(conversation.messages || []), {
            role: 'agent',
            content: agentResponse,
            timestamp: new Date().toISOString()
        }];

        await base44.asServiceRole.entities.Conversation.update(conversation.id, {
            messages: updatedMessages
        });

        return Response.json({
            success: true,
            response: agentResponse,
            conversation_id: conversation.id
        });

    } catch (error) {
        console.error('Website webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});