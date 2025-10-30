import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const Container = styled.div`
  padding: 3rem;
  max-width: 700px;
  margin: 2rem auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
  text-align: center;
  animation: fadeInUp 0.5s ease;

  h1 {
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    color: #555;
    margin-bottom: 1rem;
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 10px;
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
      transform: scale(1.08);
    }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(25px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;


interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const { addToCart } = useCart();
    const { user } = useAuth();

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);
    
    const handleAddToCart = () => {
      if (!product) return;
      if (!user) {
          // Require login before adding to cart (Option C)
        alert("Please log in to add items to your cart.");
        navigate("/login", { replace: false });
        return;
      }
      addToCart(product.id, 1);
      alert("✅ Added to cart!");
    };
    

  if (!product) return <Container>Loading...</Container>;

  return (
    <Container>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <h3>¥{product.price}</h3>
      <button onClick={handleAddToCart}>🛒 Add to Cart</button>
    </Container>
  );
};

export default ProductDetail;
