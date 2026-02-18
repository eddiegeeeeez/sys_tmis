import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSort } from '../useSort';

describe('useSort', () => {
    const mockItems = [
        { id: '1', name: 'Zebra', count: 10, nested: { value: 100 } },
        { id: '2', name: 'Albatross', count: 5, nested: { value: 500 } },
        { id: '3', name: 'Monkey', count: 20, nested: { value: 200 } },
    ];

    it('should return items in original order when no sort is applied', () => {
        const { result } = renderHook(() => useSort(mockItems));
        expect(result.current.items).toEqual(mockItems);
    });

    it('should sort by string key in ascending order', () => {
        const { result } = renderHook(() => useSort(mockItems));

        act(() => {
            result.current.requestSort('name');
        });

        expect(result.current.items[0].name).toBe('Albatross');
        expect(result.current.items[1].name).toBe('Monkey');
        expect(result.current.items[2].name).toBe('Zebra');
        expect(result.current.sortConfig).toEqual({ key: 'name', order: 'asc' });
    });

    it('should sort by string key in descending order when requested twice', () => {
        const { result } = renderHook(() => useSort(mockItems));

        act(() => {
            result.current.requestSort('name'); // asc
            result.current.requestSort('name'); // desc
        });

        expect(result.current.items[0].name).toBe('Zebra');
        expect(result.current.items[1].name).toBe('Monkey');
        expect(result.current.items[2].name).toBe('Albatross');
        expect(result.current.sortConfig).toEqual({ key: 'name', order: 'desc' });
    });

    it('should reset sort when requested three times for the same key', () => {
        const { result } = renderHook(() => useSort(mockItems));

        act(() => {
            result.current.requestSort('name'); // asc
            result.current.requestSort('name'); // desc
            result.current.requestSort('name'); // null
        });

        expect(result.current.items).toEqual(mockItems);
        expect(result.current.sortConfig).toEqual({ key: 'name', order: null });
    });

    it('should sort by numeric key', () => {
        const { result } = renderHook(() => useSort(mockItems));

        act(() => {
            result.current.requestSort('count');
        });

        expect(result.current.items[0].count).toBe(5);
        expect(result.current.items[1].count).toBe(10);
        expect(result.current.items[2].count).toBe(20);
    });

    it('should sort by nested key', () => {
        const { result } = renderHook(() => useSort(mockItems));

        act(() => {
            result.current.requestSort('nested.value');
        });

        expect(result.current.items[0].nested.value).toBe(100);
        expect(result.current.items[1].nested.value).toBe(200);
        expect(result.current.items[2].nested.value).toBe(500);
    });

    it('should change sort key immediately', () => {
        const { result } = renderHook(() => useSort(mockItems));

        act(() => {
            result.current.requestSort('name');
            result.current.requestSort('count');
        });

        expect(result.current.sortConfig).toEqual({ key: 'count', order: 'asc' });
        expect(result.current.items[0].count).toBe(5);
    });

    it('should handle initial sort configuration', () => {
        const { result } = renderHook(() => useSort(mockItems, 'count', 'desc'));

        expect(result.current.sortConfig).toEqual({ key: 'count', order: 'desc' });
        expect(result.current.items[0].count).toBe(20);
        expect(result.current.items[1].count).toBe(10);
        expect(result.current.items[2].count).toBe(5);
    });
});
