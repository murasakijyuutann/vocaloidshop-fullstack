import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { useToast } from "../hooks/useToast";

const Wrapper = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: float 20s infinite ease-in-out reverse;
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
  max-width: 480px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OptionalBadge = styled.span`
  font-size: 0.75rem;
  color: #a0aec0;
  font-weight: 400;
  background: #f7fafc;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
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

const PasswordStrength = styled.div<{ $strength: number }>`
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StrengthBar = styled.div`
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const StrengthFill = styled.div<{ $strength: number }>`
  height: 100%;
  width: ${props => props.$strength * 25}%;
  background: ${props => 
    props.$strength === 0 ? '#e2e8f0' :
    props.$strength === 1 ? '#f56565' :
    props.$strength === 2 ? '#ed8936' :
    props.$strength === 3 ? '#ecc94b' :
    '#48bb78'
  };
  transition: all 0.3s ease;
`;

const StrengthLabel = styled.span<{ $strength: number }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => 
    props.$strength === 0 ? '#a0aec0' :
    props.$strength === 1 ? '#f56565' :
    props.$strength === 2 ? '#ed8936' :
    props.$strength === 3 ? '#ecc94b' :
    '#48bb78'
  };
`;

const TermsLabel = styled.label`
  display: flex;
  align-items: start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
  line-height: 1.5;

  input[type="checkbox"] {
    margin-top: 0.25rem;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #667eea;
    flex-shrink: 0;
  }

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
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

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    birthday: "",
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    terms: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthLabel = (strength: number): string => {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[strength];
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (typeof value === 'string') {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      terms: ""
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.nickname) {
      newErrors.nickname = "Nickname is required";
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = "Nickname must be at least 2 characters";
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    if (Object.values(newErrors).some(err => err !== "")) {
      setErrors(newErrors);
      toast("❌ Please fix the errors", "error");
      return;
    }

    // Submit
    setLoading(true);
    try {
      await register(
        formData.email, 
        formData.password, 
        {
          nickname: formData.nickname,
          birthday: formData.birthday || undefined
        }
      );
      toast("✅ Account created successfully!", "success");
      navigate("/");
    } catch (error) {
      toast("❌ Registration failed. Email may already exist.", "error");
      setErrors(prev => ({ ...prev, email: "Email already exists" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Wrapper>
        <Container>
          <Header>
            <Icon>✨</Icon>
            <Title>Create Account</Title>
            <Subtitle>Join VocaloCart today!</Subtitle>
          </Header>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Nickname</Label>
              <InputWrapper>
                <InputIcon>👤</InputIcon>
                <Input
                  type="text"
                  placeholder="Choose a nickname"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  $hasError={!!errors.nickname}
                />
              </InputWrapper>
              {errors.nickname && (
                <ErrorMessage>
                  ⚠️ {errors.nickname}
                </ErrorMessage>
              )}
            </InputGroup>

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
              placeholder="Create a password"
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
          {formData.password && (
            <PasswordStrength $strength={passwordStrength}>
              <StrengthBar>
                <StrengthFill $strength={passwordStrength} />
              </StrengthBar>
              <StrengthLabel $strength={passwordStrength}>
                {getStrengthLabel(passwordStrength)}
              </StrengthLabel>
            </PasswordStrength>
          )}
          {errors.password && (
            <ErrorMessage>
              ⚠️ {errors.password}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label>Confirm Password</Label>
          <InputWrapper>
            <InputIcon>🔒</InputIcon>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              $hasError={!!errors.confirmPassword}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </PasswordToggle>
          </InputWrapper>
          {errors.confirmPassword && (
            <ErrorMessage>
              ⚠️ {errors.confirmPassword}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label>
            Birthday
            <OptionalBadge>optional</OptionalBadge>
          </Label>
          <InputWrapper>
            <InputIcon>🎂</InputIcon>
            <Input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleChange('birthday', e.target.value)}
            />
          </InputWrapper>
        </InputGroup>

        <div>
          <TermsLabel>
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
            />
            <span>
              I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
            </span>
          </TermsLabel>
          {errors.terms && (
            <ErrorMessage style={{ marginLeft: '1.75rem' }}>
              ⚠️ {errors.terms}
            </ErrorMessage>
          )}
        </div>

        <SubmitButton type="submit" disabled={loading} $loading={loading}>
          {loading ? (
            <>
              <span>⏳</span>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Create Account</span>
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
          Sign up with Google
        </SocialButton>
        <SocialButton onClick={() => window.location.href = "/oauth2/authorization/github"}>
          <span style={{ fontSize: '1.5rem' }}>⚫</span>
          Sign up with GitHub
        </SocialButton>
      </SocialButtons>

      <Footer>
        Already have an account? <Link to="/login">Login now</Link>
      </Footer>
    </Container>
  </Wrapper>
</PageTransition>
);
};

export default RegisterPage;