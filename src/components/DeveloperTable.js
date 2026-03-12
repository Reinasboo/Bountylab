import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, } from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, ArrowUpDown } from 'lucide-react';
import { useCandidateStore } from '@/store/useCandidateStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
export function DeveloperTable({ developers }) {
    const navigate = useNavigate();
    const { isCandidateSaved, addCandidate, removeCandidate } = useCandidateStore();
    const [sorting, setSorting] = useState([]);
    const columns = useMemo(() => [
        {
            accessorKey: 'login',
            header: ({ column }) => (_jsxs(Button, { variant: "ghost", onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'), className: "hover:bg-transparent", children: ["Developer", _jsx(ArrowUpDown, { className: "ml-2", size: 16 })] })),
            cell: ({ row }) => {
                const developer = row.original;
                return (_jsxs(Button, { variant: "ghost", onClick: () => navigate(`/developer/${developer.login}`), className: "justify-start hover:bg-transparent", children: [_jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [_jsx(AvatarImage, { src: developer.avatar_url }), _jsx(AvatarFallback, { children: developer.login.slice(0, 1) })] }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-semibold", children: developer.name || developer.login }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["@", developer.login] })] })] }));
            },
        },
        {
            accessorKey: 'location',
            header: 'Location',
            cell: ({ row }) => row.original.location || '-',
        },
        {
            accessorKey: 'followers',
            header: ({ column }) => (_jsxs(Button, { variant: "ghost", onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'), className: "hover:bg-transparent", children: ["Followers", _jsx(ArrowUpDown, { className: "ml-2", size: 16 })] })),
            cell: ({ row }) => row.original.followers.toLocaleString(),
        },
        {
            accessorKey: 'total_stars',
            header: ({ column }) => (_jsxs(Button, { variant: "ghost", onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'), className: "hover:bg-transparent", children: ["Stars", _jsx(ArrowUpDown, { className: "ml-2", size: 16 })] })),
            cell: ({ row }) => (row.original.total_stars || 0).toLocaleString(),
        },
        {
            accessorKey: 'top_languages',
            header: 'Languages',
            cell: ({ row }) => (_jsx("div", { className: "flex gap-1 flex-wrap", children: row.original.top_languages?.slice(0, 3).map(lang => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: lang }, lang))) })),
        },
        {
            accessorKey: 'devrank_score',
            header: ({ column }) => (_jsxs(Button, { variant: "ghost", onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'), className: "hover:bg-transparent", children: ["DevRank", _jsx(ArrowUpDown, { className: "ml-2", size: 16 })] })),
            cell: ({ row }) => row.original.devrank_score || '-',
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const developer = row.original;
                const isStarred = isCandidateSaved(developer.id);
                return (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                        if (isStarred) {
                            removeCandidate(developer.id);
                        }
                        else {
                            addCandidate(developer);
                        }
                    }, className: isStarred ? 'text-red-500' : '', children: _jsx(Heart, { className: isStarred ? 'fill-current' : '', size: 18 }) }));
            },
        },
    ], [navigate, isCandidateSaved, addCandidate, removeCandidate]);
    const table = useReactTable({
        data: developers,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });
    return (_jsxs(Card, { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "border-b bg-muted", children: table.getHeaderGroups().map(headerGroup => (_jsx("tr", { children: headerGroup.headers.map(header => (_jsx("th", { className: "h-12 px-4 text-left align-middle font-semibold text-muted-foreground", children: header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext()) }, header.id))) }, headerGroup.id))) }), _jsx("tbody", { children: table.getRowModel().rows.map(row => (_jsx("tr", { className: "border-b hover:bg-muted/50 transition-colors", children: row.getVisibleCells().map(cell => (_jsx("td", { className: "p-4 align-middle", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id))) })] }), developers.length === 0 && (_jsx("div", { className: "p-8 text-center", children: _jsx("p", { className: "text-muted-foreground", children: "No developers found" }) }))] }));
}
