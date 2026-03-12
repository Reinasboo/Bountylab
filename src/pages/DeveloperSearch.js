import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { bountylabClient } from '@/api/bountylabClient';
import { DeveloperCard } from '@/components/DeveloperCard';
import { DeveloperTable } from '@/components/DeveloperTable';
import { DeveloperFilters } from '@/components/DeveloperFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Grid, Table as TableIcon } from 'lucide-react';
export default function DeveloperSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [developers, setDevelopers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [viewMode, setViewMode] = useState('grid');
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Please enter a search query');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await bountylabClient.searchDevelopers(searchQuery, filters, currentPage, 20);
            setDevelopers(response.items);
            setTotalPages(response.total_pages);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search developers');
            setDevelopers([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);
    return (_jsx("div", { className: "min-h-screen bg-background p-4 md:p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: "Developer Search" }), _jsx("p", { className: "text-muted-foreground", children: "Find and manage talented developers from GitHub" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsx(DeveloperFilters, { filters: filters, onFilterChange: setFilters, onSearch: handleSearch, isLoading: isLoading }) }), _jsxs("div", { className: "lg:col-span-3 space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Search by name, bio, skills, company, location...", value: searchQuery, onChange: e => setSearchQuery(e.target.value), onKeyPress: e => e.key === 'Enter' && handleSearch(), className: "text-base" }), _jsx(Button, { onClick: handleSearch, disabled: isLoading, size: "lg", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "mr-2 animate-spin", size: 18 }), "Searching..."] })) : ('Search') })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: viewMode === 'grid' ? 'default' : 'outline', size: "sm", onClick: () => setViewMode('grid'), children: [_jsx(Grid, { size: 16, className: "mr-2" }), "Grid"] }), _jsxs(Button, { variant: viewMode === 'table' ? 'default' : 'outline', size: "sm", onClick: () => setViewMode('table'), children: [_jsx(TableIcon, { size: 16, className: "mr-2" }), "Table"] })] })] }), developers.length > 0 && (_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Found ", developers.length, " results on page ", currentPage, " of", ' ', totalPages] })), error && (_jsx("div", { className: "bg-destructive/10 border border-destructive/30 rounded-lg p-4", children: _jsx("p", { className: "text-destructive text-sm", children: error }) })), developers.length > 0 ? (_jsxs(_Fragment, { children: [viewMode === 'grid' ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: developers.map(dev => (_jsx(DeveloperCard, { developer: dev }, dev.id))) })) : (_jsx(DeveloperTable, { developers: developers })), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsx(Button, { variant: "outline", disabled: currentPage === 1 || isLoading, onClick: () => setCurrentPage(p => p - 1), children: "Previous" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Page ", currentPage, " of ", totalPages] }), _jsx(Button, { variant: "outline", disabled: currentPage === totalPages || isLoading, onClick: () => setCurrentPage(p => p + 1), children: "Next" })] })] })) : !isLoading && searchQuery ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground text-lg", children: "No developers found. Try adjusting your search or filters." }) })) : (!isLoading && (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground text-lg", children: "Enter a search query to get started" }) })))] })] })] }) }));
}
