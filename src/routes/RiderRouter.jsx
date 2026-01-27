// src/routes/RiderRouter.jsx
import { Navigate, Route, Routes } from "react-router-dom";
import RiderLayout from "../layout/rider/RiderLayout.jsx";

import RiderMainPage from "../pages/rider/RiderMainPage.jsx";
import RiderDeliveriesPage from "../pages/rider/RiderDeliveriesPage.jsx";
import RiderDeliveryRequestPage from "../pages/rider/RiderDeliveryRequestPage.jsx";
import RiderDeliveryDetailPage from "../pages/rider/RiderDeliveryDetailPage.jsx";
import RiderDeliveryInProgressPage from "../pages/rider/RiderDeliveryInProgressPage.jsx";
import RiderDeliveryCompletePage from "../pages/rider/RiderDeliveryCompletePage.jsx";
import RiderDeliveryNavigationPage from "../pages/rider/RiderDeliveryNavigationPage.jsx";

export default function RiderRouter() {
  return (
    <Routes>
        <Route path="/" element={<RiderLayout />}>
            <Route path="rider" element={<RiderLayout />} />
            <Route index element={<Navigate to="main" replace />} />
            <Route path="main" element={<RiderMainPage />} />
            <Route path="deliveries" element={<RiderDeliveriesPage />} />

            {/* ✅ 아래는 네가 만들었던 “deliveries/:deliveryId/...” 구조로 맞추는 걸 추천
            <Route path="deliveries/request" element={<RiderDeliveryRequestPage />} />
            <Route path="deliveries/:deliveryId" element={<RiderDeliveryDetailPage />} />
            <Route path="deliveries/:deliveryId/in-progress" element={<RiderDeliveryInProgressPage />} />
            <Route path="deliveries/:deliveryId/complete" element={<RiderDeliveryCompletePage />} />
            <Route path="deliveries/:deliveryId/navigation" element={<RiderDeliveryNavigationPage />} /> */}
        
        </Route>
    </Routes>
  );
}