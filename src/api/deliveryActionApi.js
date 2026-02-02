import api from "./axios";
import DELIVERY_ACTION_ENDPOINTS from "../endpoints/deliveryActionEndpoints";

export const deliveryActionApi = {
  accept: (deliveryId) =>
    api.post(DELIVERY_ACTION_ENDPOINTS.accept(deliveryId)),

  pickupComplete: (deliveryId) =>
    api.post(DELIVERY_ACTION_ENDPOINTS.pickupComplete(deliveryId)),

  start: (deliveryId) =>
    api.post(DELIVERY_ACTION_ENDPOINTS.start(deliveryId)),

  complete: (deliveryId) =>
    api.post(DELIVERY_ACTION_ENDPOINTS.complete(deliveryId)),
};