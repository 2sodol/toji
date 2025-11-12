package com.toji.toji.controller;

import com.toji.toji.dto.RegionRegisterRequest;
import com.toji.toji.service.RegionService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/regions")
@RequiredArgsConstructor
public class RegionController {

  private final RegionService regionService;

  @RequestMapping(method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> registerRegion(@RequestBody RegionRegisterRequest request) {
    try {
      Long id = regionService.registerRegion(request);
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(Map.of("success", true, "id", id, "message", "지역 등록에 성공했습니다."));
    } catch (RuntimeException ex) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "id", null, "message", "지역 등록에 실패했습니다."));
    }
  }
}
