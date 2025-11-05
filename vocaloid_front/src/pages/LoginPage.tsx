import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { useToast } from "../hooks/useToast";

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: float 20s infinite ease-in-out;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-50px, 50px) rotate(180deg); }
  }
`;

const Container = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 440px;
  padding: 3rem 2.5rem;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 2.5rem 2rem;
    max-width: 100%;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #4a5568;
  font-size: 0.95rem;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  box-sizing: border-box;
  border: 2px solid ${props => props.$hasError ? '#f56565' : '#e2e8f0'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: ${props => props.$hasError ? '#fff5f5' : 'white'};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#f56565' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(245, 101, 101, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &::placeholder {
    color: #cbd5e0;
  }
`;

const InputIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #a0aec0;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #a0aec0;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }
`;

const ErrorMessage = styled.div`
  color: #f56565;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const RememberRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #667eea;
  }
`;

const ForgotLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: #764ba2;
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 1rem;
  background: ${props => props.$loading 
    ? '#a0aec0' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }

  span {
    color: #a0aec0;
    font-size: 0.9rem;
    font-weight: 600;
  }
`;

const SocialButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #2d3748;

  &:hover {
    border-color: #667eea;
    background: #f7fafc;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  color: #718096;
  font-size: 0.95rem;

  a {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #764ba2;
      text-decoration: underline;
    }
  }
`;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field === 'email' || field === 'password') {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = {
      email: "",
      password: ""
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } 
    
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    // Submit
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast("✅ Welcome back!", "success");
      navigate("/");
    } catch (error) {
      toast("❌ Invalid email or password", "error");
      setErrors(prev => ({ ...prev, password: "Invalid credentials" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Wrapper>
        <Container>
          <Header>
            <Icon>🔐</Icon>
            <Title>Welcome Back!</Title>
            <Subtitle>Login to continue to VocaloCart</Subtitle>
          </Header>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Email Address</Label>
              <InputWrapper>
                <InputIcon>📧</InputIcon>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  $hasError={!!errors.email}
                />
              </InputWrapper>
              {errors.email && (
                <ErrorMessage>
                  ⚠️ {errors.email}
                </ErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <InputWrapper>
                <InputIcon>🔒</InputIcon>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  $hasError={!!errors.password}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </PasswordToggle>
              </InputWrapper>
              {errors.password && (
                <ErrorMessage>
                  ⚠️ {errors.password}
                </ErrorMessage>
              )}
            </InputGroup>

            <RememberRow>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleChange('rememberMe', e.target.checked)}
                />
                <span>Remember me</span>
              </CheckboxLabel>
              <ForgotLink to="/forgot-password">Forgot password?</ForgotLink>
            </RememberRow>

            <SubmitButton type="submit" disabled={loading} $loading={loading}>
              {loading ? (
                <>
                  <span>⏳</span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Login</span>
                </>
              )}
            </SubmitButton>
          </Form>

          <Divider>
            <span>OR</span>
          </Divider>

          <SocialButtons>
            <SocialButton onClick={() => window.location.href = "/oauth2/authorization/google"}>
              <span style={{ fontSize: '1.5rem' }}>🔵</span>
              Continue with Google
            </SocialButton>
            <SocialButton onClick={() => window.location.href = "/oauth2/authorization/github"}>
              <span style={{ fontSize: '1.5rem' }}>⚫</span>
              Continue with GitHub
            </SocialButton>
          </SocialButtons>

          <Footer>
            Don't have an account? <Link to="/register">Sign up now</Link>
          </Footer>
        </Container>
      </Wrapper>
    </PageTransition>
  );
};

export default LoginPage;