'use client'

import { useState, useMemo } from 'react'
import awardsData from '../data/awards.json'

const difficultyColors = {
  'Easy': 'badge-easy',
  'Medium': 'badge-medium',
  'Hard': 'badge-hard',
}

const typeIcons = {
  'judging': '⚖️',
  'speaking': '🎤',
  'event': '🎪',
  'competition': '🏆',
}

function parseDeadline(deadline) {
  if (!deadline) return { date: null, isRolling: true }
  
  const lower = deadline.toLowerCase()
  if (lower.includes('rolling') || lower.includes('ongoing') || lower.includes('event-dependent')) {
    return { date: null, isRolling: true }
  }
  
  const monthMap = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  }
  
  const patterns = [
    /([a-z]+)\s*(\d{1,2})?\s*[-–]?\s*(\d{4})/i,
    /([a-z]+)\s+(\d{4})/i,
    /(\d{4})/,
  ]
  
  for (const pattern of patterns) {
    const match = deadline.match(pattern)
    if (match) {
      if (match[1] && monthMap[match[1].toLowerCase().substring(0, 3)] !== undefined) {
        const month = monthMap[match[1].toLowerCase().substring(0, 3)]
        const day = match[2] ? parseInt(match[2]) : 1
        const year = match[3] ? parseInt(match[3]) : (match[2] && match[2].length === 4 ? parseInt(match[2]) : 2026)
        return { date: new Date(year, month, day), isRolling: false }
      }
    }
  }
  
  const yearMatch = deadline.match(/20\d{2}/)
  if (yearMatch) {
    const quarterMatch = deadline.toLowerCase()
    let month = 0
    if (quarterMatch.includes('early')) month = 2
    else if (quarterMatch.includes('mid')) month = 5
    else if (quarterMatch.includes('late')) month = 9
    return { date: new Date(parseInt(yearMatch[0]), month, 1), isRolling: false }
  }
  
  return { date: null, isRolling: true }
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState('deadline')
  const [lastUpdated] = useState(awardsData.lastUpdated)

  const categories = useMemo(() => {
    const cats = [...new Set(awardsData.awards.map(a => a.category))]
    return ['All', ...cats.sort()]
  }, [])

  const difficulties = ['All', 'Easy', 'Medium', 'Hard']
  const types = ['All', 'judging', 'speaking', 'event']
  const statuses = ['All', 'Not started', 'Completed']

  const filteredAwards = useMemo(() => {
    let filtered = awardsData.awards.filter(award => {
      const matchesSearch = award.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           award.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           award.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDifficulty = selectedDifficulty === 'All' || award.difficulty === selectedDifficulty
      const matchesCategory = selectedCategory === 'All' || award.category === selectedCategory
      const matchesType = selectedType === 'All' || award.type === selectedType
      const matchesStatus = selectedStatus === 'All' || award.status === selectedStatus
      
      return matchesSearch && matchesDifficulty && matchesCategory && matchesType && matchesStatus
    })

    if (sortBy === 'deadline') {
      filtered.sort((a, b) => {
        const deadlineA = parseDeadline(a.deadline)
        const deadlineB = parseDeadline(b.deadline)
        
        if (deadlineA.isRolling && deadlineB.isRolling) return 0
        if (deadlineA.isRolling) return 1
        if (deadlineB.isRolling) return -1
        
        return deadlineA.date - deadlineB.date
      })
    } else if (sortBy === 'difficulty') {
      const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 }
      filtered.sort((a, b) => order[a.difficulty] - order[b.difficulty])
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category))
    }

    return filtered
  }, [searchQuery, selectedDifficulty, selectedCategory, selectedType, selectedStatus, sortBy])

  const stats = useMemo(() => ({
    total: awardsData.awards.length,
    completed: awardsData.awards.filter(a => a.status === 'Completed').length,
    easy: awardsData.awards.filter(a => a.difficulty === 'Easy').length,
    medium: awardsData.awards.filter(a => a.difficulty === 'Medium').length,
    hard: awardsData.awards.filter(a => a.difficulty === 'Hard').length,
  }), [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
    })
  }

  const hasActiveFilters = selectedDifficulty !== 'All' || selectedCategory !== 'All' || 
                           selectedType !== 'All' || selectedStatus !== 'All'

  const clearFilters = () => {
    setSelectedDifficulty('All')
    setSelectedCategory('All')
    setSelectedType('All')
    setSelectedStatus('All')
    setSearchQuery('')
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Design Awards Tracker</h1>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {stats.total} opportunities · {stats.completed} applied
              </p>
            </div>
            <div className="text-xs text-[var(--muted)]">
              Updated {formatDate(lastUpdated)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search awards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Difficulties</option>
            {difficulties.slice(1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="judging">⚖️ Judging</option>
            <option value="speaking">🎤 Speaking</option>
            <option value="event">🎪 Event</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Not started">Not started</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[var(--muted)]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="deadline">Deadline</option>
              <option value="difficulty">Difficulty</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-[var(--muted)]">
          {filteredAwards.length} {filteredAwards.length === 1 ? 'result' : 'results'}
        </div>

        {/* Awards List */}
        <div className="space-y-3">
          {filteredAwards.map((award) => (
            <AwardRow key={award.id} award={award} />
          ))}
        </div>

        {filteredAwards.length === 0 && (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">🔍</div>
            <div className="font-medium">No awards found</div>
            <div className="text-sm text-[var(--muted)] mt-1">Try adjusting your filters</div>
          </div>
        )}
      </div>
    </main>
  )
}

function AwardRow({ award }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(award.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const deadlineInfo = parseDeadline(award.deadline)
  const isUrgent = deadlineInfo.date && !deadlineInfo.isRolling && 
                   (deadlineInfo.date - new Date()) < 30 * 24 * 60 * 60 * 1000

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition-colors">
      <div className="text-2xl w-10 text-center flex-shrink-0">
        {typeIcons[award.type] || '🏆'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{award.name}</h3>
          {award.status === 'Completed' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
              Applied
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className={`${difficultyColors[award.difficulty]} badge`}>{award.difficulty}</span>
          <span>{award.category}</span>
        </div>
      </div>

      <div className={`text-sm flex-shrink-0 w-32 text-right ${isUrgent ? 'text-red-500 font-medium' : 'text-[var(--muted)]'}`}>
        {award.deadline}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={award.link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Apply
        </a>
        <button
          onClick={handleCopyLink}
          className="p-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--card-hover)] transition-colors"
          title="Copy link"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  )
}
