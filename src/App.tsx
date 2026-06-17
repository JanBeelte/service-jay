import { createHashRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
import HostPage from "./pages/HostPage.tsx";
import GuestPage from "./pages/GuestPage.tsx";

const router = createHashRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/host/:roomId", element: <HostPage /> },
  { path: "/guest/:roomId", element: <GuestPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
