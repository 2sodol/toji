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
public class ActionHistory {

  private Long id;
  private Long basicInfoId;
  private String actionYearMonth;
  private String description;
  private LocalDateTime createdAt;
}
