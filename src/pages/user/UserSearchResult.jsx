import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HiOutlineSearch, HiX } from "react-icons/hi";
import { appUserStoreService } from "../../api/appuser/StoreService";

// CSS
import "./UserSearchResult.css";

// StoreCard
import StoreCard from "../../components/appuser/StoreCard";

export default function UserSearchResult() {
  const navigate = useNavigate();
  
  
  // State
  const [keyword, setKeyword] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [viewState, setViewState] = useState("history"); // 'history' | 'loading' | 'results' | 'empty'
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword");

  // --- Effects ---

  useEffect(() => {
    const saved = localStorage.getItem("search_history");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    if (urlKeyword) {
      setKeyword(urlKeyword);
      executeSearch(urlKeyword);
    }
  }, [urlKeyword]);

  // --- Handlers ---

  const addToHistory = (term) => {
    let updated = [term, ...recentSearches.filter((t) => t !== term)];
    if (updated.length > 10) updated = updated.slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const removeHistoryItem = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const handleSearchClick = () => {
    if (!keyword.trim()) return;
    setSearchParams({ keyword: keyword.trim() });
  };

  const executeSearch = async (term) => {
    if (!term.trim()) return;
    
    addToHistory(term);
    setViewState("loading");
    setError(null);

    try {
      const response = await appUserStoreService.searchStores(term);
      const data = Array.isArray(response) ? response : (response.data || []);
      
      setSearchResults(data);
      setViewState(data.length > 0 ? "results" : "empty");
    } catch (err) {
      console.error(err);
      setError("검색 중 오류가 발생했습니다.");
      setViewState("empty");
    }
  };

  return (
    <div className="search-result-page">
      
      {/* Main Content */}
      <div className="search-content">
        
        {/* VIEW: History */}
        {viewState === "history" && (
          <div className="history-section">
            <h3 className="section-title">
              최근 검색어 <span className="title-sub">Recent</span>
            </h3>
            
            {recentSearches.length === 0 ? (
              <p className="no-history-msg">
                최근 검색 기록이 없습니다.
              </p>
            ) : (
              <div className="history-tags">
                {recentSearches.map((term, index) => (
                  <span 
                    key={index} 
                    onClick={() => {
                        setKeyword(term);
                        setSearchParams({ keyword: term });
                    }}
                    className="history-tag"
                  >
                    {term}
                    <button 
                      onClick={(e) => removeHistoryItem(e, term)}
                      className="delete-tag-btn"
                    >
                      <HiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: Loading */}
        {viewState === "loading" && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">맛집을 찾고 있어요...</p>
          </div>
        )}

        {/* VIEW: Empty / Error */}
        {(viewState === "empty" || error) && (
          <div className="empty-container">
            {error ? (
              <p className="error-msg">{error}</p>
            ) : (
              <>
                <div className="empty-icon-wrapper">
                    <HiOutlineSearch size={40} className="empty-icon" />
                </div>
                <p className="empty-title">검색 결과가 없습니다.</p>
                <p className="empty-desc">
                  입력하신 검색어의 철자를 확인하거나<br/>다른 키워드로 검색해보세요.
                </p>
              </>
            )}
          </div>
        )}

        {/* VIEW: Results List */}
        {viewState === "results" && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-count-title">
                검색 결과 <span className="count-number">{searchResults.length}</span>
              </h2>
            </div>
            
            <div className="results-list">
              {searchResults.map((store) => (
                // Uses StoreCard component which relies on StoreCard.css
                <StoreCard 
                  key={store.storeId} 
                  store={store} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}