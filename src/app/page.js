'use client'

import { useState, useMemo, useEffect } from 'react'
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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState('difficulty')
  const [lastUpdated, setLastUpdated] = useState(awardsData.lastUpdated)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

    if (sortBy === 'difficulty') {
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // On GitHub Pages (static), this triggers a visual refresh
    // Actual data updates happen via GitHub Actions daily rebuild
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdated(new Date().toISOString())
    setIsRefreshing(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Design Awards Tracker</h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Judging & Speaking Opportunities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot"></span>
                Updated {formatDate(lastUpdated)}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-xs text-[var(--muted)] mt-1">Total Awards</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-500">{stats.completed}</div>
            <div className="text-xs text-[var(--muted)] mt-1">Completed</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-500">{stats.easy}</div>
            <div className="text-xs text-[var(--muted)] mt-1">Easy</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.medium}</div>
            <div className="text-xs text-[var(--muted)] mt-1">Medium</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-red-500">{stats.hard}</div>
            <div className="text-xs text-[var(--muted)] mt-1">Hard</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search awards, categories, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Difficulty Filter */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2 block">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`filter-btn ${selectedDifficulty === diff ? 'filter-btn-active' : 'filter-btn-inactive'}`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`filter-btn ${selectedType === type ? 'filter-btn-active' : 'filter-btn-inactive'}`}
                >
                  {type === 'All' ? 'All' : `${typeIcons[type] || ''} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`filter-btn ${selectedStatus === status ? 'filter-btn-active' : 'filter-btn-inactive'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`filter-btn ${selectedCategory === cat ? 'filter-btn-active' : 'filter-btn-inactive'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="difficulty">Difficulty</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-[var(--muted)]">
          Showing {filteredAwards.length} of {awardsData.awards.length} opportunities
        </div>

        {/* Awards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAwards.map((award) => (
            <AwardCard key={award.id} award={award} />
          ))}
        </div>

        {filteredAwards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg font-medium">No awards found</div>
            <div className="text-sm text-[var(--muted)] mt-1">Try adjusting your filters or search query</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-[var(--muted)]">
            <p>Auto-updated daily with the latest design awards and opportunities</p>
            <p className="mt-2">Built for EB-1A visa applicants pursuing design excellence</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function AwardCard({ award }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(award.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base leading-tight group-hover:text-blue-500 transition-colors">
            {award.name}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{award.description}</p>
        </div>
        <span className="text-xl">{typeIcons[award.type] || '🏆'}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`badge ${difficultyColors[award.difficulty]}`}>
          {award.difficulty}
        </span>
        <span className="badge badge-category">
          {award.category}
        </span>
        {award.status === 'Completed' && (
          <span className="badge badge-completed">
            ✓ Applied
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{award.deadline}</span>
      </div>

      <div className="flex gap-2">
        <a
          href={award.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium text-center hover:opacity-90 transition-opacity"
        >
          Apply Now
        </a>
        <button
          onClick={handleCopyLink}
          className="px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--card-hover)] transition-colors"
          title="Copy link"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  )
}
