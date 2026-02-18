import { useState, useMemo } from 'react';

export type SortOrder = 'asc' | 'desc' | null;

interface SortConfig {
    key: string;
    order: SortOrder;
}

export function useSort<T>(items: T[], initialKey: string = '', initialOrder: SortOrder = null) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: initialKey,
        order: initialOrder,
    });

    const sortedItems = useMemo(() => {
        if (!sortConfig.key || !sortConfig.order) {
            return items;
        }

        return [...items].sort((a, b) => {
            const aValue = getNestedValue(a, sortConfig.key);
            const bValue = getNestedValue(b, sortConfig.key);

            if (aValue === bValue) return 0;

            const orderModifier = sortConfig.order === 'asc' ? 1 : -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return aValue.localeCompare(bValue) * orderModifier;
            }

            return (aValue < bValue ? -1 : 1) * orderModifier;
        });
    }, [items, sortConfig]);

    const requestSort = (key: string) => {
        setSortConfig((prev) => {
            let order: SortOrder = 'asc';
            if (prev.key === key && prev.order === 'asc') {
                order = 'desc';
            } else if (prev.key === key && prev.order === 'desc') {
                order = null;
            }
            return { key, order };
        });
    };

    return { items: sortedItems, requestSort, sortConfig };
}

function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
