// ========================================
// FINAL VERSION: Components/builder/ConfigurePanel
// Дата: 2026-01-11
// Изменения:
// - Упрощенные URL аватарок
// - Загрузка аватарки через Base44 Media Library
// - Кнопка сброса аватарки к умолчанию
// - knowledge_base как JSON или текст
// ========================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, User, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Упрощенные аватарки по умолчанию
const DEFAULT_AVATAR_VICTORIA = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Victoria';
const DEFAULT_AVATAR_ALEXANDER = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander';

export default function ConfigurePanel({ agentData, onChange, onSave }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleChange = (field, value) => {
    onChange({ ...agentData, [field]: value });
  };

  const handleChannelToggle = (channel) => {
    const updatedChannels = { ...agentData.channels };
    updatedChannels[channel] = !updatedChannels[channel];
    handleChange('channels', updatedChannels);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (максимум 2 МБ)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Файл слишком большой. Максимум 2 МБ.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Попытка загрузить через Base44 Media Library
      if (window.base44?.media?.upload) {
        const result = await window.base44.media.upload(file);
        handleChange('avatar_url', result.url);
      } else {
        // Резервный вариант: загрузка через Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          handleChange('avatar_url', reader.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setUploadError('Ошибка загрузки. Попробуйте еще раз.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetAvatar = () => {
    // Сброс к аватарке по умолчанию в зависимости от имени
    const isVictoria = agentData.name?.toLowerCase().includes('виктори');
    const defaultAvatar = isVictoria ? DEFAULT_AVATAR_VICTORIA : DEFAULT_AVATAR_ALEXANDER;
    handleChange('avatar_url', defaultAvatar);
  };

  // Определяем аватарку: загруженная или дефолтная
  const getAvatarUrl = () => {
    if (agentData.avatar_url) {
      return agentData.avatar_url;
    }
    const isVictoria = agentData.name?.toLowerCase().includes('виктори');
    return isVictoria ? DEFAULT_AVATAR_VICTORIA : DEFAULT_AVATAR_ALEXANDER;
  };

  // Форматирование knowledge_base для отображения
  const formatKnowledgeBase = (kb) => {
    if (!kb) return '';
    if (typeof kb === 'string') return kb;
    try {
      return JSON.stringify(kb, null, 2);
    } catch {
      return String(kb);
    }
  };

  // Парсинг knowledge_base из текста
  const parseKnowledgeBase = (text) => {
    if (!text.trim()) return '';
    try {
      // Пытаемся распарсить как JSON
      return JSON.parse(text);
    } catch {
      // Если не JSON — возвращаем как строку
      return text;
    }
  };

  const channels = [
    { id: 'telegram', name: 'Telegram', icon: '📱', color: 'bg-blue-500' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
    { id: 'phone', name: 'Телефония', icon: '📞', color: 'bg-purple-500' },
    { id: 'widget', name: 'Виджет на сайт', icon: '🌐', color: 'bg-indigo-500' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Профиль агента */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Профиль агента</h2>

          {/* Аватарка */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Аватарка
            </label>
            <div className="flex items-center gap-4">
              {/* Превью аватарки */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback при ошибке загрузки
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Кнопки управления */}
              <div className="flex flex-col gap-2">
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => document.getElementById('avatar-upload').click()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить
                      </>
                    )}
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAvatar}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  По умолчанию
                </Button>
              </div>
            </div>
            {uploadError && (
              <p className="text-sm text-red-600 mt-2">{uploadError}</p>
            )}
          </div>

          {/* Имя агента */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя агента
            </label>
            <Input
              value={agentData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Виктория"
            />
          </div>

          {/* Тип бизнеса */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип бизнеса
            </label>
            <Input
              value={agentData.business_type || ''}
              onChange={(e) => handleChange('business_type', e.target.value)}
              placeholder="Салон красоты"
            />
          </div>

          {/* Описание */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <Textarea
              value={agentData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Краткое описание агента..."
              rows={3}
            />
          </div>

          {/* Системные инструкции */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Системные инструкции
            </label>
            <Textarea
              value={agentData.instructions || ''}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Инструкции для агента..."
              rows={4}
            />
          </div>
        </motion.section>

        {/* Каналы связи */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Каналы связи</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${channel.color} rounded-lg flex items-center justify-center text-xl`}>
                    {channel.icon}
                  </div>
                  <span className="font-medium">{channel.name}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agentData.channels?.[channel.id] || false}
                    onChange={() => handleChannelToggle(channel.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.section>

        {/* База знаний */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-2">База знаний</h2>
          <p className="text-sm text-gray-600 mb-4">
            Можно вводить текст или JSON-объект
          </p>
          <Textarea
            value={formatKnowledgeBase(agentData.knowledge_base)}
            onChange={(e) => handleChange('knowledge_base', parseKnowledgeBase(e.target.value))}
            placeholder="Добавьте информацию о компании, услугах, ценах..."
            rows={8}
            className="font-mono text-sm"
          />
          
          {/* Кнопка загрузки файлов (placeholder) */}
          <div className="mt-4">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Загрузить файл
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Поддерживаются файлы: PDF, DOCX, TXT
            </p>
          </div>
        </motion.section>

        {/* Кнопка сохранения */}
        <div className="sticky bottom-0 bg-gray-50 py-4 border-t">
          <Button
            onClick={onSave}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
}
