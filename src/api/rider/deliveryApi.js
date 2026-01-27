import api from "../axios";
import API from "../endpoints";

// GET : 라이더: 내 배달 목록/단건/상태별 조회 
export const riderDeliveryApi = {
  // GET /api/v1/rider/deliveries
  getMyDeliveries: () => api.get(API.riderDeliveries.list()),

  // GET /api/v1/rider/deliveries/{deliveryId}
  getMyDelivery: (deliveryId) => api.get(API.riderDeliveries.detail(deliveryId)),

  // GET /api/v1/rider/deliveries/status?orderDeliveryStatus=ASSIGNED
  getMyDeliveriesByStatus: (orderDeliveryStatus) =>
    api.get(API.riderDeliveries.byStatus(), {
      params: { orderDeliveryStatus },
    }),
}

export default riderDeliveryApi;