import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRoleGuard from "../../hooks/useRoleGuard.js";

import { riderDeliveryService } from "../../services/riderDeliveryService.js";
import { deliveryActionService } from "../../services/deliveryActionService.js";

import { mapToUiStatus } from "../../utils/mapDeliveryStatus.js";
import { DELIVERY_UI_CONFIG } from "../../constants/deliveryUiConfig.js";
import { DELIVERY_STATUS } from "../../constants/deliveryStatus.js";

import KakaoMap from "../../components/rider/map/KakaoMap.jsx";


const fallbackUser = { name: "Sample Rider" };

function pickFields(d) {
  return {
    deliveryId: d?.deliveryId ?? d?.orderDeliveryId ?? d?.id,
    status: d?.orderDeliveryStatus ?? d?.status,

    storeName: d?.storeName ?? d?.store?.storeName ?? "가게",
    storeAddress: d?.storeAddress ?? d?.store?.storeAddress ?? "-",
    dropoffAddress: d?.dropoffAddress ?? d?.orderAddressSnapshot ?? "-",

    fee: d?.orderDeliveryFee ?? d?.deliveryFee ?? d?.fee,

    // 시간 null 허용
    // etaMin: d?.orderDeliveryEstTime ?? d?.etaMin ?? null,
  };
}

function formatKRW(amount) {
  if (amount == null) return "-";
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

// function formatKm(km) {
//   if (km == null) return "-";
//   const n = Number(km);
//   if (Number.isNaN(n)) return String(km);
//   return `${n.toFixed(1)}km`;
// }

// function formatEta(min) {
//   if (min == null) return "-";
//   const n = Number(min);
//   if (Number.isNaN(n)) return String(min);
//   if (n <= 0) return "도착";
//   return `${n}분`;
// }

export default function RiderDeliveryInProgressPage() {
  const { user, loading } = useRoleGuard("RIDER", fallbackUser);
  const { deliveryId } = useParams(); // deliveryId
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [delivery, setDelivery] = useState(null);

  const [acting, setActing] = useState(false);

  async function refresh() {
    setFetching(true);
    setErrorMsg("");
    try {
      const data = await riderDeliveryService.getMyDelivery(deliveryId);
      setDelivery(data);
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message || e?.message || "배달 정보를 불러오지 못했습니다."
      );
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId]);

  const view = useMemo(() => (delivery ? pickFields(delivery) : null), [delivery]);

  const uiStatus = useMemo(() => {
    if (!view) return null;
    return mapToUiStatus(view.status);
  }, [view]);

  const statusLabel = useMemo(() => {
    if (!uiStatus) return "";
    return DELIVERY_UI_CONFIG?.[uiStatus]?.label ?? uiStatus;
  }, [uiStatus]);

  // 버튼 노출 규칙 (현재 흐름 기준)
  // - 픽업완료 후 들어오므로 보통 PICKED_UP 상태일 확률 ↑ → "배달 시작" 버튼 제공
  // - IN_DELIVERY면 "배달 완료" 버튼 제공
  const canStart = view?.status === DELIVERY_STATUS.PICKED_UP;
  const canComplete = view?.status === DELIVERY_STATUS.IN_DELIVERY;

  async function onStart() {
    if (!view?.deliveryId) return;

    const delivererId = user?.delivererId;
    if (!delivererId) {
      alert("delivererId를 찾을 수 없습니다.");
      return;
    }

    setActing(true);
    const result = await deliveryActionService.start(view.deliveryId, delivererId);
    setActing(false);

    if (!result.ok) {
      alert(result.message);
      return;
    }

    // 상태 갱신 후 UI 업데이트
    await refresh();
  }

  async function onComplete() {
    if (!view?.deliveryId) return;

    const delivererId = user?.delivererId;
    if (!delivererId) {
      alert("delivererId를 찾을 수 없습니다.");
      return;
    }

    setActing(true);
    const result = await deliveryActionService.complete(view.deliveryId, delivererId);
    setActing(false);

    if (!result.ok) {
      alert(result.message);
      return;
    }

    // 완료 후 배달현황(목록)으로 이동
    navigate(`/rider/deliveries`);
  }

  const headerRight = useMemo(() => {
    if (loading) return "로딩중...";
    return user?.name ?? "";
  }, [loading, user]);

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
          style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}
          aria-label="back"
        >
          ←
        </button>
        <div style={{ fontWeight: 900 }}>배달 중</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>{headerRight}</div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {fetching && <InfoBox>불러오는 중…</InfoBox>}
        {!fetching && errorMsg && <InfoBox>{errorMsg}</InfoBox>}

        {!fetching && !errorMsg && view && (
          <>
            {/* 지도 영역(placeholder) */}
            <div style={mapBoxStyle}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>지도/경로 (TODO)</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                Kakao Map 또는 지도 컴포넌트(MapView)를 여기에 붙이면 됩니다.
                <br />
                - 픽업지/도착지 마커
                <br />
                - 경로 폴리라인
              </div>
            </div>

            {/* 요약 카드 */}
            <div style={{ ...cardStyle, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={chipStyle}>{statusLabel}</span>
                <div style={{ marginLeft: "auto", fontWeight: 900 }}>
                  {formatKRW(view.fee)}
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900 }}>
                {view.storeName}
              </div>

              <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                <div>📍 픽업: {view.storeAddress}</div>
                <div style={{ marginTop: 4 }}>🏁 도착: {view.dropoffAddress}</div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                  style={btnStyleGhost}
                  onClick={() => navigate(`/rider/deliveries/${view.deliveryId}`)}
                  disabled={acting}
                >
                  상세
                </button>

                {canStart && (
                  <button style={btnStylePrimary} onClick={onStart} disabled={acting}>
                    {acting ? "처리 중..." : "배달 시작"}
                  </button>
                )}

                {canComplete && (
                  <button style={btnStylePrimary} onClick={onComplete} disabled={acting}>
                    {acting ? "처리 중..." : "배달 완료"}
                  </button>
                )}

                {!canStart && !canComplete && (
                  <button style={btnStylePrimary} onClick={refresh} disabled={acting}>
                    새로고침
                  </button>
                )}
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
                * 픽업 완료 후 “배달 시작”을 눌러 IN_DELIVERY로 전환한 뒤, “배달 완료”를 진행하세요.
              </div>
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

const mapBoxStyle = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
  minHeight: 220,
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
