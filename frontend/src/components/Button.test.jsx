
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'

describe('Button component', () => {
  it('renders its child text', () => {
    render(<Button>Click me</Button>)

    expect(
      screen.getByRole('button', { name: 'Click me' })
    ).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button', { name: 'Click me' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Disabled button
      </Button>
    )

    const button = screen.getByRole('button', {
      name: 'Disabled button',
    })

    expect(button).toBeDisabled()

    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('uses the requested button type', () => {
    render(<Button type="submit">Submit</Button>)

    expect(screen.getByRole('button', { name: 'Submit' }))
      .toHaveAttribute('type', 'submit')
  })

  it('applies the requested variant and custom class', () => {
    render(
      <Button variant="danger" className="custom-class">
        Delete
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Delete' })

    expect(button).toHaveClass('bg-red-600')
    expect(button).toHaveClass('custom-class')
  })
})
