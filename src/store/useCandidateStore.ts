import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SavedCandidate, Developer } from '../types/developer'
import { calculateRecruiterScore, DEFAULT_WEIGHTS, RankingWeights } from '../utils/scoring'

interface CandidateStore {
  candidates: SavedCandidate[]
  weights: RankingWeights

  // Candidate operations
  addCandidate: (developer: Developer) => void
  removeCandidate: (developerId: string) => void
  updateCandidate: (id: string, updates: Partial<SavedCandidate>) => void
  getCandidateById: (developerId: string) => SavedCandidate | undefined
  isCandidateSaved: (developerId: string) => boolean

  // Notes and tags
  updateNotes: (developerId: string, notes: string) => void
  addTag: (developerId: string, tag: string) => void
  removeTag: (developerId: string, tag: string) => void
  updateStatus: (
    developerId: string,
    status: 'interested' | 'contacted' | 'rejected' | 'hired'
  ) => void

  // Ranking weights
  updateWeights: (weights: Partial<RankingWeights>) => void

  // Bulk operations
  clearAllCandidates: () => void
  getCandidates: () => SavedCandidate[]
  getCandidatesByStatus: (
    status: 'interested' | 'contacted' | 'rejected' | 'hired'
  ) => SavedCandidate[]
}

const STORAGE_KEY = 'bountylab_candidates'

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set, get) => ({
      candidates: [],
      weights: DEFAULT_WEIGHTS,

      addCandidate: (developer: Developer) => {
        const store = get()

        // Prevent duplicates
        if (store.isCandidateSaved(developer.id)) {
          return
        }

        const newCandidate: SavedCandidate = {
          id: developer.id,
          developer,
          tags: [],
          notes: '',
          status: 'interested',
          recruiter_score: calculateRecruiterScore(
            developer,
            store.weights
          ),
          saved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        set(state => ({
          candidates: [...state.candidates, newCandidate],
        }))
      },

      removeCandidate: (developerId: string) => {
        set(state => ({
          candidates: state.candidates.filter(c => c.id !== developerId),
        }))
      },

      updateCandidate: (id: string, updates: Partial<SavedCandidate>) => {
        set(state => ({
          candidates: state.candidates.map(c =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : c
          ),
        }))
      },

      getCandidateById: (developerId: string) => {
        return get().candidates.find(c => c.id === developerId)
      },

      isCandidateSaved: (developerId: string) => {
        return get().candidates.some(c => c.id === developerId)
      },

      updateNotes: (developerId: string, notes: string) => {
        get().updateCandidate(developerId, { notes })
      },

      addTag: (developerId: string, tag: string) => {
        const candidate = get().getCandidateById(developerId)
        if (candidate && !candidate.tags.includes(tag)) {
          get().updateCandidate(developerId, {
            tags: [...candidate.tags, tag],
          })
        }
      },

      removeTag: (developerId: string, tag: string) => {
        const candidate = get().getCandidateById(developerId)
        if (candidate) {
          get().updateCandidate(developerId, {
            tags: candidate.tags.filter(t => t !== tag),
          })
        }
      },

      updateStatus: (
        developerId: string,
        status: 'interested' | 'contacted' | 'rejected' | 'hired'
      ) => {
        get().updateCandidate(developerId, { status })
      },

      updateWeights: (weights: Partial<RankingWeights>) => {
        const currentWeights = get().weights
        const newWeights = { ...currentWeights, ...weights }

        // Recalculate all scores with new weights
        set(state => ({
          weights: newWeights,
          candidates: state.candidates.map(c => ({
            ...c,
            recruiter_score: calculateRecruiterScore(c.developer, newWeights),
          })),
        }))
      },

      clearAllCandidates: () => {
        set({ candidates: [] })
      },

      getCandidates: () => {
        return get().candidates
      },

      getCandidatesByStatus: (status) => {
        return get().candidates.filter(c => c.status === status)
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
)
