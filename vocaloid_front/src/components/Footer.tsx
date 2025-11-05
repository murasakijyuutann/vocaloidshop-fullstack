import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaYoutube, FaGithub, FaHeart } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useToast } from '../hooks/useToast';

const FooterWrap = styled.footer`
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: #fff;
  margin-top: auto;
`;

const TopSection = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Inner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 1rem;
  }
`;

const Column = styled.div`
  h3 {
    font-size: 1.25rem;
    margin: 0 0 1.25rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  h4 {
    font-size: 1rem;
    margin: 0 0 1rem;
    color: #cbd5e0;
    font-weight: 600;
  }

  p {
    margin: 0.5rem 0;
    opacity: 0.9;
    line-height: 1.6;
    color: #e2e8f0;
  }
`;

const Brand = styled(Column)`
  .logo {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tagline {
    font-size: 1rem;
    opacity: 0.85;
    margin-bottom: 1.5rem;
    color: #cbd5e0;
  }

  .description {
    font-size: 0.875rem;
    line-height: 1.6;
    opacity: 0.75;
    color: #a0aec0;
  }
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.75rem;
  }

  a {
    color: #e2e8f0;
    text-decoration: none;
    opacity: 0.85;
    transition: all 0.2s ease;
    display: inline-block;
    font-size: 0.95rem;

    &:hover {
      opacity: 1;
      color: #667eea;
      transform: translateX(4px);
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 1.25rem;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transform: translateY(-3px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
  }
`;

const NewsletterForm = styled.form`
  margin-top: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
`;

const SubscribeButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PrivacyNote = styled.p`
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.5rem;
  color: #a0aec0;
`;

const ContactInfo = styled.div`
  margin-top: 1rem;
  
  p {
    font-size: 0.9rem;
    margin: 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  a {
    color: #667eea;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Bottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 1.5rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const BottomInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  color: #cbd5e0;

  .heart {
    color: #f56565;
    animation: heartbeat 1.5s ease-in-out infinite;
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.1); }
  }
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  a {
    color: #e2e8f0;
    text-decoration: none;
    font-size: 0.875rem;
    opacity: 0.8;
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
      color: #667eea;
    }
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('⚠️ Please enter your email', 'error');
      return;
    }
    
    // Simulate newsletter subscription
    toast('✅ Successfully subscribed to newsletter!', 'success');
    setEmail('');
  };

  return (
    <FooterWrap>
      <TopSection>
        <Inner>
          <Brand>
            <div className="logo">🎵 VocaloCart</div>
            <div className="tagline">Your favorite Vocaloid merch, delivered.</div>
            <p className="description">
              Discover exclusive Vocaloid merchandise, collectibles, and more. 
              Shipping worldwide with secure payments and friendly support.
            </p>
            <SocialLinks>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)">
                <FaXTwitter />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
            </SocialLinks>
          </Brand>

          <Column>
            <h4>Quick Links</h4>
            <LinkList>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/my">My Account</Link></li>
            </LinkList>
          </Column>

          <Column>
            <h4>Support</h4>
            <LinkList>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="#shipping">Shipping Info</a></li>
              <li><a href="#returns">Returns</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </LinkList>
          </Column>

          <Column>
            <h4>Newsletter</h4>
            <p>Subscribe for exclusive deals and updates!</p>
            <NewsletterForm onSubmit={handleSubscribe}>
              <InputGroup>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <SubscribeButton type="submit">
                  Subscribe
                </SubscribeButton>
              </InputGroup>
              <PrivacyNote>We respect your privacy. Unsubscribe anytime.</PrivacyNote>
            </NewsletterForm>
            
            <ContactInfo>
              <p>📧 <a href="mailto:neneke.emu@gmail.com">neneke.emu@gmail.com</a></p>
            </ContactInfo>
          </Column>
        </Inner>
      </TopSection>

      <Bottom>
        <BottomInner>
          <Copyright>
            © {currentYear} VocaloCart • Made with <FaHeart className="heart" /> for Vocaloid fans
          </Copyright>
          <BottomLinks>
            <a href="#terms">Terms of Service</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#cookies">Cookies</a>
          </BottomLinks>
        </BottomInner>
      </Bottom>
    </FooterWrap>
  );
};

export default Footer;
