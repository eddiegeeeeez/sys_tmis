"use client";

import React from 'react';
import { UserRole } from '@/types';
import { getRoleQuickActions } from '@/lib/roleConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsCardProps {
    role: UserRole;
    onNavigate: (view: string) => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ role, onNavigate }) => {
    const quickActions = getRoleQuickActions(role);

    if (quickActions.length === 0) {
        return null;
    }

    return (
        <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
                <CardTitle className="text-base text-zinc-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                onClick={() => onNavigate(action.id)}
                                className="p-4 rounded border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all text-center group"
                                title={action.description}
                            >
                                <Icon className="w-5 h-5 text-zinc-600 mx-auto mb-2 group-hover:text-zinc-900 transition-colors" />
                                <p className="text-xs font-medium text-zinc-900 line-clamp-2">{action.label}</p>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
