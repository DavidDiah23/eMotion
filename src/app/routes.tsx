import { createBrowserRouter } from "react-router";
import { Splash } from "./pages/Splash";
import { Welcome } from "./pages/Welcome";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ProfileSetup } from "./pages/ProfileSetup";
import { Dashboard } from "./pages/Dashboard";
import { ActiveTrek } from "./pages/ActiveTrek";
import { JoinTrek } from "./pages/JoinTrek";
import { History } from "./pages/History";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/welcome",
    Component: Welcome,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/active-trek",
    Component: ActiveTrek,
  },
  {
    path: "/join",
    Component: JoinTrek,
  },
  {
    path: "/history",
    Component: History,
  },
]);
