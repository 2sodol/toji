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

/**
 * 지역 기본 정보와 이력, 사진 메타데이터를 등록하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class RegionService {

  private static final DateTimeFormatter ACTION_YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");

  private final RegionMapper regionMapper;

  /**
   * 지역 등록 요청을 받아 기본 정보 및 관련 이력, 사진 메타데이터를 저장한다.
   *
   * @param request 등록 요청 DTO
   * @return 생성된 기본 정보의 식별자
   */
  @Transactional
  public Long registerRegion(RegionRegisterRequest request) {
    LocalDateTime now = LocalDateTime.now();

    BasicInfo basicInfo = buildBasicInfo(request, now);
    regionMapper.insertBasicInfo(basicInfo);

    insertActionHistories(basicInfo.getId(), request.getActionHistories(), now);
    insertPhotoMetadata(basicInfo.getId(), request.getPhotos(), now);

    return basicInfo.getId();
  }

  /**
   * 등록 요청으로부터 기본 정보를 구성한다.
   *
   * @param request 등록 요청 DTO
   * @param now     생성/수정 시각
   * @return 구성된 기본 정보 엔티티
   */
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

  /**
   * 유효한 조치 이력만 추려 기본 정보와 매핑하여 저장한다.
   *
   * @param basicInfoId 기본 정보 식별자
   * @param histories   조치 이력 요청 목록
   * @param now         생성 시각
   */
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

  /**
   * 유효한 사진 메타데이터만 추려 기본 정보와 매핑하여 저장한다.
   *
   * @param basicInfoId 기본 정보 식별자
   * @param photos      사진 요청 목록
   * @param now         생성 시각
   */
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

  /**
   * 조치 일자를 연월(yyyyMM) 포맷으로 변환한다.
   *
   * @param date 조치 일자
   * @return yyyyMM 문자열
   */
  private String formatYearMonth(LocalDate date) {
    return date.format(ACTION_YEAR_MONTH_FORMATTER);
  }

  /**
   * {@link LocalDate}를 자정 시각의 {@link LocalDateTime}으로 변환한다.
   *
   * @param date 변환할 날짜
   * @return 변환된 날짜-시각, 입력이 null이면 null
   */
  private LocalDateTime toLocalDateTime(LocalDate date) {
    return date == null ? null : date.atStartOfDay();
  }

  /**
   * 소수의 불필요한 0을 제거해 정규화한다.
   *
   * @param value 정규화 대상 값
   * @return 정규화된 값, 입력이 null이면 null
   */
  private BigDecimal normalizeDecimal(BigDecimal value) {
    return value == null ? null : value.stripTrailingZeros();
  }
}
