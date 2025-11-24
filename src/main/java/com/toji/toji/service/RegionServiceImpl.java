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
        attachment.setUseYn("Y");

        int result = regionMapper.insertAttachment(attachment);
        log.info("첨부파일 저장 완료: {} -> {}, DB insert 결과={}, ilglAttflSeq={}", filename, uploadPath.toAbsolutePath(),
            result,
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
   * Map에서 대소문자 구분 없이 값을 가져온다.
   * Oracle은 컬럼명을 대문자로 반환할 수 있으므로 이를 처리한다.
   *
   * @param map 값을 가져올 Map
   * @param key 찾을 키 (대소문자 무관)
   * @return 찾은 값, 없으면 null
   */
  private Object getValueIgnoreCase(Map<String, Object> map, String key) {
    if (map == null || key == null) {
      return null;
    }
    // 정확한 키로 먼저 시도
    if (map.containsKey(key)) {
      return map.get(key);
    }
    // 대소문자 구분 없이 찾기
    for (Map.Entry<String, Object> entry : map.entrySet()) {
      if (key.equalsIgnoreCase(entry.getKey())) {
        return entry.getValue();
      }
    }
    return null;
  }

  /**
   * Attachment 객체를 웹 접근 가능한 이미지 경로로 변환한다.
   * 
   * @deprecated 현재는 쿼리에서 직접 웹 경로 형태로 조회하므로 사용되지 않음.
   *             향후 다른 용도로 필요할 수 있어 유지함.
   *
   * @param attachment 첨부파일 객체
   * @return 웹 접근 가능한 이미지 경로, 변환 불가능하면 null
   */
  @Deprecated
  private String convertToWebImagePath(Attachment attachment) {
    if (attachment == null || attachment.getAttflPath() == null || attachment.getAttflNm() == null) {
      return null;
    }

    String attflPath = attachment.getAttflPath();
    String attflNm = attachment.getAttflNm();

    // 웹 접근 가능한 경로로 변환
    // attflPath:
    // "src/main/resources/static/CDIGIT_CCTV01/attach/extension/illegalLands"
    // 변환 후: "/CDIGIT_CCTV01/attach/extension/illegalLands/파일명"
    String imagePath = attflPath.replace("src/main/resources/static", "").replace("\\", "/");
    imagePath = imagePath.replaceAll("^/+", "").replaceAll("/+$", "");
    return imagePath.isEmpty() ? "/" + attflNm : "/" + imagePath + "/" + attflNm;
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
    int totalCount = regionMapper.countAll();
    int totalPages = (int) Math.ceil((double) totalCount / size);

    // 최적화된 쿼리 사용: N+1 문제 해결 (hasData, imagePath 포함)
    List<Map<String, Object>> list = regionMapper.findAllWithPagingOptimized(offset, size);

    // 결과 데이터 변환 (쿼리에서 이미 조회된 데이터를 메모리에서 변환)
    List<Map<String, Object>> listWithData = new ArrayList<>();
    for (Map<String, Object> item : list) {
      Map<String, Object> itemMap = new HashMap<>();

      // 기본 정보 매핑 (대소문자 구분 없이 키 찾기)
      itemMap.put("ilglPrvuInfoSeq", getValueIgnoreCase(item, "ilglPrvuInfoSeq"));
      itemMap.put("lndsUnqNo", getValueIgnoreCase(item, "lndsUnqNo"));
      itemMap.put("lndsLdnoAddr", getValueIgnoreCase(item, "lndsLdnoAddr"));
      itemMap.put("gpsLgtd", getValueIgnoreCase(item, "gpsLgtd"));
      itemMap.put("gpsLttd", getValueIgnoreCase(item, "gpsLttd"));

      // hasData: 쿼리에서 이미 계산됨 (1 또는 0)
      Object hasDataObj = getValueIgnoreCase(item, "hasData");
      boolean hasData = hasDataObj != null
          && (hasDataObj instanceof Number ? ((Number) hasDataObj).intValue() > 0 : Boolean.TRUE.equals(hasDataObj));
      itemMap.put("hasData", hasData);

      // imagePath: 쿼리에서 이미 웹 경로 형태로 조회됨, 경로 정리
      String imagePath = (String) getValueIgnoreCase(item, "imagePath");
      if (imagePath != null && !imagePath.trim().isEmpty()) {
        imagePath = imagePath.replaceAll("^/+", "").replaceAll("/+$", "");
        imagePath = imagePath.isEmpty() ? null : "/" + imagePath;
      }
      itemMap.put("imagePath", imagePath);

      listWithData.add(itemMap);
    }

    Map<String, Object> result = new HashMap<>();
    result.put("list", listWithData);
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

    // 웹 경로 설정
    for (Attachment photo : photos) {
      String webPath = convertToWebImagePath(photo);
      photo.setWebPath(webPath);
    }

    Map<String, Object> result = new HashMap<>();
    result.put("photos", photos);

    return result;
  }

  /**
   * 지역 정보를 수정한다.
   *
   * @param ilglPrvuInfoSeq 수정할 불법점용정보 SEQ
   * @param request         수정 요청 DTO
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

    // 첨부파일(이미지) 삭제
    if (request.getDeletedFileIds() != null && !request.getDeletedFileIds().isEmpty()) {
      log.info("첨부파일 삭제 시작: basicInfoId={}, 삭제할 파일 ID 목록={}", ilglPrvuInfoSeq, request.getDeletedFileIds());
      for (Long fileId : request.getDeletedFileIds()) {
        // 실제 파일은 삭제하지 않고 DB에서만 USE_YN = 'N' 처리 (Soft Delete)
        regionMapper.deleteAttachment(fileId);
      }
    }

    return ilglPrvuInfoSeq;
  }

  /**
   * 수정 요청으로부터 기본 정보를 구성한다.
   *
   * @param request         등록 요청 DTO
   * @param ilglPrvuInfoSeq 수정할 기본 정보 식별자
   * @param userId          수정자 ID
   * @param now             현재 시각
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

  /**
   * 지역 정보를 삭제한다. (논리적 삭제)
   *
   * @param ilglPrvuInfoSeq 삭제할 불법점용정보 SEQ
   */
  @Override
  @Transactional(rollbackFor = Exception.class)
  public void deleteRegion(Long ilglPrvuInfoSeq) {
    LocalDateTime now = LocalDateTime.now();
    String currentUserId = "SYSTEM"; // TODO: 실제 사용자 ID로 변경 필요

    // 기본 정보 삭제 (USE_YN = 'N')
    BasicInfo basicInfo = new BasicInfo();
    basicInfo.setIlglPrvuInfoSeq(ilglPrvuInfoSeq);
    basicInfo.setLsttmModfrId(currentUserId);
    basicInfo.setLsttmAltrDttm(now);

    int updatedCount = regionMapper.deleteBasicInfo(basicInfo);
    if (updatedCount == 0) {
      throw new IllegalArgumentException("삭제할 데이터를 찾을 수 없습니다. ilglPrvuInfoSeq: " + ilglPrvuInfoSeq);
    }

    // 조치 이력 삭제 (USE_YN = 'N')
    regionMapper.deleteActionHistoriesByBasicInfoId(ilglPrvuInfoSeq);

    // 첨부파일 삭제 (USE_YN = 'N')
    regionMapper.deleteAttachmentsByBasicInfoId(ilglPrvuInfoSeq);

    log.info("지역 정보 삭제 완료: ilglPrvuInfoSeq={}", ilglPrvuInfoSeq);
  }

  @Override
  public Attachment findAttachmentBySeq(Long ilglAttflSeq) {
    return regionMapper.findAttachmentBySeq(ilglAttflSeq);
  }
}
