import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/Table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    // tableRef lets the row-number cell read live pagination state without
    // needing controlled state (avoids breaking internal TanStack pagination)
    const tableRef = React.useRef<ReturnType<typeof useReactTable<TData>> | null>(null)

    const columnsWithIndex: ColumnDef<TData, TValue>[] = React.useMemo(() => [
        {
            id: "__row_number__",
            header: "#",
            cell: ({ row }) => {
                const { pageIndex, pageSize } = tableRef.current?.getState().pagination ?? { pageIndex: 0, pageSize: 10 }
                return (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono select-none">
                        {pageIndex * pageSize + row.index + 1}
                    </span>
                )
            },
            enableSorting: false,
            size: 40,
        } as ColumnDef<TData, TValue>,
        ...columns,
    ], [columns])

    const table = useReactTable({
        data,
        columns: columnsWithIndex,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        initialState: { pagination: { pageSize: 10 } },
    })

    // Keep ref in sync after every render
    tableRef.current = table

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col flex-1">
                <div className="overflow-auto flex-1">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="whitespace-nowrap"
                                            style={header.column.id === "__row_number__" ? { width: 40, minWidth: 40 } : undefined}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="group cursor-default hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                style={cell.column.id === "__row_number__" ? { width: 40, minWidth: 40 } : undefined}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columnsWithIndex.length} className="h-24 text-center text-zinc-500 dark:text-zinc-400">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2 shrink-0 pt-2 mt-1">
                {/* Left: editable rows-per-page */}
                <div className="flex-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Showing</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            table.setPageSize(Number(e.target.value))
                        }}
                        className="h-6 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 px-1 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                    >
                        {PAGE_SIZE_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <span>of {table.getFilteredRowModel().rows.length} rows</span>
                </div>

                {/* Right: page navigation */}
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center justify-center text-xs font-medium text-zinc-900 dark:text-zinc-50">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount() || 1}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground hidden h-7 w-7 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground hidden h-7 w-7 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
