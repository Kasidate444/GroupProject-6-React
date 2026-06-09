import { useEffect, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useFollow } from "../../contexts/FollowContext";
import { useWishlist } from "../context/WishlistContext";
import { apiGet, apiUpload } from "../../lib/api";
import FollowButton from "../components/FollowButton";
import ProductCard from "../components/product/ProductCard";

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const { followedArtistIds, setFollowedArtists } = useFollow();
  const { wishlistedIds, setWishlistedProducts } = useWishlist();
  const [followingArtists, setFollowingArtists] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("collection");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savedProfile, setSavedProfile] = useState({ display_name: "", profile_picture_url: "", banner_picture_url: "", location: "", bio: "" });
  const [profileForm, setProfileForm] = useState({ display_name: "", location: "", bio: "", profile_picture: null, banner_picture: null });
  const [profileStatus, setProfileStatus] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const profile = await apiGet("/profile");
        if (cancelled) return;

        const nextProfile = {
          display_name: profile.display_name || profile.username || "",
          profile_picture_url: profile.profile_picture?.url || "",
          banner_picture_url: profile.banner_picture?.url || "",
          location: profile.location || "",
          bio: profile.bio || "",
        };

        const nextCollectionProducts = (profile.user_collection || profile.collection || [])
          .map((item) => normalizeProfileProduct(item.product_id || item))
          .filter(Boolean);
        const nextWishlistProducts = (profile.wishlist || [])
          .map((item) => normalizeProfileProduct(item.product_id || item))
          .filter(Boolean);
        const nextFollowingArtists = (profile.followingArtist || []).map(normalizeProfileArtist).filter(Boolean);

        setSavedProfile(nextProfile);
        setProfileForm({ display_name: nextProfile.display_name, location: nextProfile.location, bio: nextProfile.bio, profile_picture: null, banner_picture: null });
        setAvatarUrl(nextProfile.profile_picture_url);
        setBannerUrl(nextProfile.banner_picture_url);
        setCollectionProducts(nextCollectionProducts);
        setWishlistProducts(nextWishlistProducts);
        setFollowingArtists(nextFollowingArtists);
        setWishlistedProducts(nextWishlistProducts.map((product) => product._id));
        setFollowedArtists(nextFollowingArtists.map((artist) => artist._id));
      } catch (err) {
        if (!cancelled) {
          setProfileStatus("error");
          setProfileMessage(err.message || "Unable to load profile.");
        }
      }
    };

    if (isLoggedIn) loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, setFollowedArtists, setWishlistedProducts]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const updateProfileField = (name, value) => {
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileStatus(null);
    setProfileMessage("");
  };

  const startProfileEdit = () => {
    setProfileForm({ display_name: savedProfile.display_name, location: savedProfile.location, bio: savedProfile.bio, profile_picture: null, banner_picture: null });
    setIsEditingProfile(true);
    setProfileStatus(null);
    setProfileMessage("");
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({ display_name: savedProfile.display_name, location: savedProfile.location, bio: savedProfile.bio, profile_picture: null, banner_picture: null });
    setAvatarUrl(savedProfile.profile_picture_url);
    setBannerUrl(savedProfile.banner_picture_url);
    setProfileStatus(null);
    setProfileMessage("");
  };

  const handleImageChange = (e, type) => {
    if (!isEditingProfile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target.result;
      if (type === "banner") {
        setBannerUrl(url);
        updateProfileField("banner_picture", file);
      } else {
        setAvatarUrl(url);
        updateProfileField("profile_picture", file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileSaving) return;

    setProfileSaving(true);
    setProfileStatus(null);
    setProfileMessage("");

    try {
      const formData = new FormData();
      formData.append("display_name", profileForm.display_name.trim());
      if (user?.role === "artist") {
        formData.append("location", profileForm.location.trim());
        formData.append("bio", profileForm.bio.trim());
      }
      if (profileForm.profile_picture) formData.append("profile_picture", profileForm.profile_picture);
      if (profileForm.banner_picture) formData.append("banner_picture", profileForm.banner_picture);

      const response = await apiUpload("/profile", formData, "PUT");
      const updatedProfile = response.data || response.user || response;
      const nextProfile = {
        display_name: updatedProfile.display_name || updatedProfile.username || "",
        profile_picture_url: updatedProfile.profile_picture?.url || avatarUrl,
        banner_picture_url: updatedProfile.banner_picture?.url || bannerUrl,
        location: updatedProfile.location || profileForm.location.trim(),
        bio: updatedProfile.bio || profileForm.bio.trim(),
      };

      setSavedProfile(nextProfile);
      setProfileForm({ display_name: nextProfile.display_name, location: nextProfile.location, bio: nextProfile.bio, profile_picture: null, banner_picture: null });
      setAvatarUrl(nextProfile.profile_picture_url);
      setBannerUrl(nextProfile.banner_picture_url);
      setIsEditingProfile(false);
      setProfileStatus("success");
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileStatus("error");
      setProfileMessage(err.message || "Unable to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const visibleWishlistProducts = wishlistProducts.filter((product) => wishlistedIds.includes(product._id));
  const visibleFollowingArtists = followingArtists.filter((artist) => followedArtistIds.includes(artist._id));

  const tabs = [
    { key: "collection", label: "collection", count: collectionProducts.length },
    { key: "following", label: "following", count: visibleFollowingArtists.length },
    { key: "wishlist", label: "wishlist", count: visibleWishlistProducts.length },
  ];

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div
        className={`relative h-75 bg-cover bg-center bg-white/5 group ${isEditingProfile ? "cursor-pointer" : ""}`}
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : {}}
        onClick={() => {
          if (isEditingProfile) bannerInputRef.current?.click();
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent" />
        {isEditingProfile && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/55 text-white text-[13px] px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">Change banner</span>
          </div>
        )}
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "banner")} />
      </div>

      <div className="px-[5%] -mt-20 relative z-10 md:px-[10%]">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div
            className={`relative w-32 h-32 rounded-2xl overflow-hidden bg-bg-card border-4 border-bg shadow-xl shrink-0 group ${isEditingProfile ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (isEditingProfile) avatarInputRef.current?.click();
            }}
          >
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-white/10 text-white text-[2.5rem] font-bold">{user?.email?.[0]?.toUpperCase() || "?"}</div>}
            {isEditingProfile && <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white/80 text-[12px] font-semibold">Change</span></div>}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "avatar")} />
          </div>

          <div className="flex-1 pt-2 w-full">
            <form id="profile-edit-form" onSubmit={handleProfileSubmit} className="max-w-2xl">
              {isEditingProfile ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-white/45 mb-1.5">Display name</label>
                    <input type="text" value={profileForm.display_name} onChange={(e) => updateProfileField("display_name", e.target.value)} maxLength={80} autoFocus className="w-full max-w-xl px-3.5 py-2.5 rounded-lg border outline-none text-white text-[14px] bg-white/[0.05] border-white/10 focus:border-white/30" />
                  </div>
                  {user?.role === "artist" && (
                    <>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/45 mb-1.5">Location</label>
                        <input type="text" value={profileForm.location} onChange={(e) => updateProfileField("location", e.target.value)} maxLength={120} placeholder="Bangkok, Thailand" className="w-full max-w-xl px-3.5 py-2.5 rounded-lg border outline-none text-white text-[14px] bg-white/[0.05] border-white/10 focus:border-white/30" />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/45 mb-1.5">Bio</label>
                        <textarea value={profileForm.bio} onChange={(e) => updateProfileField("bio", e.target.value)} maxLength={250} rows={3} placeholder="Tell fans about your sound." className="w-full max-w-xl resize-none px-3.5 py-2.5 rounded-lg border outline-none text-white text-[14px] bg-white/[0.05] border-white/10 focus:border-white/30" />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <h1 className="text-white text-[2rem] font-bold tracking-tight leading-tight">{savedProfile.display_name || user?.username || "Profile"}</h1>
                  {user?.role === "artist" && (savedProfile.location || savedProfile.bio) && (
                    <div className="mt-2 flex flex-col gap-1 text-[13px] text-white/45">
                      {savedProfile.location && <span>{savedProfile.location}</span>}
                      {savedProfile.bio && <span className="max-w-2xl leading-relaxed">{savedProfile.bio}</span>}
                    </div>
                  )}
                </div>
              )}
            </form>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {user?.email && (
                <p className="text-white/40 text-[13px] hidden">{user.email}</p>
              )}
              {isEditingProfile ? (
                <>
                  <button type="submit" form="profile-edit-form" disabled={profileSaving} className="px-4 py-2 text-[13px] font-semibold text-white bg-[#fc3c44] hover:bg-[#e8333b] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{profileSaving ? "Saving..." : "Save"}</button>
                  <button type="button" onClick={cancelProfileEdit} disabled={profileSaving} className="px-4 py-2 text-[13px] font-medium text-white/65 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
                </>
              ) : (
                <button type="button" onClick={startProfileEdit} className="px-4 py-2 text-[13px] font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-lg transition-colors">Edit profile</button>
              )}
            </div>

            {profileStatus && <p className={`text-[12px] mt-3 ${profileStatus === "success" ? "text-green-400" : "text-[#fc3c44]"}`}>{profileMessage}</p>}
          </div>
        </div>
      </div>

      <div className="mt-10 px-[5%] md:px-[10%]">
        <div className="flex items-center gap-1 border-b border-white/10">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key ? "border-white text-white" : "border-transparent text-white/45 hover:text-white/70"}`}>
              {tab.label} <span className={activeTab === tab.key ? "text-white/60" : "text-white/30"}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "collection" && <WishlistGrid products={collectionProducts} emptyMessage="No purchases yet" />}
          {activeTab === "following" && <ArtistGrid artists={visibleFollowingArtists} emptyMessage="Not following any artists yet" />}
          {activeTab === "wishlist" && <WishlistGrid products={visibleWishlistProducts} emptyMessage="No items in wishlist" />}
        </div>
      </div>
    </div>
  );
}

