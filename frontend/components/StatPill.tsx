import React from 'react';

interface StatPillProps {
    label: string;
    color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}

export default function StatPill({ label, color = 'gray' }: StatPillProps) {
    const colors = {
        green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        gray: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}>
            {label}
        </span>
    );
}
