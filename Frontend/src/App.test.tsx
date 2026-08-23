import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import App from './App'

beforeEach(() => {
  window.history.pushState({}, '', '/')
})

test('shows the Home screen at the root route', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'MicroSift' })).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: 'Log in' })).toHaveLength(2)
  screen.getAllByRole('link', { name: 'Log in' }).forEach((link) => {
    expect(link).toHaveAttribute('href', '/login')
  })
})

test('logs in with the demo credentials and opens the dashboard', () => {
  window.history.pushState({}, '', '/login')
  render(<App />)

  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: '12345' } })
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
})

test('shows an empty dashboard shell at the dashboard route', () => {
  window.history.pushState({}, '', '/dashboard')
  render(<App />)

  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  expect(screen.getAllByText('No data yet.')).toHaveLength(3)
})

test('rejects invalid demo credentials', () => {
  window.history.pushState({}, '', '/login')
  render(<App />)

  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
})
