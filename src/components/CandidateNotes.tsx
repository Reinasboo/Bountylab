import { useState } from 'react'
import { SavedCandidate } from '@/types/developer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCandidateStore } from '@/store/useCandidateStore'
import { X, Plus } from 'lucide-react'

interface CandidateNotesProps {
  candidate: SavedCandidate
}

const COMMON_TAGS = [
  'Strong React',
  'Backend specialist',
  'Reached out',
  'Rejected',
  'Interview scheduled',
  'Offer sent',
  'DevOps',
  'Full Stack',
]

export function CandidateNotes({ candidate }: CandidateNotesProps) {
  const { updateNotes, addTag, removeTag, updateStatus } = useCandidateStore()
  const [newTag, setNewTag] = useState('')
  const [notes, setNotes] = useState(candidate.notes)

  const handleAddTag = () => {
    if (newTag.trim() && !candidate.tags.includes(newTag)) {
      addTag(candidate.id, newTag)
      setNewTag('')
    }
  }

  const handleSaveNotes = () => {
    updateNotes(candidate.id, notes)
  }

  const handleStatusChange = (
    status: 'interested' | 'contacted' | 'rejected' | 'hired'
  ) => {
    updateStatus(candidate.id, status)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(
              [
                { value: 'interested', label: 'Interested' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'hired', label: 'Hired' },
              ] as const
            ).map(({ value, label }) => (
              <Button
                key={value}
                variant={candidate.status === value ? 'default' : 'outline'}
                onClick={() => handleStatusChange(value)}
                className="text-sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1 flex-wrap">
            {candidate.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => removeTag(candidate.id, tag)}
                  className="ml-1 hover:opacity-70"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Add Tag</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Custom tag..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="sm">
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Suggestions</p>
            <div className="flex gap-1 flex-wrap">
              {COMMON_TAGS
                .filter(tag => !candidate.tags.includes(tag))
                .slice(0, 4)
                .map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(candidate.id, tag)}
                    className="text-xs h-7"
                  >
                    + {tag}
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add personal notes about this candidate..."
            className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button onClick={handleSaveNotes} className="w-full">
            Save Notes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
