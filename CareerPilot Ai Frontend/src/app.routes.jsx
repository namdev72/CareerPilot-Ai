import { createBrowserRouter } from "react-router-dom";
import Login from "./feature/auth/pages/Login.jsx";
import Register from "./feature/auth/pages/Register.jsx";
import Protected from "./feature/auth/components/Protected.jsx";
import Home from "./feature/interview/pages/Home.jsx";
import Interview from "./feature/interview/pages/Interview.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />
      </Protected>
    ),
  },
]);