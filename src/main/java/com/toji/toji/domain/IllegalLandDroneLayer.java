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
public class IllegalLandDroneLayer {
    private Long droneLyrSeq;
    private Long ilglPrvuInfoSeq;
    private String shootYmd;
    private String lyrNm;
    private String lyrRootPath;
    private String lyrExtentVal;
    private Integer minZoomLvl;
    private Integer maxZoomLvl;
    private String fsttmRgsrId;
    private LocalDateTime fsttmRgstDttm;
    private String useYn;
}
