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
}
