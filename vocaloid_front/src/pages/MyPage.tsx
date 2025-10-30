import React from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  padding: 3rem;
  max-width: 600px;
  margin: 3rem auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  text-align: center;
  animation: fadeInUp 0.5s ease;

  h1 {
    color: ${({ theme }) => theme.colors.primary};
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    margin-top: 1rem;
    cursor: pointer;
    transition: 0.25s;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
      transform: scale(1.05);
    }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;


const MyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <Wrapper>
      <h1>👤 My Page</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
    </Wrapper>
  );
};

export default MyPage;
