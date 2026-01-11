// ========================================
// FINAL VERSION: Components/dashboard/AgentCard
// Дата: 2026-01-11
// Изменения:
// - Упрощенные URL аватарок
// - Fallback на иконку User при ошибке загрузки
// ========================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Play, Pause, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

// Упрощенные аватарки по умолчанию
const DEFAULT_AVATAR_VICTORIA = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Victoria';
const DEFAULT_AVATAR_ALEXANDER = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander';

export default function AgentCard({ agent, onSelect, isSelected }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Определяем аватарку
  const getAvatarUrl = () => {
    if (agent.avatar_url) {
      return agent.avatar_url;
    }
    const isVictoria = agent.name?.toLowerCase().includes('виктори');
    return isVictoria ? DEFAULT_AVATAR_VICTORIA : DEFAULT_AVATAR_ALEXANDER;
  };

  const handleEdit = () => {
    if (agent.conversation_id) {
      const url = createPageUrl('AgentBuilder', { conversationId: agent.conversation_id });
      navigate(url);
    } else {
      alert('Conversation ID не найден для этого агента');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить агента "${agent.name}"?`)) return;

    try {
      const response = await fetch(
        `https://neuro-seller-production.up.railway.app/api/v1/agents/${agent.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert('Агент удален');
        window.location.reload();
      } else {
        throw new Error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка при удалении агента');
    }
  };

  const handleTogglePause = async () => {
    try {
      const endpoint = agent.status === 'paused' ? 'resume' : 'pause';
      const response = await fetch(
        `https://neuro-seller-production.up.railway.app/api/v1/agents/${agent.id}/${endpoint}`,
        { method: 'POST' }
      );

      if (response.ok) {
        alert(agent.status === 'paused' ? 'Агент возобновлен' : 'Агент приостановлен');
        window.location.reload();
      } else {
        throw new Error('Failed to toggle pause');
      }
    } catch (error) {
      console.error('Toggle pause error:', error);
      alert('Ошибка при изменении статуса агента');
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
      test: { label: 'Тестирование', color: 'bg-yellow-100 text-yellow-800' },
      active: { label: 'Активен', color: 'bg-green-100 text-green-800' },
      paused: { label: 'Приостановлен', color: 'bg-orange-100 text-orange-800' },
      deleted: { label: 'Удален', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[agent.status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-indigo-200'
      }`}
      onClick={() => onSelect?.(agent)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
              {!avatarError && getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {agent.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {agent.business_type}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Редактировать
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePause();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  {agent.status === 'paused' ? (
                    <>
                      <Play className="h-4 w-4" />
                      Возобновить
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Приостановить
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          {getStatusBadge()}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {agent.stats?.totalDialogs || 0}
            </div>
            <div className="text-xs text-gray-600">Диалогов</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {agent.stats?.activeDialogs || 0}
            </div>
            <div className="text-xs text-gray-600">Активных</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {agent.stats?.conversionRate || 0}%
            </div>
            <div className="text-xs text-gray-600">Конверсия</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
