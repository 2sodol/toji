# 불법점용 용지 관리 모듈 로직 명세서

이 문서는 불법점용 용지 관리 시스템의 등록, 조회, 수정 기능에 대한 로직과 구현 가이드를 정리한 것입니다.

## 1. 공통 사항 (Common)

### 1.1 데이터 구조 (Entity)

- **기본 정보 (Basic Info)**
  - 관리 주체: 본부(`hdqrNm`), 지사(`mtnofNm`)
  - 위치 정보: 노선(`routeCd`), 방향(`drveDrctCd`), 이정(`routeDstnc`), 주소(`lndsLdnoAddr`), 좌표(`gpsLgtd`, `gpsLttd`), 고유번호(`lndsUnqNo`)
  - 발생 정보: 발생일(`ocrnDates`), 담당자(`prchEmno`)
  - 행위자 정보: 행위자명(`trnrNm`), 주소(`trnrAddr`), 관련자명(`rltrNm`), 관련자 주소(`rltrAddr`)
  - 점유 정보: 점유율(`ilglPssrt`), 점유면적(`ilglPssnSqms`)
  - 상태 정보: 조치상태(`ilglPrvuActnStatVal`), 시설물분류(`strcClssCd`)
- **조치 이력 (Action History)**
  - 구조: 1:N 관계
  - 필드: 조치 일시(`actnDttm`), 조치 내용(`actnCtnt`)
- **첨부 파일 (Attachment)**
  - 구조: 1:N 관계 (주로 현장 사진)
  - 필드: 파일명(`attflNm`), 경로(`attflPath`), 촬영일(`ocrnDates`)

### 1.2 UI 구성 전략

- **JSP 모듈화**: `illegal-register-form-fields.jsp`를 공통 폼으로 사용하여 유지보수성 확보.
- **ID 충돌 방지**: `jsp:include` 시 `prefix` 파라미터를 사용하여 요소 ID 구분 (등록: `prefix=""`, 수정: `prefix="modify"`).
- **이미지 처리**: 클라이언트에서 파일을 읽어 **Base64 문자열**로 변환하여 JSON payload에 포함 전송.

---

## 2. 등록 (Registration)

### 2.1 프로세스 흐름

1.  **모달 오픈 (`openRegisterModal`)**:
    - 폼 초기화 (Input 값 리셋).
    - 기본 이미지 입력 필드 1개 생성.
    - 지도상 선택된 위치가 있다면 좌표 및 주소 정보 자동 입력.
2.  **이미지 추가**:
    - "추가" 버튼 클릭 시 동적으로 이미지 입력 행(`illegal-register-image-item`) 생성.
    - 파일 선택(`input[type=file]`) 시:
      - 확장자(PNG) 및 용량 체크.
      - **선행 조건**: 촬영일(`input[type=date]`)이 먼저 선택되어 있어야 함.
      - `FileReader`로 Base64 변환 후 미리보기 표시.
      - 숨겨진 필드(`imageMappingData[]`)에 `촬영일:Base64데이터` 형식으로 저장.
3.  **제출 (`handleRegisterSubmit`)**:
    - 필수 값 유효성 검사 (본부, 지사, 노선, 발생일 등).
    - 조치 이력 데이터 수집 (동적 생성된 리스트).
    - 이미지 데이터 수집 (숨겨진 매핑 데이터 파싱).
    - **API 호출**: `POST /regions/register` (JSON Body).
4.  **완료 처리**:
    - 성공 시 알림 표시 및 목록/지도 리로드.
    - 모달 닫기.

### 2.2 주요 API

- `POST /regions/register`: 신규 불법점용 정보 및 관련 데이터(이미지, 조치이력) 일괄 저장.

---

## 3. 조회 (Inquiry)

### 3.1 프로세스 흐름

1.  **상세 조회 요청**:
    - 지도 마커 클릭 또는 목록 아이템 클릭 시 발생.
    - **API 호출**: `GET /regions/detail/{seq}`.
2.  **모달 오픈 및 데이터 바인딩 (`openInquiryModal`)**:
    - 응답 받은 JSON 데이터를 조회 모달(`inquiry-modal.jsp`)의 각 필드(`span`, `div`)에 텍스트로 바인딩.
    - **이미지 렌더링**:
      - 이미지 목록(`response.photos`)을 순회하며 슬라이더 또는 그리드 형태로 표시.
      - 이미지 소스: `/regions/photo/{ilglAttflSeq}` 엔드포인트 사용.
    - **조치 이력 렌더링**:
      - 이력 목록(`response.actionHistories`)을 테이블 형태로 동적 생성하여 표시.
3.  **수정/삭제 버튼**:
    - 사용자 권한에 따라 버튼 노출.
    - 수정 버튼 클릭 시 수정 모달 프로세스로 전환.

### 3.2 주요 API

- `GET /regions/detail/{id}`: 불법점용 상세 정보(기본정보, 이미지 목록, 조치이력 목록) 반환.
- `GET /regions/photo/{id}`: 개별 이미지 파일 스트림 반환 (바이너리).

---

## 4. 수정 (Modification)

### 4.1 프로세스 흐름

1.  **데이터 로드 (`loadModifyData`)**:
    - 상세 조회된 데이터를 기반으로 수정 모달(`modify-modal.jsp`)의 폼 필드(`input`, `select`)에 값 설정.
    - **ID 접두사 주의**: 모든 선택자는 `#modify` + `ID` 형태여야 함 (예: `#modifyhdqrNm`).
2.  **기존 이미지 렌더링**:
    - 서버에서 받아온 기존 이미지 목록을 미리보기 영역에 표시.
    - **삭제 처리**: 기존 이미지 삭제 버튼 클릭 시, 해당 이미지의 ID(`ilglAttflSeq`)를 `deletedFileIds` 배열에 저장.
3.  **신규 이미지 추가**:
    - 등록 로직과 동일 (동적 행 생성 -> 날짜 선택 -> 파일 선택 -> Base64 변환).
    - 기존 이미지와 신규 이미지가 혼재된 상태로 UI 유지.
4.  **제출 (`handleModifySubmit`)**:
    - 변경된 폼 데이터 수집.
    - `deletedFileIds` (삭제할 기존 파일 ID 목록) 포함.
    - 신규 추가된 이미지(`files`)만 Base64로 전송.
    - **API 호출**: `PUT /regions/update?ilglPrvuInfoSeq={id}`.
5.  **완료 처리**:
    - 성공 시 알림 및 목록 갱신.
    - 상세 조회 창이 열려있다면 데이터 갱신 필요.

### 4.2 주요 API

- `PUT /regions/update`: 수정된 정보 반영. (삭제된 이미지는 DB/파일시스템에서 제거, 신규 이미지는 추가).

---

## 5. 주요 구현 포인트 (Checklist)

- [ ] **ID Prefix 처리**: JSP Include 시 `param.prefix`를 사용하여 ID 중복을 방지했는가?
- [ ] **이미지-날짜 매핑**: 파일 선택 시점의 날짜 값을 정확히 매핑하여 서버로 전송하는가?
- [ ] **날짜 포맷**: `yyyy-MM-dd` 형식의 문자열과 `Date` 객체, `LocalDateTime` 간의 변환이 정확한가?
- [ ] **파일 용량/형식 제한**: 클라이언트 측에서 1차적으로 필터링하는가?
- [ ] **트랜잭션**: 등록/수정 시 기본정보, 이미지, 조치이력이 하나의 트랜잭션으로 처리되는가?
