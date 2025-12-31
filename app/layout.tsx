import './globals.css'

export const metadata = {
  title: 'Universal AI Agent Team',
  description: 'Professional analysis with proven methodologies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
