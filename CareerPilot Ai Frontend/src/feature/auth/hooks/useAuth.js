//we implement the hook that handle the api and state layer
//we use this in ui in pages
import { useContext ,useEffect} from "react";
import { AuthContext } from "../auth.context.jsx";
import { login, logout, register, getMe } from "../services/auth.api.js";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      console.log("Data= ", data);
      if (!data) {
        console.log("Login returned undefined");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);

    try {
      const data = await register({ username, email, password });
      setUser(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const data = await logout();
      setUser(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        setUser(data?.user ?? null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getAndSetUser();
  }, []);

  return { user, loading, handleLogin, handleLogout, handleRegister };
};
