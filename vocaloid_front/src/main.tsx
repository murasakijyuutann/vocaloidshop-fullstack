import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeModeProvider } from "./context/ThemeContext";
import ToastProvider from "./components/ToastProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import App from "./App";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyPage from "./pages/MyPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistoryPage from "./pages/OrderHistoryPage.tsx";
import WishlistPage from "./pages/WishlistPage";
import AddressesPage from "./pages/AddressesPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <ThemeModeProvider>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="mypage" element={<MyPage />} />
        </Route>
      </Routes>
  </BrowserRouter>
  </ToastProvider>
      </CartProvider>
      </AuthProvider>
    </ThemeModeProvider>
  </React.StrictMode>
);
