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
}
