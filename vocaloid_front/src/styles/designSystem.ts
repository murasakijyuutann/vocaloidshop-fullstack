/**
 * Enterprise Design System - VocaloCart
 * Consistent styling patterns for professional UI/UX
 */

export const colors = {
  // Primary palette
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#667eea15',
  
  // Neutral palette
  text: '#2d3748',
  textLight: '#4a5568',
  textMuted: '#718096',
  border: '#e2e8f0',
  borderHover: '#cbd5e0',
  background: '#f7fafc',
  backgroundHover: '#edf2f7',
  white: '#ffffff',
  
  // Status colors
  success: '#48bb78',
  error: '#f56565',
  warning: '#ed8936',
  info: '#4299e1',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

export const shadows = {
  sm: '0 2px 8px rgba(0,0,0,0.08)',
  md: '0 4px 15px rgba(0,0,0,0.08)',
  lg: '0 6px 20px rgba(0,0,0,0.12)',
  xl: '0 10px 40px rgba(0,0,0,0.1)',
  primary: '0 4px 15px rgba(102, 126, 234, 0.4)',
  primaryHover: '0 6px 25px rgba(102, 126, 234, 0.5)',
};

export const borderRadius = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  full: '50%',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  xxl: '1.5rem',
  xxxl: '2rem',
};

export const transitions = {
  fast: 'all 0.2s ease',
  normal: 'all 0.3s ease',
  slow: 'all 0.5s ease',
  cubic: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  mobile: '768px',
  tablet: '968px',
  desktop: '1200px',
};

export const animations = {
  fadeInUp: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideIn: `
    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
  `,
};

// Common styled component mixins
export const buttonPrimary = `
  padding: 1rem 2rem;
  background: ${colors.gradientPrimary};
  color: white;
  border: none;
  border-radius: ${borderRadius.md};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: ${transitions.normal};
  box-shadow: ${shadows.primary};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${shadows.primaryHover};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const inputStyle = `
  padding: 0.875rem 1rem;
  border: 2px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 1rem;
  transition: ${transitions.fast};
  background: ${colors.background};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    background: white;
    box-shadow: 0 0 0 3px ${colors.primaryLight};
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

export const cardStyle = `
  background: white;
  border-radius: ${borderRadius.xl};
  padding: 2rem;
  box-shadow: ${shadows.md};
  transition: ${transitions.normal};

  &:hover {
    box-shadow: ${shadows.lg};
    transform: translateY(-2px);
  }
`;
