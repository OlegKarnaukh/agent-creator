import React from 'react';

export default function Layout({ children, currentPageName }) {
    return (
        <div className="min-h-screen bg-slate-50">
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
            {children}
        </div>
    );
}