import { useState } from "react";
import { Link } from "react-router-dom";
import logoB from "../../assets/landing-page/logob.png";
import RegisterSuccessModal from "./RegisterSuccessModal";
import { ARTIST_GENRES } from "../../constants/genre.js";

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function ArtistGenreSelect({ value, error, onChange }) {
  return (
    <div className="ka-field">
      <label className="ka-label" htmlFor="artist-genre">
        Artist genre
      </label>
      <select
        id="artist-genre"
        className="ka-input ka-select"
        name="genre"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "artist-genre-error" : undefined}
        required
      >
        <option value="">Select genre</option>
        {ARTIST_GENRES.map((genre) => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
      {error && (
        <p id="artist-genre-error" className="ka-hint ka-hint--error">{error}</p>
      )}
    </div>
  );
}

const initialForm = {
  artistName: "",
  username: "",
  email: "",
  genre: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export default function ArtistRegister({ onGoLogIn, onGoFan, onRegister }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registered, setRegistered] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

    if (!form.artistName.trim()) {
      nextErrors.artistName = "Artist or band name is required.";
    }
    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
    } else if (!usernamePattern.test(form.username.trim())) {
      nextErrors.username = "Use 3-20 letters, numbers, or underscores only.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!form.genre) {
      nextErrors.genre = "Please select a genre.";
    }
    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms = "You must agree to the terms to continue.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      await onRegister({
        artistName: form.artistName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        genre: form.genre,
        password: form.password,
      });
      setRegistered(true);
    } catch (err) {
      setErrors({ server: err.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ka-register-page">
<div className="ka-register-card">

        {/* Left: image panel */}
        <div className="ka-register-card__hero">
          <img src="/covers/signupart.jpg" alt="" aria-hidden="true" />
        </div>

        {/* Right: form panel */}
        <div className="ka-register-card__side">
          <Link to="/"><img src={logoB} alt="AUDTLIST" className="h-29 w-auto object-contain object-left mb-4 ml-[-5%] hover:opacity-80 transition-opacity" /></Link>
          <form onSubmit={handleSubmit} noValidate>
            <p className="ka-title">Create artist account</p>
            <p className="ka-subtitle">
              Join as an artist and start sharing your music
            </p>

            <div className="ka-tabs" role="tablist" aria-label="Account type">
              <button className="ka-tab" type="button" onClick={onGoFan}>
                Fan
              </button>
              <button className="ka-tab ka-tab--active" type="button">
                Artist
              </button>
            </div>

            {errors.server && (
              <p className="ka-hint ka-hint--error" role="alert">{errors.server}</p>
            )}

            <div className="ka-field">
              <label className="ka-label" htmlFor="artist-name">
                Artist or band name
              </label>
              <input
                id="artist-name"
                className="ka-input"
                type="text"
                name="organization"
                placeholder="The Midnight"
                autoComplete="organization"
                value={form.artistName}
                onChange={(e) => updateField("artistName", e.target.value)}
                aria-invalid={!!errors.artistName}
                aria-describedby={errors.artistName ? "artist-name-error" : undefined}
                required
              />
              {errors.artistName && (
                <p id="artist-name-error" className="ka-hint ka-hint--error">{errors.artistName}</p>
              )}
            </div>

            <div className="ka-row">
              <div className="ka-field">
                <label className="ka-label" htmlFor="artist-username">Username</label>
                <input
                  id="artist-username"
                  className="ka-input"
                  type="text"
                  name="username"
                  placeholder="artistname"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "artist-username-error" : "artist-username-hint"}
                  required
                />
                {errors.username ? (
                  <p id="artist-username-error" className="ka-hint ka-hint--error">{errors.username}</p>
                ) : (
                  <p id="artist-username-hint" className="ka-hint">Letters, numbers, and underscores only.</p>
                )}
              </div>

              <div className="ka-field">
                <label className="ka-label" htmlFor="artist-email">Email</label>
                <input
                  id="artist-email"
                  className="ka-input"
                  type="email"
                  name="email"
                  placeholder="you@mail.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "artist-email-error" : undefined}
                  required
                />
                {errors.email && (
                  <p id="artist-email-error" className="ka-hint ka-hint--error">{errors.email}</p>
                )}
              </div>
            </div>

            <ArtistGenreSelect
              value={form.genre}
              error={errors.genre}
              onChange={(val) => updateField("genre", val)}
            />

            <div className="ka-row">
              <div className="ka-field">
                <label className="ka-label" htmlFor="artist-password">Password</label>
                <div className="relative">
                  <input
                    id="artist-password"
                    className="ka-input"
                    type={showPassword ? "text" : "password"}
                    name="new-password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "artist-password-error" : "artist-password-hint"}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#475569] hover:text-[#64748b] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="artist-password-error" className="ka-hint ka-hint--error">{errors.password}</p>
                ) : (
                  <p id="artist-password-hint" className="ka-hint">Use at least 8 characters.</p>
                )}
              </div>

              <div className="ka-field">
                <label className="ka-label" htmlFor="artist-confirm-password">Confirm password</label>
                <div className="relative">
                  <input
                    id="artist-confirm-password"
                    className="ka-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm-password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "artist-confirm-password-error" : undefined}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#475569] hover:text-[#64748b] transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="artist-confirm-password-error" className="ka-hint ka-hint--error">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="ka-check">
              <input
                type="checkbox"
                className="ka-checkbox"
                id="artist-terms"
                checked={form.acceptedTerms}
                onChange={(e) => updateField("acceptedTerms", e.target.checked)}
                aria-invalid={!!errors.acceptedTerms}
                aria-describedby={errors.acceptedTerms ? "artist-terms-error" : undefined}
                required
              />
              <label htmlFor="artist-terms" className="ka-check__label">
                I agree to the <Link to="/terms">Terms of Use</Link> and <Link to="/terms">Privacy Policy</Link>.
              </label>
            </div>
            {errors.acceptedTerms && (
              <p id="artist-terms-error" className="ka-hint ka-hint--error">{errors.acceptedTerms}</p>
            )}

            <button className="ka-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </button>

            <div className="ka-footer">
              Already have an account? <button type="button" onClick={onGoLogIn}><span className="cursor-pointer hover:underline text-blue-500">Log in</span></button>
              <br />
              Not an artist? <button type="button" onClick={onGoFan}><span className="cursor-pointer hover:underline text-blue-500">Create a fan account</span></button>
            </div>
          </form>
        </div>

      </div>

      <RegisterSuccessModal open={registered} role="artist" onGoLogin={onGoLogIn} />
    </div>
  );
}
