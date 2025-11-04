import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';

const Wrapper = styled(motion.div)`
  padding: 2rem;
  max-width: 640px;
  margin: 3rem auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* spacing between sections */
`;

const Title = styled(motion.h1)`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-size: 1.8rem;
`;

const Field = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* space between label and input */
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const Input = styled(motion.input)`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(57,197,187,0.15);
    outline: none;
  }
`;

const TextArea = styled(motion.textarea)`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  min-height: 180px; /* taller textarea */
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(57,197,187,0.15);
    outline: none;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  margin-top: 0.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
    <Wrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        📨 Contact us
      </Title>

      <Field
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label>Your name</Label>
        <Input
          value={senderName}
          onChange={e => setSenderName(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        />
      </Field>

      <Field
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Label>Your email</Label>
        <Input
          value={senderEmail}
          onChange={e => setSenderEmail(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        />
      </Field>

      <Field
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Label>Title</Label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        />
      </Field>

      <Field
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Label>Details</Label>
        <TextArea
          value={details}
          onChange={e => setDetails(e.target.value)}
          whileFocus={{ scale: 1.01 }}
        />
      </Field>

      <Button
        onClick={send}
        disabled={busy}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {busy ? 'Sending…' : 'Send'}
      </Button>

      <p style={{ marginTop: 10, textAlign: 'center' }}>
        Prefer email? <a href="mailto:neneke.emu@gmail.com">neneke.emu@gmail.com</a>
      </p>
    </Wrapper>
  );
};

export default ContactPage;
