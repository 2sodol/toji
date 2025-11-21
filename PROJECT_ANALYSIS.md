# 프로젝트 분석 및 개선점 리포트

## 📋 분석 개요

지역 불법점용 정보 관리 시스템의 백엔드 및 프론트엔드 로직을 분석하여 API 호출 패턴과 로직 구현의 개선점을 도출했습니다.

---

## 🔴 주요 개선점

### 1. **N+1 쿼리 문제 (심각)** ✅ **해결 완료**

**이전 문제:**

- 리스트의 각 아이템마다 `hasDataByLndsUnqNo()`와 `findFirstImagePathByIlglPrvuInfoSeq()`를 호출
- 페이지당 5개 아이템이면 최소 11번의 쿼리 실행 (1번 리스트 조회 + 5번 hasData + 5번 이미지)
- 데이터가 많아질수록 성능 저하 심각

**해결 방법:**

- `findAllWithPagingOptimized` 쿼리를 추가하여 JOIN과 윈도우 함수를 활용
- 한 번의 쿼리로 모든 데이터 조회 (hasData, imagePath 포함)
- 성능 개선: **11번 쿼리 → 1번 쿼리**

**구현 내용:**

1. **Mapper XML에 최적화된 쿼리 추가**

   - LEFT JOIN을 사용하여 이미지 경로를 한 번에 조회
   - COUNT를 활용하여 hasData 계산 (같은 lndsUnqNo를 가진 레코드가 2개 이상인지 확인)
   - 윈도우 함수(ROW_NUMBER)로 첫 번째 이미지만 선택

2. **Mapper 인터페이스에 새 메서드 추가**

   ```java
   List<Map<String, Object>> findAllWithPagingOptimized(int offset, int limit);
   ```

3. **Service 구현 수정**
   - 기존 루프 내 쿼리 호출 제거
   - 최적화된 쿼리 결과를 직접 사용하여 데이터 변환

**성능 개선 효과:**

- 쿼리 횟수: **11회 → 1회** (페이지당 5개 기준)
- 응답 시간: **약 80-90% 감소 예상** (데이터베이스 부하에 따라 다름)
- 확장성: 데이터가 많아져도 성능 저하 최소화

---

### 2. **API 엔드포인트 설계 개선**

**현재 문제:**

```205:206:src/main/java/com/toji/toji/controller/RegionController.java
  @RequestMapping(value = "/update", method = RequestMethod.PUT)
  public ResponseEntity<Map<String, Object>> updateRegion(
      @RequestParam Long ilglPrvuInfoSeq,
      @RequestBody RegionRegisterRequest request) {
```

**문제점:**

- PUT 메서드에 쿼리 파라미터 사용 (RESTful하지 않음)
- URL이 `/regions/update?ilglPrvuInfoSeq=123` 형태로 되어 있어 리소스 중심 설계가 아님

**개선 방안:**

```java
// 권장: RESTful 스타일
@RequestMapping(value = "/{id}", method = RequestMethod.PUT)
public ResponseEntity<Map<String, Object>> updateRegion(
    @PathVariable Long id,
    @RequestBody RegionRegisterRequest request) {
```

**프론트엔드도 함께 수정:**

```javascript
// register.js 수정 필요
var url = state.editMode ? "/regions/" + state.editSeq : "/regions/register";
var method = state.editMode ? "PUT" : "POST";
// 쿼리 파라미터 제거
```

---

### 3. **하드코딩된 값들**

**현재 문제:**

```47:47:src/main/java/com/toji/toji/service/RegionServiceImpl.java
    String currentUserId = "SYSTEM"; // TODO: 실제 사용자 ID로 변경 필요
```

```35:35:src/main/java/com/toji/toji/service/RegionServiceImpl.java
  private static final String UPLOAD_PATH = "src/main/resources/static/CDIGIT_CCTV01/attach/extension/illegalLands";
```

**개선 방안:**

1. **사용자 ID**: Spring Security 또는 세션에서 가져오기
2. **파일 경로**: `application.properties`에 설정 추가
   ```properties
   file.upload.path=src/main/resources/static/CDIGIT_CCTV01/attach/extension/illegalLands
   ```
3. **@Value 어노테이션으로 주입**
   ```java
   @Value("${file.upload.path}")
   private String uploadPath;
   ```

---

### 4. **예외 처리 개선**

**현재 문제:**

```49:60:src/main/java/com/toji/toji/controller/RegionController.java
    } catch (Exception ex) {
      String errorMessage = ex.getMessage();
      if (errorMessage == null || errorMessage.isEmpty()) {
        errorMessage = ex.getClass().getSimpleName();
      }
      log.error("지역 등록 실패", ex);
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("id", null);
      response.put("message", "지역 등록에 실패했습니다: " + errorMessage);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
```

**문제점:**

- 모든 예외를 동일하게 처리
- 구체적인 예외 타입별 처리 없음
- 클라이언트에 불필요한 내부 오류 정보 노출 가능

**개선 방안:**

1. **커스텀 예외 클래스 생성**

   ```java
   public class RegionNotFoundException extends RuntimeException { }
   public class FileUploadException extends RuntimeException { }
   public class ValidationException extends RuntimeException { }
   ```

2. **@ControllerAdvice로 전역 예외 처리**

   ```java
   @ControllerAdvice
   public class GlobalExceptionHandler {
     @ExceptionHandler(RegionNotFoundException.class)
     public ResponseEntity<Map<String, Object>> handleNotFound(RegionNotFoundException e) {
       // 404 처리
     }

     @ExceptionHandler(ValidationException.class)
     public ResponseEntity<Map<String, Object>> handleValidation(ValidationException e) {
       // 400 처리
     }
   }
   ```

