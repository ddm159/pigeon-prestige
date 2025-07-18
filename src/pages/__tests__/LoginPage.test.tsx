import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../../test/renderHelpers';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage';

// Mock the auth context
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sign In Mode', () => {
    it('renders sign in form by default', () => {
      render(<LoginPage />);
      
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('handles sign in form submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValueOnce({});
      
      render(<LoginPage />);
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('displays error message on sign in failure', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      render(<LoginPage />);
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up Mode', () => {
    it('switches to sign up mode when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('handles sign up form submission', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValueOnce({});
      
      render(<LoginPage />);
      
      // Switch to sign up mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      // Fill form
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser');
      });
    });

    it('displays error message on sign up failure', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValueOnce(new Error('Email already exists'));
      
      render(<LoginPage />);
      
      // Switch to sign up mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      // Fill form
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('requires email and password for sign in', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);
      
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('requires username, email and password for sign up', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      
      // Switch to sign up mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      const signUpButton = screen.getByRole('button', { name: /create account/i });
      await user.click(signUpButton);
      
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: 'Eye' }); // Eye icon button
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner during sign in', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<LoginPage />);
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      const submitButton = screen.getByRole('button', { name: '' });
      expect(submitButton).toBeDisabled();
    });

    it('shows loading spinner during sign up', async () => {
      const user = userEvent.setup();
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<LoginPage />);
      
      // Switch to sign up mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      
      const submitButton = screen.getByRole('button', { name: '' });
      expect(submitButton).toBeDisabled();
    });
  });
}); 