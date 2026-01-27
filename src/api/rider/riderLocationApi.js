// src/api/rider/riderLocationApi.js
import axiosInstance from "../axios";

/**
 * DeliveryLocationController 연동용 (매장/고객 좌표만)
 *
 * 백엔드:
 * GET /api/v1/rider/deliveries/{deliveryId}/coordinates
 *
 * 응답(예상):
 * {
 *   success: true,
 *   message: "좌표 조회 성공",
 *   data: {
 *     deliveryId,
 *     storeLatitude, storeLongitude,
 *     dropoffLatitude, dropoffLongitude
 *   }
 * }
 */

/**
 * 배달 좌표 조회 (매장/고객)
 */
export const getDeliveryCoordinates = (deliveryId) => {
  if (!deliveryId) throw new Error("deliveryId is required");
  return axiosInstance.get(`/api/v1/rider/deliveries/${deliveryId}/coordinates`);
};