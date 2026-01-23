import { DELIVERY_STATUS, DELIVERY_UI_STEP } from "@/constants/deliveryStatus";

/**
 * 백엔드 DeliveryStatus → 프론트 UI 단계
 * UI 변경, (배달)단계 추가, 텍스트 변경 전부 컨트롤 가능해짐
 */
export function mapToUiStatus(status) {
  switch (status) {
    case DELIVERY_STATUS.PENDING:
      return DELIVERY_UI_STEP.WAITING;

    case DELIVERY_STATUS.ASSIGNED:
      return DELIVERY_UI_STEP.REQUESTED;

    case DELIVERY_STATUS.ACCEPTED:
      return DELIVERY_UI_STEP.ACCEPTED;

    case DELIVERY_STATUS.PICKED_UP:
      return DELIVERY_UI_STEP.PICKED_UP;

    case DELIVERY_STATUS.IN_DELIVERY:
      return DELIVERY_UI_STEP.DELIVERING;

    case DELIVERY_STATUS.DELIVERED:
      return DELIVERY_UI_STEP.COMPLETED;

    case DELIVERY_STATUS.CANCELLED:
      return DELIVERY_UI_STEP.CANCELLED;

    default:
      return DELIVERY_UI_STEP.WAITING;
  }
}