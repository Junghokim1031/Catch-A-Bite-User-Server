import React from 'react';
import { HiStar, HiHeart } from "react-icons/hi";
import './StoreCardLean.css';

const StoreCardLean = ({ store, onClick, onRemove }) => {

  // Helper to safely get the image URL (Handles Arrays and Strings)
  const getStoreImage = (storeData) => {
    if (!storeData) return null;
    
    // Check for Array
    if (Array.isArray(storeData.storeImageUrl) && storeData.storeImageUrl.length > 0) {
        return storeData.storeImageUrl[0];
    }
    if (Array.isArray(storeData.storeImageUrls) && storeData.storeImageUrls.length > 0) {
        return storeData.storeImageUrls[0];
    }
    
    // Check for String
    if (typeof storeData.storeImageUrl === 'string') {
        return storeData.storeImageUrl;
    }

    return null;
  };

  const imageUrl = getStoreImage(store);

  return (
    <div className="scl-card" onClick={() => onClick(store.storeId)}>
      
      {/* Image Area */}
      <div className="scl-image-wrapper">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={store.storeName} 
              className="scl-img"
            />
          ) : (
            <div className="scl-placeholder">
               {store.storeName?.charAt(0)}
            </div>
          )}
      </div>

      {/* Info Area */}
      <div className="scl-info">
        <h3 className="scl-title">
          {store.storeName}
        </h3>
        
        <div className="scl-meta">
          <HiStar className="scl-star-icon" />
          <span className="scl-rating">
            {store.storeRating?.toFixed(1) || store.rating?.toFixed(1) || "0.0"}
          </span>
          
          {store.storeDeliveryFee !== undefined && (
            <>
               <span className="scl-divider">|</span>
               <span>
                 배달팁 {store.storeDeliveryFee > 0 ? `${store.storeDeliveryFee.toLocaleString()}원` : "무료"}
               </span>
            </>
          )}
        </div>
      </div>
      
      {/* Action Area (Heart Button) */}
      <div className="scl-action">
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onRemove(store.favoriteId);
            }}
            className="scl-remove-btn"
          >
            <HiHeart className="scl-heart-icon" size={24} />
          </button>
      </div>
    </div>
  );
};

export default StoreCardLean;