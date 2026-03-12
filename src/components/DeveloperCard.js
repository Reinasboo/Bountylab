import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MapPin, Building2 } from 'lucide-react';
import { useCandidateStore } from '@/store/useCandidateStore';
import { useNavigate } from 'react-router-dom';
export function DeveloperCard({ developer, onAddCandidate }) {
    const navigate = useNavigate();
    const { isCandidateSaved, addCandidate } = useCandidateStore();
    const isStarred = isCandidateSaved(developer.id);
    const handleSave = () => {
        addCandidate(developer);
        onAddCandidate?.(developer);
    };
    const handleViewProfile = () => {
        navigate(`/developer/${developer.login}`);
    };
    return (_jsxs(Card, { className: "overflow-hidden transition-all hover:shadow-lg", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsxs(Avatar, { className: "h-12 w-12", children: [_jsx(AvatarImage, { src: developer.avatar_url }), _jsx(AvatarFallback, { children: developer.login.slice(0, 2).toUpperCase() })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-lg truncate", children: developer.name || developer.login }), _jsxs("p", { className: "text-sm text-muted-foreground truncate", children: ["@", developer.login] })] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: handleSave, className: isStarred ? 'text-red-500' : 'text-muted-foreground', children: _jsx(Heart, { className: isStarred ? 'fill-current' : '', size: 20 }) })] }) }), _jsxs(CardContent, { className: "space-y-3", children: [developer.bio && (_jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: developer.bio })), _jsxs("div", { className: "space-y-2", children: [developer.location && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(MapPin, { size: 16 }), _jsx("span", { children: developer.location })] })), developer.company && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Building2, { size: 16 }), _jsx("span", { children: developer.company })] }))] }), developer.top_languages && developer.top_languages.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "Languages" }), _jsx("div", { className: "flex gap-1 flex-wrap", children: developer.top_languages.slice(0, 5).map(lang => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: lang }, lang))) })] })), _jsxs("div", { className: "flex gap-4 text-sm border-t pt-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Followers" }), _jsx("p", { className: "font-semibold", children: developer.followers.toLocaleString() })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Stars" }), _jsx("p", { className: "font-semibold", children: (developer.total_stars || 0).toLocaleString() })] }), developer.devrank_score && (_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "DevRank" }), _jsx("p", { className: "font-semibold", children: developer.devrank_score })] }))] }), _jsx(Button, { onClick: handleViewProfile, className: "w-full", variant: "outline", children: "View Profile" })] })] }));
}
