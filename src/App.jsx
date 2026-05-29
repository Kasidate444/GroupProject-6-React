import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/About";
import Article1Page from "./pages/article1";
import Article2Page from "./pages/article2";
import Article3Page from "./pages/article3";
import RadioPage from "./pages/RadioPage";
import LoginPage from "./pages/LoginPage";
import FanRegisterPage from "./pages/FanRegisterPage";
import ArtistRegisterPage from "./pages/ArtistRegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MainLayout from "./layouts/MainLayout";
import ShopLayout from "./shop/ShopLayout";
import ShopPage from "./shop/pages/ShopPage";
import ProductDetailPage from "./shop/pages/ProductDetailPage";
import CheckoutPage from "./shop/pages/CheckoutPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center bg-[#0a0a1a] px-[10%] text-white">
      <p className="mb-4 font-['Montserrat',sans-serif] text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
        404
      </p>
      <h1 className="mb-4 text-[44px] font-bold leading-tight text-white">
        Page not found
      </h1>
      <p className="mb-8 max-w-xl text-[16px] leading-[1.7] text-white/55">
        This page is not available yet.
      </p>
      <Link
        to="/"
        className="rounded-full bg-[#6c63ff] px-6 py-3 font-['Montserrat',sans-serif] text-sm font-semibold text-white no-underline transition-colors hover:bg-[#4f46e5]"
      >
        Back to home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/fan" element={<FanRegisterPage />} />
        <Route path="/register/artist" element={<ArtistRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<MainLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/article1" element={<Article1Page />} />
          <Route path="/article2" element={<Article2Page />} />
          <Route path="/article3" element={<Article3Page />} />
          <Route path="/radio" element={<RadioPage />} />
          <Route element={<ShopLayout />}>
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/discover/:genres" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
