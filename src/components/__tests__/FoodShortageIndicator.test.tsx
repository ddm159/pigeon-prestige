// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FoodShortageIndicator from '../FoodShortageIndicator';

describe('FoodShortageIndicator', () => {
  it('should not render when food shortage streak is 0', () => {
    render(
      <FoodShortageIndicator 
        foodShortageStreak={0} 
        currentHealth={100} 
      />
    );
    
    expect(screen.queryByText('0d')).not.toBeInTheDocument();
  });

  it('should render low severity indicator correctly', () => {
    render(
      <FoodShortageIndicator 
        foodShortageStreak={1} 
        currentHealth={95} 
      />
    );
    
    expect(screen.getByText('1d')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('should render medium severity indicator correctly', () => {
    render(
      <FoodShortageIndicator 
        foodShortageStreak={3} 
        currentHealth={85} 
      />
    );
    
    expect(screen.getByText('3d')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should render high severity indicator correctly', () => {
    render(
      <FoodShortageIndicator 
        foodShortageStreak={5} 
        currentHealth={70} 
      />
    );
    
    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('should render critical severity indicator correctly', () => {
    render(
      <FoodShortageIndicator 
        foodShortageStreak={10} 
        currentHealth={45} 
      />
    );
    
    expect(screen.getByText('10d')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <FoodShortageIndicator 
        foodShortageStreak={2} 
        currentHealth={90} 
        className="custom-class"
      />
    );
    
    const indicator = screen.getByText('2d').closest('div');
    expect(indicator).toHaveClass('custom-class');
  });
}); 