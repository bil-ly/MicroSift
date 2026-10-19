import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { accessToken, initializeAuth, keycloak } from './auth'
import App from './App'

vi.mock('./auth', () => ({
  initializeAuth: vi.fn(),
  accessToken: vi.fn(),
  keycloak: { login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
  window.history.pushState({}, '', '/')
  vi.mocked(initializeAuth).mockResolvedValue(false)
  vi.mocked(accessToken).mockResolvedValue('signed-access-token')
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => vi.unstubAllGlobals())

test('shows the home screen', async () => {
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'MicroSift' })).toBeInTheDocument()
})

test('sends login and registration to Keycloak without collecting passwords', async () => {
  window.history.pushState({}, '', '/login')
  render(<App />)
  fireEvent.click(await screen.findByRole('button', { name: 'Continue with Keycloak' }))
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
  expect(keycloak.login).toHaveBeenCalled()
  expect(keycloak.register).toHaveBeenCalled()
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
})

test('does not expose the dashboard to an unauthenticated user', async () => {
  window.history.pushState({}, '', '/dashboard')
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
  expect(fetch).not.toHaveBeenCalled()
})

test('shows pending status without dashboard data', async () => {
  vi.mocked(initializeAuth).mockResolvedValue(true)
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ username: 'alice', approval: 'pending' }),
  } as Response)
  window.history.pushState({}, '', '/dashboard')
  render(<App />)
  expect(await screen.findByText('Email verified. Awaiting admin approval.')).toBeInTheDocument()
  expect(screen.queryByText('No data yet.')).not.toBeInTheDocument()
  expect(fetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({
    headers: { Authorization: 'Bearer signed-access-token' },
  }))
})

test('shows dashboard data only after the backend confirms approval', async () => {
  vi.mocked(initializeAuth).mockResolvedValue(true)
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ username: 'alice', approval: 'approved' }),
  } as Response)
  window.history.pushState({}, '', '/dashboard')
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('No data yet.')).toHaveLength(3))
  expect(screen.getByRole('status')).toHaveTextContent('Signed in as alice')
})
