import { SavedCandidate } from '../types/developer'

/**
 * Export saved candidates to CSV format
 */
export function exportCandidatesCSV(candidates: SavedCandidate[]): void {
  // Define CSV headers
  const headers = [
    'Name',
    'GitHub URL',
    'Location',
    'Company',
    'Top Languages',
    'Followers',
    'Total Stars',
    'Email',
    'Recruiter Score',
    'Status',
    'Tags',
    'Notes',
    'Saved Date',
  ]

  // Map candidates to CSV rows
  const rows = candidates.map(candidate => [
    escapeCSVField(candidate.developer.name || candidate.developer.login),
    candidate.developer.github_url,
    escapeCSVField(candidate.developer.location || 'N/A'),
    escapeCSVField(candidate.developer.company || 'N/A'),
    candidate.developer.top_languages?.join('; ') || 'N/A',
    candidate.developer.followers.toString(),
    candidate.developer.total_stars?.toString() || '0',
    escapeCSVField(candidate.developer.email || 'N/A'),
    candidate.recruiter_score.toString(),
    candidate.status,
    escapeCSVField(candidate.tags.join('; ')),
    escapeCSVField(candidate.notes),
    new Date(candidate.saved_at).toLocaleDateString(),
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  // Create blob and download
  downloadCSV(csvContent, 'bountylab-candidates.csv')
}

/**
 * Escape CSV field values that contain commas, quotes, or newlines
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * Trigger CSV file download
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export all data as JSON for backup
 */
export function exportCandidatesJSON(candidates: SavedCandidate[]): void {
  const jsonContent = JSON.stringify(candidates, null, 2)
  const blob = new Blob([jsonContent], {
    type: 'application/json;charset=utf-8;',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'bountylab-candidates.json')
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
