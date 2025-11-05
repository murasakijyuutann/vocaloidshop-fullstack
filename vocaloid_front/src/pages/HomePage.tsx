import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { PageTransition } from "../components/PageTransition";

const Wrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  animation: fadeInUp 0.5s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;



const Hero = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1.5rem 1rem;

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
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

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:hover {
    border-color: #cbd5e0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-4px);
    }
  }
`;

const ProductImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 240px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;

  @media (max-width: 768px) {
    height: 180px;
    font-size: 3rem;
  }
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);

  &:hover {
    transform: scale(1.1);
    background: #fff;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProductInfo = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProductName = styled(Link)`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  text-decoration: none;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;

  &:hover {
    color: #667eea;
  }

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem;
  }
`;

const PaginationButton = styled.button<{ $disabled?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$disabled ? '#e2e8f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: ${props => props.$disabled ? '#a0aec0' : 'white'};
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.$disabled ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const PageInfo = styled.span`
  font-weight: 600;
  color: #2d3748;
  padding: 0 1rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 3rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);

  h2 {
    font-size: 2rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #718096;
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;

    h2 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
}

interface Category {
  id: number;
  name: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    axios.get<Category[]>("/api/categories").then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
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
      })
      .finally(() => setLoading(false));
  }, [q, categoryId, sort, dir, page, size]);

  const canPrev = useMemo(() => page > 0, [page]);
  const canNext = useMemo(() => page < totalPages - 1, [page, totalPages]);

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      toast("Please log in to add items to cart", "info");
      return;
    }
    try {
      await axios.post('/api/cart', {
        userId: user.id,
        productId,
        quantity: 1
      });
      toast("Added to cart! 🛒", "success");
    } catch (error) {
      toast("Failed to add to cart", "error");
    }
  };

  const handleAddToWishlist = async (productId: number) => {
    if (!user) {
      toast("Please log in to use wishlist", "info");
      return;
    }
    try {
      await axios.post(`/api/wishlist/${user.id}/${productId}`);
      toast("Added to wishlist! ❤️", "success");
    } catch (error) {
      toast("Already in wishlist", "info");
    }
  };

  return (
    <PageTransition>
      <Wrapper>
        <Hero>
          <h1>🎵 VocaloCart</h1>
          <p>Your ultimate destination for Vocaloid merchandise</p>
        </Hero>

        <Controls>
          <SearchInput
            placeholder="🔍 Search products..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
          />
          <Select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="id">Newest</option>
          </Select>
          <Select value={dir} onChange={(e) => { setDir(e.target.value); setPage(0); }}>
            <option value="asc">↑ Ascending</option>
            <option value="desc">↓ Descending</option>
          </Select>
        </Controls>

        {loading ? (
          <LoadingSpinner>⏳</LoadingSpinner>
        ) : products.length === 0 ? (
          <EmptyState>
            <h2>😢 No products found</h2>
            <p>Try adjusting your search or filters</p>
          </EmptyState>
        ) : (
          <>
            <Grid>
              {products.map(p => (
                <ProductCard key={p.id}>
                  <ProductImage $imageUrl={p.imageUrl}>
                    {!p.imageUrl && '🎵'}
                    <WishlistButton 
                      onClick={() => handleAddToWishlist(p.id)}
                      title="Add to wishlist"
                    >
                      ❤️
                    </WishlistButton>
                  </ProductImage>
                  <ProductInfo>
                    {p.categoryName && (
                      <CategoryBadge>{p.categoryName}</CategoryBadge>
                    )}
                    <ProductName to={`/product/${p.id}`}>
                      {p.name}
                    </ProductName>
                    <ProductPrice>¥{p.price.toLocaleString()}</ProductPrice>
                    <AddToCartButton onClick={() => handleAddToCart(p.id)}>
                      🛒 Add to Cart
                    </AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Pagination>
                <PaginationButton 
                  $disabled={!canPrev} 
                  disabled={!canPrev} 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  ← Previous
                </PaginationButton>
                <PageInfo>
                  Page {page + 1} of {totalPages}
                </PageInfo>
                <PaginationButton 
                  $disabled={!canNext} 
                  disabled={!canNext} 
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </Wrapper>
    </PageTransition>
  );
};

export default HomePage;