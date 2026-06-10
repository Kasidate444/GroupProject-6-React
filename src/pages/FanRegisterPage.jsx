import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FanRegister from "../components/signin/FanRegister";

export default function FanRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  return (
    <FanRegister
      onGoLogIn={() => navigate("/login")}
      onGoArtist={() => navigate("/register/artist")}
      onRegister={async (formData) => {
        await register({ ...formData, role: "fan" });
      }}
    />
  );
}
