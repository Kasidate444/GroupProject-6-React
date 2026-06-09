import { useEffect, useState, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useFollow } from "../../contexts/FollowContext";
import { useWishlist } from "../context/WishlistContext";
import { useCollection } from "../context/CollectionContext";
import { findArtistById, getProductWithDetails } from "../data/helpers";
import { apiGet, apiUpload } from "../../lib/api";

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const { collectionIds } = useCollection();
  const { followedArtistIds } = useFollow();
  const { wishlistedIds } = useWishlist();

  const [activeTab, setActiveTab] = useState("collection");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savedProfile, setSavedProfile] = useState({
    display_name: "",
    profile_picture_url: "",
    banner_picture_url: "",
  });
  const [profileForm, setProfileForm] = useState({
    display_name: "",
    profile_picture: null,
    banner_picture: null,
  });
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
        };

        setSavedProfile(nextProfile);
        setProfileForm({
          display_name: nextProfile.display_name,
          profile_picture: null,
          banner_picture: null,
        });
        setAvatarUrl(nextProfile.profile_picture_url);
        setBannerUrl(nextProfile.banner_picture_url);
      } catch (err) {
        if (!cancelled) {
          setProfileStatus("error");
          setProfileMessage(err.message || "Unable to load profile.");
        }
      }
    };

    if (isLoggedIn) {
      loadProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const updateProfileField = (name, value) => {
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileStatus(null);
    setProfileMessage("");
  };

  const startProfileEdit = () => {
    setProfileForm({
      display_name: savedProfile.display_name,
      profile_picture: null,
      banner_picture: null,
    });
    setIsEditingProfile(true);
    setProfileStatus(null);
    setProfileMessage("");
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      display_name: savedProfile.display_name,
      profile_picture: null,
      banner_picture: null,
    });
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
    reader.onload = (ev) => {
      const url = ev.target.result;
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
      const fd = new FormData();
      fd.append("display_name", profileForm.display_name.trim());

      if (profileForm.profile_picture) {
        fd.append("profile_picture", profileForm.profile_picture);
      }

      if (profileForm.banner_picture) {
        fd.append("banner_picture", profileForm.banner_picture);
      }

      const response = await apiUpload("/profile", fd, "PUT");
      const updatedProfile = response.data || response.user || response;
      const nextProfile = {
        display_name: updatedProfile.display_name || updatedProfile.username || "",
        profile_picture_url: updatedProfile.profile_picture?.url || avatarUrl,
        banner_picture_url: updatedProfile.banner_picture?.url || bannerUrl,
      };

      setSavedProfile(nextProfile);
      setProfileForm({
        display_name: nextProfile.display_name,
        profile_picture: null,
        banner_picture: null,
      });
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

  const tabs = [
    { key: "collection", label: "collection", count: collectionIds.length },
    { key: "following", label: "following", count: followedArtistIds.length },
    { key: "wishlist", label: "wishlist", count: wishlistedIds.length },
  ];

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── Banner ── */}
      <div
        className={`relative h-75 bg-cover bg-center bg-white/5 group ${isEditingProfile ? "cursor-pointer" : ""}`}
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : {}}
        onClick={() => {
          if (isEditingProfile) bannerInputRef.current?.click();
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent" />
        {isEditingProfile && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black/55 text-white text-[13px] px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
            Change banner
          </span>
        </div>}
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e, "banner")}
        />
      </div>

      {/* ── Profile info ── */}
      <div className="px-[5%] -mt-20 relative z-10 md:px-[10%]">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div
            className={`relative w-32 h-32 rounded-2xl overflow-hidden bg-bg-card border-4 border-bg shadow-xl shrink-0 group ${isEditingProfile ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (isEditingProfile) avatarInputRef.current?.click();
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/10 text-white text-[2.5rem] font-bold">
                {user?.email?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            {isEditingProfile && <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, "avatar")}
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 w-full">
            <form id="profile-edit-form" onSubmit={handleProfileSubmit} className="max-w-2xl">
              {isEditingProfile ? (
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-white/45 mb-1.5">
                    Display name
                  </label>
                  <input
                    type="text"
                    value={profileForm.display_name}
                    onChange={(e) => updateProfileField("display_name", e.target.value)}
                    maxLength={80}
                    autoFocus
                    className="w-full max-w-xl px-3.5 py-2.5 rounded-lg border outline-none text-white text-[14px] bg-white/[0.05] border-white/10 focus:border-white/30"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-white text-[2rem] font-bold tracking-tight leading-tight">
                    {savedProfile.display_name || user?.username || "Profile"}
                  </h1>
                </div>
              )}
            </form>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {user?.email && (
                <p className="text-white/40 text-[13px] hidden">{user.email}</p>
              )}
              {isEditingProfile ? (
                <>
                  <button
                    type="submit"
                    form="profile-edit-form"
                    disabled={profileSaving}
                    className="px-4 py-2 text-[13px] font-semibold text-white bg-[#fc3c44] hover:bg-[#e8333b] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelProfileEdit}
                    disabled={profileSaving}
                    className="px-4 py-2 text-[13px] font-medium text-white/65 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startProfileEdit}
                  className="px-4 py-2 text-[13px] font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-lg transition-colors"
                >
                  Edit profile
                </button>
              )}
            </div>

            {profileStatus && (
              <p className={`text-[12px] mt-3 ${profileStatus === "success" ? "text-green-400" : "text-[#fc3c44]"}`}>
                {profileMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs + Content ── */}
      <div className="mt-10 px-[5%] md:px-[10%]">
        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-white text-white"
                  : "border-transparent text-white/45 hover:text-white/70"
              }`}
            >
              {tab.label}{" "}
              <span className={activeTab === tab.key ? "text-white/60" : "text-white/30"}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-8">
          {activeTab === "collection" && (
            <ProductGrid
              ids={collectionIds}
              emptyMessage="No purchases yet"
            />
          )}
          {activeTab === "following" && (
            <ArtistGrid
              ids={followedArtistIds}
              emptyMessage="Not following any artists yet"
            />
          )}
          {activeTab === "wishlist" && (
            <ProductGrid
              ids={wishlistedIds}
              emptyMessage="No items in wishlist"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ ids, emptyMessage }) {
  const products = ids.map((id) => getProductWithDetails(id)).filter(Boolean);

  if (products.length === 0) {
    return (
      <div className="py-8">
        <p className="text-white/40 text-[14px]">{emptyMessage}</p>
        <Link to="/shop" className="text-accent text-[13px] hover:underline mt-1 inline-block">
          Browse the shop →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
      {products.map((p) => (
        <Link key={p._id} to={`/product/${p.slug}`} className="flex flex-col gap-2 no-underline group">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
            <img
              src={p.cover_url}
              alt={p.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-white/85 text-[13px] font-medium truncate group-hover:text-white transition-colors">
              {p.title}
            </p>
            <p className="text-white/40 text-[11px] truncate">{p.artist?.name || "Unknown"}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ArtistGrid({ ids, emptyMessage }) {
  const artists = ids.map((id) => findArtistById(id)).filter(Boolean);

  if (artists.length === 0) {
    return (
      <div className="py-8">
        <p className="text-white/40 text-[14px]">{emptyMessage}</p>
        <Link to="/shop" className="text-accent text-[13px] hover:underline mt-1 inline-block">
          Discover artists →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
      {artists.map((artist) => (
        <Link
          key={artist._id}
          to={`/artist/${artist.slug}`}
          className="flex flex-col gap-2 no-underline group"
        >
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
            <img
              src={artist.banner_url}
              alt={artist.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-white/85 text-[13px] font-medium truncate group-hover:text-white transition-colors">
              {artist.name}
            </p>
            <p className="text-white/40 text-[11px] truncate">{artist.location}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
