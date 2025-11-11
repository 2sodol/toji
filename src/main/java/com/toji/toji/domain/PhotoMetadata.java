package com.toji.toji.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhotoMetadata {

  private Long id;
  private Long basicInfoId;
  private String fileName;
  private String filePath;
  private String contentType;
  private Long fileSize;
  private LocalDateTime shotDatetime;
  private String description;
  private LocalDateTime createdAt;
}
