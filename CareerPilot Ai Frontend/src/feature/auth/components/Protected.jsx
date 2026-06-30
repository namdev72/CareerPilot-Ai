import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router-dom";

const Protected = ({ children }) => {

    const { user, loading } = useAuth();
    console.log("User:", user);
console.log("Loading:", loading);
    if (loading) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default Protected;