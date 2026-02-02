// 라이더 배달상황 페이지
const RIDER_DELIVERIES = {
  list: () => "/api/v1/rider/deliveries",
  detail: (deliveryId) => `/api/v1/rider/deliveries/${deliveryId}`,
  byStatus: () => "/api/v1/rider/deliveries/status",
};

export default RIDER_DELIVERIES;