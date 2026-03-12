import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCandidateStore } from '@/store/useCandidateStore';
import { useState } from 'react';
export function RankingSliders() {
    const { weights, updateWeights } = useCandidateStore();
    const [localWeights, setLocalWeights] = useState(weights);
    const handleSliderChange = (key, value) => {
        const newWeights = { ...localWeights, [key]: value };
        setLocalWeights(newWeights);
        updateWeights(newWeights);
    };
    const total = Object.values(localWeights).reduce((a, b) => a + b, 0);
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Ranking Weights" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Adjust how each factor affects candidate scoring" })] }), _jsxs(CardContent, { className: "space-y-6", children: [[
                        { key: 'devrank', label: 'DevRank Score', description: 'Developer reputation score' },
                        { key: 'stars', label: 'Repository Stars', description: 'Total project stars' },
                        { key: 'activity', label: 'Recent Activity', description: 'Commits in last 30 days' },
                        { key: 'followers', label: 'Followers', description: 'GitHub followers count' },
                    ].map(({ key, label, description }) => (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: key, className: "text-base font-semibold", children: label }), _jsx("p", { className: "text-xs text-muted-foreground", children: description })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: localWeights[key] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [((localWeights[key] / total) * 100).toFixed(0), "%"] })] })] }), _jsx("input", { id: key, type: "range", min: "0", max: "50", value: localWeights[key], onChange: e => handleSliderChange(key, parseInt(e.target.value, 10)), className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" })] }, key))), _jsxs("div", { className: "border-t pt-4 mt-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("p", { className: "text-sm font-semibold text-muted-foreground", children: "Total Weight" }), _jsx("p", { className: "text-lg font-bold", children: total })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Scores are normalized to 0-100 scale based on these weights" })] })] })] }));
}
