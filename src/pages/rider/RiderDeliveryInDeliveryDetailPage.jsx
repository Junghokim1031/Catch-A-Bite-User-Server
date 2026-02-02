import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRoleGuard from "../../hooks/useRoleGuard.js";

import { DELIVERY_STATUS } from "../../constants/deliveryStatus.js";
import { mapToUiStatus } from "../../utils/mapDeliveryStatus.js";
import { DELIVERY_UI_CONFIG } from "../../constants/deliveryUiConfig.js";

import { riderDeliveryService } from "../../services/riderDeliveryService.js";
import { deliveryActionService } from "../../services/deliveryActionService.js";

const fallbackUser = { name: "Sample Rider" };

function pickSummaryFields(d) {
  const storeName = d?.storeName ?? d?.store?.storeName ?? "가게";
  const storeAddress =
    d?.storeAddress ?? d?.store?.storeAddress ?? d?.pickupAddress ?? "-";
  const dropoffAddress =
    d?.address ?? d?.deliveryAddress ?? d?.dropoffAddress ?? "-";
  const fee = d?.deliveryFee ?? d?.fee ?? d?.orderDeliveryFee ?? 0;

  return { storeName, storeAddress, dropoffAddress, fee };
}

export default function RiderDeliveryInDeliveryDetailPage() {
  useRoleGuard("RIDER");

  const { deliveryId } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const uiStatusKey = useMemo(
    () => mapToUiStatus(delivery?.orderDeliveryStatus),
    [delivery?.orderDeliveryStatus]
  );

  const uiConfig = DELIVERY_UI_CONFIG[uiStatusKey] ?? DELIVERY_UI_CONFIG.WAITING;

  const summary = useMemo(() => pickSummaryFields(delivery), [delivery]);

  useEffect(() => {
    let mounted = true;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const res = await riderDeliveryService.getMyDeliveryDetail(deliveryId);
        if (!mounted) return;

        setDelivery(res?.data ?? res); // 서비스 반환 형태에 따라 fallback
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [deliveryId]);

  const handleDeliveryComplete = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await deliveryActionService.complete(deliveryId);

      // 완료 처리 후 목록(배달현황)으로
      navigate(`/rider/deliveries`);
    } catch (e) {
      setError(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}>에러가 발생했어요.</div>
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  const riderName = delivery?.delivererName ?? fallbackUser.name;

  return (
    <div style={{ padding: 16 }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 18,
            cursor: "pointer",
            marginRight: 8,
          }}
        >
          ←
        </button>

        <div style={{ fontSize: 18, fontWeight: 700 }}>배달 접수 상세</div>

        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
          {riderName}
        </div>
      </div>

      {/* 카드 */}
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 999,
              background: uiConfig.badgeBg,
              color: uiConfig.badgeText,
              fontWeight: 700,
            }}
          >
            {uiConfig.badgeLabel}
          </div>

          <div style={{ marginLeft: "auto", fontWeight: 800 }}>
            {Number(summary.fee).toLocaleString()}원
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 24, fontWeight: 900 }}>
          {summary.storeName}
        </div>

        <div style={{ marginTop: 10, opacity: 0.85 }}>
          <div style={{ marginBottom: 6 }}>📍 픽업: {summary.storeAddress}</div>
          <div>🏁 도착: {summary.dropoffAddress}</div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button
          onClick={() => navigate("/rider/deliveries")}
          style={{
            flex: 1,
            padding: "14px 12px",
            borderRadius: 12,
            border: "1px solid #eee",
            background: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          목록으로
        </button>

        <button
          onClick={handleDeliveryComplete}
          disabled={submitting}
          style={{
            flex: 1,
            padding: "14px 12px",
            borderRadius: 12,
            border: "none",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          배달 완료
        </button>
      </div>

      {/* 상태 디버그(원하면 삭제) */}
      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.55 }}>
        orderStatus: {delivery?.orderStatus ?? "-"} / orderDeliveryStatus:{" "}
        {delivery?.orderDeliveryStatus ?? "-"}
      </div>
    </div>
  );
}