import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoleGuard from "../../hooks/useRoleGuard.js";

import { DELIVERY_STATUS } from "../../constants/deliveryStatus.js";
import { mapToUiStatus } from "../../utils/mapDeliveryStatus.js";
import { DELIVERY_UI_CONFIG } from "../../constants/deliveryUiConfig.js";

import { riderDeliveryService } from "../../services/riderDeliveryService.js";

const fallbackUser = { name: "Sample Rider" };

// 탭(화면) -> 백엔드 DeliveryStatus (서버 조회 파라미터)
const TAB_TO_BACKEND_STATUSES = {
  WAITING: [DELIVERY_STATUS.PENDING, DELIVERY_STATUS.ASSIGNED],
  ONGOING: [DELIVERY_STATUS.ACCEPTED, DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.IN_DELIVERY],
  DONE: [DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.CANCELLED],
};

const TABS = [
  { key: "WAITING", label: "대기" },
  { key: "ONGOING", label: "진행" },
  { key: "DONE", label: "완료" },
];

function formatKRW(amount) {
  if (amount == null) return "-";
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

function DeliveryCard({ delivery, onClick }) {
  const uiStatus = mapToUiStatus(delivery.orderDeliveryStatus ?? delivery.status);
  const config = DELIVERY_UI_CONFIG[uiStatus] ?? { label: uiStatus, actions: [] };

  // 백엔드 DTO 기준으로 우선순위 재정의
  const storeName =
    delivery.storeName ??
    delivery.store?.storeName ??
    "가게";

  // '배달주소' = 고객 주소(드롭오프)
  const address =
    delivery.dropoffAddress ??             // 백엔드에서 내려주면 이걸 사용
    delivery.orderAddressSnapshot ??        // (혹시 내려주면)
    delivery.address ??
    delivery.deliveryAddress ??
    "-";

  // 배달금액
  const fee =
    delivery.orderDeliveryFee ??           // StoreOrder.orderDeliveryFee
    delivery.deliveryFee ??
    delivery.fee;

  return (
    <div onClick={onClick} style={{ /* 그대로 */ }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ /* 그대로 */ }}>{config.label}</span>
        <div style={{ marginLeft: "auto", fontWeight: 800 }}>{formatKRW(fee)}</div>
      </div>

      <div style={{ marginTop: 10, fontSize: 16, fontWeight: 800 }}>{storeName}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: "#666" }}>{address}</div>
    </div>
  );
}

export default function RiderDeliveriesPage() {
  const { user, loading } = useRoleGuard("RIDER", fallbackUser);
  const navigate = useNavigate();

  const [tab, setTab] = useState("WAITING");
  const [deliveries, setDeliveries] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 픽업완료/배달완료 제어
  const handleDeliveryClick = (delivery) => {
      const id = delivery?.deliveryId ?? delivery?.id ?? delivery;
      const ods = delivery?.orderDeliveryStatus;

      // 상태별 상세 페이지 분기
      if (ods === DELIVERY_STATUS.IN_DELIVERY) {
        navigate(`/rider/deliveries/${id}/in-delivery`);
        return;
      }
      if (ods === DELIVERY_STATUS.DELIVERED || ods === DELIVERY_STATUS.CANCELLED) {
        navigate(`/rider/deliveries/${id}/complete`);
        return;
      }
      navigate(`/rider/deliveries/${id}`);
    };

  // 탭의 여러 status를 “서버 호출 여러 번”으로 가져와 합치기
  // (백엔드가 status 1개씩만 받도록 되어있음) :contentReference[oaicite:3]{index=3}
  useEffect(() => {
    if (loading) return;   // me 확인 전에는 호출하지 않음

    let cancelled = false;

    async function fetchByTab() {
      setFetching(true);
      setErrorMsg("");

      try {
        const statuses = TAB_TO_BACKEND_STATUSES[tab] ?? [];

        const results = await Promise.all(
          statuses.map((s) => riderDeliveryService.getMyDeliveriesByStatus(s))
        );

        // 서비스에서 이미 "배열"만 리턴하므로 바로 flat
        const merged = results.flat();

        // 중복 제거
        const uniq = new Map();
        for (const d of merged) {
          const id = d?.deliveryId ?? d?.orderDeliveryId ?? d?.id;
          if (id != null) uniq.set(id, d);
        }

        if (!cancelled) setDeliveries(Array.from(uniq.values()));
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "조회 중 오류가 발생했습니다.";
        if (!cancelled) setErrorMsg(msg);
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    fetchByTab();
    return () => {
      cancelled = true;
    };
  }, [tab, loading]); // loading 의존성 추가 // 로그인 정보가 먼저 오도록 후순위로 미룰 방법 찾기

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
        <div style={{ fontWeight: 900 }}>배달 현황</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>{headerRight}</div>
      </div>

      {/* 탭 */}
      <div
        style={{
          background: "#fff",
          padding: "10px 16px",
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: 8,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              borderRadius: 999,
              padding: "10px 12px",
              border: "1px solid #ddd",
              background: tab === t.key ? "#111" : "#fff",
              color: tab === t.key ? "#fff" : "#111",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 내용 */}
      <div style={{ padding: "12px 16px" }}>
        {fetching && (
          <div style={boxStyle}>
            목록을 불러오는 중…
          </div>
        )}

        {!fetching && errorMsg && (
          <div style={boxStyle}>
            {errorMsg}
          </div>
        )}

        {!fetching && !errorMsg && deliveries.length === 0 && (
          <div style={boxStyle}>
            표시할 배달이 없습니다.
          </div>
        )}

        {!fetching &&
          !errorMsg &&
          deliveries.map((d) => {
            const id = d.deliveryId ?? d.orderDeliveryId ?? d.id;
            return (
              <DeliveryCard
                key={id}
                delivery={d}
                onClick={() => handleDeliveryClick(d)} style={{ cursor: "pointer" }}
              />
            );
          })}
      </div>
    </div>
  );
}

const boxStyle = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 16,
  color: "#666",
};