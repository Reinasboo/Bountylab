/**
 * Calculate composite recruiter score for a developer
 * based on multiple weighted factors
 */
export function calculateRecruiterScore(developer, weights) {
    // Normalize each component to 0-100 scale
    const devrankScore = normalizeDevRank(developer.devrank_score || 0);
    const starsScore = normalizeStars(developer.total_stars || 0);
    const activityScore = normalizeActivity(developer.recent_activity || 0);
    const followersScore = normalizeFollowers(developer.followers);
    // Apply weights and calculate weighted average
    const totalWeight = weights.devrank +
        weights.stars +
        weights.activity +
        weights.followers;
    if (totalWeight === 0)
        return 0;
    const score = (devrankScore * weights.devrank +
        starsScore * weights.stars +
        activityScore * weights.activity +
        followersScore * weights.followers) /
        totalWeight;
    return Math.round(score);
}
/**
 * Normalize DevRank score (typically 0-100) to 0-100 scale
 */
function normalizeDevRank(score) {
    return Math.min(score, 100);
}
/**
 * Normalize total stars to 0-100 scale
 * Using logarithmic scale: 0 stars = 0, 100000+ stars = 100
 */
function normalizeStars(stars) {
    if (stars === 0)
        return 0;
    if (stars >= 100000)
        return 100;
    // Logarithmic scale
    const log = Math.log10(stars + 1);
    const maxLog = Math.log10(100000 + 1);
    return (log / maxLog) * 100;
}
/**
 * Normalize recent activity (commits in last 30 days)
 * 0 commits = 0, 100+ commits = 100
 */
function normalizeActivity(commits) {
    if (commits === 0)
        return 0;
    if (commits >= 100)
        return 100;
    return (commits / 100) * 100;
}
/**
 * Normalize followers count to 0-100 scale
 * 0 followers = 0, 10000+ followers = 100
 */
function normalizeFollowers(followers) {
    if (followers === 0)
        return 0;
    if (followers >= 10000)
        return 100;
    // Logarithmic scale
    const log = Math.log10(followers + 1);
    const maxLog = Math.log10(10000 + 1);
    return (log / maxLog) * 100;
}
/**
 * Calculate match score between developer and job requirements
 * Returns 0-100 score
 */
export function calculateMatchScore(developer, requirements) {
    let score = 50; // Base score
    // Language match
    if (requirements.requiredLanguages && developer.top_languages) {
        const matchedLanguages = developer.top_languages.filter(lang => requirements.requiredLanguages.some(req => req.toLowerCase() === lang.toLowerCase()));
        const languageScore = (matchedLanguages.length / requirements.requiredLanguages.length) * 30;
        score += languageScore;
    }
    // Location match
    if (requirements.preferredLocation &&
        developer.location?.toLowerCase().includes(requirements.preferredLocation.toLowerCase())) {
        score += 10;
    }
    // Followers match
    if (requirements.minFollowers &&
        developer.followers >= requirements.minFollowers) {
        score += 10;
    }
    // DevRank match
    if (requirements.minDevRank &&
        (developer.devrank_score || 0) >= requirements.minDevRank) {
        score += 10;
    }
    return Math.min(score, 100);
}
/**
 * Rank developers based on scoring criteria
 */
export function rankDevelopers(developers, weights) {
    return developers
        .map(dev => ({
        ...dev,
        score: calculateRecruiterScore(dev, weights),
    }))
        .sort((a, b) => b.score - a.score);
}
/**
 * Default weights for recruiter scoring
 */
export const DEFAULT_WEIGHTS = {
    devrank: 30,
    stars: 25,
    activity: 25,
    followers: 20,
};
