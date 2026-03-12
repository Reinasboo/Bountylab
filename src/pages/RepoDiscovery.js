import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { bountylabClient } from '@/api/bountylabClient';
import { RepoCard } from '@/components/RepoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Search } from 'lucide-react';
export default function RepoDiscovery() {
    const [searchQuery, setSearchQuery] = useState('');
    const [repos, setRepos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        language: '',
        min_stars: '',
        max_stars: '',
        size: '',
        sort_by: 'stars',
    });
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Please enter a search query');
            return;
        }
        setIsLoading(true);
        setError(null);
        setCurrentPage(1);
        try {
            const response = await bountylabClient.searchRepositories(searchQuery, {
                language: filters.language || undefined,
                min_stars: filters.min_stars ? parseInt(filters.min_stars) : undefined,
                max_stars: filters.max_stars ? parseInt(filters.max_stars) : undefined,
                size: filters.size || undefined,
                sort_by: filters.sort_by,
            }, 1, 20);
            setRepos(response.items);
            setTotalPages(response.total_pages);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search repositories');
            setRepos([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-background p-4 md:p-8", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: "Repository Discovery" }), _jsx("p", { className: "text-muted-foreground", children: "Search for repositories using natural language queries" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Search Filters" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "language", children: "Language" }), _jsx(Input, { id: "language", placeholder: "e.g. Python, Go", value: filters.language, onChange: e => setFilters({ ...filters, language: e.target.value }), className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "min_stars", children: "Min Stars" }), _jsx(Input, { id: "min_stars", type: "number", placeholder: "0", value: filters.min_stars, onChange: e => setFilters({ ...filters, min_stars: e.target.value }), className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "max_stars", children: "Max Stars" }), _jsx(Input, { id: "max_stars", type: "number", placeholder: "100000", value: filters.max_stars, onChange: e => setFilters({ ...filters, max_stars: e.target.value }), className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "size", children: "Repository Size" }), _jsxs("select", { id: "size", value: filters.size, onChange: e => setFilters({
                                                            ...filters,
                                                            size: e.target.value,
                                                        }), className: "w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [_jsx("option", { value: "", children: "Any Size" }), _jsx("option", { value: "small", children: "Small" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "large", children: "Large" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sort_by", children: "Sort By" }), _jsxs("select", { id: "sort_by", value: filters.sort_by, onChange: e => setFilters({
                                                            ...filters,
                                                            sort_by: e.target.value,
                                                        }), className: "w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [_jsx("option", { value: "stars", children: "Stars" }), _jsx("option", { value: "updated", children: "Recently Updated" }), _jsx("option", { value: "forks", children: "Forks" })] })] }), _jsxs(Button, { onClick: handleSearch, className: "w-full", disabled: isLoading, children: [_jsx(Search, { className: "mr-2", size: 16 }), isLoading ? 'Searching...' : 'Search'] })] })] }) }), _jsxs("div", { className: "lg:col-span-3 space-y-6", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: 'e.g. "payment processing microservice in Go", "React authentication library"', value: searchQuery, onChange: e => setSearchQuery(e.target.value), onKeyPress: e => e.key === 'Enter' && handleSearch(), className: "text-base" }), _jsx(Button, { onClick: handleSearch, disabled: isLoading, size: "lg", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "mr-2 animate-spin", size: 18 }), "Searching..."] })) : ('Search') })] }), repos.length > 0 && (_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Found ", repos.length, " repositories on page ", currentPage, " of", ' ', totalPages] })), error && (_jsx("div", { className: "bg-destructive/10 border border-destructive/30 rounded-lg p-4", children: _jsx("p", { className: "text-destructive text-sm", children: error }) })), repos.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid gap-4", children: repos.map(repo => (_jsx(RepoCard, { repo: repo }, repo.id))) }), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsx(Button, { variant: "outline", disabled: currentPage === 1 || isLoading, onClick: () => setCurrentPage(p => p - 1), children: "Previous" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Page ", currentPage, " of ", totalPages] }), _jsx(Button, { variant: "outline", disabled: currentPage === totalPages || isLoading, onClick: () => setCurrentPage(p => p + 1), children: "Next" })] })] })) : !isLoading && searchQuery ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground text-lg", children: "No repositories found. Try adjusting your search or filters." }) })) : (!isLoading && (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground text-lg", children: "Try searching for: \"payment processing\", \"authentication\", \"microservice\"" }) })))] })] })] }) }));
}
