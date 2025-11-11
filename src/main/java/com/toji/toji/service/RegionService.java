package com.toji.toji.service;

import com.toji.toji.domain.ActionHistory;
import com.toji.toji.domain.BasicInfo;
import com.toji.toji.domain.PhotoMetadata;
import com.toji.toji.dto.RegionRegisterRequest;
import com.toji.toji.mapper.RegionMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class RegionService {

  private static final DateTimeFormatter ACTION_YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");

  private final RegionMapper regionMapper;

  @Transactional
  public Long registerRegion(RegionRegisterRequest request) {
    LocalDateTime now = LocalDateTime.now();

    BasicInfo basicInfo = buildBasicInfo(request, now);
    regionMapper.insertBasicInfo(basicInfo);

    insertActionHistories(basicInfo.getId(), request.getActionHistories(), now);
    insertPhotoMetadata(basicInfo.getId(), request.getPhotos(), now);

    return basicInfo.getId();
  }

  private BasicInfo buildBasicInfo(RegionRegisterRequest request, LocalDateTime now) {
    BasicInfo basicInfo = new BasicInfo();
    basicInfo.setHqName(request.getHeadOffice());
    basicInfo.setBranchName(request.getBranchOffice());
    basicInfo.setRouteName(request.getRouteName());
    basicInfo.setDrivingDirection(request.getDrivingDirection());
    basicInfo.setMilestone(request.getDistanceMark());
    basicInfo.setCategory(request.getCategory());
    basicInfo.setOccurrenceDate(request.getIncidentDate());
    basicInfo.setManagerName(request.getManagerName());
    basicInfo.setActorName(request.getActorName());
    basicInfo.setRelatedPerson(request.getRelatedPersonName());
    basicInfo.setActorAddress(request.getActorAddress());
    basicInfo.setRelatedAddress(request.getRelatedAddress());
    basicInfo.setOccupancyRate(normalizeDecimal(request.getOccupancyRate()));
    basicInfo.setOccupancyArea(normalizeDecimal(request.getOccupancyArea()));
    basicInfo.setActionStatus(request.getActionStatus());
    basicInfo.setPnu(null);
    basicInfo.setLatitude(null);
    basicInfo.setLongitude(null);
    basicInfo.setCreatedAt(now);
    basicInfo.setUpdatedAt(now);
    return basicInfo;
  }

  private void insertActionHistories(Long basicInfoId, List<RegionRegisterRequest.ActionHistoryRequest> histories,
      LocalDateTime now) {
    if (basicInfoId == null || CollectionUtils.isEmpty(histories)) {
      return;
    }

    histories.stream()
        .filter(history -> history.getActionDate() != null && StringUtils.hasText(history.getDescription()))
        .forEach(history -> {
          ActionHistory actionHistory = new ActionHistory();
          actionHistory.setBasicInfoId(basicInfoId);
          actionHistory.setActionYearMonth(formatYearMonth(history.getActionDate()));
          actionHistory.setDescription(history.getDescription());
          actionHistory.setCreatedAt(now);
          regionMapper.insertActionHistory(actionHistory);
        });
  }

  private void insertPhotoMetadata(Long basicInfoId, List<RegionRegisterRequest.PhotoRequest> photos,
      LocalDateTime now) {
    if (basicInfoId == null || CollectionUtils.isEmpty(photos)) {
      return;
    }

    photos.stream()
        .filter(photo -> StringUtils.hasText(photo.getFileName()))
        .forEach(photo -> {
          PhotoMetadata metadata = new PhotoMetadata();
          metadata.setBasicInfoId(basicInfoId);
          metadata.setFileName(photo.getFileName());
          metadata.setFilePath(photo.getFilePath());
          metadata.setContentType(photo.getContentType());
          metadata.setFileSize(photo.getFileSize());
          metadata.setShotDatetime(toLocalDateTime(photo.getPhotoDate()));
          metadata.setDescription(photo.getDescription());
          metadata.setCreatedAt(now);
          regionMapper.insertPhotoMetadata(metadata);
        });
  }

  private String formatYearMonth(LocalDate date) {
    return date.format(ACTION_YEAR_MONTH_FORMATTER);
  }

  private LocalDateTime toLocalDateTime(LocalDate date) {
    return date == null ? null : date.atStartOfDay();
  }

  private BigDecimal normalizeDecimal(BigDecimal value) {
    return value == null ? null : value.stripTrailingZeros();
  }
}

