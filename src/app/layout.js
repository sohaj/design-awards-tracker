import './globals.css'

export const metadata = {
  title: 'Design Awards Tracker | Judging & Speaking Opportunities',
  description: 'Track design awards, competitions, and find judging and speaking opportunities. Updated daily with the latest design industry events.',
  keywords: 'design awards, judging opportunities, design competitions, UX awards, product design, speaking events',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
