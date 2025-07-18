import { describe, it, expect, vi } from 'vitest';
import { customRender } from '../../test/renderHelpers';
import { screen } from '@testing-library/react';
import { mockUser } from '../../test/utils';
import Layout from '../Layout';

// Mock the auth context
vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({
    gameUser: mockUser,
    signOut: vi.fn(),
  }),
}));
vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Layout', () => {
  it('renders the game title', () => {
    customRender(
      <Layout>
        <div>Test content</div>
      </Layout>
    );
    
    expect(screen.getByText('🐦 Pigeon Prestige')).toBeInTheDocument();
  });

  it('displays user information', () => {
    customRender(
      <Layout>
        <div>Test content</div>
      </Layout>
    );
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Level 1 • $ 1,000')).toBeInTheDocument();
  });

  it('renders navigation menu items', () => {
    customRender(
      <Layout>
        <div>Test content</div>
      </Layout>
    );
    
    expect(screen.getAllByText('Home')[0]).toBeInTheDocument();
    expect(screen.getByText('Pigeons')).toBeInTheDocument();
    expect(screen.getByText('Breeding')).toBeInTheDocument();
    expect(screen.getByText('Racing')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Market')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    customRender(
      <Layout>
        <div>Test content</div>
      </Layout>
    );
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders children content', () => {
    customRender(
      <Layout>
        <div data-testid="test-content">Test content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
}); 