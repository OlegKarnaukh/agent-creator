// ========================================
// FINAL VERSION: Pages/Dashboard
// Дата: 2026-01-11
// Логика: Dashboard всегда показывается, даже если агентов нет
// ========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import base44 from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Users, TrendingUp, Loader2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import StatCard from '@/components/dashboard/StatCard';
import AgentCard from '@/components/dashboard/AgentCard';
import ConversationFeed from '@/components/dashboard/ConversationFeed';
import ChannelSettings from '@/components/dashboard/ChannelSettings';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: agentConversations = [], isLoading } = useQuery({
    queryKey: ['agentConversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(
        `https://neuro-seller-production.up.railway.app/api/v1/constructor/conversations/${user.id}`
      );
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const agents = agentConversations
    .filter(conv => conv.agent !== null)
    .map(conv => ({
      id: conv.agent.id,
      name: conv.agent.agent_name,
      avatar_url: conv.agent.avatar_url,
      business_type: conv.agent.business_type,
      status: conv.agent.status,
      conversation_id: conv.id,
      stats: {
        totalDialogs: 0,
        activeDialogs: 0,
        conversionRate: 0,
      }
    }));

  const totalDialogs = agents.reduce((sum, agent) => sum + (agent.stats?.totalDialogs || 0), 0);
  const activeDialogs = agents.reduce((sum, agent) => sum + (agent.stats?.activeDialogs || 0), 0);
  const avgConversion = agents.length > 0
    ? agents.reduce((sum, agent) => sum + (agent.stats?.conversionRate || 0), 0) / agents.length
    : 0;

  const handleCreateAgent = () => {
    // Перекидываем сразу на AgentBuilder БЕЗ conversationId
    // BuilderChat автоматически создаст новый диалог
    const url = createPageUrl('AgentBuilder');
    navigate(url);
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка агентов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Агенты</h1>
            <p className="text-gray-600">Управление вашими AI-агентами и аналитика</p>
          </div>
          <Button
            onClick={handleCreateAgent}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Создать агента
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Всего диалогов"
            value={totalDialogs}
            icon={MessageSquare}
            trend={totalDialogs > 0 ? "+12%" : "—"}
            trendUp={true}
          />
          <StatCard
            title="Активных диалогов"
            value={activeDialogs}
            icon={Users}
            trend={activeDialogs > 0 ? "+8%" : "—"}
            trendUp={true}
          />
          <StatCard
            title="Конверсия"
            value={agents.length > 0 ? `${avgConversion.toFixed(1)}%` : "0%"}
            icon={TrendingUp}
            trend={avgConversion > 0 ? "+5%" : "—"}
            trendUp={true}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Ваши агенты</h2>
              
              {/* Если агентов нет — показываем подсказку */}
              {agents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    У вас пока нет агентов
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Создайте первого AI-агента для автоматизации общения с клиентами
                  </p>
                  <Button
                    onClick={handleCreateAgent}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Создать агента
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onSelect={handleSelectAgent}
                      isSelected={selectedAgent?.id === agent.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Agent Details */}
            {selectedAgent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <ConversationFeed agent={selectedAgent} />
              </motion.div>
            )}
          </div>

          {/* Channel Settings */}
          <div className="lg:col-span-1">
            <ChannelSettings agent={selectedAgent} />
          </div>
        </div>
      </div>
    </div>
  );
}
