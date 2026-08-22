import { Navigate, createBrowserRouter } from 'react-router-dom'
import { LivePage } from '../features/live/LivePage'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/live" replace /> },
  { path: '/live', element: <LivePage /> },
  { path: '/trades', element: <main className="desktop-placeholder">Trades</main> },
  { path: '/trades/:id', element: <main className="desktop-placeholder">Trade Detail</main> },
  { path: '/calendar', element: <main className="desktop-placeholder">Calendar</main> },
  { path: '/execution-quality', element: <main className="desktop-placeholder">Execution Quality</main> },
  { path: '/sizing', element: <main className="desktop-placeholder">Sizing</main> },
  { path: '/settings', element: <main className="desktop-placeholder">Settings</main> },
  { path: '/health', element: <main className="desktop-placeholder">System Health</main> },
])
