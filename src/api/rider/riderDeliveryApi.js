import axiosInstance from "../axios";

/**
 * 내 배달 목록 조회 (배달원)
 * GET /api/v1/rider/deliveries
 */
export const getMyDeliveries = () => {
  return axiosInstance.get("/api/v1/rider/deliveries");
};

/**
 * 내 배달 단건 조회 (배달원)
 * GET /api/v1/rider/deliveries/{deliveryId}
 */
export const getDeliveryDetail = (deliveryId) => {
  if (!deliveryId) throw new Error("deliveryId is required");
  return axiosInstance.get(`/api/v1/rider/deliveries/${deliveryId}`);
};

/**
 * 상태별 내 배달 조회 (배달원)
 * GET /api/v1/rider/deliveries/status
 *
 * @param {string} status - DeliveryStatus (예: WAITING, IN_DELIVERY, DELIVERED)
 */
export const getDeliveriesByStatus = (status) => {
  if (!status) throw new Error("orderDeliveryStatus is required");

  return axiosInstance.get("/api/v1/rider/deliveries/status", {
    params: { orderDeliveryStatus: status },
  });
};