import { riderDeliveryApi } from "../api/rider/deliveryApi";

function pickPayload(res) {
  // DeliveryApiResponseDTO<T> => { success, message, data }
  return res?.data?.data;
}

export const riderDeliveryService = {
  async getMyDeliveries() {
    const res = await riderDeliveryApi.getMyDeliveries();
    return pickPayload(res) ?? [];
  },

  async getMyDeliveriesByStatus(orderDeliveryStatus) {
    const res = await riderDeliveryApi.getMyDeliveriesByStatus(orderDeliveryStatus);
    return pickPayload(res) ?? [];
  },

  async getMyDelivery(deliveryId) {
    const res = await riderDeliveryApi.getMyDelivery(deliveryId);
    return pickPayload(res);
  },
};