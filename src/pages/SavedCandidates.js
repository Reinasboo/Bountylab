import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCandidateStore } from '@/store/useCandidateStore';
import { CandidateNotes } from '@/components/CandidateNotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RankingSliders } from '@/components/RankingSliders';
import { exportCandidatesCSV, exportCandidatesJSON } from '@/utils/exportCSV';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Download, Trash2, Filter } from 'lucide-react';
export default function SavedCandidates() {
    const navigate = useNavigate();
    const { candidates, clearAllCandidates, getCandidatesByStatus, weights } = useCandidateStore();
    const [selectedCandidate, setSelectedCandidate] = useState(candidates[0]);
    const [statusFilter, setStatusFilter] = useState('all');
    const filteredCandidates = statusFilter === 'all'
        ? candidates
        : getCandidatesByStatus(statusFilter);
    const sortedCandidates = [...filteredCandidates].sort((a, b) => b.recruiter_score - a.recruiter_score);
    const stats = {
        total: candidates.length,
        interested: getCandidatesByStatus('interested').length,
        contacted: getCandidatesByStatus('contacted').length,
        rejected: getCandidatesByStatus('rejected').length,
        hired: getCandidatesByStatus('hired').length,
    };
    const handleExportCSV = () => {
        exportCandidatesCSV(sortedCandidates);
    };
    const handleExportJSON = () => {
        exportCandidatesJSON(sortedCandidates);
    };
    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to delete all saved candidates? This cannot be undone.')) {
            clearAllCandidates();
            setSelectedCandidate(null);
        }
    };
    if (candidates.length === 0) {
        return (_jsx("div", { className: "min-h-screen bg-background p-4 md:p-8", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: "Saved Candidates" }), _jsx("p", { className: "text-muted-foreground", children: "Manage your developer pipeline" })] }), _jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-muted-foreground text-lg mb-4", children: "You haven't saved any candidates yet." }), _jsx(Button, { onClick: () => navigate('/developers'), children: "Start Searching" })] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background p-4 md:p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: "Saved Candidates" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Manage your developer pipeline and recruitment process" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "TOTAL" }), _jsx("p", { className: "text-2xl font-bold", children: stats.total })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "INTERESTED" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: stats.interested })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "CONTACTED" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: stats.contacted })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "REJECTED" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: stats.rejected })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "HIRED" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: stats.hired })] }) })] })] }), _jsxs("div", { className: "flex gap-2 mb-6 flex-wrap", children: [_jsxs(Button, { onClick: handleExportCSV, variant: "outline", children: [_jsx(Download, { className: "mr-2", size: 18 }), "Export CSV"] }), _jsxs(Button, { onClick: handleExportJSON, variant: "outline", children: [_jsx(Download, { className: "mr-2", size: 18 }), "Export JSON"] }), _jsxs(Button, { onClick: handleClearAll, variant: "destructive", className: "ml-auto", children: [_jsx(Trash2, { className: "mr-2", size: 18 }), "Clear All"] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: [
                                        { value: 'all', label: 'All' },
                                        { value: 'interested', label: 'Interested' },
                                        { value: 'contacted', label: 'Contacted' },
                                        { value: 'rejected', label: 'Rejected' },
                                        { value: 'hired', label: 'Hired' },
                                    ].map(({ value, label }) => (_jsxs(Button, { variant: statusFilter === value ? 'default' : 'outline', onClick: () => setStatusFilter(value), className: "whitespace-nowrap", children: [_jsx(Filter, { size: 14, className: "mr-2" }), label] }, value))) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: statusFilter === 'all'
                                                    ? 'All Candidates'
                                                    : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Candidates` }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: sortedCandidates.map(candidate => (_jsxs("div", { onClick: () => setSelectedCandidate(candidate), className: `p-4 rounded-lg border cursor-pointer transition-colors ${selectedCandidate?.id === candidate.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'hover:bg-muted'}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsxs(Avatar, { className: "h-10 w-10", children: [_jsx(AvatarImage, { src: candidate.developer.avatar_url }), _jsx(AvatarFallback, { children: candidate.developer.login.slice(0, 1) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold truncate", children: candidate.developer.name ||
                                                                                        candidate.developer.login }), _jsxs("p", { className: "text-xs text-muted-foreground truncate", children: ["@", candidate.developer.login] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-2xl font-bold text-primary", children: candidate.recruiter_score }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Score" })] })] }), candidate.developer.location && (_jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: ["\uD83D\uDCCD ", candidate.developer.location] })), candidate.tags.length > 0 && (_jsxs("div", { className: "flex gap-1 flex-wrap mt-2", children: [candidate.tags.slice(0, 2).map(tag => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, tag))), candidate.tags.length > 2 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", candidate.tags.length - 2] }))] }))] }, candidate.id))) }) })] })] }), _jsxs("div", { className: "space-y-6", children: [selectedCandidate && (_jsxs(_Fragment, { children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Candidate Details" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsxs(Avatar, { className: "h-20 w-20", children: [_jsx(AvatarImage, { src: selectedCandidate.developer.avatar_url }), _jsx(AvatarFallback, { className: "text-2xl", children: selectedCandidate.developer.login.slice(0, 1) })] }) }), _jsx("p", { className: "text-center text-lg font-semibold", children: selectedCandidate.developer.name ||
                                                                        selectedCandidate.developer.login }), _jsxs("p", { className: "text-center text-sm text-muted-foreground", children: ["@", selectedCandidate.developer.login] })] }), _jsxs("div", { className: "space-y-2 text-sm border-t pt-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "FOLLOWERS" }), _jsx("p", { className: "font-semibold", children: selectedCandidate.developer.followers.toLocaleString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "TOTAL STARS" }), _jsx("p", { className: "font-semibold", children: (selectedCandidate.developer.total_stars || 0).toLocaleString() })] }), selectedCandidate.developer.top_languages && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "LANGUAGES" }), _jsx("div", { className: "flex gap-1 flex-wrap mt-1", children: selectedCandidate.developer.top_languages
                                                                                .slice(0, 3)
                                                                                .map(lang => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: lang }, lang))) })] }))] }), _jsx(Button, { asChild: true, variant: "outline", className: "w-full", children: _jsx("a", { href: selectedCandidate.developer.github_url, target: "_blank", rel: "noopener noreferrer", children: "View on GitHub" }) })] })] }), _jsx(CandidateNotes, { candidate: selectedCandidate })] })), _jsx(RankingSliders, {})] })] })] }) }));
}
