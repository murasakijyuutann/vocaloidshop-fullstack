import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const Container = styled.div`
  padding: 2rem;
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
