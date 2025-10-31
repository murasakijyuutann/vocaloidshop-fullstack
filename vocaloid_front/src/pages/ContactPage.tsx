import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const Wrapper = styled.div`
  padding: 2rem;
  max-width: 840px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
`;

const Title = styled.h1`
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  min-height: 140px;
`;

const Button = styled.button`
  margin-top: 0.8rem;
`;

const ContactPage: React.FC = () => {
  const toast = useToast();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!senderName || !senderEmail || !title || !details) {
      toast('Please fill all fields', 'error');
      return;
    }
    try {
      setBusy(true);
      await axios.post('/api/contact', { senderName, senderEmail, title, details });
      setSenderName(''); setSenderEmail(''); setTitle(''); setDetails('');
      toast('Enquiry sent. Thank you!', 'success');
    } catch {
      toast('Unable to send enquiry. Please try again later.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrapper>
      <Title>📨 Contact us</Title>
      <Grid>
        <Input placeholder="Your name" value={senderName} onChange={e => setSenderName(e.target.value)} />
        <Input placeholder="Your email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} />
      </Grid>
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{marginTop: 8}} />
      <TextArea placeholder="Details" value={details} onChange={e => setDetails(e.target.value)} style={{marginTop: 8}} />
      <Button onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send'}</Button>
      <p style={{marginTop: 10}}>Prefer email? <a href="mailto:neneke.emu@gmail.com">neneke.emu@gmail.com</a></p>
    </Wrapper>
  );
};

export default ContactPage;
