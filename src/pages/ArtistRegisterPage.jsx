import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ArtistRegister from "../components/signin/ArtistRegister";

export default function ArtistRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  return (
    <ArtistRegister
      onGoLogIn={() => navigate("/login")}
      onGoFan={() => navigate("/register/fan")}
      onRegister={async (formData) => {
        await register({ ...formData, role: "artist" });
      }}
    />
  );
}
