import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login", { replace: true, state: { from: location } });
    } else {
      setIsAuth(true);
    }
  }, [navigate, location]);

  if (!isAuth) {
    return null; // or loading spinner
  }

  return children;
}

export default ProtectedRoute;
