package com.toji.toji.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegionRegisterRequest {

  private String headOffice;

  private String branchOffice;

  private String routeName;

  private String drivingDirection;

  private String distanceMark;

  private String category;

  private String detailAddress;

  private LocalDate incidentDate;

  private String managerName;

  private String actorName;

  private String relatedPersonName;

  private String actorAddress;

  private String relatedAddress;

  private BigDecimal occupancyRate;

  private BigDecimal occupancyArea;

  private String actionStatus;

  private LocalDate photoRegisteredAt;

  private String memo;

  private List<ActionHistoryRequest> actionHistories = new ArrayList<>();

  private List<PhotoRequest> photos = new ArrayList<>();

  @Getter
  @Setter
  public static class ActionHistoryRequest {

    private LocalDate actionDate;

    private String description;
  }

  @Getter
  @Setter
  public static class PhotoRequest {

    private LocalDate photoDate;

    private String fileName;

    private String filePath;

    private String contentType;

    private Long fileSize;

    private String description;
  }
}
