import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppUserCartService } from '../../api/appuser/CartService';
import { appUserStoreOrderService } from '../../api/appuser/StoreOrderService';
import { AppUserAddressService } from '../../api/appuser/AddressService';
import useRoleGuard from '../../hooks/useRoleGuard';
import './UserOrder.css';

const UserOrder = () => {
    const { user, loading: authLoading } = useRoleGuard('USER');
    const navigate = useNavigate();

    // Data State
    const [cartData, setCartData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [storeRequest, setStoreRequest] = useState('');
    const [riderRequest, setRiderRequest] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CARD'); // Default
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Initial Data Fetch (Cart & Addresses)
    useEffect(() => {
        if (!authLoading && user) {
            fetchInitialData();
        }
    }, [authLoading, user]);

    const fetchInitialData = async () => {
        // console.log("========================================");
        // console.log("USER");
        // console.log(user);
        // console.warn("========================================");
        try {

            if (!user || !user.appUserId) {
                console.warn("========================================");
                console.warn("User ID missing, skipping address fetch.");
                console.warn("========================================");
                return;
            }
            
            setLoading(true);
            
            // Parallel Fetch
            const [cartResp, addrResp] = await Promise.all([
                AppUserCartService.getMyCart(),
                AppUserAddressService.getMyAddresses(user.appUserId)
            ]);

            // Handle Cart
            if (!cartResp.data || cartResp.data.items.length === 0) {
                alert("장바구니가 비어있습니다.");
                navigate('/user/cart');
                return;
            }
            setCartData(cartResp.data);

            // Handle Addresses
            const addrList = addrResp.data || [];
            setAddresses(addrList);
            
            // Auto-select default address if exists
            if (addrList.length > 0) {
                const defaultAddr = addrList.find(a => a.isDefault === 'Y') || addrList[0];
                setSelectedAddressId(defaultAddr.addressId);
            }

        } catch (error) {
            console.error("Order Page Load Error:", error);
            alert("주문 정보를 불러오는데 실패했습니다.");
            navigate('/user/main');
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle "Payment" Button Click
    const handleCreateOrder = async () => {
        if (!selectedAddressId) {
            alert("배달 받으실 주소를 선택해주세요.");
            return;
        }

        if (window.confirm("결제를 진행하시겠습니까?")) {
            setIsSubmitting(true);
            try {
                // Construct DTO
                const orderData = {
                    appUserId: user.appUserId,
                    storeId: cartData.storeId,
                    addressId: Number(selectedAddressId),
                    storeRequest: storeRequest,
                    riderRequest: riderRequest,
                    paymentMethod: paymentMethod
                };
                
                console.log("========================================");
                console.log("OrderDataDTO to be sent to the backend");
                console.log(orderData);
                console.log("========================================");
                // API Call: Create Order
                const result = await appUserStoreOrderService.createOrder(orderData);
                
                if (result && result.orderId) {
                    // Success -> Navigate to Payment Page
                    navigate(`/user/payment?orderId=${result.orderId}`);
                } else {
                    throw new Error("주문 ID를 반환받지 못했습니다.");
                }

            } catch (error) {
                console.error("Order Creation Failed:", error);
                alert(`주문 생성 실패: ${error.message}`);
                setIsSubmitting(false);
            }
        }
    };

    if (authLoading || loading) return <div className="loading-screen">Loading...</div>;
    if (!cartData) return null;

    const totalAmount = cartData.totalFoodPrice + cartData.deliveryCost;

    return (
        <div className="order-page-container">
            <header className="order-header">
                <h2>주문하기</h2>
            </header>

            {/* 1. Address Section */}
            <section className="order-section">
                <h3 className="section-title">📍 배달 주소</h3>
                {addresses.length > 0 ? (
                    <select 
                        className="address-select-box"
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                    >
                        {addresses.map(addr => (
                            <option key={addr.addressId} value={addr.addressId}>
                                {addr.addressName} ({addr.addressDetail})
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="no-address-warning">
                        등록된 주소가 없습니다. <br/>
                        <button onClick={() => navigate('/user/address/new')}>새 주소 등록</button>
                    </div>
                )}
            </section>

            {/* 2. Order Items Section */}
            <section className="order-section">
                <h3 className="section-title">🛒 주문 내역 ({cartData.storeName})</h3>
                {cartData.items.map(item => (
                    <div key={item.cartItemId} className="order-item-row">
                        <span className="item-name">
                            {item.menuName} <small>x {item.cartItemQuantity}</small>
                        </span>
                        <span className="item-price">
                            {item.totalItemPrice.toLocaleString()}원
                        </span>
                    </div>
                ))}
            </section>

            {/* 3. Requests Section */}
            <section className="order-section">
                <h3 className="section-title">📝 요청 사항</h3>
                <div className="request-input-group">
                    <label>가게 사장님께</label>
                    <input 
                        className="request-input" 
                        placeholder="예: 맵지 않게 해주세요."
                        value={storeRequest}
                        onChange={(e) => setStoreRequest(e.target.value)}
                    />
                </div>
                <div className="request-input-group">
                    <label>배달 기사님께</label>
                    <input 
                        className="request-input" 
                        placeholder="예: 문 앞에 두고 가주세요."
                        value={riderRequest}
                        onChange={(e) => setRiderRequest(e.target.value)}
                    />
                </div>
            </section>

            {/* 4. Payment Method */}
            <section className="order-section">
                <h3 className="section-title">💳 결제 수단</h3>
                <div className="payment-method-options">
                    <button 
                        className={`method-btn ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('CARD')}
                    >
                        카드 결제
                    </button>
                    <button 
                        className={`method-btn ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('CASH')}
                        disabled // Optional: Disable other methods for now
                    >
                        현장 결제
                    </button>
                </div>
            </section>

            {/* 5. Final Bill */}
            <section className="order-section">
                <h3 className="section-title">💰 결제 금액</h3>
                <div className="bill-row">
                    <span>주문금액</span>
                    <span>{cartData.totalFoodPrice.toLocaleString()}원</span>
                </div>
                <div className="bill-row">
                    <span>배달팁</span>
                    <span>{cartData.deliveryCost.toLocaleString()}원</span>
                </div>
                <div className="bill-total">
                    <span>총 결제금액</span>
                    <span className="total-price">{totalAmount.toLocaleString()}원</span>
                </div>
            </section>

            {/* Spacer for Fixed Footer */}
            <div className="footer-spacer"></div>

            {/* Fixed Bottom Button */}
            <div className="order-footer">
                <div className="order-footer-content">
                    <button 
                        className="submit-order-btn" 
                        onClick={handleCreateOrder}
                        disabled={isSubmitting || !selectedAddressId}
                    >
                        {isSubmitting ? '처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOrder;