package com.toji.toji.service;

import com.toji.toji.domain.ActionHistory;
import com.toji.toji.domain.Attachment;
import com.toji.toji.domain.BasicInfo;
import com.toji.toji.dto.RegionRegisterRequest;
import com.toji.toji.mapper.RegionMapper;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 지역 기본 정보와 이력을 등록하는 서비스 구현.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegionServiceImpl implements RegionService {

  private final RegionMapper regionMapper;
  private static final String UPLOAD_PATH = "src/main/resources/static/CDIGIT_CCTV01/attach/extension/illegalLands";

  /**
   * 지역 등록 요청을 받아 기본 정보 및 관련 이력을 저장한다.
   *
   * @param request 등록 요청 DTO
   * @return 생성된 기본 정보의 식별자
   */
  @Override
  @Transactional(rollbackFor = Exception.class)
  public Long registerRegion(RegionRegisterRequest request) {
    LocalDateTime now = LocalDateTime.now();
    String currentUserId = "SYSTEM"; // TODO: 실제 사용자 ID로 변경 필요

    BasicInfo basicInfo = buildBasicInfo(request, currentUserId, now);
    regionMapper.insertBasicInfo(basicInfo);

    insertActionHistories(basicInfo.getIlglPrvuInfoSeq(), request.getActionHistories(), currentUserId, now);

    // 첨부파일(이미지) 저장
    if (request.getFiles() != null && request.getFiles().getImages() != null) {
      log.info("첨부파일 저장 시작: basicInfoId={}, 이미지 개수={}", basicInfo.getIlglPrvuInfoSeq(),
          request.getFiles().getImages().size());
      insertAttachments(basicInfo.getIlglPrvuInfoSeq(), request.getFiles().getImages(), currentUserId, now);
    } else {
      log.warn("첨부파일 데이터가 없습니다. files={}", request.getFiles());
    }

    return basicInfo.getIlglPrvuInfoSeq();
  }

  /**
   * 등록 요청으로부터 기본 정보를 구성한다.
   *
   * @param request 등록 요청 DTO
   * @param userId  등록자 ID
   * @param now     현재 시각
   * @return 구성된 기본 정보 엔티티
   */
  private BasicInfo buildBasicInfo(RegionRegisterRequest request, String userId, LocalDateTime now) {
    BasicInfo basicInfo = new BasicInfo();
    basicInfo.setHdqrNm(request.getHdqrNm());
    basicInfo.setMtnofNm(request.getMtnofNm());
    basicInfo.setRouteCd(request.getRouteCd());
    basicInfo.setDrveDrctCd(request.getDrveDrctCd());
    basicInfo.setRouteDstnc(normalizeDecimal(request.getRouteDstnc()));
    basicInfo.setStrcClssCd(request.getStrcClssCd());
    basicInfo.setOcrnDates(request.getOcrnDates());
    basicInfo.setPrchEmno(request.getPrchEmno());
    basicInfo.setTrnrNm(request.getTrnrNm());
    basicInfo.setRltrNm(request.getRltrNm());
    basicInfo.setTrnrAddr(request.getTrnrAddr());
    basicInfo.setRltrAddr(request.getRltrAddr());
    basicInfo.setIlglPssrt(normalizeDecimal(request.getIlglPssrt()));
    basicInfo.setIlglPssnSqms(normalizeDecimal(request.getIlglPssnSqms()));
    basicInfo.setIlglPrvuActnStatVal(request.getIlglPrvuActnStatVal());
    basicInfo.setLndsUnqNo(request.getLndsUnqNo());
    basicInfo.setGpsLgtd(normalizeDecimal(request.getGpsLgtd()));
    basicInfo.setGpsLttd(normalizeDecimal(request.getGpsLttd()));
    basicInfo.setLndsLdnoAddr(request.getLndsLdnoAddr());
    basicInfo.setFsttmRgsrId(userId);
    basicInfo.setFsttmRgstDttm(now);
    basicInfo.setLsttmModfrId(userId);
    basicInfo.setLsttmAltrDttm(now);
    basicInfo.setUseYn("Y");
    return basicInfo;
  }

  /**
   * 유효한 조치 이력만 추려 기본 정보와 매핑하여 저장한다.
   *
   * @param basicInfoId 기본 정보 식별자
   * @param histories   조치 이력 요청 목록
   * @param userId      등록자 ID
   * @param now         생성 시각
   */
  private void insertActionHistories(Long basicInfoId, List<RegionRegisterRequest.ActionHistoryRequest> histories,
      String userId, LocalDateTime now) {
    if (basicInfoId == null || histories == null || histories.isEmpty()) {
      return;
    }

    for (RegionRegisterRequest.ActionHistoryRequest history : histories) {
      if (history.getActnDttm() != null && StringUtils.hasText(history.getActnCtnt())) {
        ActionHistory actionHistory = new ActionHistory();
        actionHistory.setIlglPrvuInfoSeq(basicInfoId);
        actionHistory.setActnDttm(history.getActnDttm());
        actionHistory.setActnCtnt(history.getActnCtnt());
        actionHistory.setFsttmRgsrId(userId);
        actionHistory.setFsttmRgstDttm(now);
        actionHistory.setLsttmModfrId(userId);
        actionHistory.setLsttmAltrDttm(now);
        actionHistory.setUseYn("Y");
        regionMapper.insertActionHistory(actionHistory);
      }
    }
  }

  /**
   * 첨부파일(이미지)을 NAS에 저장하고 메타데이터를 DB에 저장한다.
   *
   * @param basicInfoId 기본 정보 식별자 (FK)
   * @param images      이미지 파일 요청 목록
   * @param userId      등록자 ID
   * @param now         생성 시각
   */
  private void insertAttachments(Long basicInfoId, List<RegionRegisterRequest.FileRequest.ImageFileRequest> images,
      String userId, LocalDateTime now) {
    if (basicInfoId == null || images == null || images.isEmpty()) {
      log.warn("insertAttachments: 잘못된 파라미터. basicInfoId={}, images={}", basicInfoId, images);
      return;
    }

    log.info("insertAttachments 시작: basicInfoId={}, 이미지 개수={}", basicInfoId, images.size());

    // 파일 업로드 경로 디렉토리 생성 (프로젝트 루트 기준)
    String projectRoot = System.getProperty("user.dir");
    Path uploadPath = Paths.get(projectRoot, UPLOAD_PATH);
    try {
      if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
        log.info("파일 업로드 경로 생성: {}", uploadPath.toAbsolutePath());
      }
    } catch (IOException e) {
      log.error("파일 업로드 경로 생성 실패: {}", uploadPath.toAbsolutePath(), e);
      throw new RuntimeException("파일 저장 경로를 생성할 수 없습니다.", e);
    }

    for (RegionRegisterRequest.FileRequest.ImageFileRequest imageRequest : images) {
      if (imageRequest.getBase64() == null || imageRequest.getBase64().trim().isEmpty()) {
        continue;
      }

      try {
        // base64 디코딩
        String base64Data = imageRequest.getBase64();
        if (base64Data.contains(",")) {
          base64Data = base64Data.split(",")[1];
        }
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        // 파일명 생성 (기본정보 ID + 타임스탬프 + 확장자)
        String extension = StringUtils.hasText(imageRequest.getExtension()) ? imageRequest.getExtension() : "png";
        String filename = imageRequest.getFilename();
        if (!StringUtils.hasText(filename)) {
          filename = basicInfoId + "_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000) + "."
              + extension;
        }

        // 파일 저장 경로
        Path filePath = uploadPath.resolve(filename);

        // 파일 저장
        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
          fos.write(imageBytes);
        }

        // DB에 메타데이터 저장
        Attachment attachment = new Attachment();
        attachment.setIlglPrvuAddrSeq(basicInfoId);
        attachment.setAttflNm(filename);
        attachment.setAttflPath(UPLOAD_PATH);
        attachment.setAttflCpct((long) imageBytes.length);
        attachment.setOcrnDates(imageRequest.getOcrnDates());

        int result = regionMapper.insertAttachment(attachment);
        log.info("첨부파일 저장 완료: {} -> {}, DB insert 결과={}, ilglAttflSeq={}", filename, uploadPath.toAbsolutePath(), result,
            attachment.getIlglAttflSeq());

      } catch (Exception e) {
        log.error("첨부파일 저장 실패: filename={}, base64 길이={}, ocrnDates={}, 오류: {}",
            imageRequest != null ? imageRequest.getFilename() : "null",
            imageRequest != null && imageRequest.getBase64() != null ? imageRequest.getBase64().length() : 0,
            imageRequest != null ? imageRequest.getOcrnDates() : "null",
            e.getMessage(), e);
        // 파일 저장 실패 시 예외를 다시 throw하여 전체 롤백
        throw new RuntimeException("첨부파일 저장 중 오류 발생: " + e.getMessage(), e);
      }
    }
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

  /**
   * 페이징 처리된 불법점용 리스트를 조회한다.
   *
   * @param page 페이지 번호 (1부터 시작)
   * @param size 페이지 크기
   * @return 페이징 정보와 리스트를 포함한 맵
   */
  @Override
  public Map<String, Object> findAllWithPaging(int page, int size) {
    if (page < 1) {
      page = 1;
    }
    if (size < 1) {
      size = 5;
    }

    int offset = (page - 1) * size;
    List<BasicInfo> list = regionMapper.findAllWithPaging(offset, size);
    int totalCount = regionMapper.countAll();
    int totalPages = (int) Math.ceil((double) totalCount / size);

    // 각 항목에 데이터 존재 여부 추가
    List<Map<String, Object>> listWithHasData = new ArrayList<>();
    for (BasicInfo item : list) {
      Map<String, Object> itemMap = new HashMap<>();
      itemMap.put("ilglPrvuInfoSeq", item.getIlglPrvuInfoSeq());
      itemMap.put("lndsUnqNo", item.getLndsUnqNo());
      itemMap.put("lndsLdnoAddr", item.getLndsLdnoAddr());
      itemMap.put("gpsLgtd", item.getGpsLgtd());
      itemMap.put("gpsLttd", item.getGpsLttd());
      
      // 데이터 존재 여부 확인 (hasData)
      boolean hasData = regionMapper.hasDataByLndsUnqNo(item.getLndsUnqNo()) > 0;
      itemMap.put("hasData", hasData);
      
      listWithHasData.add(itemMap);
    }

    Map<String, Object> result = new HashMap<>();
    result.put("list", listWithHasData);
    result.put("totalCount", totalCount);
    result.put("totalPages", totalPages);
    result.put("currentPage", page);
    result.put("pageSize", size);

    return result;
  }

  @Override
  public Map<String, Object> findDatesByLndsUnqNoAndType(String lndsUnqNo, String type) {
    List<Map<String, Object>> dates;

    if ("detail".equals(type)) {
      dates = regionMapper.findDetailDatesByLndsUnqNo(lndsUnqNo);
    } else if ("photo".equals(type)) {
      dates = regionMapper.findPhotoDatesByLndsUnqNo(lndsUnqNo);
    } else {
      throw new IllegalArgumentException("Invalid type: " + type + ". Must be 'detail' or 'photo'");
    }

    Map<String, Object> result = new HashMap<>();
    result.put("lndsUnqNo", lndsUnqNo);
    result.put("type", type);
    result.put("dates", dates);

    return result;
  }

  @Override
  public Map<String, Object> findDetailByLndsUnqNoAndDate(String lndsUnqNo, String ocrnDates) {
    // Mapper에 메서드가 없으면 일단 빈 결과 반환하거나 예외 처리
    // TODO: Mapper에 findDetailByLndsUnqNoAndDate 메서드 추가 필요
    throw new UnsupportedOperationException("findDetailByLndsUnqNoAndDate는 아직 구현되지 않았습니다.");
  }

  @Override
  public Map<String, Object> findPhotosByLndsUnqNoAndDate(String lndsUnqNo, String ocrnDates) {
    // Mapper에 메서드가 없으면 일단 빈 결과 반환하거나 예외 처리
    // TODO: Mapper에 findPhotosByLndsUnqNoAndDate 메서드 추가 필요
    throw new UnsupportedOperationException("findPhotosByLndsUnqNoAndDate는 아직 구현되지 않았습니다.");
  }

  @Override
  public Map<String, Object> findDetailBySeq(Long ilglPrvuInfoSeq) {
    BasicInfo detail = regionMapper.findDetailBySeq(ilglPrvuInfoSeq);
    List<ActionHistory> actionHistories = regionMapper.findActionHistoriesByBasicInfoId(ilglPrvuInfoSeq);

    Map<String, Object> result = new HashMap<>();
    result.put("basicInfo", detail);
    result.put("actionHistories", actionHistories);

    return result;
  }

  @Override
  public Map<String, Object> findPhotosBySeq(Long ilglPrvuInfoSeq) {
    List<Attachment> photos = regionMapper.findPhotosBySeq(ilglPrvuInfoSeq);

    Map<String, Object> result = new HashMap<>();
    result.put("photos", photos);

    return result;
  }

  /**
   * 지역 정보를 수정한다.
   *
   * @param ilglPrvuInfoSeq 수정할 불법점용정보 SEQ
   * @param request 수정 요청 DTO
   * @return 수정된 기본 정보의 식별자
   */
  @Override
  @Transactional(rollbackFor = Exception.class)
  public Long updateRegion(Long ilglPrvuInfoSeq, RegionRegisterRequest request) {
    LocalDateTime now = LocalDateTime.now();
    String currentUserId = "SYSTEM"; // TODO: 실제 사용자 ID로 변경 필요

    // 기존 데이터 조회
    BasicInfo existingBasicInfo = regionMapper.findDetailBySeq(ilglPrvuInfoSeq);
    if (existingBasicInfo == null) {
      throw new IllegalArgumentException("수정할 데이터를 찾을 수 없습니다. ilglPrvuInfoSeq: " + ilglPrvuInfoSeq);
    }

    // 기본 정보 업데이트
    BasicInfo basicInfo = buildBasicInfoForUpdate(request, ilglPrvuInfoSeq, currentUserId, now);
    regionMapper.updateBasicInfo(basicInfo);

    // 기존 조치 이력 삭제 (USE_YN = 'N')
    regionMapper.deleteActionHistoriesByBasicInfoId(ilglPrvuInfoSeq);

    // 새로운 조치 이력 등록
    insertActionHistories(ilglPrvuInfoSeq, request.getActionHistories(), currentUserId, now);

    // 첨부파일(이미지) 추가 (기존 이미지는 유지, 새 이미지만 추가)
    if (request.getFiles() != null && request.getFiles().getImages() != null) {
      log.info("첨부파일 추가 시작: basicInfoId={}, 이미지 개수={}", ilglPrvuInfoSeq,
          request.getFiles().getImages().size());
      insertAttachments(ilglPrvuInfoSeq, request.getFiles().getImages(), currentUserId, now);
    }

    return ilglPrvuInfoSeq;
  }

  /**
   * 수정 요청으로부터 기본 정보를 구성한다.
   *
   * @param request 등록 요청 DTO
   * @param ilglPrvuInfoSeq 수정할 기본 정보 식별자
   * @param userId 수정자 ID
   * @param now 현재 시각
   * @return 구성된 기본 정보 엔티티
   */
  private BasicInfo buildBasicInfoForUpdate(RegionRegisterRequest request, Long ilglPrvuInfoSeq,
      String userId, LocalDateTime now) {
    BasicInfo basicInfo = new BasicInfo();
    basicInfo.setIlglPrvuInfoSeq(ilglPrvuInfoSeq);
    basicInfo.setHdqrNm(request.getHdqrNm());
    basicInfo.setMtnofNm(request.getMtnofNm());
    basicInfo.setRouteCd(request.getRouteCd());
    basicInfo.setDrveDrctCd(request.getDrveDrctCd());
    basicInfo.setRouteDstnc(normalizeDecimal(request.getRouteDstnc()));
    basicInfo.setStrcClssCd(request.getStrcClssCd());
    basicInfo.setOcrnDates(request.getOcrnDates());
    basicInfo.setPrchEmno(request.getPrchEmno());
    basicInfo.setTrnrNm(request.getTrnrNm());
    basicInfo.setRltrNm(request.getRltrNm());
    basicInfo.setTrnrAddr(request.getTrnrAddr());
    basicInfo.setRltrAddr(request.getRltrAddr());
    basicInfo.setIlglPssrt(normalizeDecimal(request.getIlglPssrt()));
    basicInfo.setIlglPssnSqms(normalizeDecimal(request.getIlglPssnSqms()));
    basicInfo.setIlglPrvuActnStatVal(request.getIlglPrvuActnStatVal());
    basicInfo.setLndsUnqNo(request.getLndsUnqNo());
    basicInfo.setGpsLgtd(normalizeDecimal(request.getGpsLgtd()));
    basicInfo.setGpsLttd(normalizeDecimal(request.getGpsLttd()));
    basicInfo.setLndsLdnoAddr(request.getLndsLdnoAddr());
    basicInfo.setLsttmModfrId(userId);
    basicInfo.setLsttmAltrDttm(now);
    return basicInfo;
  }
}
