import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

// Страницы без sidebar
const pagesWithoutSidebar = ['AgentBuilder', 'Landing', 'Auth'];

export default function Layout({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const showSidebar = !pagesWithoutSidebar.includes(currentPageName);

    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: () => base44.entities.Agent.list(),
        enabled: !!user,
    });

    // Перевод страницы авторизации на русский
    useEffect(() => {
        const translations = {
            "Welcome to NeuroSeller": "Добро пожаловать",
            "Sign in to continue": "Войдите чтобы продолжить",
            "Sign in": "Войти",
            "Sign up": "Регистрация",
            "Email": "Эл. почта",
            "Password": "Пароль",
            "Forgot password?": "Забыли пароль?",
            "Need an account?": "Нет аккаунта?",
            "Already have an account?": "Уже есть аккаунт?",
            "Create account": "Создать аккаунт",
            "Full Name": "Имя",
            "you@example.com": "ваш@email.com"
        };

        const translateElement = (element) => {
            // Переводим textContent
            if (element.nodeType === Node.TEXT_NODE) {
                for (const [en, ru] of Object.entries(translations)) {
                    if (element.textContent.includes(en)) {
                        element.textContent = element.textContent.replace(en, ru);
                    }
                }
            }

            // Переводим placeholder
            if (element.placeholder) {
                for (const [en, ru] of Object.entries(translations)) {
                    if (element.placeholder.includes(en)) {
                        element.placeholder = element.placeholder.replace(en, ru);
                    }
                }
            }

            // Рекурсивно обрабатываем дочерние элементы
            Array.from(element.childNodes).forEach(translateElement);
        };

        const observer = new MutationObserver(() => {
            translateElement(document.body);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Первый проход
        translateElement(document.body);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await base44.auth.me();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            }
        };
        fetchUser();
    }, []);



    return (
        <div className="h-screen bg-slate-50">
            <style>{`
                :root {
                    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                body {
                    font-family: var(--font-sans);
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                * {
                    scrollbar-width: thin;
                    scrollbar-color: #e2e8f0 transparent;
                }
                
                *::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                
                *::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                *::-webkit-scrollbar-thumb {
                    background-color: #e2e8f0;
                    border-radius: 3px;
                }
                
                *::-webkit-scrollbar-thumb:hover {
                    background-color: #cbd5e1;
                }
            `}</style>
            
            {showSidebar ? (
                <div className="flex h-screen">
                    <Sidebar user={user} />
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            ) : (
                children
            )}
        </div>
    );
}