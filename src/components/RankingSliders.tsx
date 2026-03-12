import { RankingWeights } from '@/types/developer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useCandidateStore } from '@/store/useCandidateStore'
import { useState } from 'react'

export function RankingSliders() {
  const { weights, updateWeights } = useCandidateStore()
  const [localWeights, setLocalWeights] = useState(weights)

  const handleSliderChange = (key: keyof RankingWeights, value: number) => {
    const newWeights = { ...localWeights, [key]: value }
    setLocalWeights(newWeights)
    updateWeights(newWeights)
  }

  const total = Object.values(localWeights).reduce((a, b) => a + b, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ranking Weights</CardTitle>
        <p className="text-sm text-muted-foreground">
          Adjust how each factor affects candidate scoring
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {(
          [
            { key: 'devrank', label: 'DevRank Score', description: 'Developer reputation score' },
            { key: 'stars', label: 'Repository Stars', description: 'Total project stars' },
            { key: 'activity', label: 'Recent Activity', description: 'Commits in last 30 days' },
            { key: 'followers', label: 'Followers', description: 'GitHub followers count' },
          ] as const
        ).map(({ key, label, description }) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor={key} className="text-base font-semibold">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{localWeights[key]}</div>
                <div className="text-xs text-muted-foreground">
                  {((localWeights[key] / total) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <input
              id={key}
              type="range"
              min="0"
              max="50"
              value={localWeights[key]}
              onChange={e =>
                handleSliderChange(key, parseInt(e.target.value, 10))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        ))}

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-muted-foreground">Total Weight</p>
            <p className="text-lg font-bold">{total}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Scores are normalized to 0-100 scale based on these weights
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
