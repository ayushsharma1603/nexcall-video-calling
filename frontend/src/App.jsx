import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./Pages/LoginPage.jsx";
import ChatPage from "./Pages/ChatPage.jsx";

import CallPage from "./Pages/CallPage.jsx";
import NotificationsPage from "./Pages/NotificationsPage.jsx";
import OnboardingPage from "./Pages/OnboardingPage.jsx";
import SignUpPage from "./Pages/SignUpPage.jsx";
import NotFoundPage from "./Pages/NotFoundPage.jsx";
import PageLoader from "./components/PageLoader.jsx";
import { Toaster } from "react-hot-toast";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import HomePage from "./Pages/HomePage.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import FriendsPage from "./Pages/FriendsPage.jsx";
import TermsPage from "./Pages/TermsPage.jsx";
import PrivacyPage from "./Pages/PrivacyPage.jsx";

function App() {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
            )
          }
        />

        {/* Chat */}
        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
            )
          }
        />

        {/* Call */}
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
            )
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              isOnboarded ? (
                <Navigate to="/" />
              ) : (
                <OnboardingPage />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Friends */}
        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
            )
          }
        />
        {/* Terms of Service */}
<Route path="/terms" element={<TermsPage />} />

{/* Privacy Policy */}
<Route path="/privacy" element={<PrivacyPage />} />


        {/* Not Found */}
        <Route
          path="*"
          element={
            isAuthenticated && isOnboarded ? (
              <NotFoundPage />
            ) : (
              <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
