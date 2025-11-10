package com.toji.toji.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.toji.toji.domain.RegionInfo;
import com.toji.toji.dto.RegionInfoRequest;
import com.toji.toji.service.RegionInfoService;

@RestController
@RequestMapping("/regions")
public class RegionInfoController {

    private final RegionInfoService regionInfoService;

    public RegionInfoController(RegionInfoService regionInfoService) {
        this.regionInfoService = regionInfoService;
    }

    @PostMapping
    public ResponseEntity<Long> createRegionInfo(@Validated @RequestBody RegionInfoRequest request) {
        Long savedId = regionInfoService.saveRegionInfo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedId);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<RegionInfo>> getRecentRegionInfos(
            @RequestParam(name = "limit", required = false) Integer limit) {
        return ResponseEntity.ok(regionInfoService.getRecentRegionInfos(limit));
    }
}

