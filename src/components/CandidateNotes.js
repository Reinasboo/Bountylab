import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCandidateStore } from '@/store/useCandidateStore';
import { X, Plus } from 'lucide-react';
const COMMON_TAGS = [
    'Strong React',
    'Backend specialist',
    'Reached out',
    'Rejected',
    'Interview scheduled',
    'Offer sent',
    'DevOps',
    'Full Stack',
];
export function CandidateNotes({ candidate }) {
    const { updateNotes, addTag, removeTag, updateStatus } = useCandidateStore();
    const [newTag, setNewTag] = useState('');
    const [notes, setNotes] = useState(candidate.notes);
    const handleAddTag = () => {
        if (newTag.trim() && !candidate.tags.includes(newTag)) {
            addTag(candidate.id, newTag);
            setNewTag('');
        }
    };
    const handleSaveNotes = () => {
        updateNotes(candidate.id, notes);
    };
    const handleStatusChange = (status) => {
        updateStatus(candidate.id, status);
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Status" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: [
                                { value: 'interested', label: 'Interested' },
                                { value: 'contacted', label: 'Contacted' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'hired', label: 'Hired' },
                            ].map(({ value, label }) => (_jsx(Button, { variant: candidate.status === value ? 'default' : 'outline', onClick: () => handleStatusChange(value), className: "text-sm", children: label }, value))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Tags" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "flex gap-1 flex-wrap", children: candidate.tags.map(tag => (_jsxs(Badge, { variant: "secondary", className: "gap-1", children: [tag, _jsx("button", { onClick: () => removeTag(candidate.id, tag), className: "ml-1 hover:opacity-70", children: _jsx(X, { size: 14 }) })] }, tag))) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Add Tag" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Custom tag...", value: newTag, onChange: e => setNewTag(e.target.value), onKeyPress: e => e.key === 'Enter' && handleAddTag() }), _jsx(Button, { onClick: handleAddTag, size: "sm", children: _jsx(Plus, { size: 16 }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "Suggestions" }), _jsx("div", { className: "flex gap-1 flex-wrap", children: COMMON_TAGS
                                            .filter(tag => !candidate.tags.includes(tag))
                                            .slice(0, 4)
                                            .map(tag => (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => addTag(candidate.id, tag), className: "text-xs h-7", children: ["+ ", tag] }, tag))) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Notes" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsx("textarea", { value: notes, onChange: e => setNotes(e.target.value), placeholder: "Add personal notes about this candidate...", className: "w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" }), _jsx(Button, { onClick: handleSaveNotes, className: "w-full", children: "Save Notes" })] })] })] }));
}
