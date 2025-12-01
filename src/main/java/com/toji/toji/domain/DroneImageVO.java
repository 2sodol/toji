package com.toji.toji.domain;

import java.util.Date;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DroneImageVO {
    private Long imgId;
    private String remoteUrl;
    private String fileName;
    private String storePath;
    private Long fileSize;
    private Double latitude;
    private Double longitude;
    private String addrFull;
    private String addrGroup;
    private Date collectTime;
    private Date regDate;
}
