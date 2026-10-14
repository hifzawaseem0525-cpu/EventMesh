
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatCard from './StatCard'

describe('StatCard component', () => {
  it('displays the title and value', () => {
    render(<StatCard title="Total Events" value={24} />)

    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '24' })).toBeInTheDocument()
  })

  it('displays the subtitle when provided', () => {
    render(
      <StatCard
        title="Bookings"
        value={150}
        subtitle="Compared with last month"
      />
    )

    expect(screen.getByText('Compared with last month')).toBeInTheDocument()
  })

  it('does not display a subtitle when omitted', () => {
    render(<StatCard title="Bookings" value={150} />)

    expect(screen.queryByText('Compared with last month')).not.toBeInTheDocument()
  })

  it('displays a positive trend in green', () => {
    render(<StatCard title="Revenue" value="₹5,000" trend="+12%" />)

    const trend = screen.getByText('+12%')
    expect(trend).toBeInTheDocument()
    expect(trend).toHaveClass('text-green-600')
  })

  it('displays a negative trend in red', () => {
    render(<StatCard title="Revenue" value="₹4,000" trend="-8%" />)

    const trend = screen.getByText('-8%')
    expect(trend).toBeInTheDocument()
    expect(trend).toHaveClass('text-red-500')
  })

  it('does not display a trend when omitted', () => {
    render(<StatCard title="Revenue" value="₹5,000" />)

    expect(screen.queryByText('+12%')).not.toBeInTheDocument()
  })
})
