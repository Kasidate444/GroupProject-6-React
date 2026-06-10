import { useState } from "react";
import { Link } from "react-router-dom";
import logoB from "../../assets/landing-page/logob.png";
import RegisterSuccessModal from "./RegisterSuccessModal";

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

const initialForm = {
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export default function FanRegister({ onGoLogIn, onGoArtist, onRegister }) {
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

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
    } else if (!usernamePattern.test(form.username.trim())) {
      nextErrors.username = "Use 3-20 letters, numbers, or underscores only.";
    }
    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
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
        email: form.email.trim(),
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
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
        <div className="ka-register-card__hero ka-register-card__hero--fan">
          <img src="/covers/signupforfansv2.jpg" alt="" aria-hidden="true" />
        </div>

        {/* Right: form panel */}
        <div className="ka-register-card__side">
          <Link to="/"><img src={logoB} alt="AUDTLIST" className="h-29 w-auto object-contain object-left mb-4 ml-[-5%] hover:opacity-80 transition-opacity" /></Link>
          <form onSubmit={handleSubmit} noValidate>
            <p className="ka-title">Create account</p>
            <p className="ka-subtitle">Sign up for an AUDTLIST fan account</p>

            <div className="ka-tabs" role="tablist" aria-label="Account type">
              <button className="ka-tab ka-tab--active" type="button">
                Fan
              </button>
              <button className="ka-tab" type="button" onClick={onGoArtist}>
                Artist
              </button>
            </div>

            {errors.server && (
              <p className="ka-hint ka-hint--error" role="alert">{errors.server}</p>
            )}

            <div className="ka-field">
              <label className="ka-label" htmlFor="fan-email">Email</label>
              <input
                id="fan-email"
                className="ka-input"
                type="email"
                name="email"
                placeholder="you@mail.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "fan-email-error" : undefined}
                required
              />
              {errors.email && (
                <p id="fan-email-error" className="ka-hint ka-hint--error">{errors.email}</p>
              )}
            </div>

            <div className="ka-field">
              <label className="ka-label" htmlFor="fan-username">Username</label>
              <input
                id="fan-username"
                className="ka-input"
                type="text"
                name="username"
                placeholder="musiclover"
                autoComplete="username"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "fan-username-error" : "fan-username-hint"}
                required
              />
              {errors.username ? (
                <p id="fan-username-error" className="ka-hint ka-hint--error">{errors.username}</p>
              ) : (
                <p id="fan-username-hint" className="ka-hint">Letters, numbers, and underscores only.</p>
              )}
            </div>

            <div className="ka-row">
              <div className="ka-field">
                <label className="ka-label" htmlFor="fan-first-name">First name</label>
                <input
                  id="fan-first-name"
                  className="ka-input"
                  type="text"
                  name="given-name"
                  placeholder="First name"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "fan-first-name-error" : undefined}
                  required
                />
                {errors.firstName && (
                  <p id="fan-first-name-error" className="ka-hint ka-hint--error">{errors.firstName}</p>
                )}
              </div>

              <div className="ka-field">
                <label className="ka-label" htmlFor="fan-last-name">Last name</label>
                <input
                  id="fan-last-name"
                  className="ka-input"
                  type="text"
                  name="family-name"
                  placeholder="Last name"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "fan-last-name-error" : undefined}
                  required
                />
                {errors.lastName && (
                  <p id="fan-last-name-error" className="ka-hint ka-hint--error">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="ka-row">
              <div className="ka-field">
                <label className="ka-label" htmlFor="fan-password">Password</label>
                <div className="relative">
                  <input
                    id="fan-password"
                    className="ka-input"
                    type={showPassword ? "text" : "password"}
                    name="new-password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "fan-password-error" : "fan-password-hint"}
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
                  <p id="fan-password-error" className="ka-hint ka-hint--error">{errors.password}</p>
                ) : (
                  <p id="fan-password-hint" className="ka-hint">Use at least 8 characters.</p>
                )}
              </div>

              <div className="ka-field">
                <label className="ka-label" htmlFor="fan-confirm-password">Confirm password</label>
                <div className="relative">
                  <input
                    id="fan-confirm-password"
                    className="ka-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm-password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "fan-confirm-password-error" : undefined}
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
                  <p id="fan-confirm-password-error" className="ka-hint ka-hint--error">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="ka-check">
              <input
                type="checkbox"
                className="ka-checkbox"
                id="fan-terms"
                checked={form.acceptedTerms}
                onChange={(e) => updateField("acceptedTerms", e.target.checked)}
                aria-invalid={!!errors.acceptedTerms}
                aria-describedby={errors.acceptedTerms ? "fan-terms-error" : undefined}
                required
              />
              <label htmlFor="fan-terms" className="ka-check__label">
                I agree to the <Link to="/terms">Terms of Use</Link> and <Link to="/terms">Privacy Policy</Link>.
              </label>
            </div>
            {errors.acceptedTerms && (
              <p id="fan-terms-error" className="ka-hint ka-hint--error">{errors.acceptedTerms}</p>
            )}

            <button className="ka-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </button>

            <div className="ka-footer">
              Already have an account? <button type="button" onClick={onGoLogIn}><span className="cursor-pointer hover:underline text-blue-500">Log in</span></button>
              <br />
              Are you an artist? <button type="button" onClick={onGoArtist}><span className="cursor-pointer hover:underline text-blue-500">Create an artist account</span></button>
            </div>
          </form>
        </div>

      </div>

      <RegisterSuccessModal open={registered} role="fan" onGoLogin={onGoLogIn} />
    </div>
  );
}
