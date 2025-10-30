import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const Wrapper = styled.div`
  padding: 2rem;
  color: #333;
`;

const ProductCard = styled.div`
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 1rem;
  padding: 1rem;
`;

interface Product {
  id: number;
  name: string;
  price: number;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get("/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Wrapper>
      <h1>🎵 VocaloCart</h1>
          {products.map(p => (
  <ProductCard key={p.id}>
    <Link to={`/product/${p.id}`}>
      <h2>{p.name}</h2>
    </Link>
    <p>¥{p.price}</p>
  </ProductCard>       
))}
    </Wrapper>
  );
};

export default HomePage;
