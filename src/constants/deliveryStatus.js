/**
 * 백엔드 DeliveryStatus 원본
 */
export const DELIVERY_STATUS = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
  IN_DELIVERY: "IN_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

/**
 * 라이더 UI 단계 (화면 표현용)
 * - 백엔드 상태 여러 개를 하나의 UI 단계로 묶을 수 있음
 */
export const DELIVERY_UI_STEP = {
  WAITING: "WAITING",          // 배달 대기
  REQUESTED: "REQUESTED",      // 배달 요청 수신
  ACCEPTED: "ACCEPTED",        // 배달 수락
  PICKUP_READY: "PICKUP_READY",// 픽업 이동 중
  PICKED_UP: "PICKED_UP",      // 픽업 완료
  DELIVERING: "DELIVERING",    // 배달 중
  COMPLETED: "COMPLETED",      // 배달 완료
  CANCELLED: "CANCELLED",
};