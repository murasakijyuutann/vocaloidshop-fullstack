import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../hooks/useToast";
import { PageTransition } from "../components/PageTransition";

const Wrapper = styled.div`
  max-width: 800px;
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

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.label`
  font-weight: 600;
  color: #718096;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  color: #2d3748;
  font-weight: 500;
`;

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 1rem;
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

const DangerButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  color: #f56565;
  border: 2px solid #fed7d7;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fff5f5;
    border-color: #f56565;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.button`
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .label {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.95rem;
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
      toast("✅ Profile updated successfully!", "success");
    } catch {
      toast("❌ Could not update profile (birthday can be changed once/year)", "error");
    }
  };

  const handleLogout = () => {
    logout();
    toast("👋 Logged out successfully", "success");
    navigate("/");
  };

  return (
    <PageTransition>
      <Wrapper>
        <Header>
          <h1>👤 My Profile</h1>
          <p>Manage your account settings and preferences</p>
        </Header>

        <Card>
          <SectionTitle>Account Information</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Full Name</InfoLabel>
              <InfoValue>{user.name}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Email Address</InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </InfoItem>
            {user.nickname && (
              <InfoItem>
                <InfoLabel>Nickname</InfoLabel>
                <InfoValue>{user.nickname}</InfoValue>
              </InfoItem>
            )}
            {user.birthday && (
              <InfoItem>
                <InfoLabel>Birthday</InfoLabel>
                <InfoValue>{new Date(user.birthday).toLocaleDateString()}</InfoValue>
              </InfoItem>
            )}
          </InfoGrid>
        </Card>

        <Card>
          <SectionTitle>Update Profile</SectionTitle>
          <FormGroup>
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Enter a new nickname"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
            />
          </FormGroup>

          <ButtonGroup>
            <PrimaryButton onClick={save}>Save Changes</PrimaryButton>
            <SecondaryButton onClick={() => { setNickname(""); setBirthday(""); }}>
              Clear
            </SecondaryButton>
          </ButtonGroup>
        </Card>

        <Card>
          <SectionTitle>Quick Actions</SectionTitle>
          <QuickActions>
            <ActionCard onClick={() => navigate("/orders")}>
              <div className="icon">📦</div>
              <div className="label">My Orders</div>
            </ActionCard>
            <ActionCard onClick={() => navigate("/addresses")}>
              <div className="icon">📍</div>
              <div className="label">Addresses</div>
            </ActionCard>
            <ActionCard onClick={() => navigate("/wishlist")}>
              <div className="icon">❤️</div>
              <div className="label">Wishlist</div>
            </ActionCard>
          </QuickActions>
        </Card>

        <Card style={{ textAlign: 'center' }}>
          <DangerButton onClick={handleLogout}>
            🚪 Logout from Account
          </DangerButton>
        </Card>
      </Wrapper>
    </PageTransition>
  );
};

export default MyPage;
