package com.toji.toji.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BasicInfo {

  private Long ilglPrvuInfoSeq; // ILGL_PRVU_INFO_SEQ
  private BigDecimal gpsLgtd; // GPS_LGTD (NOT NULL)
  private BigDecimal gpsLttd; // GPS_LTTD (NOT NULL)
  private String lndsUnqNo; // LNDS_UNQ_NO (NOT NULL)
  private String lndsLdnoAddr; // LNDS_LDNO_ADDR (NOT NULL)
  private String hdqrNm; // HDQR_NM (NOT NULL)
  private String mtnofNm; // MTNOF_NM (NOT NULL)
  private String routeCd; // ROUTE_CD (NOT NULL)
  private String drveDrctCd; // DRVE_DRCT_CD (NOT NULL)
  private BigDecimal routeDstnc; // ROUTE_DSTNC (NOT NULL)
  private String strcClssCd; // STRC_CLSS_CD (NOT NULL)
  private String ocrnDates; // OCRN_DATES (NOT NULL, VARCHAR2(8) - yyyyMMdd)
  private String prchEmno; // PRCH_EMNO (NOT NULL, 사원번호)
  private String trnrNm; // TRNR_NM
  private String rltrNm; // RLTR_NM
  private String trnrAddr; // TRNR_ADDR
  private String rltrAddr; // RLTR_ADDR
  private BigDecimal ilglPssrt; // ILGL_PSSRT
  private BigDecimal ilglPssnSqms; // ILGL_PSSN_SQMS
  private String ilglPrvuActnStatVal; // ILGL_PRVU_ACTN_STAT_VAL (NOT NULL)
  private String fsttmRgsrId; // FSTTM_RGSR_ID (NOT NULL)
  private LocalDateTime fsttmRgstDttm; // FSTTM_RGST_DTTM (NOT NULL)
  private String lsttmModfrId; // LSTTM_MODFR_ID (NOT NULL)
  private LocalDateTime lsttmAltrDttm; // LSTTM_ALTR_DTTM (NOT NULL)
  private String useYn; // USE_YN (NOT NULL)

}
