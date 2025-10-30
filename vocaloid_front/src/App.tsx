import React from "react";
import { Outlet, Link } from "react-router-dom";
import styled from "styled-components";

const Header = styled.header`
  background: #39c5bb;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Nav = styled.nav`
  a {
    color: white;
    margin-left: 1rem;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const App: React.FC = () => {
  return (
    <>
      <Header>
        <h2>VocaloCart</h2>
        <Nav>
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
        </Nav>
      </Header>

      <Outlet /> {/* Pages render here */}
    </>
  );
};

export default App;
