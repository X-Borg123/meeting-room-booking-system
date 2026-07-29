import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EmptyState from '../../src/components/common/EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Nothing here yet" />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<EmptyState title="Empty" />)
    expect(screen.queryByText('Nothing here yet')).not.toBeInTheDocument()
  })
})
