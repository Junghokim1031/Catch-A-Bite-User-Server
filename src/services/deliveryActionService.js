// src/services/deliveryActionService.js
import { deliveryActionApi } from "../api/deliveryActionApi";

function pickMessage(res) {
  return res?.data?.message ?? "처리되었습니다.";
}

function pickErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    "요청 처리 중 오류가 발생했습니다."
  );
}

export const deliveryActionService = {
  async accept(deliveryId, delivererId) {
    try {
      const res = await deliveryActionApi.accept(deliveryId, delivererId);
      return { ok: true, message: pickMessage(res) };
    } catch (err) {
      return { ok: false, message: pickErrorMessage(err) };
    }
  },

  async pickupComplete(deliveryId, delivererId) {
    try {
      const res = await deliveryActionApi.pickupComplete(deliveryId, delivererId);
      return { ok: true, message: pickMessage(res) };
    } catch (err) {
      return { ok: false, message: pickErrorMessage(err) };
    }
  },

  async start(deliveryId, delivererId) {
    try {
      const res = await deliveryActionApi.start(deliveryId, delivererId);
      return { ok: true, message: pickMessage(res) };
    } catch (err) {
      return { ok: false, message: pickErrorMessage(err) };
    }
  },

  async complete(deliveryId, delivererId) {
    try {
      const res = await deliveryActionApi.complete(deliveryId, delivererId);
      return { ok: true, message: pickMessage(res) };
    } catch (err) {
      return { ok: false, message: pickErrorMessage(err) };
    }
  },
};