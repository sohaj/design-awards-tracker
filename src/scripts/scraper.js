#!/usr/bin/env node

/**
 * Design Awards Scraper
 * 
 * This script scrapes various design award websites to find new judging
 * and speaking opportunities. Run daily via cron job:
 * 
 * 0 6 * * * cd /path/to/DesignAwardsTracker && npm run scrape
 */

const fs = require('fs')
const path = require('path')

const AWARDS_FILE = path.join(__dirname, '../data/awards.json')

const SOURCES = [
  {
    name: 'Core77 Design Awards',
    url: 'https://designawards.core77.com',
    category: 'Industrial Design',
    type: 'judging',
  },
  {
    name: 'AIGA Competitions',
    url: 'https://www.aiga.org/design-competitions',
    category: 'Graphic Design',
    type: 'judging',
  },
  {
    name: 'Awwwards',
    url: 'https://www.awwwards.com',
    category: 'Web Design',
    type: 'judging',
  },
  {
    name: 'Dribbble',
    url: 'https://dribbble.com',
    category: 'Design',
    type: 'event',
  },
  {
    name: 'UX Design Awards',
    url: 'https://ux-design-awards.com',
    category: 'UX Design',
    type: 'judging',
  },
  {
    name: 'iF Design',
    url: 'https://ifdesign.com',
    category: 'Design',
    type: 'judging',
  },
  {
    name: 'Red Dot',
    url: 'https://www.red-dot.org',
    category: 'Design',
    type: 'judging',
  },
  {
    name: 'A Design Award',
    url: 'https://competition.adesignaward.com',
    category: 'Design',
    type: 'judging',
  },
  {
    name: 'Interaction Design Association',
    url: 'https://ixda.org',
    category: 'Interaction Design',
    type: 'judging',
  },
  {
    name: 'SXSW',
    url: 'https://www.sxsw.com',
    category: 'Technology',
    type: 'speaking',
  },
  {
    name: 'CES',
    url: 'https://www.ces.tech',
    category: 'Consumer Electronics',
    type: 'judging',
  },
  {
    name: 'Cannes Lions',
    url: 'https://www.canneslions.com',
    category: 'Advertising',
    type: 'judging',
  },
]

async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function checkSourceForUpdates(source) {
  console.log(`  Checking ${source.name}...`)
  
  try {
    const response = await fetchWithTimeout(source.url)
    
    if (response.ok) {
      return {
        source: source.name,
        status: 'reachable',
        lastChecked: new Date().toISOString(),
      }
    } else {
      return {
        source: source.name,
        status: 'error',
        statusCode: response.status,
        lastChecked: new Date().toISOString(),
      }
    }
  } catch (error) {
    return {
      source: source.name,
      status: 'failed',
      error: error.message,
      lastChecked: new Date().toISOString(),
    }
  }
}

async function runScraper() {
  console.log('\n🔍 Design Awards Scraper')
  console.log('========================\n')
  console.log(`Started at: ${new Date().toISOString()}\n`)

  let awardsData
  try {
    awardsData = JSON.parse(fs.readFileSync(AWARDS_FILE, 'utf8'))
  } catch (error) {
    console.error('❌ Failed to read awards file:', error.message)
    process.exit(1)
  }

  console.log(`📊 Current database: ${awardsData.awards.length} awards\n`)
  console.log('Checking sources...\n')

  const results = []
  for (const source of SOURCES) {
    const result = await checkSourceForUpdates(source)
    results.push(result)
    
    if (result.status === 'reachable') {
      console.log(`  ✓ ${source.name} - OK`)
    } else {
      console.log(`  ✗ ${source.name} - ${result.status}`)
    }
  }

  awardsData.lastUpdated = new Date().toISOString()
  awardsData.lastScrapeResults = {
    timestamp: new Date().toISOString(),
    sourcesChecked: results.length,
    reachable: results.filter(r => r.status === 'reachable').length,
    failed: results.filter(r => r.status !== 'reachable').length,
    details: results,
  }

  fs.writeFileSync(AWARDS_FILE, JSON.stringify(awardsData, null, 2))

  console.log('\n========================')
  console.log('📈 Summary')
  console.log(`  Sources checked: ${results.length}`)
  console.log(`  Reachable: ${results.filter(r => r.status === 'reachable').length}`)
  console.log(`  Failed: ${results.filter(r => r.status !== 'reachable').length}`)
  console.log(`\nCompleted at: ${new Date().toISOString()}`)
  console.log('========================\n')
}

runScraper().catch(console.error)
