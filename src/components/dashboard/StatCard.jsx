import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:shadow-slate-100 transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% к вчера
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </motion.div>
    );
}