import DashboardLayout from "../../components/DashboardLayout.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";

const fallbackUser = {
  name: "샘플 사용자",
};

const quickActions = [
  { label: "주문하기", hint: "가까운 맛집 둘러보기" },
  { label: "즐겨찾기", hint: "자주 찾는 가게 모아보기" },
  { label: "리뷰 작성", hint: "최근 주문 리뷰 남기기" },
];

const summaryCards = [
  { title: "이번 달 주문", value: "8건", meta: "지난달 대비 +2건" },
  { title: "보유 포인트", value: "12,500P", meta: "이번 주 +1,200P" },
];

const activities = [
  { title: "치킨플레이스 주문 완료", time: "오늘 10:24", status: "완료" },
  { title: "카페라떼 주문 접수", time: "어제 19:12", status: "접수" },
  { title: "분식집 리뷰 작성", time: "어제 15:40", status: "리뷰" },
  { title: "샐러드 주문 완료", time: "3일 전", status: "완료" },
  { title: "쿠폰 사용", time: "4일 전", status: "혜택" },
];

const notices = [
  { title: "주말 주문 프로모션", detail: "금요일 오후 6시부터 적용됩니다." },
  { title: "서비스 점검 안내", detail: "다음 주 화요일 02:00 ~ 03:00" },
];

export default function UserMainPage() {
  const { user, loading } = useRoleGuard("USER", fallbackUser);
  const dateText = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <DashboardLayout
      roleLabel="사용자"
      userName={user.name}
      dateText={dateText}
      quickActions={quickActions}
      summaryCards={summaryCards}
      activities={activities}
      notices={notices}
      isLoading={loading}
    />
  );
}
