import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Optionally, we could fetch /auth/me here; AuthProvider will do it on mount when token changes
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [params, navigate]);

  return <div>Signing you in…</div>;
}
