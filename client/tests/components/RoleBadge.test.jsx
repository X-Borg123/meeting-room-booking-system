import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RoleBadge from '../../src/components/common/RoleBadge'

describe('RoleBadge', () => {
  it('renders admin badge', () => {
    render(<RoleBadge role="admin" />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renders owner badge', () => {
    render(<RoleBadge role="owner" />)
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  it('renders user badge', () => {
    render(<RoleBadge role="user" />)
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('falls back to User for unknown role', () => {
    render(<RoleBadge role="unknown" />)
    expect(screen.getByText('User')).toBeInTheDocument()
  })
})
