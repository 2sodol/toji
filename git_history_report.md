# Git 변경 내역 보고서 (2025-12-11 ~ 현재)

## 1. 2025-12-15 (최신)

**커밋**: `58f4c93`
**메시지**: `feat: Enhance slide panel functionality with image toggle behavior and automatic map navigation for item visibility`

### 📝 상세 수정 내역

#### **`src/main/webapp/resources/js/slide-panel.js`**

- **`handleImageToggle` 함수 수정**:
  - **스마트 지도 이동 로직 추가**: 이미지 표시 체크박스를 켰을 때, 현재 보고 있는 지도 영역(`map.getView().calculateExtent()`) 안에 리스트에 있는 필지가 하나라도 포함되어 있는지(`ol.extent.containsCoordinate`) 검사합니다.
  - 화면에 관련 필지가 하나도 보이지 않는 경우에만 리스트의 첫 번째 필지 위치로 지도를 자동 이동시킵니다.
- **`handleItemClick` 함수 수정**:
  - 리스트 아이템 클릭 시, '이미지 표시' 체크박스가 꺼져 있다면 자동으로 켜주는 로직을 추가하여 사용자 편의성을 높였습니다.
- **상태 변수 추가**:
  - `hasMovedToFirstItem`: 자동 이동이 반복적으로 발생하지 않도록 제어하는 플래그 변수를 추가하고 `clearList`에서 초기화하도록 설정했습니다.

#### **`src/main/webapp/WEB-INF/views/slide-panel.jsp`**

- **이미지 토글 체크박스**:
  - 초기 로딩 시 `checked` 속성을 제거하여 기본 상태를 '끄기'로 변경했습니다.

---

## 2. 2025-12-12

**커밋**: `2547ccb`
**메시지**: `feat: Implement slide panel for region list management including search, pagination, and map layer controls.`

### 📝 상세 수정 내역

#### **`src/main/webapp/WEB-INF/views/index.jsp`**

- **고정 하이라이트 레이어 추가**:
  - `fixedHighlightLayer`: 리스트에 있는 필지들의 경계선을 붉은색(`rgba(255, 0, 0, 0.8)`)으로 표시하기 위한 별도 벡터 레이어를 추가했습니다.
- **`addBoundaryHighlights` 함수 구현**:
  - PNU 목록을 받아 VWorld WFS API를 호출하고, 응답받은 지오메트리를 `fixedHighlightLayer`에 그리는 로직을 구현했습니다.
- **레이어 제어 함수 업데이트**:
  - `toggleImageLayer`, `clearImageLayer`: 이미지 레이어뿐만 아니라 고정 하이라이트 레이어도 함께 켜고 끄거나 초기화하도록 수정했습니다.

#### **`src/main/webapp/resources/js/slide-panel.js`**

- **`renderList` 함수 수정**:
  - 리스트를 렌더링할 때 각 아이템의 PNU를 수집하여 `addBoundaryHighlights` 함수를 호출, 지도에 해당 필지들의 경계선을 일괄 표시하도록 연동했습니다.
  - 리스트 렌더링 전 기존 하이라이트를 초기화하는 로직을 추가했습니다.

---

## 3. 2025-12-12

**커밋**: `bfac65d`
**메시지**: `feat: Add initial application setup including Docker Compose, core views, proxy controller, and SQL mappers...`

### 📝 상세 수정 내역

#### **`src/main/resources/mappers/RegionMapper.xml`**

- **스키마 명칭 제거**:
  - 모든 쿼리문(`SELECT`, `INSERT`, `UPDATE`, `DELETE`)에서 `DTJ_MAIN.` 스키마 접두어를 제거하여 DB 연결 계정에 종속되지 않도록 수정했습니다. (예: `DTJ_MAIN.T_LNDS_...` → `T_LNDS_...`)

#### **`src/main/webapp/resources/js/slide-panel.js`**

- **지적도 토글 기능 추가**:
  - `#slide-panel-cadastral-toggle` 체크박스에 대한 이벤트 리스너를 추가하여, 체크 여부에 따라 `window.cadastralLayer`의 가시성(`setVisible`)을 제어하도록 구현했습니다.

#### **`src/main/webapp/WEB-INF/views/index.jsp`**

- **이미지 투명도 조정**:
  - `createImageLayer` 함수에서 이미지 레이어 생성 시 설정했던 `opacity: 0.8` 속성을 제거하여 이미지가 불투명하게(선명하게) 표시되도록 수정했습니다.

#### **기타 설정 파일**

- **`docker-compose.yml`**: 컨테이너 환경 구성을 위한 파일 신규 추가.
- **`src/main/java/com/toji/toji/controller/ProxyController.java`**: 외부 API 호출을 위한 프록시 컨트롤러 신규 추가.
