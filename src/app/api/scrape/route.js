import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const AWARDS_FILE = path.join(process.cwd(), 'src/data/awards.json')

const SCRAPE_SOURCES = [
  {
    name: 'Design Awards Network',
    selectors: {
      title: '.award-title',
      link: '.award-link',
      deadline: '.deadline',
    }
  },
  {
    name: 'Core77 Competitions',
    url: 'https://core77.com/competitions',
  },
  {
    name: 'AIGA Events',
    url: 'https://www.aiga.org/events',
  },
  {
    name: 'Dribbble Jobs',
    url: 'https://dribbble.com/jobs',
  },
  {
    name: 'Design Week Events',
    url: 'https://www.designweek.co.uk/events/',
  }
]

async function simulateScrape(source) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))
  
  const newOpportunities = [
    {
      name: `${source.name} Featured Award`,
      category: 'Design',
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
      type: 'judging',
      deadline: 'Rolling',
      description: `New opportunity from ${source.name}`,
      status: 'Not started',
    }
  ]
  
  return newOpportunities
}

export async function POST(request) {
  try {
    const awardsData = JSON.parse(fs.readFileSync(AWARDS_FILE, 'utf8'))
    const scrapedResults = []

    for (const source of SCRAPE_SOURCES) {
      try {
        const opportunities = await simulateScrape(source)
        scrapedResults.push({
          source: source.name,
          found: opportunities.length,
          opportunities,
        })
      } catch (error) {
        console.error(`Failed to scrape ${source.name}:`, error)
        scrapedResults.push({
          source: source.name,
          found: 0,
          error: error.message,
        })
      }
    }

    awardsData.lastUpdated = new Date().toISOString()
    awardsData.lastScrapeResults = scrapedResults

    fs.writeFileSync(AWARDS_FILE, JSON.stringify(awardsData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Scrape completed',
      lastUpdated: awardsData.lastUpdated,
      results: scrapedResults,
      totalFound: scrapedResults.reduce((acc, r) => acc + r.found, 0),
    })
  } catch (error) {
    console.error('Scrape failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const awardsData = JSON.parse(fs.readFileSync(AWARDS_FILE, 'utf8'))
    
    return NextResponse.json({
      lastUpdated: awardsData.lastUpdated,
      lastScrapeResults: awardsData.lastScrapeResults || null,
      awardsCount: awardsData.awards.length,
      sources: SCRAPE_SOURCES.map(s => s.name),
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 })
  }
}
