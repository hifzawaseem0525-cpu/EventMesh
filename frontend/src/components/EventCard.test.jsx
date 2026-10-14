
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import EventCard from './EventCard'

const sampleEvent = {
  id: 42,
  title: 'Tech Fest',
  category: 'Technology',
  date: '2026-11-15T10:00:00',
  location: 'Bengaluru',
  price: 250,
  image: '/tech-fest.jpg',
}

function renderEventCard(event = sampleEvent) {
  return render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>
  )
}

describe('EventCard component', () => {
  it('displays the event title and category', () => {
    renderEventCard()

    expect(screen.getByRole('heading', { name: 'Tech Fest' })).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('displays the event image with the event title as alt text', () => {
    renderEventCard()

    const image = screen.getByRole('img', { name: 'Tech Fest' })
    expect(image).toHaveAttribute('src', '/tech-fest.jpg')
  })

  it('uses a placeholder image when no image is provided', () => {
    renderEventCard({ ...sampleEvent, image: '' })

    expect(screen.getByRole('img', { name: 'Tech Fest' }))
      .toHaveAttribute('src', '/placeholder-event.jpg')
  })

  it('displays the event location', () => {
    renderEventCard()

    expect(screen.getByText('Bengaluru')).toBeInTheDocument()
  })

  it('displays the paid event price', () => {
    renderEventCard()

    expect(screen.getByText('From ₹250')).toBeInTheDocument()
  })

  it('displays Free when the event price is zero', () => {
    renderEventCard({ ...sampleEvent, price: 0 })

    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('links to the correct event details page', () => {
    renderEventCard()

    expect(screen.getByRole('link', { name: /View Event/ }))
      .toHaveAttribute('href', '/event/42')
  })

  it('displays the original date when the date is invalid', () => {
    renderEventCard({ ...sampleEvent, date: 'not-a-valid-date' })

    expect(screen.getByText('not-a-valid-date')).toBeInTheDocument()
  })
})
