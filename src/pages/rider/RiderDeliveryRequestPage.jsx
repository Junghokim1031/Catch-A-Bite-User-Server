import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoleGuard from "../../hooks/useRoleGuard.js";

import { DELIVERY_STATUS } from "../../constants/deliveryStatus.js";
import { mapToUiStatus } from "../../utils/mapDeliveryStatus.js";
import { DELIVERY_UI_CONFIG } from "../../constants/deliveryUiConfig.js";

import { riderDeliveryService } from "../../services/riderDeliveryService.js";
import { deliveryActionService } from "../../services/deliveryActionService.js";


const fallbackUser = { name: "Sample Rider" };

function formatKRW(amount) {
  if (amount == null) return "-";
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

function safeId(d) {
  return d?.deliveryId ?? d?.orderDeliveryId ?? d?.id;
}

function pickSummaryFields(d) {
  // OrderDeliveryDTO 실제 필드명이 프로젝트마다 다를 수 있어 안전하게 fallback
  const storeName = d?.storeName ?? d?.store?.storeName ?? "가게";
  const storeAddress = d?.storeAddress ?? d?.store?.storeAddress ?? d?.pickupAddress ?? "-";
  const dropoffAddress = d?.address ?? d?.deliveryAddress ?? d?.dropoffAddress ?? "-";
  const fee = d?.deliveryFee ?? d?.fee ?? d?.orderDeliveryFee;
  const distance = d?.orderDeliveryDistance ?? d?.distanceKm ?? d?.distance;
  const etaMin = d?.etaMin ?? d?.estimatedMinutes ?? d?.eta;

  return { storeName, storeAddress, dropoffAddress, fee, distance, etaMin };
}

function formatKm(km) {
  if (km == null) return "-";
  const num = Number(km);
  if (Number.isNaN(num)) return String(km);
  return `${num.toFixed(1)}km`;
}

function formatEta(min) {
  if (min == null) return "-";
  const num = Number(min);
  if (Number.isNaN(num)) return String(min);
  if (num <= 0) return "도착";
  return `${num}분`;
}

export default function RiderDeliveryRequestPage() {
  const { user, loading } = useRoleGuard("RIDER", fallbackUser);
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);

  // “수락 대기(배차됨)” 목록 조회: ASSIGNED
  useEffect(() => {
    let cancelled = false;

    async function fetchAssigned() {
      setFetching(true);
      setErrorMsg("");

      try {
        const list = await riderDeliveryService.getMyDeliveriesByStatus(
          DELIVERY_STATUS.ASSIGNED
        );
        if (!cancelled) setAssignedDeliveries(list ?? []);
      } catch (e) {
        const msg =
          e?.response?.data?.message || e?.message || "배달 요청을 불러오지 못했습니다.";
        if (!cancelled) setErrorMsg(msg);
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    fetchAssigned();
    return () => {
      cancelled = true;
    };
  }, []);

  // “가장 최신 1건”만 보여주기(필요하면 정렬 기준을 createdTime으로 바꾸면 됨)
  const latest = useMemo(() => {
    if (!assignedDeliveries?.length) return null;
    // createdTime 같은 게 있으면 여기서 정렬 추천:
    // return [...assignedDeliveries].sort((a,b)=>new Date(b.createdTime)-new Date(a.createdTime))[0]
    return assignedDeliveries[0];
  }, [assignedDeliveries]);

  const headerRight = useMemo(() => {
    if (loading) return "로딩중...";
    return user?.name ?? "";
  }, [loading, user]);

  const uiStatus = latest ? mapToUiStatus(latest.orderDeliveryStatus ?? latest.status) : null;
  const statusLabel =
    uiStatus && DELIVERY_UI_CONFIG?.[uiStatus]?.label
      ? DELIVERY_UI_CONFIG[uiStatus].label
      : "배달 요청";

  const summary = latest ? pickSummaryFields(latest) : null;

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
        <div style={{ fontWeight: 900 }}>새로운 배달 요청</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>{headerRight}</div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {fetching && <InfoBox>요청을 불러오는 중…</InfoBox>}

        {!fetching && errorMsg && <InfoBox>{errorMsg}</InfoBox>}

        {!fetching && !errorMsg && !latest && (
          <InfoBox>현재 수락 대기 중인 배달 요청이 없습니다.</InfoBox>
        )}

        {!fetching && !errorMsg && latest && (
          <>
            {/* 상단 요약 카드 */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={chipStyle}>{statusLabel}</span>
                <div style={{ marginLeft: "auto", fontWeight: 900 }}>
                  {formatKRW(summary.fee)}
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900 }}>
                {summary.storeName}
              </div>

              <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                <div>📍 픽업: {summary.storeAddress}</div>
                <div style={{ marginTop: 4 }}>🏁 도착: {summary.dropoffAddress}</div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, fontSize: 13 }}>
                <span>⏱ 예상 {formatEta(summary.etaMin)}</span>
                <span>🧭 {formatKm(summary.distance)}</span>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                  onClick={() => navigate(`/rider/deliveries/${safeId(latest)}`)}
                  style={btnStyleGhost}
                >
                  상세보기
                </button>

                {/* 변경 후 코드 (실제 API + 이동) */}
                <button
                  style={btnStylePrimary}
                  disabled={fetching}
                  onClick={async () => {
                    if (!latest) return;

                    const deliveryId =
                      latest.deliveryId ?? latest.orderDeliveryId ?? latest.id;

                    const delivererId = user?.delivererId;
                    if (!delivererId) {
                      alert("delivererId를 찾을 수 없습니다.");
                      return;
                    }

                    setFetching(true);

                    const result = await deliveryActionService.accept(
                      deliveryId,
                      delivererId
                    );

                    setFetching(false);

                    if (!result.ok) {
                      alert(result.message);
                      return;
                    }

                    // 수락 성공 → 배달 접수 상세로 이동
                    navigate(`/rider/deliveries/${deliveryId}`);
                  }}
                  >
                    배달 수락하기
                </button>

              </div>
            </div>

            {/* 하단 안내/노티 */}
            <div style={noticeStyle}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>안내</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                배달 요청을 수락하면 “배달 접수(ACCEPTED)” 단계로 이동합니다. 안전 운행을 위해
                출발 전 헬멧/조명 상태를 확인하세요.
              </div>
            </div>

            {/* (선택) 추가 요청이 여러 건이면 리스트로 표시 */}
            {assignedDeliveries.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>다른 요청</div>
                {assignedDeliveries.slice(1).map((d) => {
                  const id = safeId(d);
                  const s = pickSummaryFields(d);
                  return (
                    <div
                      key={id}
                      style={{ ...cardStyle, padding: 12, cursor: "pointer" }}
                      onClick={() => navigate(`/rider/deliveries/${id}`)}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ fontWeight: 800 }}>{s.storeName}</div>
                        <div style={{ marginLeft: "auto", fontWeight: 800 }}>
                          {formatKRW(s.fee)}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                        픽업: {s.storeAddress}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
  padding: "10px 12px",
  fontWeight: 900,
  cursor: "pointer",
  background: "#111",
  color: "#fff",
};

const btnStyleGhost = {
  flex: 1,
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 900,
  cursor: "pointer",
  background: "#fff",
};

const noticeStyle = {
  marginTop: 12,
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
};