import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { PageTransition } from "../components/PageTransition";

const Wrapper = styled.div`
  padding: 3rem;
  text-align: center;
  animation: fadeInUp 0.5s ease;

  h1 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 2rem;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  input, select {
    padding: 0.5rem 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
`;

const ProductCard = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 18px rgba(0,0,0,0.1);
  }

  h2 {
    color: ${({ theme }) => theme.colors.text};
  }
`;


interface Product {
  id: number;
  name: string;
  price: number;
}

interface Category {
  id: number;
  name: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sort, setSort] = useState("name");
  const [dir, setDir] = useState("asc");
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    axios.get<Category[]>("/api/categories").then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    params.set("sort", sort);
    params.set("dir", dir);
    params.set("page", String(page));
    params.set("size", String(size));
    axios.get<PageResponse<Product>>(`/api/products/search?${params.toString()}`)
      .then(res => {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      });
  }, [q, categoryId, sort, dir, page, size]);

  const canPrev = useMemo(() => page > 0, [page]);
  const canNext = useMemo(() => page < totalPages - 1, [page, totalPages]);

    return (
      <PageTransition>
    <Wrapper>
      <h1>🎵 VocaloCart</h1>
          <Controls>
            <input
              placeholder="Search products..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
            />
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
            >
              <option value="">All categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="id">Newest</option>
            </select>
            <select value={dir} onChange={(e) => { setDir(e.target.value); setPage(0); }}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </Controls>

          <Grid>
            {products.map(p => (
              <ProductCard key={p.id}>
                <Link to={`/product/${p.id}`}>
                  <h2>{p.name}</h2>
                </Link>
                <p>¥{p.price}</p>
                <div style={{ marginTop: "0.5rem" }}>
                  <button
                    onClick={async () => {
                      if (!user) {
                        toast("Please log in to use wishlist", "info");
                        return;
                      }
                      await axios.post(`/api/wishlist/${user.id}/${p.id}`);
                      toast("Added to wishlist", "success");
                    }}
                  >❤ Add to Wishlist</button>
                </div>
              </ProductCard>
            ))}
          </Grid>

          <div style={{ marginTop: "1rem" }}>
            <button disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
            <span style={{ margin: "0 0.75rem" }}>Page {page + 1} / {Math.max(1, totalPages)}</span>
            <button disabled={!canNext} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </Wrapper>
      </PageTransition>
  );
};

export default HomePage;
