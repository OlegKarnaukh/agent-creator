import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

// Страницы без sidebar
const pagesWithoutSidebar = ['AgentBuilder', 'Landing'];

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

    useEffect(() => {
        if (!user) return;

        // Если пользователь на Landing и авторизован, редирект на Dashboard или AgentBuilder
        if (currentPageName === 'Landing' && user) {
            if (agents.length > 0) {
                navigate(createPageUrl('Dashboard'));
            } else {
                navigate(createPageUrl('AgentBuilder'));
            }
        }
    }, [user, agents, currentPageName, navigate]);

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