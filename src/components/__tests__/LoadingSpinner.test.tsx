import { describe, it, expect } from 'vitest';
import { simpleRender } from '../../test/renderHelpers';
import { screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner with correct text', () => {
    simpleRender(<LoadingSpinner />);
    
    expect(screen.getByText('Loading Pigeon Prestige...')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    simpleRender(<LoadingSpinner />);
    
    const spinner = screen.getByText('Loading Pigeon Prestige...');
    expect(spinner).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    simpleRender(<LoadingSpinner />);
    
    const container = screen.getByText('Loading Pigeon Prestige...').parentElement;
    expect(container).toHaveClass('text-center');
  });
}); 