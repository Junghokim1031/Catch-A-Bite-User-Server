const DELIVERY_BASE = "/api/v1/deliveries";
// 백엔드가 /api/deliveries 라면 여기만 수정하면 됨

const DELIVERY_ACTION_ENDPOINTS = {
  accept: (deliveryId) =>
    `${DELIVERY_BASE}/${deliveryId}/accept`,

  pickupComplete: (deliveryId) =>
    `${DELIVERY_BASE}/${deliveryId}/pickup-complete`,

  start: (deliveryId) =>
    `${DELIVERY_BASE}/${deliveryId}/start`,

  complete: (deliveryId) =>
    `${DELIVERY_BASE}/${deliveryId}/complete`,
};

export default DELIVERY_ACTION_ENDPOINTS;