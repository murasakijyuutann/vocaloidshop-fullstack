import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

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

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <Container>Loading...</Container>;

  return (
    <Container>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <h3>¥{product.price}</h3>
      <button>🛒 Add to Cart</button>
    </Container>
  );
};

export default ProductDetail;
