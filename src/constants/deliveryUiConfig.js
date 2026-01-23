import { DELIVERY_UI_STEP } from "./deliveryStatus";

export const DELIVERY_UI_CONFIG = {
  [DELIVERY_UI_STEP.WAITING]: {
    label: "배달 대기 중",
    actions: [],
  },

  [DELIVERY_UI_STEP.REQUESTED]: {
    label: "새로운 배달 요청",
    actions: ["ACCEPT"],
  },

  [DELIVERY_UI_STEP.ACCEPTED]: {
    label: "가게로 이동 중",
    actions: ["PICKUP_COMPLETE"],
  },

  [DELIVERY_UI_STEP.PICKED_UP]: {
    label: "픽업 완료",
    actions: ["START_DELIVERY"],
  },

  [DELIVERY_UI_STEP.DELIVERING]: {
    label: "배달 중",
    actions: ["COMPLETE"],
  },

  [DELIVERY_UI_STEP.COMPLETED]: {
    label: "배달 완료",
    actions: [],
  },

  [DELIVERY_UI_STEP.CANCELLED]: {
    label: "배달 취소",
    actions: [],
  },
};