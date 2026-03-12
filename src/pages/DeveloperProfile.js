import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bountylabClient } from '@/api/bountylabClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useCandidateStore } from '@/store/useCandidateStore';
import { MapPin, Building2, Github, Star, Loader, Heart, ChevronLeft, } from 'lucide-react';
export default function DeveloperProfile() {
    const { login } = useParams();
    const navigate = useNavigate();
    const [developer, setDeveloper] = useState(null);
    const [repos, setRepos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isCandidateSaved, addCandidate, removeCandidate } = useCandidateStore();
    const isStarred = developer ? isCandidateSaved(developer.id) : false;
    useEffect(() => {
        const loadDeveloper = async () => {
            if (!login)
                return;
            setIsLoading(true);
            setError(null);
            try {
                const devData = await bountylabClient.getDeveloper(login);
                setDeveloper(devData);
                const reposData = await bountylabClient.getDeveloperRepositories(login, 1, 10);
                setRepos(reposData.items);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load developer');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadDeveloper();
    }, [login]);
    const handleSave = () => {
        if (!developer)
            return;
        if (isStarred) {
            removeCandidate(developer.id);
        }
        else {
            addCandidate(developer);
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader, { className: "animate-spin h-12 w-12 mx-auto mb-4 text-primary" }), _jsx("p", { className: "text-muted-foreground", children: "Loading developer profile..." })] }) }));
    }
    if (error || !developer) {
        return (_jsx("div", { className: "min-h-screen bg-background p-4 md:p-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate('/developers'), className: "mb-4", children: [_jsx(ChevronLeft, { size: 18, className: "mr-2" }), "Back"] }), _jsx("div", { className: "bg-destructive/10 border border-destructive/30 rounded-lg p-6", children: _jsx("p", { className: "text-destructive", children: error || 'Developer not found' }) })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background p-4 md:p-8", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate('/developers'), children: [_jsx(ChevronLeft, { size: 18, className: "mr-2" }), "Back to Search"] }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [_jsxs(Avatar, { className: "h-32 w-32", children: [_jsx(AvatarImage, { src: developer.avatar_url }), _jsx(AvatarFallback, { className: "text-2xl", children: developer.login.slice(0, 2).toUpperCase() })] }), _jsxs("div", { className: "flex-1", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: developer.name || developer.login }), _jsxs("p", { className: "text-lg text-muted-foreground mb-4", children: ["@", developer.login] }), developer.bio && (_jsx("p", { className: "text-base mb-4", children: developer.bio })), _jsxs("div", { className: "space-y-2 mb-4", children: [developer.location && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { size: 18, className: "text-muted-foreground" }), _jsx("span", { children: developer.location })] })), developer.company && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building2, { size: 18, className: "text-muted-foreground" }), _jsx("span", { children: developer.company })] }))] }), _jsxs("div", { className: "flex gap-2 flex-wrap mb-4", children: [_jsx(Button, { asChild: true, variant: "outline", children: _jsxs("a", { href: developer.github_url, target: "_blank", rel: "noopener noreferrer", children: [_jsx(Github, { size: 18, className: "mr-2" }), "GitHub Profile"] }) }), _jsxs(Button, { onClick: handleSave, variant: isStarred ? 'default' : 'outline', children: [_jsx(Heart, { className: isStarred ? 'fill-current mr-2' : 'mr-2', size: 18 }), isStarred ? 'Saved' : 'Save Candidate'] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted p-4 rounded-lg mt-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-1", children: "FOLLOWERS" }), _jsx("p", { className: "text-2xl font-bold", children: developer.followers.toLocaleString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-1", children: "FOLLOWING" }), _jsx("p", { className: "text-2xl font-bold", children: developer.following.toLocaleString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-1", children: "PUBLIC REPOS" }), _jsx("p", { className: "text-2xl font-bold", children: developer.public_repos.toLocaleString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-1", children: "TOTAL STARS" }), _jsx("p", { className: "text-2xl font-bold", children: (developer.total_stars || 0).toLocaleString() })] })] }), developer.devrank_score && (_jsxs("div", { className: "bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4", children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-1", children: "DEVRANK SCORE" }), _jsx("p", { className: "text-3xl font-bold text-primary", children: developer.devrank_score })] }))] }) }), developer.top_languages && developer.top_languages.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Languages" }) }), _jsx(CardContent, { children: _jsx("div", { className: "flex gap-2 flex-wrap", children: developer.top_languages.map(lang => (_jsx(Badge, { variant: "secondary", className: "text-sm", children: lang }, lang))) }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Repositories" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: repos.map(repo => (_jsx("div", { className: "p-3 border rounded-lg hover:bg-muted/50 transition-colors", children: _jsx(Button, { asChild: true, variant: "ghost", className: "justify-start p-0 h-auto hover:bg-transparent", children: _jsx("a", { href: repo.url, target: "_blank", rel: "noopener noreferrer", children: _jsxs("div", { className: "text-left w-full", children: [_jsx("h4", { className: "font-semibold", children: repo.name }), repo.description && (_jsx("p", { className: "text-sm text-muted-foreground mt-1 line-clamp-2", children: repo.description })), _jsxs("div", { className: "flex gap-4 mt-2 text-xs text-muted-foreground", children: [repo.language && (_jsx("span", { className: "bg-muted px-2 py-1 rounded", children: repo.language })), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Star, { size: 14 }), repo.stargazers_count] })] })] }) }) }) }, repo.id))) }) })] })] }) }));
}
