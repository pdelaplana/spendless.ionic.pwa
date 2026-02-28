import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MainMenuContent from './MainMenuContent';

vi.mock('@/providers/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { displayName: 'Test User', email: 'test@example.com' },
    updatePhotoUrl: vi.fn(),
    signout: vi.fn(),
  })),
}));

vi.mock('@/hooks', () => ({
  usePrompt: vi.fn(() => ({
    showConfirmPrompt: vi.fn(),
  })),
}));

vi.mock('@/components/shared', async () => {
  const actual = await vi.importActual<typeof import('@/components/shared')>(
    '@/components/shared',
  );
  return {
    ...actual,
    ProfilePhoto: () => null,
    PwaInstallPrompt: () => null,
  };
});

describe('MainMenuContent', () => {
  it('renders a Notifications section heading', () => {
    render(<MainMenuContent />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders the Inbox navigation item', () => {
    render(<MainMenuContent />);
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('renders Inbox above Recurring Spending', () => {
    render(<MainMenuContent />);

    const inbox = screen.getByText('Inbox');
    const recurring = screen.getByText('Recurring Spending');

    // DOCUMENT_POSITION_FOLLOWING means recurring comes after inbox in the DOM
    const position = inbox.compareDocumentPosition(recurring);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the Recurring Spending navigation item', () => {
    render(<MainMenuContent />);
    expect(screen.getByText('Recurring Spending')).toBeInTheDocument();
  });
});
