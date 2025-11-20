package com.toji.toji.controller;

import com.toji.toji.dto.RegionRegisterRequest;
import com.toji.toji.service.RegionService;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/regions")
@RequiredArgsConstructor
public class RegionController {

  private final RegionService regionService;

  /**
   * 지역 정보를 등록한다.
   *
   * @param request 등록 요청 DTO
   * @return 등록 결과 응답
   */
  @RequestMapping(value = "/register", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> registerRegion(@RequestBody RegionRegisterRequest request) {
    try {
      log.info("지역 등록 요청 수신: {}", request);
      if (request.getFiles() != null) {
        log.info("첨부파일 정보: images={}, kml={}",
            request.getFiles().getImages() != null ? request.getFiles().getImages().size() : 0,
            request.getFiles().getKml() != null ? "있음" : "없음");
      } else {
        log.warn("첨부파일 정보가 없습니다. request.getFiles() = null");
      }
      Long id = regionService.registerRegion(request);
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("id", id);
      response.put("message", "지역 등록에 성공했습니다.");
      log.info("지역 등록 성공: id={}", id);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
  }

  /**
   * 페이징 처리된 불법점용 리스트를 조회한다.
   *
   * @param page 페이지 번호 (기본값: 1)
   * @param size 페이지 크기 (기본값: 5)
   * @return 페이징 정보와 리스트를 포함한 응답
   */
  @RequestMapping(value = "/list", method = RequestMethod.GET)
  public ResponseEntity<Map<String, Object>> getIllegalList(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "5") int size) {
    try {
      log.info("불법점용 리스트 조회 요청: page={}, size={}", page, size);
      Map<String, Object> result = regionService.findAllWithPaging(page, size);
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("data", result);
      log.info("불법점용 리스트 조회 성공: totalCount={}", result.get("totalCount"));
      return ResponseEntity.ok(response);
    } catch (Exception ex) {
      String errorMessage = ex.getMessage();
      if (errorMessage == null || errorMessage.isEmpty()) {
        errorMessage = ex.getClass().getSimpleName();
      }
      log.error("불법점용 리스트 조회 실패", ex);
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("message", "리스트 조회에 실패했습니다: " + errorMessage);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }

  /**
   * 특정 토지의 등록일 리스트를 조회한다.
   *
   * @param lndsUnqNo 토지고유번호
   * @param type      조회 타입 (detail: 상세정보, photo: 사진)
   * @return 등록일 리스트 응답
   */
  @RequestMapping(value = "/dates", method = RequestMethod.GET)
  public ResponseEntity<Map<String, Object>> getDatesByLndsUnqNo(
      @RequestParam String lndsUnqNo,
      @RequestParam String type) {
    try {
      log.info("등록일 리스트 조회 요청: lndsUnqNo={}, type={}", lndsUnqNo, type);

      Map<String, Object> result = regionService.findDatesByLndsUnqNoAndType(lndsUnqNo, type);
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("data", result);

      log.info("등록일 리스트 조회 성공: lndsUnqNo={}, type={}, count={}",
          lndsUnqNo, type, result.get("dates") != null ? ((java.util.List<?>) result.get("dates")).size() : 0);

      return ResponseEntity.ok(response);
    } catch (Exception ex) {
      String errorMessage = ex.getMessage();
      if (errorMessage == null || errorMessage.isEmpty()) {
        errorMessage = ex.getClass().getSimpleName();
      }
      log.error("등록일 리스트 조회 실패: lndsUnqNo={}, type={}", lndsUnqNo, type, ex);
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("message", "등록일 리스트 조회에 실패했습니다: " + errorMessage);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }

  /**
   * 특정 SEQ의 상세정보를 조회한다.
   *
   * @param ilglPrvuInfoSeq 불법점용정보 SEQ
   * @return 상세정보 응답
   */
  @RequestMapping(value = "/details", method = RequestMethod.GET)
  public ResponseEntity<Map<String, Object>> getDetailBySeq(
      @RequestParam Long ilglPrvuInfoSeq) {
    try {
      log.info("상세정보 조회 요청: ilglPrvuInfoSeq={}", ilglPrvuInfoSeq);

      Map<String, Object> result = regionService.findDetailBySeq(ilglPrvuInfoSeq);
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("data", result);

      log.info("상세정보 조회 성공: ilglPrvuInfoSeq={}", ilglPrvuInfoSeq);

      return ResponseEntity.ok(response);
    } catch (Exception ex) {
      String errorMessage = ex.getMessage();
      if (errorMessage == null || errorMessage.isEmpty()) {
        errorMessage = ex.getClass().getSimpleName();
      }
      log.error("상세정보 조회 실패: ilglPrvuInfoSeq={}", ilglPrvuInfoSeq, ex);
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("message", "상세정보 조회에 실패했습니다: " + errorMessage);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }

  /**
   * 특정 SEQ의 사진 리스트를 조회한다.
   *
   * @param ilglPrvuInfoSeq 불법점용정보 SEQ
   * @return 사진 리스트 응답
   */
  @RequestMapping(value = "/photos", method = RequestMethod.GET)
  public ResponseEntity<Map<String, Object>> getPhotosBySeq(
      @RequestParam Long ilglPrvuInfoSeq) {
    try {
      log.info("사진 리스트 조회 요청: ilglPrvuInfoSeq={}", ilglPrvuInfoSeq);

      Map<String, Object> result = regionService.findPhotosBySeq(ilglPrvuInfoSeq);
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("data", result);

      log.info("사진 리스트 조회 성공: ilglPrvuInfoSeq={}, count={}",
          ilglPrvuInfoSeq, result.get("photos") != null ? ((java.util.List<?>) result.get("photos")).size() : 0);

      return ResponseEntity.ok(response);
    } catch (Exception ex) {
      String errorMessage = ex.getMessage();
      if (errorMessage == null || errorMessage.isEmpty()) {
        errorMessage = ex.getClass().getSimpleName();
      }
      log.error("사진 리스트 조회 실패: ilglPrvuInfoSeq={}", ilglPrvuInfoSeq, ex);
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("message", "사진 리스트 조회에 실패했습니다: " + errorMessage);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }

  /**
   * 지역 정보를 수정한다.
   *
   * @param ilglPrvuInfoSeq 수정할 불법점용정보 SEQ
   * @param request 수정 요청 DTO
   * @return 수정 결과 응답
   */
  @RequestMapping(value = "/update", method = RequestMethod.PUT)
  public ResponseEntity<Map<String, Object>> updateRegion(
      @RequestParam Long ilglPrvuInfoSeq,
      @RequestBody RegionRegisterRequest request) {
    try {
      log.info("지역 수정 요청 수신: ilglPrvuInfoSeq={}, request={}", ilglPrvuInfoSeq, request);
      if (request.getFiles() != null) {
        log.info("첨부파일 정보: images={}, kml={}",
            request.getFiles().getImages() != null ? request.getFiles().getImages().size() : 0,
            request.getFiles().getKml() != null ? "있음" : "없음");
      }
      Long id = regionService.updateRegion(ilglPrvuInfoSeq, request);
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("id", id);
      response.put("message", "지역 수정에 성공했습니다.");
      log.info("지역 수정 성공: id={}", id);
      return ResponseEntity.ok(response);
    } catch (Exception ex) {
      String errorMessage = ex.getMessage();
      if (errorMessage == null || errorMessage.isEmpty()) {
        errorMessage = ex.getClass().getSimpleName();
      }
      log.error("지역 수정 실패", ex);
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("id", null);
      response.put("message", "지역 수정에 실패했습니다: " + errorMessage);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }
}