function normalizeProfileArtist(artist) {
  if (!artist) return null;
  return {
    ...artist,
    slug: artist.slug || artist.username || artist._id,
    name: artist.name || artist.display_name || artist.username || "Artist",
    banner_url: artist.banner_url || artist.banner_picture_url || artist.banner_picture?.url || artist.profile_picture?.url,
    avatar_url: artist.avatar_url || artist.profile_picture_url || artist.profile_picture?.url,
  };
}

function normalizeProfileProduct(product) {
  if (!product) return null;
  return {
    ...product,
    artist_id: product.artist?._id || product.artist_id || product.artist,
    artist: product.artist ? normalizeProfileArtist(product.artist) : product.artist,
    merch_type: product.merchType || product.merch_type,
    cover_url: product.cover_url || product.coverUrl?.url,
    name_your_price: product.name_your_price ?? product.nameYourPrice,
    min_price: product.min_price ?? product.minPrice,
    release_date: product.release_date ?? product.releaseDate,
    tracks: product.tracks || [],
  };
}

function EmptyState({ message, linkLabel }) {
  return (
    <div className="py-8">
      <p className="text-white/40 text-[14px]">{message}</p>
      <Link to="/shop" className="text-accent text-[13px] hover:underline mt-1 inline-block">{linkLabel}</Link>
    </div>
  );
}

function WishlistGrid({ products, emptyMessage }) {
  if (products.length === 0) return <EmptyState message={emptyMessage} linkLabel="Browse the shop" />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
      {products.map((product) => <ProductCard key={product._id} product={product} contextQueue={products} />)}
    </div>
  );
}

function ArtistGrid({ artists, emptyMessage }) {
  if (artists.length === 0) return <EmptyState message={emptyMessage} linkLabel="Discover artists" />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
      {artists.map((artist) => (
        <div key={artist._id} className="flex flex-col gap-2">
          <Link to={`/artist/${artist.slug || artist.username || artist._id}`} className="flex flex-col gap-2 no-underline group">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
              {artist.banner_url || artist.avatar_url ? <img src={artist.banner_url || artist.avatar_url} alt={artist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /> : <div className="w-full h-full bg-white/[0.06]" />}
            </div>
            <div>
              <p className="text-white/85 text-[13px] font-medium truncate group-hover:text-white transition-colors">{artist.name}</p>
              <p className="text-white/40 text-[11px] truncate">{artist.genre || "Artist"}</p>
            </div>
          </Link>
          <FollowButton artistId={artist._id} size="sm" />
        </div>
      ))}
    </div>
  );
}
