import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({
  auth: { isAuthenticated: false, loading: false, user: null },
  location: { pathname: '/dashboard' },
}));

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => routeState.auth,
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, state, replace }) => ({ to, state, replace }),
  useLocation: () => routeState.location,
}));

vi.mock('../src/components/common/Loader', () => ({
  default: () => null,
}));

import ProtectedRoute from '../src/routes/ProtectedRoute';

describe('ProtectedRoute email verification gate', () => {
  beforeEach(() => {
    routeState.auth = { isAuthenticated: false, loading: false, user: null };
    routeState.location = { pathname: '/dashboard' };
  });

  it('blocks an unverified authenticated user and preserves the attempted route', () => {
    routeState.auth = {
      isAuthenticated: true,
      loading: false,
      user: { uid: 'uid-1', emailVerified: false },
    };

    expect(ProtectedRoute({ children: 'dashboard' }).props).toEqual({
      to: '/login',
      state: { from: { pathname: '/dashboard' } },
      replace: true,
    });
  });

  it('continues blocking the same unverified user after a route transition', () => {
    routeState.auth = {
      isAuthenticated: true,
      loading: false,
      user: { uid: 'uid-1', emailVerified: false },
    };
    routeState.location = { pathname: '/events' };

    expect(ProtectedRoute({ children: 'events' }).props).toMatchObject({
      to: '/login',
      state: { from: { pathname: '/events' } },
    });
  });

  it('allows a verified authenticated user through', () => {
    routeState.auth = {
      isAuthenticated: true,
      loading: false,
      user: { uid: 'uid-1', emailVerified: true },
    };

    expect(ProtectedRoute({ children: 'dashboard' })).toBe('dashboard');
  });
});