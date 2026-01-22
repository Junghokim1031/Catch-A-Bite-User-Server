import { Navigate, Route, Routes } from "react-router-dom";
import RoleLoginPage from "../pages/RoleLoginPage.jsx";
import RoleSelectPage from "../pages/RoleSelectPage.jsx";
import SignupOwnerPage from "../pages/SignupOwnerPage.jsx";
import SignupRiderPage from "../pages/SignupRiderPage.jsx";
import SignupUserPage from "../pages/SignupUserPage.jsx";
import OwnerMainPage from "../pages/owner/OwnerMainPage.jsx";
import RiderMainPage from "../pages/rider/RiderMainPage.jsx";
import UserMainPage from "../pages/user/UserMainPage.jsx";
import MyPage from "../pages/user/MyPage.jsx";
import EditProfilePage from "../pages/user/EditProfilePage.jsx";
import AddressListPage from "../pages/user/AddressListPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRouter({ onAuthRefresh }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/select" replace />} />
      <Route path="/select" element={<RoleSelectPage />} />

      <Route
        path="/user/login"
        element={<RoleLoginPage role="USER" onAuthRefresh={onAuthRefresh} />}
      />
      <Route
        path="/owner/login"
        element={<RoleLoginPage role="OWNER" onAuthRefresh={onAuthRefresh} />}
      />
      <Route
        path="/rider/login"
        element={<RoleLoginPage role="RIDER" onAuthRefresh={onAuthRefresh} />}
      />

      <Route path="/user/signup" element={<SignupUserPage />} />
      <Route path="/owner/signup" element={<SignupOwnerPage />} />
      <Route path="/rider/signup" element={<SignupRiderPage />} />

      <Route path="/user/main" element={<UserMainPage />} />
      <Route path="/owner/main" element={<OwnerMainPage />} />
      <Route path="/rider/main" element={<RiderMainPage />} />

      <Route element={<ProtectedRoute expectedRole="USER" redirectTo="/select" />}>
        <Route path="/user/mypage" element={<MyPage />} />
        <Route path="/user/profile/edit" element={<EditProfilePage />} />
        <Route path="/user/addresses" element={<AddressListPage />} />
      </Route>

      <Route path="/user" element={<Navigate to="/user/main" replace />} />
      <Route path="/owner" element={<Navigate to="/owner/main" replace />} />
      <Route path="/rider" element={<Navigate to="/rider/main" replace />} />

      <Route path="*" element={<Navigate to="/select" replace />} />
    </Routes>
  );
}
