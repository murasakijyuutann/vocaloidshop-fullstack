import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../hooks/useToast";

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
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const save = async () => {
    try {
      const payload: { nickname?: string; birthday?: string } = {};
      if (nickname) payload.nickname = nickname;
      if (birthday) payload.birthday = birthday;
      await axios.patch("/auth/me", payload);
      await refresh();
      setNickname("");
      setBirthday("");
      toast("Profile updated", "success");
    } catch {
      toast("Could not update profile (birthday can be changed once/year)", "error");
    }
  };

  return (
    <Wrapper>
      <h1>👤 My Page</h1>
      <p><strong>Name:</strong> {user.name}</p>
      {user.nickname && <p><strong>Nickname:</strong> {user.nickname}</p>}
      <p><strong>Email:</strong> {user.email}</p>
      {user.birthday && <p><strong>Birthday:</strong> {new Date(user.birthday).toLocaleDateString()}</p>}
      <div style={{marginTop: '1rem'}}>
        <input style={{padding:'0.5rem', border:'1px solid #ddd', borderRadius:8, marginRight:8}} placeholder="New nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
        <input style={{padding:'0.5rem', border:'1px solid #ddd', borderRadius:8, marginRight:8}} type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
        <button onClick={save}>Save</button>
      </div>
      <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
    </Wrapper>
  );
};

export default MyPage;
