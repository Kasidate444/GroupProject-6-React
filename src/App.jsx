import { useEffect } from "react";
import { AuthProvider } from "./shop/context/AuthContext";
import { FulfillmentProvider } from "./contexts/FulfillmentContext";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import MiniPlayer from "./components/common/MiniPlayer";
import CartDrawer from "./shop/components/cart/CartDrawer";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/About";
import Article1Page from "./pages/article1";
import Article2Page from "./pages/article2";
import Article3Page from "./pages/article3";
import LoginPage from "./pages/LoginPage";
import FanRegisterPage from "./pages/FanRegisterPage";
import ArtistRegisterPage from "./pages/ArtistRegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TermsConditions from "./pages/TermsConditions";
import MainLayout from "./layouts/MainLayout";
import ShopLayout from "./shop/ShopLayout";
import ShopPage from "./shop/pages/ShopPage";
import ProductDetailPage from "./shop/pages/ProductDetailPage";
import CheckoutPage from "./shop/pages/CheckoutPage";
import ArtistPage from "./shop/pages/ArtistPage";
import ProfilePage from "./shop/pages/ProfilePage";
import ProfilePageAdmin from "./shop/pages/ProfilePageAdmin";
import ProfilePageArtist from "./shop/pages/ProfilePageArtist";
import LivePage from "./shop/pages/LivePage";
import HelpPage from "./pages/HelpPage";
import HelpArticlePage from "./pages/HelpArticlePage";
import OrderConfirmedPage from "./shop/pages/OrderConfirmedPage";
import ProfileSetting from "./pages/profilesetting";
import GiftCardsPage from "./pages/GiftCardsPage";
import ClubPage from "./pages/ClubPage";
import ClubDetailPage from "./pages/ClubDetailPage";

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
      <p className="mb-4 font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
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
        className="rounded-full bg-[#6c63ff] px-6 py-3 font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold text-white no-underline transition-colors hover:bg-[#4f46e5]"
      >
        Back to home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FulfillmentProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/fan" element={<FanRegisterPage />} />
        <Route path="/register/artist" element={<ArtistRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/:slug" element={<HelpArticlePage />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route element={<MainLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gift-cards" element={<GiftCardsPage />} />
          <Route path="/club" element={<ClubPage />} />
          <Route path="/club/:id" element={<ClubDetailPage />} />
          <Route path="/article1" element={<Article1Page />} />
          <Route path="/article2" element={<Article2Page />} />
          <Route path="/article3" element={<Article3Page />} />
          <Route element={<ShopLayout />}>
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/discover/:genres" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin" element={<ProfilePageAdmin />} />
            <Route path="/artist" element={<ProfilePageArtist />} />
            <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
            <Route path="/artist/:slug" element={<ArtistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/live/:id" element={<LivePage />} />
            <Route path="/profilesetting" element={<ProfileSetting />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CartDrawer />
      <MiniPlayer />
      </FulfillmentProvider>
    </AuthProvider>
  );
}
