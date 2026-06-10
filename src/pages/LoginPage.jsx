import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LogIn from "../components/signin/LogIn";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogIn = async (credentials) => {
    await login(credentials);

    const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/";
    sessionStorage.removeItem("redirectAfterLogin");
    navigate(redirectTo, { replace: true });
  };

  return (
    <LogIn
      onGoFan={() => navigate("/register/fan")}
      onGoArtist={() => navigate("/register/artist")}
      onGoForgot={() => navigate("/forgot-password")}
      onLogIn={handleLogIn}
    />
  );
}
