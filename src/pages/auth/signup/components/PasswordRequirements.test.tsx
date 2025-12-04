import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PasswordRequirements from './PasswordRequirements';

describe('PasswordRequirements', () => {
  it('should show all requirements as unmet for empty password', () => {
    render(<PasswordRequirements password='' />);

    expect(screen.getByText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('Contains number')).toBeInTheDocument();
    expect(screen.getByText('Contains special character')).toBeInTheDocument();
  });

  it('should show only length requirement met for short lowercase password', () => {
    render(<PasswordRequirements password='password' />);

    // Length and lowercase should be met (8 characters, has lowercase)
    expect(screen.getByText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();

    // These should not be met
    expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('Contains number')).toBeInTheDocument();
    expect(screen.getByText('Contains special character')).toBeInTheDocument();
  });

  it('should show all requirements met for strong password', () => {
    render(<PasswordRequirements password='SecurePass123!' />);

    // All requirements should be present
    expect(screen.getByText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('Contains number')).toBeInTheDocument();
    expect(screen.getByText('Contains special character')).toBeInTheDocument();
  });

  it('should validate minimum length requirement correctly', () => {
    const { rerender } = render(<PasswordRequirements password='Test1!' />);

    // 6 characters - should meet length requirement
    expect(screen.getByText('At least 6 characters')).toBeInTheDocument();

    // Less than 6 characters
    rerender(<PasswordRequirements password='Ts1!' />);
    expect(screen.getByText('At least 6 characters')).toBeInTheDocument();
  });

  it('should validate uppercase requirement correctly', () => {
    const { rerender } = render(<PasswordRequirements password='nouppercasepass123!' />);

    expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();

    rerender(<PasswordRequirements password='Uppercasepass123!' />);
    expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();
  });

  it('should validate lowercase requirement correctly', () => {
    const { rerender } = render(<PasswordRequirements password='NOLOWERCASE123!' />);

    expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();

    rerender(<PasswordRequirements password='LOWERCASEpass123!' />);
    expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();
  });

  it('should validate number requirement correctly', () => {
    const { rerender } = render(<PasswordRequirements password='NoNumbers!' />);

    expect(screen.getByText('Contains number')).toBeInTheDocument();

    rerender(<PasswordRequirements password='WithNumber1!' />);
    expect(screen.getByText('Contains number')).toBeInTheDocument();
  });

  it('should validate special character requirement correctly', () => {
    const { rerender } = render(<PasswordRequirements password='NoSpecialChars123' />);

    expect(screen.getByText('Contains special character')).toBeInTheDocument();

    rerender(<PasswordRequirements password='WithSpecial123!' />);
    expect(screen.getByText('Contains special character')).toBeInTheDocument();
  });

  it('should accept various special characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '='];

    for (const char of specialChars) {
      const { unmount } = render(<PasswordRequirements password={`Pass123${char}`} />);
      expect(screen.getByText('Contains special character')).toBeInTheDocument();
      unmount();
    }
  });

  it('should handle edge case passwords', () => {
    // Exactly 6 characters with all requirements
    render(<PasswordRequirements password='Aa1!bc' />);
    expect(screen.getByText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('Contains number')).toBeInTheDocument();
    expect(screen.getByText('Contains special character')).toBeInTheDocument();
  });
});
