package com.toji.toji.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IllegalLandInfo {
    private Long ilglPrvuInfoSeq;
    private BigDecimal gpsLgtd;
    private BigDecimal gpsLttd;
    private String lndsUnqNo;
    private String lndsLdnoAddr;
    private String hdqrNm;
    private String mtnofNm;
    private String routeCd;
    private String drveDrctCd;
    private BigDecimal routeDstnc;
    private String strcClssCd;
    private String ocrnDates;
    private String prchEmno;
    private String trnrNm;
    private String rltrNm;
    private String trnrAddr;
    private String rltrAddr;
    private BigDecimal ilglPssrt;
    private BigDecimal ilglPssnSqms;
    private String ilglPrvuActnStatVal;
    private String fsttmRgsrId;
    private LocalDateTime fsttmRgstDttm;
    private String lsttmModfrId;
    private LocalDateTime lsttmAltrDttm;
    private String useYn;
}
