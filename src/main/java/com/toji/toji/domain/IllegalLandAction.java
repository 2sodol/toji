package com.toji.toji.domain;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IllegalLandAction {
    private Long ilglActnCtntSeq;
    private Long ilglPrvuInfoSeq;
    private LocalDateTime actnDttm;
    private String actnCtnt;
    private String actnTypeCd;
    private String fsttmRgsrId;
    private LocalDateTime fsttmRgstDttm;
    private String lsttmModfrId;
    private LocalDateTime lsttmAltrDttm;
    private String useYn;
}
