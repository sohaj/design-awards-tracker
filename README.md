# Design Awards Tracker

A clean, minimal website to track design awards, competitions, judging opportunities, and speaking events. Built for designers pursuing EB-1A visa applications.

## Features

- **32+ Design Awards** - Curated list of judging and speaking opportunities
- **Smart Filtering** - Filter by difficulty, category, type, and status
- **Search** - Quick search across all awards
- **Auto-Updates** - Daily scraping for new opportunities
- **Dark Mode** - Automatic light/dark theme support
- **Responsive** - Works on all devices

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Daily Auto-Updates

The website includes a scraper that checks award sources daily. Set up a cron job:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 6 AM
0 6 * * * cd /path/to/DesignAwardsTracker && npm run scrape >> /var/log/awards-scraper.log 2>&1
```

Or manually trigger an update:

```bash
npm run scrape
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Deploy automatically

For daily scraping on Vercel, use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs):

```json
// vercel.json
{
  "crons": [{
    "path": "/api/scrape",
    "schedule": "0 6 * * *"
  }]
}
```

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Data Structure

Awards are stored in `src/data/awards.json`:

```json
{
  "id": 1,
  "name": "Award Name",
  "link": "https://apply.example.com",
  "deadline": "Rolling",
  "difficulty": "Easy|Medium|Hard",
  "status": "Not started|Completed",
  "category": "Design",
  "type": "judging|speaking|event",
  "description": "Brief description"
}
```

## Adding New Awards

1. Edit `src/data/awards.json`
2. Add a new entry following the structure above
3. The website will automatically pick up the changes

## Tech Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Node.js** - Backend scraping

## Project Structure

```
DesignAwardsTracker/
├── src/
│   ├── app/
│   │   ├── api/scrape/    # API for scraping
│   │   ├── globals.css    # Global styles
│   │   ├── layout.js      # Root layout
│   │   └── page.js        # Main page
│   ├── data/
│   │   └── awards.json    # Awards database
│   └── scripts/
│       └── scraper.js     # Daily scraper
├── public/
├── package.json
├── tailwind.config.js
└── README.md
```

## License

MIT
