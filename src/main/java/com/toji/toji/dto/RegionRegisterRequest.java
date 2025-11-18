package com.toji.toji.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegionRegisterRequest {

  private String hdqrNm;
  private String mtnofNm;
  private String routeCd;
  private String drveDrctCd;
  private BigDecimal routeDstnc;
  private String strcClssCd;
  private String lndsLdnoAddr;
  private String ocrnDates;
  private String prchEmno;
  private String trnrNm;
  private String rltrNm;
  private String trnrAddr;
  private String rltrAddr;
  private BigDecimal ilglPssrt;
  private BigDecimal ilglPssnSqms;
  private String ilglPrvuActnStatVal;
  private String lndsUnqNo;
  private BigDecimal gpsLgtd;
  private BigDecimal gpsLttd;
  private List<ActionHistoryRequest> actionHistories = new ArrayList<>();

  @Getter
  @Setter
  public static class ActionHistoryRequest {
    private LocalDateTime actnDttm;
    private String actnCtnt;
  }
}