---

### 5. **프론트엔드 API 호출 중복 및 일관성**

**현재 문제:**

- API 호출이 `register.js`, `slide-panel.js`, `inquiry-modal.js`에 분산
- 에러 처리 방식이 파일마다 다름
- API URL이 하드코딩

**개선 방안:**

1. **공통 API 유틸리티 모듈 생성**

   ```javascript
   // api-client.js
   (function (window) {
     const API_BASE = "/regions";

     window.RegionAPI = {
       register: function (data) {
         return $.ajax({
           url: API_BASE + "/register",
           method: "POST",
           contentType: "application/json",
           data: JSON.stringify(data),
         });
       },
       // ... 다른 메서드들
     };
   })(window);
   ```

2. **에러 처리 통일**
   - 모든 API 호출에서 동일한 에러 핸들링 로직 사용
   - 공통 에러 메시지 표시 함수

---

### 6. **데이터 검증 부족**

**현재 문제:**

- DTO에 검증 어노테이션 없음
- 서비스 레이어에서 수동 검증만 수행

**개선 방안:**

1. **Bean Validation 추가**

   ```java
   public class RegionRegisterRequest {
     @NotBlank(message = "본부명은 필수입니다")
     private String hdqrNm;

     @NotNull(message = "GPS 경도는 필수입니다")
     @DecimalMin(value = "-180.0")
     @DecimalMax(value = "180.0")
     private BigDecimal gpsLgtd;
     // ...
   }
   ```

2. **Controller에서 @Valid 사용**
   ```java
   public ResponseEntity<Map<String, Object>> registerRegion(
       @Valid @RequestBody RegionRegisterRequest request) {
   ```

---

### 7. **트랜잭션 범위 검토**

**현재 상태:**

```44:44:src/main/java/com/toji/toji/service/RegionServiceImpl.java
  @Transactional(rollbackFor = Exception.class)
```

**문제점:**

- 파일 저장 실패 시 DB 롤백은 되지만, 이미 저장된 파일은 삭제되지 않음
- 파일 저장과 DB 저장의 원자성 보장 어려움

**개선 방안:**

1. **파일 저장 실패 시 정리 로직 추가**
2. **트랜잭션 매니저를 활용한 보상 트랜잭션 고려**
3. **파일 저장을 별도 서비스로 분리하여 관리**

---

## 🟡 중간 우선순위 개선점

### 8. **로깅 개선**

- 현재는 INFO/ERROR 레벨만 사용
- 디버깅을 위한 DEBUG 로그 추가
- 민감한 정보(비밀번호, 개인정보) 로깅 방지

### 9. **응답 구조 표준화**

- 모든 API 응답이 `{success, data, message}` 형태로 통일되어 있음 (좋음)
- 하지만 일부 필드명이 일관되지 않을 수 있음 (예: `id` vs `ilglPrvuInfoSeq`)

### 10. **페이징 파라미터 검증**

```257:264:src/main/java/com/toji/toji/service/RegionServiceImpl.java
  public Map<String, Object> findAllWithPaging(int page, int size) {
    if (page < 1) {
      page = 1;
    }
    if (size < 1) {
      size = 5;
    }
```

- 음수나 0 처리만 되어 있음
- 최대 크기 제한이 없음 (예: size > 100 방지)

---

## 🟢 낮은 우선순위 개선점

### 11. **코드 중복 제거**

- `buildBasicInfo()`와 `buildBasicInfoForUpdate()` 메서드가 거의 동일
- 공통 로직 추출 고려

### 12. **매직 넘버/문자열 상수화**

- `"Y"`, `"N"` 같은 하드코딩된 문자열을 상수로 관리

### 13. **API 문서화**

- Swagger/OpenAPI 추가 고려

---

## 📊 성능 영향도 분석

| 개선점              | 성능 영향  | 구현 난이도 | 우선순위    |
| ------------------- | ---------- | ----------- | ----------- |
| N+1 쿼리 해결       | ⭐⭐⭐⭐⭐ | 중          | ✅ **완료** |
| API 엔드포인트 개선 | ⭐         | 낮음        | 🟡 중간     |
| 하드코딩 제거       | ⭐         | 낮음        | 🟡 중간     |
| 예외 처리 개선      | ⭐⭐       | 중          | 🟡 중간     |
| 프론트엔드 API 통합 | ⭐         | 낮음        | 🟢 낮음     |
| 데이터 검증         | ⭐⭐       | 낮음        | 🟡 중간     |

---

## ✅ 결론 및 권장사항

### ✅ 완료된 개선사항

1. **N+1 쿼리 문제 해결** ✅ - 성능 최적화 완료

### 즉시 개선 필요 (Critical)

1. **하드코딩된 사용자 ID 및 파일 경로 설정화** - 설정 파일로 분리 필요

### 단기 개선 (High Priority)

2. **RESTful API 엔드포인트 개선** - `/regions/{id}` 형태로 변경
3. **예외 처리 체계화** - 커스텀 예외 및 @ControllerAdvice 추가
4. **데이터 검증 추가** - Bean Validation 적용

### 중장기 개선 (Medium Priority)

5. **프론트엔드 API 호출 통합** - 공통 API 클라이언트 모듈 생성
6. **로깅 및 모니터링 강화** - 디버깅을 위한 로그 개선
7. **API 문서화** - Swagger/OpenAPI 추가

**현재 상태:**

- N+1 쿼리 문제가 해결되어 성능이 크게 개선되었습니다.
- 나머지 개선사항들은 코드 품질과 유지보수성을 향상시키는 데 도움이 됩니다.
