import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRoleGuard from "../../hooks/useRoleGuard.js";

import { mapToUiStatus } from "../../utils/mapDeliveryStatus.js";
import { DELIVERY_UI_CONFIG } from "../../constants/deliveryUiConfig.js";

import { riderDeliveryService } from "../../services/riderDeliveryService.js";

import { deliveryActionService } from "../../services/deliveryActionService.js";


const fallbackUser = { name: "Sample Rider" };

function formatKRW(amount) {
  if (amount == null) return "-";
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

function formatKm(km) {
  if (km == null) return "-";
  return `${Number(km).toFixed(1)}km`;
}

function formatEta(min) {
  if (min == null) return "-";
  if (min <= 0) return "도착";
  return `${min}분`;
}

function pickDetailFields(d) {
  return {
    storeName: d?.storeName ?? d?.store?.storeName ?? "가게",

    // 픽업 주소(가게 주소)
    storeAddress: d?.storeAddress ?? d?.store?.storeAddress ?? "-",

    // 배달 주소(고객 주소)
    dropoffAddress: d?.dropoffAddress ?? d?.orderAddressSnapshot ?? "-",

    // 배달금액
    fee: d?.orderDeliveryFee ?? d?.deliveryFee ?? d?.fee,

    // 시간(분) - null 허용
    // etaMin: d?.orderDeliveryEstTime ?? d?.etaMin ?? d?.estimatedMinutes ?? null,

    requestMemo: d?.deliveryRequest ?? d?.requestMemo ?? d?.orderRequest ?? "",
  };
}

export default function RiderDeliveryDetailPage() {
  const { user, loading } = useRoleGuard("RIDER", fallbackUser);
  const { deliveryId } = useParams(); // deliveryId
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [delivery, setDelivery] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setFetching(true);
      setErrorMsg("");

      try {
        const data = await riderDeliveryService.getMyDelivery(deliveryId);
        if (!cancelled) setDelivery(data);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "배달 정보를 불러오지 못했습니다.";
        if (!cancelled) setErrorMsg(msg);
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [deliveryId]);

  const uiStatus = useMemo(() => {
    if (!delivery) return null;
    return mapToUiStatus(
      delivery.orderDeliveryStatus ?? delivery.status
    );
  }, [delivery]);

  const statusLabel =
    uiStatus && DELIVERY_UI_CONFIG[uiStatus]
      ? DELIVERY_UI_CONFIG[uiStatus].label
      : "";

  const detail = delivery ? pickDetailFields(delivery) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7f9" }}>
      {/* 헤더 */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderBottom: "1px solid #eee",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <div style={{ fontWeight: 900 }}>배달 접수 상세</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {loading ? "로딩중..." : user?.name}
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {fetching && <InfoBox>불러오는 중…</InfoBox>}
        {!fetching && errorMsg && <InfoBox>{errorMsg}</InfoBox>}

        {!fetching && !errorMsg && delivery && (
          <>
            {/* 상태 + 요약 */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={chipStyle}>{statusLabel}</span>
                <div style={{ marginLeft: "auto", fontWeight: 900 }}>
                  {formatKRW(detail.fee)}
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900 }}>
                {detail.storeName}
              </div>

              <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                <div>📍 픽업: {detail.storeAddress}</div>
                <div style={{ marginTop: 4 }}>
                  🏁 도착: {detail.dropoffAddress}
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 10,
                  fontSize: 13,
                }}
              >

              </div>
            </div>

            {/* 요청사항 */}
            {detail.requestMemo && (
              <div style={{ ...cardStyle, marginTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>
                  요청사항
                </div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {detail.requestMemo}
                </div>
              </div>
            )}

            {/* 액션 */}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button
                style={btnStyleGhost}
                onClick={() => navigate("/rider/deliveries")}
              >
                목록으로
              </button>

              {/* 다음 단계에서 pickup-complete API 연결 */}
              <button
                style={btnStylePrimary}
                disabled={fetching}
                onClick={async () => {
                  if (!delivery) return;

                  const realDeliveryId =
                    delivery?.deliveryId ?? delivery?.orderDeliveryId ?? delivery?.id ?? deliveryId;

                  setFetching(true);
                  try {
                    const result = await deliveryActionService.pickupComplete(realDeliveryId);
                    if (!result.ok) {
                      alert(result.message);
                      return;
                    }
                    navigate(`/rider/deliveries/${realDeliveryId}/complete`);
                  } finally {
                    setFetching(false);
                  }
                }}
                >
                {fetching ? "처리 중..." : "픽업 완료"}
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoBox({ children }) {
  return <div style={boxStyle}>{children}</div>;
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
};

const boxStyle = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 16,
  color: "#666",
};

const chipStyle = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #ddd",
  background: "#fafafa",
};

const btnStylePrimary = {
  flex: 1,
  border: "none",
  borderRadius: 10,
  padding: "12px",
  fontWeight: 900,
  cursor: "pointer",
  background: "#111",
  color: "#fff",
};

const btnStyleGhost = {
  flex: 1,
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: "12px",
  fontWeight: 900,
  cursor: "pointer",
  background: "#fff",
};