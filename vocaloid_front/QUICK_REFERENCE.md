# Quick Reference: Enterprise Component Patterns

## 🎨 Common Styled Components

### Page Wrapper (Use on Every Page)
```tsx
const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 200px);
  animation: fadeInUp 0.5s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;
```

### Page Header
```tsx
const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #718096;
  }

  @media (max-width: 768px) {
    margin-bottom: 2rem;
    h1 { font-size: 2rem; }
    p { font-size: 1rem; }
  }
`;
```

### Card Container
```tsx
const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;
```

### Primary Button
```tsx
const PrimaryButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
`;
```

### Secondary Button
```tsx
const SecondaryButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #667eea15;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;
```

### Danger/Delete Button
```tsx
const DangerButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  color: #f56565;
  border: 2px solid #fed7d7;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fff5f5;
    border-color: #f56565;
    transform: translateY(-2px);
  }
`;
```

### Input Field
```tsx
const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f7fafc;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;
```

### Select Dropdown
```tsx
const Select = styled.select`
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:hover {
    border-color: #cbd5e0;
  }
`;
```

### Form Group
```tsx
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
`;
```

### Two-Column Layout
```tsx
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;
```

### Three-Column Grid
```tsx
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;
```

### Status Badge
```tsx
const StatusBadge = styled.span<{ $status: 'success' | 'error' | 'warning' | 'info' }>`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  width: fit-content;
  
  ${props => {
    switch (props.$status) {
      case 'success':
        return 'background: #C6F6D5; color: #22543D;';
      case 'error':
        return 'background: #FED7D7; color: #742A2A;';
      case 'warning':
        return 'background: #FEEBC8; color: #7C2D12;';
      case 'info':
        return 'background: #BEE3F8; color: #2C5282;';
    }
  }}
`;

// Usage: <StatusBadge $status="success">Delivered</StatusBadge>
```

### Section Title
```tsx
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;
```

### Empty State
```tsx
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);

  .emoji {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.8rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

// Usage:
// <EmptyState>
//   <div className="emoji">📦</div>
//   <h2>No orders yet</h2>
//   <p>Your order history will appear here</p>
//   <PrimaryButton>Start Shopping</PrimaryButton>
// </EmptyState>
```

### Loading Spinner
```tsx
const Spinner = styled.div`
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
```

## 🔥 Usage Pattern

### Complete Page Template
```tsx
import React from "react";
import styled from "styled-components";
import { PageTransition } from "../components/PageTransition";

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  animation: fadeInUp 0.5s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #718096;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
`;

const PrimaryButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }
`;

const MyNewPage: React.FC = () => {
  return (
    <PageTransition>
      <Wrapper>
        <Header>
          <h1>🎯 Page Title</h1>
          <p>Page description goes here</p>
        </Header>

        <Card>
          {/* Your content */}
        </Card>

        <PrimaryButton>Take Action</PrimaryButton>
      </Wrapper>
    </PageTransition>
  );
};

export default MyNewPage;
```

## 🎨 Color Reference

```tsx
// Primary Colors
const PRIMARY = '#667eea';
const PRIMARY_DARK = '#764ba2';
const GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

// Text Colors
const TEXT_PRIMARY = '#2d3748';
const TEXT_LIGHT = '#4a5568';
const TEXT_MUTED = '#718096';

// UI Colors
const BORDER = '#e2e8f0';
const BORDER_HOVER = '#cbd5e0';
const BACKGROUND = '#f7fafc';
const BACKGROUND_HOVER = '#edf2f7';

// Status Colors
const SUCCESS = '#48bb78';
const ERROR = '#f56565';
const WARNING = '#ed8936';
const INFO = '#4299e1';
```

## 📏 Spacing Reference

```tsx
// Padding/Margin values
xs: 0.25rem  (4px)
sm: 0.5rem   (8px)
md: 0.75rem  (12px)
lg: 1rem     (16px)
xl: 1.25rem  (20px)
xxl: 1.5rem  (24px)
xxxl: 2rem   (32px)
```

## 🎯 Responsive Breakpoints

```tsx
Mobile:  max-width: 768px
Tablet:  max-width: 968px
Desktop: min-width: 1200px

// Media query template
@media (max-width: 768px) {
  // Mobile styles
}

@media (max-width: 968px) {
  // Tablet styles
}
```

Copy and paste these patterns directly into your components for consistent, professional styling!
