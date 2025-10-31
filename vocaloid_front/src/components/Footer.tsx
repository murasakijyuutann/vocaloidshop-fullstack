import React from 'react';
import styled from 'styled-components';
import { FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
// contact logic moved to ContactPage

const FooterWrap = styled.footer`
  background: ${({ theme }) => theme.colors.text};
  color: #fff;
  margin-top: 3rem;
`;

const Inner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.25rem;
  display: grid;
  grid-template-columns: 1.2fr 1.2fr;
  gap: 1.25rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Brand = styled.div`
  h3 { margin: 0 0 0.5rem; }
  p { margin: 0.25rem 0; opacity: 0.9; }
`;

const Social = styled.div`
  display: flex;
  gap: 0.75rem;
  a {
    color: #fff;
    opacity: 0.9;
    font-size: 1.4rem;
    transition: opacity 0.2s ease;
    &:hover { opacity: 1; }
  }
`;

// Contact form styles removed (moved to ContactPage)

const Bottom = styled.div`
  border-top: 1px solid rgba(255,255,255,0.2);
  padding: 0.8rem 1.25rem;
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const Footer: React.FC = () => {
  // removed contact state
  // Contact form removed from footer

  const currentYear = new Date().getFullYear();

  return (
    <FooterWrap>
      <Inner>
        <Brand>
          <h3>VocaloCart</h3>
          <p>Your favorite Vocaloid merch, delivered.</p>
          <Social>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)"><FaXTwitter /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
          </Social>
        </Brand>
        
        <div>
          <h4>Info</h4>
          <p>Shipping worldwide. Secure payments. Friendly support.</p>
          <p>Business inquiries: <a href="mailto:neneke.emu@gmail.com" style={{color:'#fff', textDecoration:'underline'}}>neneke.emu@gmail.com</a></p>
        </div>
      </Inner>
      <Bottom>
        © {currentYear} VocaloCart • All rights reserved.
      </Bottom>
    </FooterWrap>
  );
};

export default Footer;
