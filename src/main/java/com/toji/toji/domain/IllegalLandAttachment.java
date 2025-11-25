package com.toji.toji.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IllegalLandAttachment {
    private Long ilglAttflSeq;
    private Long ilglPrvuAddrSeq;
    private Long droneLyrSeq;
    private String attflNm;
    private String attflPath;
    private Long attflCpct;
    private String ocrnDates;
}
