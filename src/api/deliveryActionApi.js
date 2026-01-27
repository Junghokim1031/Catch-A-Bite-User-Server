import api from "./axios";
import API from "./endpoints";

/**
 * POST : DeliveryController (배달 상태 변경) 전용 API
 */
export const deliveryActionApi = {
  accept: (deliveryId, delivererId) =>
    api.post(API.deliveries.accept(deliveryId), { delivererId }),

  pickupComplete: (deliveryId, delivererId) =>
    api.post(API.deliveries.pickupComplete(deliveryId), { delivererId }),

  start: (deliveryId, delivererId) =>
    api.post(API.deliveries.start(deliveryId), { delivererId }),

  complete: (deliveryId, delivererId) =>
    api.post(API.deliveries.complete(deliveryId), { delivererId }),
};