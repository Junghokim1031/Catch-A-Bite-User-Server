import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDeliveryCoordinates } from "../../api/rider";

export default function RiderDeliveryNavigationPage() {
  const { deliveryId } = useParams();

  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 좌표 조회
  useEffect(() => {
    if (!deliveryId) return;

    setLoading(true);
    getDeliveryCoordinates(deliveryId)
      .then((res) => {
        setCoords(res.data.data); // DeliveryApiResponseDTO.data
      })
      .catch((e) => {
        setError(e.response?.data?.message || "좌표 조회 실패");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [deliveryId]);

  // Kakao 길찾기 실행 (앱 or 웹)
  const openKakaoNavigation = (lat, lng, name) => {
    // 카카오맵 길찾기 URL (웹/앱 공용)
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(
      name
    )},${lat},${lng}`;
    window.open(url, "_blank");
  };

  if (loading) return <div>좌표 불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  if (!coords) return null;

  const {
    storeLatitude,
    storeLongitude,
    dropoffLatitude,
    dropoffLongitude,
  } = coords;

  return (
    <div>
      <h2>길찾기</h2>

      {/* 매장으로 */}
      <button
        onClick={() =>
          openKakaoNavigation(
            storeLatitude,
            storeLongitude,
            "매장 위치"
          )
        }
      >
        🏪 매장으로 길찾기
      </button>

      {/* 고객에게 */}
      <button
        onClick={() =>
          openKakaoNavigation(
            dropoffLatitude,
            dropoffLongitude,
            "고객 위치"
          )
        }
      >
        🏠 고객에게 길찾기
      </button>
    </div>
  );
}