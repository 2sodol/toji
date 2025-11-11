package com.toji.toji.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BasicInfo {

  private Long id;
  private String hqName;
  private String branchName;
  private String routeName;
  private String drivingDirection;
  private String milestone;
  private String category;
  private LocalDate occurrenceDate;
  private String managerName;
  private String actorName;
  private String relatedPerson;
  private String actorAddress;
  private String relatedAddress;
  private BigDecimal occupancyRate;
  private BigDecimal occupancyArea;
  private String actionStatus;
  private String pnu;
  private BigDecimal latitude;
  private BigDecimal longitude;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

}
