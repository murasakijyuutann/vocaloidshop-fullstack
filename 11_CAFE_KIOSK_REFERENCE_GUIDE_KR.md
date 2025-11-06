# 🍰 카페 키오스크 참고 가이드
## Vocaloid Shop 프로젝트의 UI 컴포넌트 & 시스템 설계

**대상 프로젝트:** 간단한 카페 키오스크 앱  
**참고 프로젝트:** Vocaloid 이커머스 플랫폼  
**작성일:** 2025년 11월 6일

---

## 📋 목차

1. [개요 - 참고할 내용](#overview)
2. [키오스크용 UI/UX 컴포넌트](#ui-components)
3. [시스템 아키텍처 패턴](#system-architecture)
4. [프론트엔드 디자인 패턴](#frontend-patterns)
5. [백엔드 API 설계](#backend-api)
6. [데이터베이스 스키마 참고](#database-schema)
7. [재사용 가능한 코드 스니펫](#code-snippets)
8. [복사하면 안 되는 것들](#what-not-to-copy)

---

## 🎯 개요 - 참고할 내용

### 카페 키오스크와 완벽하게 매칭되는 기능들

| Vocaloid Shop 기능 | 카페 키오스크 대응 기능 | 참고 파일 |
|----------------------|----------------------|----------------|
| **상품 카탈로그** | 메뉴 아이템 표시 | `HomePage.tsx` |
| **카테고리 필터** | 커피/디저트/음료 필터 | `HomePage.tsx` (60-110줄) |
| **상품 상세** | 아이템 커스터마이징 페이지 | `ProductDetail.tsx` |
| **장바구니** | 주문 카트 | `CartPage.tsx` |
| **결제 플로우** | 결제 & 주문 확인 | `CheckoutPage.tsx` |
| **주문 관리** | 주방 주문 디스플레이 | `OrderController.java` |

---

## 🎨 키오스크용 UI 컴포넌트

### 1. **상품 그리드 디스플레이** ⭐⭐⭐⭐⭐
**최적 용도:** 카페 메뉴 아이템 표시

**위치:** `vocaloid_front/src/pages/HomePage.tsx`

**주요 기능:**
- ✅ 반응형 그리드 레이아웃 (데스크톱/태블릿/모바일)
- ✅ 이미지, 이름, 가격이 포함된 상품 카드
- ✅ 검색 기능
- ✅ 카테고리 필터링
- ✅ 가격순 정렬
- ✅ 호버 애니메이션

**코드 참고:**
```tsx
// 그리드 레이아웃 - 자동 반응형
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

// 호버 효과가 있는 상품 카드
const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  }
`;
```

**키오스크 적용:**
```
커피 아이템     →  커피 이미지가 있는 상품 카드
카테고리 필터  →  커피/디저트/음료 탭
검색 바        →  메뉴 아이템 빠른 검색
가격 표시      →  ₩4,500 형식
```

---

### 2. **장바구니 UI** ⭐⭐⭐⭐⭐
**최적 용도:** 카페 키오스크의 주문 요약

**위치:** `vocaloid_front/src/pages/CartPage.tsx`

**주요 기능:**
- ✅ 이미지 + 이름 + 수량이 있는 아이템 목록
- ✅ 수량 증가/감소 버튼
- ✅ 아이템 제거
- ✅ 실시간 총액 계산
- ✅ 빈 장바구니 상태

**코드 참고:**
```tsx
// 장바구니 레이아웃 - 메인 콘텐츠 + 요약 사이드바
const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;  // 아이템 | 요약
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;  // 모바일에서 세로 배치
  }
`;

// 수량 컨트롤
const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f7fafc;
  border-radius: 10px;
  padding: 0.5rem;
`;
```

**키오스크 적용:**
```
장바구니 아이템   →  현재 주문 아이템
수량 버튼        →  +/- 버튼 (터치용으로 크게)
총액 계산        →  실시간 주문 총액
결제 버튼        →  "결제하기"
```

---

### 3. **진행 바가 있는 결제 플로우** ⭐⭐⭐⭐
**최적 용도:** 다단계 주문 프로세스

**위치:** `vocaloid_front/src/pages/CheckoutPage.tsx`

**주요 기능:**
- ✅ 시각적 진행 표시기 (1단계 → 2단계 → 3단계)
- ✅ 폼 유효성 검사
- ✅ 주문 요약 검토
- ✅ 확인 페이지

**코드 참고:**
```tsx
// 진행 바 컴포넌트
const ProgressBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 10%;
    right: 10%;
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
  }
`;

const StepCircle = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => 
    props.$completed ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' :
    props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
    '#e2e8f0'
  };
  color: ${props => props.$active || props.$completed ? 'white' : '#a0aec0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
`;
```

**키오스크 적용:**
```
1단계: 아이템 선택   →  메뉴 탐색
2단계: 주문 검토     →  장바구니 검토
3단계: 결제         →  결제 방법 선택
4단계: 확인         →  주문 번호 표시
```

---

### 4. **상품 상세 모달** ⭐⭐⭐⭐
**최적 용도:** 음료 커스터마이징 (사이즈, 샷, 우유 종류)

**위치:** `vocaloid_front/src/pages/ProductDetail.tsx`

**주요 기능:**
- ✅ 큰 상품 이미지
- ✅ 상품명 + 설명
- ✅ 가격 표시
- ✅ 수량 선택기
- ✅ 장바구니 담기 버튼
- ✅ 카테고리 배지

**코드 참고:**
```tsx
// 상품 레이아웃 - 이미지 + 정보 좌우 배치
const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;  // 모바일에서 세로 배치
    gap: 2rem;
  }
`;

// 수량 선택기
const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f7fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  width: fit-content;
`;
```

**키오스크 적용:**
```
상품 이미지      →  음료/음식 사진
카테고리 배지   →  "커피", "디저트", "음료"
설명           →  재료/커스터마이징 옵션
수량 +/-       →  주문 수량 (1-99)
장바구니 담기   →  "주문하기" (큰 버튼)
```

---

### 5. **네비게이션 & 장바구니 배지** ⭐⭐⭐⭐⭐
**최적 용도:** 장바구니 카운터가 있는 키오스크 헤더

**위치:** `vocaloid_front/src/components/Navbar.tsx`

**주요 기능:**
- ✅ 고정 네비게이션 바
- ✅ 아이템 수가 표시된 장바구니 아이콘
- ✅ 애니메이션 배지 (펄스 효과)
- ✅ 그라데이션 배경

**코드 참고:**
```tsx
// 고정 네비게이션
const Nav = styled.nav`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

// 애니메이션이 있는 장바구니 배지
const CartBadge = styled.span`
  background: #ff4757;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;
```

**키오스크 적용:**
```
로고           →  카페 로고/이름
장바구니 배지   →  주문 아이템 수 (예: "3")
네비 항목      →  "메뉴", "내 주문", "직원 호출"
```

---

### 6. **토스트 알림** ⭐⭐⭐⭐⭐
**최적 용도:** 사용자 피드백 (아이템 추가, 결제 성공)

**위치:** `vocaloid_front/src/components/ToastProvider.tsx`

**주요 기능:**
- ✅ 방해가 되지 않는 알림
- ✅ 성공/에러 타입
- ✅ 자동 사라짐 (3초)
- ✅ 슬라이드인 애니메이션
- ✅ 쌓이는 알림

**코드 참고:**
```tsx
const ToastItem = styled(motion.div)<{ type?: Toast["type"] }>`
  background: ${({ type }) => 
    type === "error" ? "#e74c3c" : 
    type === "success" ? "#48bb78" : 
    "#333"
  };
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  max-width: 320px;
`;

// 사용법
show("장바구니에 아이템이 추가되었습니다!", "success");
show("결제에 실패했습니다", "error");
```

**키오스크 적용:**
```
성공 토스트    →  "아메리카노가 주문에 추가되었습니다!"
에러 토스트    →  "결제가 거부되었습니다. 다시 시도해주세요."
정보 토스트    →  "주문을 준비 중입니다..."
```

---

## 🏗️ 시스템 아키텍처 패턴

### 1. **3계층 아키텍처** ⭐⭐⭐⭐⭐

```
┌─────────────────────────────────────────┐
│         프레젠테이션 계층                │
│  (React + TypeScript + Styled Components)│
│  - HomePage.tsx (메뉴 표시)             │
│  - CartPage.tsx (주문 카트)             │
│  - CheckoutPage.tsx (결제)              │
└──────────────┬──────────────────────────┘
               │ REST API (Axios)
┌──────────────▼──────────────────────────┐
│         애플리케이션 계층                │
│  (Spring Boot + Java 21)                │
│  - ProductController (메뉴 API)         │
│  - CartController (장바구니 관리)        │
│  - OrderController (주문 처리)          │
│  - ProductService (비즈니스 로직)        │
└──────────────┬──────────────────────────┘
               │ JPA/Hibernate
┌──────────────▼──────────────────────────┐
│            데이터 계층                   │
│  (MySQL 8.0 on AWS RDS)                 │
│  - products (메뉴 아이템)               │
│  - cart_items (현재 주문)               │
│  - orders (완료된 주문)                 │
└─────────────────────────────────────────┘
```

**카페 키오스크용:**
- 프론트엔드: React (터치 친화적 UI)
- 백엔드: Spring Boot (주문 처리)
- 데이터베이스: MySQL (메뉴 + 주문)

---

### 2. **RESTful API 설계** ⭐⭐⭐⭐⭐

**참고:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/controller/`

| 엔드포인트 | 메서드 | 목적 | 키오스크 대응 |
|----------|--------|---------|------------------|
| `/api/products` | GET | 모든 상품 목록 | 메뉴 아이템 가져오기 |
| `/api/products/{id}` | GET | 상품 상세 정보 | 아이템 상세 정보 |
| `/api/cart/{userId}` | GET | 사용자 장바구니 | 현재 주문 |
| `/api/cart` | POST | 장바구니에 추가 | 주문에 아이템 추가 |
| `/api/cart/{id}` | DELETE | 장바구니에서 제거 | 주문에서 제거 |
| `/api/orders` | POST | 주문하기 | 주문 제출 |
| `/api/orders/{userId}` | GET | 사용자 주문 내역 | 주문 내역 |

**표준 응답 형식:**
```json
// 성공
{
  "status": 200,
  "data": { ... }
}

// 에러 (GlobalExceptionHandler에서)
{
  "status": 404,
  "message": "Product not found with id: 999",
  "path": "/api/products/999",
  "timestamp": "2025-11-06T09:47:44"
}
```

---

### 3. **상태 관리 패턴** ⭐⭐⭐⭐

**참고:** `vocaloid_front/src/context/CartContext.tsx`

**React Context + 커스텀 훅 패턴:**

```tsx
// 1. Context 정의 (CartContextBase.tsx)
export const CartContext = createContext<CartContextType>(undefined!);

// 2. 상태 로직이 있는 Provider (CartContext.tsx)
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const fetchCart = async () => { /* API 호출 */ };
  const addToCart = async (productId, quantity) => { /* API 호출 */ };
  const removeFromCart = async (cartItemId) => { /* API 호출 */ };
  
  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. 쉬운 접근을 위한 커스텀 훅 (useCart.ts)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// 4. 컴포넌트에서 사용
const { cart, addToCart } = useCart();
```

**카페 키오스크용:**
```
OrderContext   →  현재 주문 상태
MenuContext    →  메뉴 아이템 (캐싱 포함)
PaymentContext → 결제 처리 상태
```

---

## 🎨 프론트엔드 디자인 패턴

### 1. **Styled Components 패턴** ⭐⭐⭐⭐

**키오스크에 좋은 이유:**
- ✅ 컴포넌트 범위 스타일링 (CSS 충돌 없음)
- ✅ props를 사용한 동적 스타일링
- ✅ 내장 테마 지원
- ✅ TypeScript 지원

**참고:** `vocaloid_front/src/pages/`의 모든 `.tsx` 파일

```tsx
// Props 기반 동적 스타일링
const Button = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#667eea' : '#e2e8f0'};
  color: ${props => props.$primary ? 'white' : '#2d3748'};
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 사용법
<Button $primary onClick={handleCheckout}>결제하기</Button>
<Button onClick={handleCancel}>취소</Button>
```

---

### 2. **반응형 디자인 전략** ⭐⭐⭐⭐⭐

**모바일 우선 접근:**

```tsx
// 모바일용 기본 스타일 (가장 작은 화면)
const Card = styled.div`
  padding: 1rem;
  font-size: 1rem;
  
  // 태블릿 (768px+)
  @media (min-width: 768px) {
    padding: 1.5rem;
    font-size: 1.1rem;
  }
  
  // 데스크톱 (968px+)
  @media (min-width: 968px) {
    padding: 2rem;
    font-size: 1.2rem;
  }
`;
```

**키오스크 고려사항:**
- 태블릿 모드: 1024x768 또는 1280x800 (대부분의 키오스크)
- 터치 타겟: 최소 44x44px (Apple HIG)
- 폰트 크기: 가독성을 위해 최소 1.2rem

---

### 3. **애니메이션 & 트랜지션** ⭐⭐⭐⭐

**부드러운 사용자 경험:**

```tsx
// 페이지 트랜지션 (PageTransition.tsx)
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// 페이드인 애니메이션
const Wrapper = styled.div`
  animation: fadeInUp 0.5s ease;
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
```

**키오스크용:**
- 페이지 전환 (메뉴 → 장바구니 → 결제)
- 버튼 피드백 (누르기 애니메이션)
- 로딩 상태 (스피너, 스켈레톤)

---

## 🔧 백엔드 API 설계

### 1. **컨트롤러 계층 패턴** ⭐⭐⭐⭐⭐

**참고:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/controller/OrderController.java`

```java
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin
public class OrderController {
    
    private final OrderService orderService;
    
    // 사용자 주문 내역 가져오기
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.listUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
    
    // 새 주문하기
    @PostMapping("/user/{userId}")
    public ResponseEntity<Order> placeOrder(
        @PathVariable Long userId, 
        @RequestParam(required = false) Long addressId
    ) {
        Order order = orderService.placeOrder(userId, addressId);
        return ResponseEntity.ok(order);
    }
}
```

**키오스크 적용:**
```java
@RestController
@RequestMapping("/api/kiosk")
public class KioskController {
    
    // 메뉴 아이템 가져오기
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getMenu() { ... }
    
    // 주문 제출
    @PostMapping("/orders")
    public ResponseEntity<Order> submitOrder(@RequestBody OrderRequest request) { ... }
    
    // 주문 상태 확인
    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderStatus> getOrderStatus(@PathVariable Long orderId) { ... }
}
```

---

### 2. **서비스 계층 패턴** ⭐⭐⭐⭐⭐

**참고:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/service/OrderService.java`

**핵심 개념:**
- ✅ 비즈니스 로직 분리
- ✅ `@Transactional`을 사용한 트랜잭션 관리
- ✅ 커스텀 예외를 사용한 에러 처리
- ✅ 재고 검증

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    
    @Transactional
    public Order placeOrder(Long userId, Long addressId) {
        // 1. 장바구니가 비어있지 않은지 검증
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // 2. 재고 확인
        for (CartItem cart : cartItems) {
            if (product.getStockQuantity() < cart.getQuantity()) {
                throw new RuntimeException("Insufficient stock: " + product.getName());
            }
        }
        
        // 3. 주문 아이템 생성 및 재고 감소
        for (CartItem cart : cartItems) {
            product.setStockQuantity(product.getStockQuantity() - cart.getQuantity());
            // 주문 아이템 생성...
        }
        
        // 4. 주문 저장 및 장바구니 비우기
        Order order = orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);
        
        return order;
    }
}
```

**키오스크 적용:**
```java
@Service
public class KioskOrderService {
    
    @Transactional
    public Order processOrder(OrderRequest request) {
        // 1. 주문 아이템 검증
        // 2. 총액 계산 (할인 있으면 적용)
        // 3. 결제 처리
        // 4. 주문 레코드 생성
        // 5. 주방 디스플레이로 전송
        // 6. 주문 번호 반환
    }
}
```

---

### 3. **예외 처리 패턴** ⭐⭐⭐⭐⭐

**참고:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/exception/GlobalExceptionHandler.java`

**중앙 집중식 에러 처리:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // 리소스 없음 처리 (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex,
        HttpServletRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    // 유효성 검사 에러 처리 (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        // 유효성 검사 에러 메시지 추출...
        return ResponseEntity.badRequest().body(error);
    }
}
```

**에러 응답 형식:**
```json
{
  "status": 404,
  "message": "Product not found with id: 999",
  "path": "/api/products/999",
  "timestamp": "2025-11-06T09:47:44"
}
```

---

## 🗄️ 데이터베이스 스키마 참고

### 전체 스키마 문서
**참고:** 완전한 세부사항은 `docs/10_DATABASE_SCHEMA.md` 참조

### 카페 키오스크용 주요 테이블

#### 1. **메뉴 아이템 테이블** (`products`와 동일)

```sql
CREATE TABLE menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,                    -- 원 단위 가격 (예: 4500 = ₩4,500)
    category_id BIGINT,                    -- categories 외래 키
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,     -- 품절 플래그
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    INDEX idx_available (is_available),
    CHECK (price >= 0)
);
```

**샘플 데이터:**
```sql
INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES
('아메리카노', '핫 또는 아이스', 4500, 1, '/images/americano.jpg'),
('카페 라떼', '부드러운 에스프레소와 스팀 밀크', 5000, 1, '/images/latte.jpg'),
('크루아상', '버터향 가득한 프랑스 페이스트리', 3500, 2, '/images/croissant.jpg');
```

#### 2. **카테고리 테이블**

```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,           -- 탭 정렬용
    
    INDEX idx_display_order (display_order)
);

INSERT INTO categories (name, display_order) VALUES
('커피', 1),
('디저트', 2),
('음료', 3),
('베이커리', 4);
```

#### 3. **주문 테이블**

```sql
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE,       -- 표시 번호 (예: "K-001")
    total_amount INT NOT NULL,
    status VARCHAR(50) NOT NULL,           -- PENDING, PREPARING, READY, COMPLETED
    payment_method VARCHAR(50),            -- CARD, CASH, MOBILE
    ordered_at DATETIME,
    completed_at DATETIME,
    
    INDEX idx_status (status),
    INDEX idx_ordered_at (ordered_at),
    CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    CHECK (total_amount >= 0)
);
```

#### 4. **주문 아이템 테이블**

```sql
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,                    -- 주문 시점 가격
    customization TEXT,                    -- JSON: {"size": "Large", "shots": 2, "milk": "Oat"}
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    CHECK (quantity > 0),
    CHECK (price >= 0)
);
```

### 키오스크용 엔터티 관계

```
categories (1) ──< (N) menu_items
                         │
                         │ (N)
                         ▼
orders (1) ──< (N) order_items
```

---

## 💻 재사용 가능한 코드 스니펫

### 1. **Axios API 클라이언트 설정**

```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청에 인증 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 전역 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 로그인으로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 2. **수량 선택기 컴포넌트**

```tsx
// components/QuantitySelector.tsx
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f7fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  width: fit-content;
`;

const Button = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
`;

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantitySelector: React.FC<Props> = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 99 
}) => {
  return (
    <Container>
      <Button onClick={() => onChange(value - 1)} disabled={value <= min}>
        −
      </Button>
      <Quantity>{value}</Quantity>
      <Button onClick={() => onChange(value + 1)} disabled={value >= max}>
        +
      </Button>
    </Container>
  );
};
```

---

### 3. **가격 포맷터 유틸리티**

```typescript
// utils/formatPrice.ts

/**
 * 표시용 가격 포맷
 * @param price - 원 단위 가격 (예: 4500)
 * @returns 포맷된 문자열 (예: "₩4,500")
 */
export const formatPrice = (price: number): string => {
  return `₩${price.toLocaleString('ko-KR')}`;
};

/**
 * 장바구니 아이템에서 총액 계산
 */
export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```

---

### 4. **로딩 스켈레톤 컴포넌트**

```tsx
// components/LoadingSkeleton.tsx
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export const Skeleton = styled.div<{ width?: string; height?: string }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
`;

// 사용법
<Skeleton width="200px" height="24px" />
```

---

### 5. **빈 상태 컴포넌트**

```tsx
// components/EmptyState.tsx
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Hint = styled.p`
  font-size: 1rem;
  opacity: 0.7;
`;

interface Props {
  icon: string;
  message: string;
  hint?: string;
}

export const EmptyState: React.FC<Props> = ({ icon, message, hint }) => (
  <Container>
    <Icon>{icon}</Icon>
    <Message>{message}</Message>
    {hint && <Hint>{hint}</Hint>}
  </Container>
);

// 사용법
<EmptyState 
  icon="🛒" 
  message="장바구니가 비어있습니다" 
  hint="메뉴를 둘러보고 아이템을 추가하세요"
/>
```

---

## ❌ 복사하면 안 되는 것들

### 1. **사용자 인증 시스템**
**이유:** 키오스크는 단일 사용자, 로그인 불필요
- ❌ AuthController.java
- ❌ JWT 토큰 처리
- ❌ 사용자 등록/로그인 페이지
- ❌ 비밀번호 암호화

**대신:** 세션 기반 주문 사용 (세션 ID 또는 주문 번호)

---

### 2. **위시리스트 기능**
**이유:** 키오스크 주문과 무관
- ❌ WishlistController
- ❌ WishlistPage.tsx
- ❌ wishlist_items 테이블

---

### 3. **배송/주소 관리**
**이유:** 매장 내 픽업만
- ❌ AddressController
- ❌ AddressesPage.tsx
- ❌ addresses 테이블
- ❌ 결제 시 배송 양식

---

### 4. **사용자 프로필 & 내역**
**이유:** 익명 키오스크 사용자
- ❌ MyPage.tsx
- ❌ UserController
- ❌ 주문 내역 페이지

**대신:** 주문 번호로만 주문 추적

---

### 5. **OAuth 통합**
**이유:** 키오스크용 외부 로그인 없음
- ❌ OAuthCallbackPage.tsx
- ❌ Google/소셜 로그인

---

### 6. **관리자 패널**
**이유:** 별도 관리자 대시보드 사용
- ❌ AdminOrdersPage.tsx (프론트엔드에서)

**대신:** 전용 관리자 앱 구축 또는 기존 POS 시스템 사용

---

## 🎯 권장 키오스크 아키텍처

### 간소화된 스택

```
프론트엔드:  React + TypeScript + Styled Components
백엔드:      Spring Boot (REST API)
데이터베이스: MySQL
호스팅:      로컬 서버 + 태블릿 키오스크
```

### 구현할 핵심 기능

✅ **필수:**
1. 카테고리별 메뉴 표시
2. 커스터마이징이 있는 아이템 상세
3. 장바구니
4. 주문 결제
5. 결제 통합 (카드 리더기 API)
6. 주문 번호 표시
7. 주방 주문 동기화

✅ **있으면 좋음:**
1. 주문 상태 추적
2. 영수증 인쇄
3. 일일 매출 대시보드
4. 재고 알림

❌ **불필요:**
1. 사용자 계정
2. 위시리스트
3. 리뷰/평점
4. 배송
5. 이메일 알림

---

## 📊 컴포넌트 재사용성 매트릭스

| 컴포넌트 | 바로 복사 | 수정 필요 | 사용 안 함 |
|-----------|------------|---------|-----------|
| 상품 그리드 | ✅ 90% | 카테고리 필터 | N/A |
| 상품 카드 | ✅ 95% | 위시리스트 아이콘 제거 | N/A |
| 장바구니 레이아웃 | ✅ 85% | "쇼핑 계속하기" 제거 | N/A |
| 수량 선택기 | ✅ 100% | 없음 | N/A |
| 결제 플로우 | 🔧 50% | 배송 단계 제거 | 주소 양식 |
| 진행 바 | ✅ 100% | 단계 라벨 조정 | N/A |
| 토스트 알림 | ✅ 100% | 없음 | N/A |
| 네비바 | 🔧 60% | 인증 링크 제거 | 로그인/회원가입 |
| OrderController | ✅ 80% | addressId 파라미터 제거 | N/A |
| OrderService | ✅ 75% | 검증 간소화 | 사용자 체크 |
| 데이터베이스 스키마 | ✅ 70% | 사용자 FK 제거 | users, addresses |

**범례:**
- ✅ 바로 복사: 최소한의 변경으로 그대로 사용
- 🔧 수정 필요: 상당한 변경 필요
- ❌ 사용 안 함: 키오스크에 적용 불가

---

## 🚀 팀을 위한 빠른 시작 체크리스트

### 1주차: 설정 & UI
- [ ] 메뉴 표시를 위한 HomePage.tsx 검토
- [ ] 주문 카트를 위한 CartPage.tsx 검토
- [ ] QuantitySelector 컴포넌트 복사
- [ ] Toast 알림 시스템 복사
- [ ] styled-components 테마 설정

### 2주차: 백엔드 & 데이터베이스
- [ ] 데이터베이스 스키마 검토 (`10_DATABASE_SCHEMA.md`)
- [ ] 간소화된 스키마 생성 (users, addresses, wishlist 제거)
- [ ] OrderController.java 검토
- [ ] OrderService.java 검토
- [ ] Spring Boot 프로젝트 설정

### 3주차: 통합
- [ ] 프론트엔드를 백엔드에 연결
- [ ] 장바구니 기능 구현
- [ ] 주문하기 추가
- [ ] 결제 플로우 테스트

### 4주차: 마무리
- [ ] 로딩 상태 추가
- [ ] 에러 처리
- [ ] 터치 최적화 (더 큰 버튼)
- [ ] 주방 디스플레이 동기화

---

## 📚 추가 리소스

### 이 프로젝트에서:
1. **데이터베이스 스키마:** `docs/10_DATABASE_SCHEMA.md`
2. **API 테스팅:** 기존 Swagger 문서 사용 (설정된 경우)
3. **프론트엔드 예제:** `vocaloid_front/src/pages/`의 모든 파일
4. **백엔드 로직:** `vocaloidshop/src/main/java/.../service/`의 모든 파일

### 외부 참조:
1. **React + TypeScript:** https://react-typescript-cheatsheet.netlify.app/
2. **Styled Components:** https://styled-components.com/docs
3. **Spring Boot REST:** https://spring.io/guides/tutorials/rest/
4. **터치 UI 가이드라인:** Apple Human Interface Guidelines (HIG)

---

## 💡 키오스크 개발을 위한 프로 팁

### 1. **터치 친화적 디자인**
```tsx
// 최소 터치 타겟: 44x44px
const Button = styled.button`
  min-width: 120px;
  min-height: 60px;
  font-size: 1.2rem;
  padding: 1rem 2rem;
`;
```

### 2. **자동 리셋 타임아웃**
```typescript
// 2분 비활성 후 홈 페이지로 리셋
useEffect(() => {
  const timeout = setTimeout(() => {
    navigate('/');
    clearCart();
  }, 120000); // 2분
  
  return () => clearTimeout(timeout);
}, [navigate]);
```

### 3. **화면 절전 방지**
```typescript
// NoSleep.js 라이브러리 사용
import NoSleep from 'nosleep.js';

const noSleep = new NoSleep();
noSleep.enable();
```

### 4. **크고 명확한 폰트**
```tsx
const Text = styled.p`
  font-size: 1.2rem;  // 키오스크용 최소값
  line-height: 1.5;
  font-weight: 500;
`;
```

### 5. **에러 복구**
```tsx
// 항상 빠져나갈 방법 제공
<Button onClick={() => navigate('/')}>
  ← 메뉴로 돌아가기
</Button>
```

---

## 📞 질문이 있으신가요?

특정 컴포넌트나 패턴에 대해 팀에서 질문이 있으시면:

1. **UI 컴포넌트:** `vocaloid_front/src/pages/`와 `vocaloid_front/src/components/` 확인
2. **백엔드 로직:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/` 확인
3. **데이터베이스:** `docs/10_DATABASE_SCHEMA.md` 또는 `schema.sql` 확인
4. **API 엔드포인트:** 컨트롤러 파일 확인 (예: `ProductController.java`)

**카페 키오스크 프로젝트 화이팅! 🎉**

---

**문서 버전:** 1.0  
**최종 업데이트:** 2025년 11월 6일  
**프로젝트:** Vocaloid Shop (카페 키오스크용 포트폴리오 참고)
