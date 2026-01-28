import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios'; // Adjust path to your axios instance
import './UserPayment.css';

const UserPayment = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [orderId, setOrderId] = useState('');
    const [currentOrder, setCurrentOrder] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [portOneConfig, setPortOneConfig] = useState({ storeId: null, channelKey: null });
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading...');
    const [result, setResult] = useState(null); // { type: 'success'|'error', message: string, data: any }

    // 1. Initialize: Load SDK, Config, and Handle URL Params
    useEffect(() => {
        loadPortOneSDK();
        loadConfig();
        checkUrlParams();
    }, []);

    // Load PortOne V2 SDK dynamically
    const loadPortOneSDK = () => {
        if (!window.PortOne) {
            const script = document.createElement("script");
            script.src = "https://cdn.portone.io/v2/browser-sdk.js";
            script.async = true;
            document.body.appendChild(script);
        }
    };

    // Load Backend Config
    const loadConfig = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/config/portone');
            const config = response.data.data || response.data;
            setPortOneConfig({
                storeId: config.storeId || config['store-id'],
                channelKey: config.channelKey || config['channel-key']
            });
        } catch (error) {
            console.error("Config Load Error:", error);
            showResult('error', '결제 설정을 불러오지 못했습니다.');
        }
    };

    // Check URL for Order ID or Redirect Returns
    const checkUrlParams = async () => {
        const orderIdParam = searchParams.get('orderId');
        
        // [Redirect Return Handling]
        const paymentId = searchParams.get('paymentId');
        const merchantUid = searchParams.get('merchant_uid');
        const code = searchParams.get('code');
        const message = searchParams.get('message');

        if (paymentId && merchantUid) {
            // Case A: Returning from Mobile Payment
            // Try to extract original orderId from merchantUid (format: ORDER_{id}_{timestamp})
            const originalOrderId = merchantUid.split('_')[1];
            if (originalOrderId) {
                setOrderId(originalOrderId);
                // Optionally fetch order data again to show context
                await fetchOrderData(originalOrderId, false); 
            }

            if (code != null) {
                showResult('error', `결제 실패: ${message} (Code: ${code})`);
            } else {
                await completePayment(paymentId, merchantUid);
            }
        } else if (orderIdParam) {
            // Case B: Initial Load
            setOrderId(orderIdParam);
            fetchOrderData(orderIdParam);
        }
    };

    // Fetch Order Data
    const fetchOrderData = async (id, shouldResetResult = true) => {
        if (!id) return;
        setLoading(true);
        setLoadingText("주문 정보를 불러오는 중...");
        if (shouldResetResult) setResult(null);

        try {
            const response = await axiosInstance.get(`/api/v1/appuser/store-orders/${id}`);
            const orderData = response.data.data || response.data;
            setCurrentOrder(orderData);

            if (orderData.appUserId) {
                await fetchUserData(orderData.appUserId);
            }
        } catch (error) {
            console.error(error);
            showResult('error', `주문을 찾을 수 없습니다: ${error.message}`);
            setCurrentOrder(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch User Data
    const fetchUserData = async (userId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/appuser/${userId}`);
            setCurrentUser(response.data.data || response.data);
        } catch (error) {
            console.error("User fetch error:", error);
        }
    };

    // [Core Logic] Request Payment
    const requestPayment = async () => {
        if (!currentOrder || !portOneConfig.storeId) {
            alert("주문 정보나 결제 설정이 올바르지 않습니다.");
            return;
        }

        const buyerName = currentUser?.appUserName || currentOrder.userName || "구매자";
        const buyerPhone = currentUser?.appUserMobile || currentOrder.userPhone || "010-0000-0000";
        const buyerEmail = currentUser?.appUserEmail || "test@example.com"; 

        setLoading(true);
        setLoadingText("결제 준비 중...");

        try {
            // 1. Prepare Payment on Backend
            const prepareData = {
                order_id: currentOrder.orderId,
                payment_amount: Number(currentOrder.orderTotalPrice),
                payment_method: "CARD", 
                buyer_name: buyerName,
                buyer_email: buyerEmail,
                buyer_tel: buyerPhone,
                buyer_addr: currentOrder.orderAddressSnapshot || "",
                name: `CatchABite 주문 #${currentOrder.orderId}`
            };

            const prepareResponse = await axiosInstance.post('/api/payments/prepare', prepareData);
            const preparedData = prepareResponse.data; // Depending on your API wrap
            const merchantUid = preparedData.merchant_uid;

            console.log("결제 준비 완료 (Merchant UID):", merchantUid);

            // 2. Generate Payment ID for PortOne
            const paymentId = `PAY-${currentOrder.orderId}-${Date.now()}`;

            // 3. Construct Redirect URL (Critical for Mobile)
            // We append merchant_uid so we know which order to verify upon return
            const redirectUrl = new URL(window.location.href);
            redirectUrl.searchParams.set('merchant_uid', merchantUid);

            // 4. Call PortOne SDK
            if (!window.PortOne) {
                throw new Error("PortOne SDK not loaded");
            }

            const response = await window.PortOne.requestPayment({
                storeId: portOneConfig.storeId,
                channelKey: portOneConfig.channelKey,
                paymentId: paymentId,
                orderName: prepareData.name,
                totalAmount: prepareData.payment_amount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: buyerName,
                    phoneNumber: buyerPhone,
                    email: buyerEmail,
                },
                redirectUrl: redirectUrl.toString(), // For Mobile
                windowType: {
                    pc: 'IFRAME',
                    mobile: 'REDIRECTION'
                }
            });

            // 5. Handle PC Response (Mobile will redirect away)
            if (response.code != null) {
                // Payment Failed (Immediate return)
                showResult('error', `결제 실패: ${response.message} (Code: ${response.code})`);
            } else {
                // Payment Success (PC) -> Verify
                await completePayment(response.paymentId, merchantUid);
            }

        } catch (error) {
            console.error("Payment Process Error:", error);
            showResult('error', `결제 중 오류 발생: ${error.response?.data?.message || error.message}`);
            setLoading(false);
        }
    };

    // [Core Logic] Verify & Complete Payment
    const completePayment = async (paymentId, merchantUid) => {
        setLoading(true);
        setLoadingText("결제 검증 및 완료 처리 중...");

        try {
            // 1. Call Backend to Verify
            const response = await axiosInstance.post(`/api/payments/complete`, null, {
                params: { paymentId, merchantUid }
            });

            // 2. Success Message
            showResult('success', "결제가 성공적으로 완료되었습니다!", response.data);
            
            // [FIX] Redirect to Order History after 2 seconds
            // Note: We use the path you provided: /user/orderHistory
            setTimeout(() => {
                window.location.replace('/user/orderHistory');
            }, 2000); 

        } catch (error) {
            console.error("Verification Failed:", error);
            const errMsg = error.response?.data?.message || "서버 통신 중 오류가 발생했습니다.";
            const errData = error.response?.data;
            showResult('error', `검증 실패: ${errMsg}`, errData);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Result Display
    const showResult = (type, message, data = null) => {
        setResult({ type, message, data });
    };

    // Helper: Reset
    const handleReset = () => {
        setOrderId('');
        setCurrentOrder(null);
        setResult(null);
        navigate(window.location.pathname); // clear params
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') fetchOrderData(orderId);
    };

    return (
        <div className="payment-page-body">
            <div className="payment-container">
                <h1>🛒 CatchABite</h1>
                <p className="payment-subtitle">PortOne V2 안전 결제</p>

                <div className="info-box">
                    <strong>테스트 정보:</strong><br />
                    Store ID 및 Channel Key는 서버 설정에서 자동으로 로드됩니다.
                </div>

                {/* Input Section */}
                <div className="form-group">
                    <label>주문 ID (Order ID)</label>
                    <input 
                        type="number" 
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="주문 ID를 입력하세요"
                        readOnly={loading || (currentOrder && result?.type === 'success')}
                    />
                </div>

                {/* Order Details Section */}
                {currentOrder && (
                    <div className="order-section">
                        <h3>주문 상세</h3>
                        <div className="order-details">
                            <div className="detail-item">
                                <div className="detail-label">구매자</div>
                                <div className="detail-value">
                                    {currentUser ? currentUser.appUserName : (currentOrder.userName || "비회원")}
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">결제 금액</div>
                                <div className="detail-value highlight">
                                    {(currentOrder.orderTotalPrice || 0).toLocaleString()}원
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                            이메일: {currentUser ? currentUser.appUserEmail : "-"}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="button-group">
                    <button 
                        className="payment-btn btn-secondary" 
                        onClick={handleReset}
                        disabled={loading}
                    >
                        초기화
                    </button>
                    <button 
                        className="payment-btn btn-primary" 
                        onClick={requestPayment} 
                        disabled={!currentOrder || loading || (result?.type === 'success')}
                    >
                        {loading ? '처리 중...' : '결제하기 (V2)'}
                    </button>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{loadingText}</p>
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className={`result-box ${result.type}`}>
                        <h3>{result.type === 'success' ? '성공' : '오류'}</h3>
                        <p>{result.message}</p>
                        {result.data && (
                            <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPayment;