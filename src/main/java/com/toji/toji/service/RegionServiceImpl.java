package com.toji.toji.service;

import com.toji.toji.domain.ActionHistory;
import com.toji.toji.domain.BasicInfo;
import com.toji.toji.dto.RegionRegisterRequest;
import com.toji.toji.mapper.RegionMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 지역 기본 정보와 이력을 등록하는 서비스 구현.
 */
@Service
@RequiredArgsConstructor
public class RegionServiceImpl implements RegionService {

  private final RegionMapper regionMapper;

  /**
   * 지역 등록 요청을 받아 기본 정보 및 관련 이력을 저장한다.
   *
   * @param request 등록 요청 DTO
   * @return 생성된 기본 정보의 식별자
   */
  @Override
  @Transactional
  public Long registerRegion(RegionRegisterRequest request) {
    LocalDateTime now = LocalDateTime.now();
    String currentUserId = "SYSTEM"; // TODO: 실제 사용자 ID로 변경 필요

    BasicInfo basicInfo = buildBasicInfo(request, currentUserId, now);
    regionMapper.insertBasicInfo(basicInfo);

    insertActionHistories(basicInfo.getIlglPrvuInfoSeq(), request.getActionHistories(), currentUserId, now);

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

    Map<String, Object> result = new HashMap<>();
    result.put("list", list);
    result.put("totalCount", totalCount);
    result.put("totalPages", totalPages);
    result.put("currentPage", page);
    result.put("pageSize", size);

    return result;
  }
}
