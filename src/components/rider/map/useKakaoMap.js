import { useEffect, useState } from "react";

export function useKakaoMap() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 이미 로드되어 있으면 재사용
    if (window.kakao && window.kakao.maps) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_KEY
    }&libraries=services`;
    script.async = true;

    script.onload = () => {
      setLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // ❌ 제거하지 않는 게 정답
      // 다른 Rider 페이지에서 재사용 가능
    };
  }, []);

  return loaded;
}
