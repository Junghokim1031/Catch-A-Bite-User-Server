// React 및 Hooks
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// 아이콘
import { HiStar, HiOutlineClock, HiHeart, HiOutlineHeart } from "react-icons/hi";

// API 서비스
import { appUserStoreService } from "../../api/appuser/StoreService";
import { appUserFavoriteService } from "../../api/appuser/FavoriteService";

// 스타일 및 컴포넌트
import "./UserStorePage.css";
import MenuCard from "../../components/appuser/MenuCard"; // [변경] 새로 만든 메뉴 카드 임포트

export default function UserStorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); 
  const [favoriteId, setFavoriteId] = useState(null);

  // 스크롤 처리를 위한 Ref
  const categoryRefs = useRef([]);
  const tabsContainerRef = useRef(null);

  // --- 데이터 로드 및 이벤트 리스너 등록 ---
  useEffect(() => {
    loadStoreData();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      const data = await appUserStoreService.getStoreDetails(storeId);
      setStore(data);
      setFavoriteId(data.favoriteId);
    } catch (error) {
      console.error("Store Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 스크롤 핸들링 (탭 활성화) ---
  const handleScroll = () => {
    if (!categoryRefs.current.length) return;
    const scrollPosition = window.scrollY + 180; 
    categoryRefs.current.forEach((ref, index) => {
      if (ref && ref.offsetTop <= scrollPosition && (ref.offsetTop + ref.offsetHeight) > scrollPosition) {
        setActiveTab(index);
      }
    });
  };

  const scrollToCategory = (index) => {
    setActiveTab(index);
    const ref = categoryRefs.current[index];
    if (ref) {
      const y = ref.getBoundingClientRect().top + window.scrollY - 120; 
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // --- 즐겨찾기 토글 ---
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (favoriteId) {
        await appUserFavoriteService.removeFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        const result = await appUserFavoriteService.addFavorite(storeId);
        if (result && result.favoriteId) {
          setFavoriteId(result.favoriteId);
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!store) return <div className="error-screen">가게 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="store-page">
      
      {/* --- 1. 헤더 이미지 영역 --- */}
      <header className="store-header">
        <div className="header-overlay">
            <div className="header-actions">
                <button className="icon-btn" onClick={toggleFavorite}>
                    {favoriteId ? (
                        <HiHeart size={24} style={{ color: '#ef4444' }} /> 
                    ) : (
                        <HiOutlineHeart size={24} />
                    )}
                </button>
            </div>
        </div>
        {store.storeImageUrl ? (
          <img src={store.storeImageUrl} alt={store.storeName} className="store-img" />
        ) : (
          <div className="store-img-placeholder">Catch-A-Bite</div>
        )}
      </header>

      {/* --- 2. 가게 정보 섹션 --- */}
      <section className="store-info-section">
        <h1 className="store-name">{store.storeName}</h1>
        
        <div className="store-meta">
          <div className="rating">
            <HiStar className="star-icon" />
            <span className="score">{store.rating || "0.0"}</span>
            <span className="count">({store.reviewCount || 0})</span>
          </div>
          <div className="delivery-time">
             <HiOutlineClock className="clock-icon" /> 
             {store.estimatedDeliveryTime || "30-45분"}
          </div>
        </div>

        <p className="store-intro">{store.storeIntro}</p>

        <div className="store-stats">
            <div className="stat-item">
                <span className="label">배달비</span>
                <span className="value">{store.deliveryFee?.toLocaleString()}원</span>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
                <span className="label">최소주문</span>
                <span className="value">{store.minOrderPrice?.toLocaleString()}원</span>
            </div>
        </div>
      </section>

      {/* --- 3. 카테고리 탭 (Sticky) --- */}
      <div className="sticky-tabs-container" ref={tabsContainerRef}>
        {store.menuCategories?.map((cat, index) => (
          <button 
            key={cat.menuCategoryId}
            className={`tab-btn ${activeTab === index ? "active" : ""}`}
            onClick={() => scrollToCategory(index)}
          >
            {cat.menuCategoryName}
          </button>
        ))}
      </div>

      {/* --- 4. 메뉴 리스트 영역 --- */}
      <div className="menu-sections">
        {store.menuCategories?.map((cat, index) => (
          <div 
            key={cat.menuCategoryId} 
            className="menu-category"
            ref={(el) => (categoryRefs.current[index] = el)}
          >
            <h3 className="category-title">{cat.menuCategoryName}</h3>
            
            <div className="menu-list">
                {cat.menus?.map((menu) => (
                  // [변경] MenuCard 컴포넌트 사용
                  <MenuCard 
                    key={menu.menuId} 
                    menu={menu}
                    onClick={() => navigate(`/user/menu/${menu.menuId}`)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}