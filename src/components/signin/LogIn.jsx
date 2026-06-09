import { useState } from "react";
import { Link } from "react-router-dom";
import logoB from "../../assets/landing-page/logob.png";

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

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

export default function LogIn({ onGoFan, onGoArtist, onGoForgot, onLogIn }) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.trim().length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    return newErrors;
  };

  const handleLogIn = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      await onLogIn({ email: email.trim(), password });
    } catch (error) {
      setErrors({ form: error.message || "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ka-login-page">
      <div className="ka-login-card">

        {/* Left: Image */}
        <div className="ka-login-card__hero">
          <img src="/covers/bannerthaiv2.jpg" alt="Music atmosphere" />
          <div className="ka-login-card__hero-overlay" />
        </div>

{/* Right: Form */}
        <div className="ka-login-card__side">
          <Link to="/"><img src={logoB} alt="AUDTLIST" className="h-29 w-auto object-contain object-left mb-4 ml-[-8%] hover:opacity-80 transition-opacity" /></Link>
          <div className="ka-login-card__greeting">
            <p className="ka-login-card__hi">Hello,</p>
            <p className="ka-login-card__greet-sub">Music Lover</p>
          </div>

          <p className="ka-login-card__heading">
            <span className="ka-login-card__heading-accent">Login</span> Your Account
          </p>

          {errors.form && (
            <div className="ka-login-card__error">{errors.form}</div>
          )}

          {/* Email */}
          <div className="ka-login-card__ufield">
            <input
              className={`ka-login-card__uinput${errors.email ? " ka-login-card__uinput--error" : ""}`}
              type="email"
              name="email"
              placeholder="Email Address"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: null }));
              }}
            />
            {errors.email && <p className="ka-login-card__field-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="ka-login-card__ufield">
            <div className="ka-login-card__uinput-wrap">
              <input
                className={`ka-login-card__uinput${errors.password ? " ka-login-card__uinput--error" : ""}`}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: null }));
                }}
              />
              <button
                className="ka-login-card__utoggle"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <p className="ka-login-card__field-error">{errors.password}</p>}
          </div>

          {/* Remember / Forgot */}
          <div className="ka-login-card__row">
            <label className="ka-login-card__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember
            </label>
            <button className="ka-login-card__forgot" onClick={onGoForgot} type="button">
              Forgot Password ?
            </button>
          </div>

          <button
            className="ka-login-card__btn"
            onClick={handleLogIn}
            disabled={isLoading}
          >
            {isLoading ? "LOGGING IN…" : "SUBMIT"}
          </button>

          <div className="ka-login-card__footer">
            <button className="ka-login-card__footer-link" onClick={onGoFan} type="button">
              Create Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
