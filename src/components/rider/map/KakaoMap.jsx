import { useEffect, useRef } from "react";
import { useKakaoMap } from "./useKakaoMap";

export default function KakaoMap({ pickup, dropoff, height = 260 }) {
  const loaded = useKakaoMap();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!loaded || !pickup || !dropoff) return;

    const { kakao } = window;

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(pickup.lat, pickup.lng),
      level: 4,
    });

    const pickupPos = new kakao.maps.LatLng(pickup.lat, pickup.lng);
    const dropoffPos = new kakao.maps.LatLng(dropoff.lat, dropoff.lng);

    new kakao.maps.Marker({ map, position: pickupPos });
    new kakao.maps.Marker({ map, position: dropoffPos });

    const line = new kakao.maps.Polyline({
      map,
      path: [pickupPos, dropoffPos],
      strokeWeight: 5,
      strokeColor: "#111",
    });

    const bounds = new kakao.maps.LatLngBounds();
    bounds.extend(pickupPos);
    bounds.extend(dropoffPos);
    map.setBounds(bounds);

    return () => line.setMap(null);
  }, [loaded, pickup, dropoff]);

  if (!loaded) {
    return <div style={{ height }}>지도 로딩 중…</div>;
  }

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height, borderRadius: 12 }}
    />
  );
}
