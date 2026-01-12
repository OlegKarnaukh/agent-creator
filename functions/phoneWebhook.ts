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
            type: 'phone' 
        });
        
        const channel = channels.find(c => c.webhook_secret === secret);
        if (!channel) {
            return Response.json({ error: 'Invalid secret' }, { status: 403 });
        }

        const body = await req.json();
        console.log('Phone webhook received:', body);

        // Обработка входящего звонка/SMS
        const { from, body: messageBody, callSid, provider } = body;

        if (!from || !messageBody) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Сохранение или обновление диалога
        const existingConversations = await base44.asServiceRole.entities.Conversation.filter({
            agent_id: agentId,
            customer_phone: from,
            status: 'active'
        });

        let conversation;
        if (existingConversations.length > 0) {
            conversation = existingConversations[0];
            const messages = conversation.messages || [];
            messages.push({
                role: 'user',
                content: messageBody,
                timestamp: new Date().toISOString()
            });

            await base44.asServiceRole.entities.Conversation.update(conversation.id, {
                messages
            });
        } else {
            conversation = await base44.asServiceRole.entities.Conversation.create({
                agent_id: agentId,
                channel: 'phone',
                customer_phone: from,
                customer_name: from,
                messages: [{
                    role: 'user',
                    content: messageBody,
                    timestamp: new Date().toISOString()
                }],
                status: 'active'
            });
        }

        // Здесь должен быть вызов вашего Railway API для генерации ответа
        const agentResponse = "Спасибо за ваше сообщение! Мы скоро с вами свяжемся.";

        // Обновление диалога с ответом агента
        const updatedMessages = [...(conversation.messages || []), {
            role: 'agent',
            content: agentResponse,
            timestamp: new Date().toISOString()
        }];

        await base44.asServiceRole.entities.Conversation.update(conversation.id, {
            messages: updatedMessages
        });

        // Возврат ответа для Twilio/провайдера
        return Response.json({
            success: true,
            response: agentResponse,
            // Для Twilio TwiML
            twiml: provider === 'twilio' ? `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${agentResponse}</Message>
</Response>` : null
        });

    } catch (error) {
        console.error('Phone webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});