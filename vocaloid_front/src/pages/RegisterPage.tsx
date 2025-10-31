import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 3rem;
  max-width: 380px;
  margin: 5rem auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  animation: fadeInUp 0.6s ease;

  h2 {
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
  }

  input {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: 0.2s;

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
      box-shadow: 0 0 6px ${({ theme }) => theme.colors.accent}55;
    }
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    padding: 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: 0.25s;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
      transform: translateY(-2px);
    }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(25px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;


const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");

  const handleRegister = async () => {
    try {
      await register(email, password, { nickname: nickname || undefined, birthday: birthday || undefined });
      navigate("/");
    } catch {
      alert("Register failed");
    }
  };

  return (
    <Form>
      <h2>📝 Register</h2>
      <input placeholder="Nickname (optional)" value={nickname} onChange={e => setNickname(e.target.value)} />
      <input type="date" placeholder="Birthday (optional)" value={birthday} onChange={e => setBirthday(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Create account</button>
    </Form>
  );
};

export default RegisterPage;
