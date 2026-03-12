import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateRecruiterScore, DEFAULT_WEIGHTS } from '../utils/scoring';
const STORAGE_KEY = 'bountylab_candidates';
export const useCandidateStore = create()(persist((set, get) => ({
    candidates: [],
    weights: DEFAULT_WEIGHTS,
    addCandidate: (developer) => {
        const store = get();
        // Prevent duplicates
        if (store.isCandidateSaved(developer.id)) {
            return;
        }
        const newCandidate = {
            id: developer.id,
            developer,
            tags: [],
            notes: '',
            status: 'interested',
            recruiter_score: calculateRecruiterScore(developer, store.weights),
            saved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        set(state => ({
            candidates: [...state.candidates, newCandidate],
        }));
    },
    removeCandidate: (developerId) => {
        set(state => ({
            candidates: state.candidates.filter(c => c.id !== developerId),
        }));
    },
    updateCandidate: (id, updates) => {
        set(state => ({
            candidates: state.candidates.map(c => c.id === id
                ? {
                    ...c,
                    ...updates,
                    updated_at: new Date().toISOString(),
                }
                : c),
        }));
    },
    getCandidateById: (developerId) => {
        return get().candidates.find(c => c.id === developerId);
    },
    isCandidateSaved: (developerId) => {
        return get().candidates.some(c => c.id === developerId);
    },
    updateNotes: (developerId, notes) => {
        get().updateCandidate(developerId, { notes });
    },
    addTag: (developerId, tag) => {
        const candidate = get().getCandidateById(developerId);
        if (candidate && !candidate.tags.includes(tag)) {
            get().updateCandidate(developerId, {
                tags: [...candidate.tags, tag],
            });
        }
    },
    removeTag: (developerId, tag) => {
        const candidate = get().getCandidateById(developerId);
        if (candidate) {
            get().updateCandidate(developerId, {
                tags: candidate.tags.filter(t => t !== tag),
            });
        }
    },
    updateStatus: (developerId, status) => {
        get().updateCandidate(developerId, { status });
    },
    updateWeights: (weights) => {
        const currentWeights = get().weights;
        const newWeights = { ...currentWeights, ...weights };
        // Recalculate all scores with new weights
        set(state => ({
            weights: newWeights,
            candidates: state.candidates.map(c => ({
                ...c,
                recruiter_score: calculateRecruiterScore(c.developer, newWeights),
            })),
        }));
    },
    clearAllCandidates: () => {
        set({ candidates: [] });
    },
    getCandidates: () => {
        return get().candidates;
    },
    getCandidatesByStatus: (status) => {
        return get().candidates.filter(c => c.status === status);
    },
}), {
    name: STORAGE_KEY,
}));
