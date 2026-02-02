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

// AppRouter에서 <Route path="/rider/*" element={<RiderRouter />} /> 로 연결된다는 전제
// 따라서 여기 path들은 "/rider" 이하의 "상대 경로"만 정의하면 됩니다.
export default function RiderRouter() {
  return (
    <Routes>
      <Route element={<RiderLayout />}>
        {/* /rider */}
        <Route index element={<Navigate to="main" replace />} />

        {/* /rider/main */}
        <Route path="main" element={<RiderMainPage />} />

        {/* /rider/deliveries (배달현황) */}
        <Route path="deliveries" element={<RiderDeliveriesPage />} />

        {/* /rider/deliveries/request (선택: 배달요청 화면) */}
        <Route path="deliveries/request" element={<RiderDeliveryRequestPage />} />

        {/* /rider/deliveries/:deliveryId (배달 접수/상세) */}
        <Route path="deliveries/:deliveryId" element={<RiderDeliveryDetailPage />} />

        {/* /rider/deliveries/:deliveryId/in-progress (배달 중) */}
        <Route path="deliveries/:deliveryId/in-progress" element={<RiderDeliveryInProgressPage />} />

        {/* /rider/deliveries/:deliveryId/navigation (길찾기) */}
        <Route path="deliveries/:deliveryId/navigation" element={<RiderDeliveryNavigationPage />} />

        {/* /rider/deliveries/:deliveryId/complete (선택: 완료 요약) */}
        <Route path="deliveries/:deliveryId/complete" element={<RiderDeliveryCompletePage />} />
      </Route>
    </Routes>
  );
}
