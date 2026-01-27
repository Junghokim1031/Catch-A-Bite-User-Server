import axiosInstance from "../axios";

/**
 * AddressService: 배송지 관리 API 통신 모듈
 */
export const AppUserAdressService = {
  
  // ==========================================================
  // 1. 배송지 추가 (POST)
  // ==========================================================
  createAddress: async (addressData) => {
    const separator = "======================================================================";

    // 유효성 검사
    if (!addressData || !addressData.addressDetail || !addressData.appUserId) {
      console.error(separator);
      console.error("배송지 필수 정보(상세주소, 사용자ID)가 누락되었습니다.");
      console.error(separator);
      throw new Error("배송지 필수 정보를 입력해주세요.");
    }

    try {
      const response = await axiosInstance.post('/api/v1/appuser/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Address Create Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 2. 배송지 상세 조회 (GET)
  // ==========================================================
  readAddress: async (addressId) => {
    const separator = "======================================================================";

    if (!addressId || addressId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주소 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주소 ID입니다.");
    }

    try {
      const response = await axiosInstance.get(`/api/v1/appuser/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Address Read Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 3. 배송지 수정 (PUT)
  // ==========================================================
  updateAddress: async (addressId, addressData) => {
    const separator = "======================================================================";

    if (!addressId || addressId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주소 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주소 ID입니다.");
    }

    try {
      const response = await axiosInstance.put(`/api/v1/appuser/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Address Update Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 4. 배송지 삭제 (DELETE)
  // ==========================================================
  deleteAddress: async (addressId) => {
    const separator = "======================================================================";

    if (!addressId || addressId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주소 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주소 ID입니다.");
    }

    try {
      const response = await axiosInstance.delete(`/api/v1/appuser/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Address Delete Error:", error);
      console.error(separator);
      throw error;
    }
  }
}

export default AppUserAdressService;