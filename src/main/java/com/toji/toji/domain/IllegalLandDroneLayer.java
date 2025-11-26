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
    private Double extentMinX;
    private Double extentMinY;
    private Double extentMaxX;
    private Double extentMaxY;
    private Integer minZoomLvl;
    private Integer maxZoomLvl;
    private String fsttmRgsrId;
    private LocalDateTime fsttmRgstDttm;
    private String useYn;
}
