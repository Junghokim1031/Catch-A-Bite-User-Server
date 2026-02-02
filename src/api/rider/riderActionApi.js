// src/api/rider/riderActionApi.js
import axiosInstance from "../axios";

/**
 *  (Principal 기반) 액션 API
 * - delivererId를 Body로 보내지 않음
 * - 백엔드: /api/v1/deliveries/**
 */

// 수락(배달원)
export const acceptDelivery = (deliveryId) => {
  if (!deliveryId) throw new Error("deliveryId is required");
  return axiosInstance.post(`/api/v1/deliveries/${deliveryId}/accept`);
};

// 매장에서 픽업완료(배달원)
export const pickupComplete = (deliveryId) => {
  if (!deliveryId) throw new Error("deliveryId is required");
  return axiosInstance.post(`/api/v1/deliveries/${deliveryId}/pickup-complete`);
};

// 배달 시작(배달원)
export const startDelivery = (deliveryId) => {
  if (!deliveryId) throw new Error("deliveryId is required");
  return axiosInstance.post(`/api/v1/deliveries/${deliveryId}/start`);
};

// 배달 완료(배달원)
export const completeDelivery = (deliveryId) => {
  if (!deliveryId) throw new Error("deliveryId is required");
  return axiosInstance.post(`/api/v1/deliveries/${deliveryId}/complete`);
};

// (옵션) 배달 재오픈(관리자/시스템) - rider 폴더에 두기 애매하면 admin/api로 분리 추천
export const reopenDelivery = (deliveryId) => {
  if (!deliveryId) throw new Error("deliveryId is required");
  return axiosInstance.post(`/api/v1/deliveries/${deliveryId}/reopen`);
};