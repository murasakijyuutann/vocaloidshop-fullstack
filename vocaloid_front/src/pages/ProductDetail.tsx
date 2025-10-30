import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { useCart } from "../context/CartContext";

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
    const [product, setProduct] = useState<Product | null>(null);
    const { addToCart } = useCart();

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);
    
    const handleAddToCart = () => {
  if (!product) return;
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
