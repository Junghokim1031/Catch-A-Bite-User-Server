import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { HiStar } from 'react-icons/hi';

import 'swiper/css';
import 'swiper/css/pagination';
import './StoreCard.css';

const StoreCard = ({ store }) => {
  const navigate = useNavigate();

  const handleInfoClick = () => {
    navigate(`/user/store/${store.storeId}`);
  };

  // FIX: Access 'storeImageUrl' (singular name from DTO) but treat it as an Array
  // If it's null/undefined, default to an empty array.
  const images = Array.isArray(store.storeImageUrl) ? store.storeImageUrl : [];

  return (
    <div className="store-card-container">
      {/* 1. Image Carousel Area */}
      <div className="card-image-swiper-wrapper">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, dynamicBullets: true }}
          loop={true}
          className="card-swiper"
          nested={true}
        >
          {images.length > 0 ? (
            images.map((url, idx) => (
              <SwiperSlide key={idx}>
                <img src={url} alt={`store-img-${idx}`} className="card-img" />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="card-placeholder">
                {store.storeName?.charAt(0)}
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* 2. Text Content (Below Image) */}
      <div className="card-info" onClick={handleInfoClick}>
        <div className="card-header">
           <h3 className="card-title">{store.storeName}</h3>
           <div className="card-rating">
              <HiStar className="text-yellow-400" />
              <span className="font-bold">{store.storeRating?.toFixed(1) || "0.0"}</span>
           </div>
        </div>
        
        <div className="card-meta">
           <span className={`status-badge ${isStoreOpen(store.storeOpenStatus) ? 'open' : 'closed'}`}>
             {isStoreOpen(store.storeOpenStatus) ? '영업중' : '준비중'}
           </span>
           <span className="dot">·</span>
           <span className="delivery-fee">
             배달팁 {store.storeDeliveryFee > 0 ? `${store.storeDeliveryFee.toLocaleString()}원` : '무료'}
           </span>
        </div>
      </div>
    </div>
  );
};

const isStoreOpen = (status) => {
  if (!status) return false;
  const s = status.toString().trim().toUpperCase();
  return s === 'OPEN' || s === 'TRUE';
};

export default StoreCard;