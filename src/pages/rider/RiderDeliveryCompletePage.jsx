import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRoleGuard from "../../hooks/useRoleGuard.js";

import { riderDeliveryService } from "../../services/riderDeliveryService.js";
import { mapToUiStatus } from "../../utils/mapDeliveryStatus.js";
import { DELIVERY_UI_CONFIG } from "../../constants/deliveryUiConfig.js";
import { deliveryActionService } from "../../services/deliveryActionService.js";

const fallbackUser = { name: "Sample Rider" };

function pickSummary(d) {
  return {
    deliveryId: d?.deliveryId ?? d?.orderDeliveryId ?? d?.deliveryId,
    storeName: d?.storeName ?? d?.store?.storeName ?? "가게",
    storeAddress:
      d?.storeAddress ?? d?.store?.storeAddress ?? d?.pickupAddress ?? "-",
    dropoffAddress:
      d?.address ?? d?.deliveryAddress ?? d?.dropoffAddress ?? "-",
    fee: d?.deliveryFee ?? d?.fee ?? d?.orderDeliveryFee,
    completedAt:
      d?.orderDeliveryCompleteTime ??
      d?.completedAt ??
      d?.updatedAt,
    status: d?.orderDeliveryStatus ?? d?.status,
  };
}

function formatKRW(amount) {
  if (amount == null) return "-";
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleString("ko-KR");
}

export default function RiderDeliveryCompletePage() {
  const { user, loading } = useRoleGuard("RIDER", fallbackUser);
  const { deliveryId } = useParams();
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
        if (!cancelled) {
          setErrorMsg(
            e?.response?.data?.message ||
              e?.message ||
              "배달 완료 정보를 불러오지 못했습니다."
          );
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [deliveryId]);

  const summary = useMemo(
    () => (delivery ? pickSummary(delivery) : null),
    [delivery]
  );

  const uiStatus = useMemo(() => {
    if (!summary) return null;
    return mapToUiStatus(summary.status);
  }, [summary]);

  const statusLabel =
    uiStatus && DELIVERY_UI_CONFIG[uiStatus]
      ? DELIVERY_UI_CONFIG[uiStatus].label
      : "배달 완료";

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
          onClick={() => navigate("/rider/deliveries")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <div style={{ fontWeight: 900 }}>배달 완료</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {loading ? "로딩중..." : user?.name}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {fetching && <InfoBox>불러오는 중…</InfoBox>}
        {!fetching && errorMsg && <InfoBox>{errorMsg}</InfoBox>}

        {!fetching && !errorMsg && summary && (
          <>
            {/* 완료 배지 */}
            <div style={completeCardStyle}>
              <div style={{ fontSize: 28 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>
                {statusLabel}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                {formatDateTime(summary.completedAt)}
              </div>
            </div>

            {/* 요약 카드 */}
            <div style={{ ...cardStyle, marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>
                배달 요약
              </div>

              <div style={{ fontSize: 14, marginBottom: 6 }}>
                🏪 {summary.storeName}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                📍 픽업: {summary.storeAddress}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
                🏁 도착: {summary.dropoffAddress}
              </div>

              <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
                <span>💰 {formatKRW(summary.fee)}</span>
              </div>
            </div>

            {/* 정산 안내 */}
            <div style={{ ...cardStyle, marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>
                정산 안내
              </div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                본 배달 건은 정산 대상에 포함됩니다.
                <br />
                정산 내역은 <b>내 수입</b> 메뉴에서 확인할 수 있습니다.
              </div>
            </div>

            {/* CTA */}
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button style={btnStyleGhost} onClick={() => navigate("/rider/main")}>
                  홈으로
                </button>

                <button
                  style={btnStylePrimary}
                  disabled={fetching}
                  onClick={async () => {
                    const realDeliveryId = summary?.deliveryId ?? deliveryId;
                    setFetching(true);
                    try {
                      const result = await deliveryActionService.complete(realDeliveryId);
                      if (!result.ok) {
                        alert(result.message);
                        return;
                      }
                      navigate("/rider/deliveries");
                    } finally {
                      setFetching(false);
                    }
                  }}
                >
                  {fetching ? "처리 중..." : "배달완료"}
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

const completeCardStyle = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: "20px 16px",
  textAlign: "center",
};

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
