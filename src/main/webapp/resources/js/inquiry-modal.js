(function (window, $) {
  /**
   * inquiry-modal.js
   * - 지역 불법 점유 조회 모달에서 사용하는 클라이언트 로직을 모두 포함한다.
   * - jQuery 기반의 이벤트 바인딩, 상태 관리, Ajax 요청 처리, 데이터 렌더링 등의 기능을 담당한다.
   */
  "use strict";

  if (!$) {
    return;
  }

  /**
   * 모듈 내부에서 공유되는 UI 상태 값.
   * currentLndsUnqNo: 현재 선택된 토지 고유번호
   * currentTab: 현재 활성화된 탭 ("detail" | "photo")
   * $modal: 모달 jQuery 객체
   */
  var state = {
    currentLndsUnqNo: null,
    currentTab: "detail",
    $modal: null,
  };

  /**
   * XSS 방지를 위한 HTML 이스케이프 유틸 함수.
   * @param {string} value - 이스케이프할 문자열
   * @returns {string} - HTML 특수 문자가 이스케이프된 문자열
   */
  function escapeHtml(value) {
    if (value === undefined || value === null) {
      return "";
    }
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * 날짜 포맷팅 (yyyyMMdd -> yyyy-MM-dd)
   * @param {string} dateStr - 포맷팅할 날짜 문자열
   * @returns {string} - 포맷팅된 날짜 문자열
   */
  function formatDate(dateStr) {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return dateStr.substring(0, 4) + "-" + dateStr.substring(4, 6) + "-" + dateStr.substring(6, 8);
  }

  /**
   * 날짜시간 포맷팅 (년월일만 표시)
   * @param {string} dateTimeStr - 포맷팅할 날짜시간 문자열
   * @returns {string} - 포맷팅된 날짜 문자열 (yyyy-MM-dd)
   */
  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return "";
    var date = new Date(dateTimeStr);
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }

  /**
   * 파일 크기 포맷팅
   * @param {number} bytes - 바이트 단위 파일 크기
   * @returns {string} - 포맷팅된 파일 크기 문자열
   */
  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * 주행방향 코드를 텍스트로 변환
   * @param {string} code - 주행방향 코드
   * @returns {string} - 변환된 텍스트
   */
  function formatDrveDrctCd(code) {
    if (!code) return "-";
    var codeUpper = String(code).toUpperCase();
    var mapping = {
      S: "상행",
      UP: "상행",
      E: "하행",
      DOWN: "하행",
      O: "양방향",
      BOTH: "양방향",
    };
    return mapping[codeUpper] || code;
  }

  /**
   * 구분 코드를 텍스트로 변환
   * @param {string} code - 구분 코드
   * @returns {string} - 변환된 텍스트
   */
  function formatStrcClssCd(code) {
    if (!code) return "-";
    var codeUpper = String(code).toUpperCase();
    var mapping = {
      GENERAL: "일반",
      BRIDGE: "교량",
    };
    return mapping[codeUpper] || code;
  }

  /**
   * 조치상태 코드를 텍스트로 변환
   * @param {string} code - 조치상태 코드
   * @returns {string} - 변환된 텍스트
   */
  function formatIlglPrvuActnStatVal(code) {
    if (!code) return "-";
    var codeUpper = String(code).toUpperCase();
    var mapping = {
      IN_PROGRESS: "조치중",
      COMPLETED: "조치완료",
    };
    return mapping[codeUpper] || code;
  }

  /**
   * 토스트 메시지를 표시한다.
   * @param {"success"|"danger"|"warning"|"info"} type - 알림 타입
   * @param {string} message - 사용자에게 보여줄 메시지
   */
  function showInquiryAlert(type, message) {
    // 토스트 컨테이너가 없으면 생성
    var $container = $("#inquiryToastContainer");
    if (!$container.length) {
      $container = $("<div>", {
        id: "inquiryToastContainer",
        class: "inquiry-toast-container",
      });
      $("body").append($container);
    }

    // 타입별 아이콘과 클래스 설정
    var iconClass = "";
    var toastClass = "inquiry-toast inquiry-toast--" + type;
    switch (type) {
      case "success":
        iconClass = "fas fa-check";
        break;
      case "danger":
        iconClass = "fas fa-times";
        break;
      case "warning":
        iconClass = "fas fa-exclamation";
        break;
      case "info":
      default:
        iconClass = "fas fa-info-circle";
        break;
    }

    // 토스트 요소 생성
    var $toast = $("<div>", {
      class: toastClass,
    });

    // 아이콘 래퍼 (원형 배경)
    var $iconWrapper = $("<div>", {
      class: "inquiry-toast__icon-wrapper",
    });

    var $icon = $("<i>", {
      class: iconClass,
    });

    $iconWrapper.append($icon);

    // 메시지 텍스트
    var $message = $("<span>", {
      class: "inquiry-toast__message",
      text: message,
    });

    // 닫기 버튼
    var $closeBtn = $("<button>", {
      type: "button",
      class: "inquiry-toast__close",
      "aria-label": "닫기",
    });
    var $closeIcon = $("<i>", {
      class: "fas fa-times",
    });
    $closeBtn.append($closeIcon);

    // 닫기 버튼 클릭 이벤트
    $closeBtn.on("click", function () {
      $toast.removeClass("inquiry-toast--show");
      setTimeout(function () {
        $toast.remove();
        if ($container.children().length === 0) {
          $container.remove();
        }
      }, 300);
    });

    $toast.append($iconWrapper).append($message).append($closeBtn);

    // 컨테이너에 추가
    $container.append($toast);

    // 애니메이션으로 표시
    setTimeout(function () {
      $toast.addClass("inquiry-toast--show");
    }, 10);

    // 3초 후 자동으로 제거
    setTimeout(function () {
      $toast.removeClass("inquiry-toast--show");
      setTimeout(function () {
        $toast.remove();
        // 컨테이너가 비어있으면 제거
        if ($container.children().length === 0) {
          $container.remove();
        }
      }, 300);
    }, 3000);
  }

  /**
   * 모달 열림 상태 확인
   * @returns {boolean} - 모달이 열려있으면 true
   */
  function isModalOpen() {
    return state.$modal && state.$modal.attr("aria-hidden") === "false";
  }

  /**
   * 모든 데이터 초기화
   */
  function clearAllData() {
    $("#detailDateList").empty();
    $("#photoDateList").empty();
    clearDetailForm();
    clearPhotoGallery();
  }

  /**
   * 상세정보 폼 초기화
   */
  function clearDetailForm() {
    $("#detailForm .illegal-inquiry-text").text("");
    $("#detailActionHistory").html('<div class="illegal-inquiry-action-empty">데이터가 없습니다.</div>');
  }

  /**
   * 사진 갤러리 초기화
   */
  function clearPhotoGallery() {
    var $container = $("#photoGrid");
    var $empty = $("#photoEmpty");

    $container
      .empty()
      .css({
        "min-height": "400px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      })
      .hide();

    $empty
      .css({
        "min-height": "400px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      })
      .show();

    $("#downloadAllBtn").prop("disabled", true);
  }

  /**
   * 모달 열기
   * @param {string} lndsUnqNo - 토지 고유번호
   */
  function openModal(lndsUnqNo) {
    if (!lndsUnqNo) {
      showInquiryAlert("warning", "토지 정보가 없습니다.");
      return;
    }

    state.currentLndsUnqNo = lndsUnqNo;
    state.currentTab = "detail";

    // 탭 초기화
    switchTab("detail");

    // 모달 표시
    state.$modal.attr("aria-hidden", "false");
    $("body").addClass("modal-open");

    // 데이터 로드
    loadDetailDates();
  }

  /**
   * 모달 닫기
   */
  function closeModal() {
    state.$modal.attr("aria-hidden", "true");
    $("body").removeClass("modal-open");

    // 데이터 초기화
    state.currentLndsUnqNo = null;
    clearAllData();
  }

  /**
   * 탭 전환
   * @param {string} tabType - 탭 타입 ("detail" | "photo")
   */
  function switchTab(tabType) {
    state.currentTab = tabType;

    // 탭 버튼 활성화
    state.$modal.find(".illegal-inquiry-tab").removeClass("illegal-inquiry-tab--active");
    state.$modal.find('.illegal-inquiry-tab[data-tab="' + tabType + '"]').addClass("illegal-inquiry-tab--active");

    // 탭 콘텐츠 표시
    state.$modal.find(".illegal-inquiry-tab-content").removeClass("illegal-inquiry-tab-content--active");
    state.$modal.find("#" + tabType + "TabContent").addClass("illegal-inquiry-tab-content--active");

    // 해당 탭 데이터 로드
    if (tabType === "detail") {
      loadDetailDates();
    } else if (tabType === "photo") {
      loadPhotoDates();
    }
  }

  /**
   * 상세정보 탭의 등록일 리스트 로드
   */
  function loadDetailDates() {
    if (!state.currentLndsUnqNo) {
      return;
    }

    $.ajax({
      url: "/regions/dates",
      method: "GET",
      data: {
        lndsUnqNo: state.currentLndsUnqNo,
        type: "detail",
      },
      dataType: "json",
    })
      .done(function (response) {
        if (response.success && response.data) {
          renderDetailDates(response.data.dates);
        } else {
          showInquiryAlert("warning", "상세정보를 불러올 수 없습니다.");
          renderDetailDates([]);
        }
      })
      .fail(function (xhr, status, error) {
        showInquiryAlert("danger", "서버 오류가 발생했습니다.");
        renderDetailDates([]);
      });
  }

  /**
   * 사진 탭의 등록일 리스트 로드
   */
  function loadPhotoDates() {
    if (!state.currentLndsUnqNo) return;

    $.ajax({
      url: "/regions/dates",
      method: "GET",
      data: {
        lndsUnqNo: state.currentLndsUnqNo,
        type: "photo",
      },
      dataType: "json",
    })
      .done(function (response) {
        if (response.success && response.data) {
          renderPhotoDates(response.data.dates);
        } else {
          showInquiryAlert("warning", "사진 정보를 불러올 수 없습니다.");
          renderPhotoDates([]);
        }
      })
      .fail(function (xhr, status, error) {
        showInquiryAlert("danger", "서버 오류가 발생했습니다.");
        renderPhotoDates([]);
      });
  }

  /**
   * 상세정보 날짜 리스트 렌더링
   * @param {Array} dates - 날짜 정보 배열
   */
  function renderDetailDates(dates) {
    var $container = $("#detailDateList");
    $container.empty();

    if (!dates || dates.length === 0) {
      $container.html('<div class="illegal-inquiry-action-empty">등록된 상세정보가 없습니다.</div>');
      clearDetailForm();
      return;
    }

    dates.forEach(function (dateInfo, index) {
      // dateInfo는 {OCRNDATES: '20251118', PRCHEMNO: '이말자', ILGLPRVUINFOSEQ: 15} 형태 (대문자)
      var dateStr = dateInfo.OCRNDATES;
      var managerName = dateInfo.PRCHEMNO;
      var seq = dateInfo.ILGLPRVUINFOSEQ;

      var formattedDate = formatDate(dateStr);
      var displayText = formattedDate + " (" + escapeHtml(managerName) + ")";

      var $item = $("<button>", {
        type: "button",
        class: "illegal-inquiry-date-item" + (index === 0 ? " illegal-inquiry-date-item--active" : ""),
        "data-seq": seq,
        "data-date": dateStr,
        html: displayText,
      });

      $container.append($item);
    });

    // 첫 번째 날짜 자동 선택
    if (dates.length > 0) {
      selectDetailDate(dates[0]);
    }
  }

  /**
   * 사진 날짜 리스트 렌더링
   * @param {Array} dates - 날짜 정보 배열
   */
  function renderPhotoDates(dates) {
    var $container = $("#photoDateList");
    $container.empty();

    if (!dates || dates.length === 0) {
      $container.html('<div class="illegal-inquiry-action-empty">등록된 사진이 없습니다.</div>');
      clearPhotoGallery();
      return;
    }

    dates.forEach(function (dateInfo, index) {
      // dateInfo는 이제 {ocrnDates: '20241118', prchEmno: '이름', ilglPrvuInfoSeq: 123} 형태
      var dateStr = dateInfo.ocrnDates;
      var managerName = dateInfo.prchEmno;
      var seq = dateInfo.ilglPrvuInfoSeq;

      var formattedDate = formatDate(dateStr);
      var displayText = formattedDate + " (" + escapeHtml(managerName) + ")";

      var $item = $("<button>", {
        type: "button",
        class: "illegal-inquiry-date-item" + (index === 0 ? " illegal-inquiry-date-item--active" : ""),
        "data-seq": seq,
        "data-date": dateStr,
        html: displayText,
      });

      $container.append($item);
    });

    // 첫 번째 날짜 자동 선택
    if (dates.length > 0) {
      selectPhotoDate(dates[0]);
    }
  }

  /**
   * 상세정보 날짜 선택
   * @param {string|Object} date - 날짜 문자열 또는 날짜 정보 객체
   */
  function selectDetailDate(date) {
    var dateStr = typeof date === "string" ? date : date.OCRNDATES;
    var seq = typeof date === "object" ? date.ILGLPRVUINFOSEQ : null;

    // 날짜 버튼 활성화
    $("#detailDateList .illegal-inquiry-date-item").removeClass("illegal-inquiry-date-item--active");
    var $activeButton = $("#detailDateList .illegal-inquiry-date-item[data-date='" + dateStr + "']");
    $activeButton.addClass("illegal-inquiry-date-item--active");

    // seq 값을 버튼에서 가져오기 (객체로 전달되지 않은 경우)
    if (!seq) {
      seq = $activeButton.data("seq");
    }

    if (!seq) {
      showInquiryAlert("warning", "상세정보를 조회할 수 없습니다.");
      return;
    }

    // 상세정보 로드
    $.ajax({
      url: "/regions/details",
      method: "GET",
      data: {
        ilglPrvuInfoSeq: seq,
      },
      dataType: "json",
    })
      .done(function (response) {
        if (response.success && response.data) {
          renderDetailForm(response.data);
        } else {
          showInquiryAlert("warning", "상세정보를 불러올 수 없습니다.");
          clearDetailForm();
        }
      })
      .fail(function (xhr, status, error) {
        showInquiryAlert("danger", "서버 오류가 발생했습니다.");
        clearDetailForm();
      });
  }

  /**
   * 사진 날짜 선택
   * @param {string|Object} date - 날짜 문자열 또는 날짜 정보 객체
   */
  function selectPhotoDate(date) {
    var dateStr = typeof date === "string" ? date : date.ocrnDates;
    var seq = typeof date === "object" ? date.ilglPrvuInfoSeq : null;

    // 날짜 버튼 활성화
    $("#photoDateList .illegal-inquiry-date-item").removeClass("illegal-inquiry-date-item--active");
    var $activeButton = $("#photoDateList .illegal-inquiry-date-item[data-date='" + dateStr + "']");
    $activeButton.addClass("illegal-inquiry-date-item--active");

    // seq 값을 버튼에서 가져오기 (객체로 전달되지 않은 경우)
    if (!seq) {
      seq = $activeButton.data("seq");
    }

    if (!seq) {
      showInquiryAlert("warning", "사진을 조회할 수 없습니다.");
      return;
    }

    // 사진 리스트 로드
    $.ajax({
      url: "/regions/photos",
      method: "GET",
      data: {
        ilglPrvuInfoSeq: seq,
      },
      dataType: "json",
    })
      .done(function (response) {
        if (response.success && response.data) {
          renderPhotoGallery(response.data.photos);
        } else {
          showInquiryAlert("warning", "사진을 불러올 수 없습니다.");
          clearPhotoGallery();
        }
      })
      .fail(function (xhr, status, error) {
        showInquiryAlert("danger", "서버 오류가 발생했습니다.");
        clearPhotoGallery();
      });
  }

  /**
   * 상세정보 폼 렌더링
   * @param {Object} data - 상세정보 데이터
   */
  function renderDetailForm(data) {
    var basicInfo = data.basicInfo;
    var actionHistories = data.actionHistories || [];

    if (!basicInfo) {
      clearDetailForm();
      return;
    }

    // 기본정보 필드 채우기
    $("#detail_hdqrNm").text(basicInfo.hdqrNm || "-");
    $("#detail_mtnofNm").text(basicInfo.mtnofNm || "-");
    $("#detail_routeCd").text(basicInfo.routeCd || "-");
    $("#detail_drveDrctCd").text(formatDrveDrctCd(basicInfo.drveDrctCd));
    $("#detail_routeDstnc").text(basicInfo.routeDstnc || "-");
    $("#detail_strcClssCd").text(formatStrcClssCd(basicInfo.strcClssCd));
    $("#detail_lndsLdnoAddr").text(basicInfo.lndsLdnoAddr || "-");
    var formattedDate = formatDate(basicInfo.ocrnDates);
    $("#detail_ocrnDates").text(formattedDate || "-");
    $("#detail_prchEmno").text(basicInfo.prchEmno || "-");
    $("#detail_trnrNm").text(basicInfo.trnrNm || "-");
    $("#detail_rltrNm").text(basicInfo.rltrNm || "-");
    $("#detail_trnrAddr").text(basicInfo.trnrAddr || "-");
    $("#detail_rltrAddr").text(basicInfo.rltrAddr || "-");
    $("#detail_ilglPssrt").text(basicInfo.ilglPssrt || "-");
    $("#detail_ilglPssnSqms").text(basicInfo.ilglPssnSqms || "-");
    $("#detail_ilglPrvuActnStatVal").text(formatIlglPrvuActnStatVal(basicInfo.ilglPrvuActnStatVal));

    // 조치이력 렌더링
    renderActionHistories(actionHistories);
  }

  /**
   * 조치이력 렌더링
   * @param {Array} actionHistories - 조치이력 배열
   */
  function renderActionHistories(actionHistories) {
    var $container = $("#detailActionHistory");
    $container.empty();

    if (!actionHistories || actionHistories.length === 0) {
      $container.html('<div class="illegal-inquiry-action-empty">등록된 조치이력이 없습니다.</div>');
      return;
    }

    actionHistories.forEach(function (history) {
      var formattedDate = formatDateTime(history.actnDttm);
      var $item = $("<div>", {
        class: "illegal-inquiry-action-item",
      });

      var $dateDiv = $("<div>", {
        class: "illegal-inquiry-action-date",
        text: formattedDate,
      });

      var $contentDiv = $("<div>", {
        class: "illegal-inquiry-action-content",
        text: history.actnCtnt || "",
      });

      $item.append($dateDiv).append($contentDiv);
      $container.append($item);
    });
  }

  /**
   * 사진 갤러리 렌더링
   * @param {Array} photos - 사진 배열
   */
  function renderPhotoGallery(photos) {
    var $container = $("#photoGrid");
    var $empty = $("#photoEmpty");

    $container.empty();

    if (!photos || photos.length === 0) {
      // 빈 상태에서도 최소 높이를 유지하도록 설정
      $container
        .css({
          "min-height": "400px",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
        })
        .hide();
      $empty
        .css({
          "min-height": "400px",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
        })
        .show();
      $("#downloadAllBtn").prop("disabled", true);
      return;
    }

    // 사진이 있을 때도 최소 높이 유지
    $container.css({
      "min-height": "400px",
      display: "grid",
    });
    $empty.hide();
    $container.show();
    $("#downloadAllBtn").prop("disabled", false);

    photos.forEach(function (photo) {
      var $item = $("<div>", {
        class: "illegal-inquiry-photo-item",
        "data-path": photo.attflPath || "",
        "data-name": photo.attflNm || "",
      });

      var $imageDiv = $("<div>", {
        class: "illegal-inquiry-photo-image",
        text: "이미지 A",
      });

      var $infoDiv = $("<div>", {
        class: "illegal-inquiry-photo-info",
      });

      var $nameDiv = $("<div>", {
        class: "illegal-inquiry-photo-name",
        text: photo.attflNm || "이름 없음",
      });

      var $sizeDiv = $("<div>", {
        class: "illegal-inquiry-photo-size",
        text: formatFileSize(photo.attflCpct),
      });

      $infoDiv.append($nameDiv).append($sizeDiv);
      $item.append($imageDiv).append($infoDiv);
      $container.append($item);
    });
  }

  /**
   * 사진 모달 표시 (확대 보기)
   * @param {string} imagePath - 이미지 경로
   * @param {string} imageName - 이미지 이름
   */
  function showPhotoModal(imagePath, imageName) {
    // 여기서 사진 확대 모달을 구현할 수 있습니다
    showInquiryAlert("info", "사진 확대 기능: " + imageName);
  }

  /**
   * 전체 사진 다운로드
   */
  function downloadAllPhotos() {
    // 여기서 전체 사진 다운로드 기능을 구현할 수 있습니다
    showInquiryAlert("info", "전체 사진 다운로드 기능은 추후 구현 예정입니다.");
  }

  /**
   * 모달 관련 이벤트를 바인딩한다.
   */
  function bindModalEvents() {
    // 모달 닫기 이벤트
    state.$modal.on("click", "[data-inquiry-modal-close]", function () {
      closeModal();
    });

    // 모달 외부 클릭 시 닫기
    state.$modal.on("click", function (e) {
      if (e.target === state.$modal[0]) {
        closeModal();
      }
    });

    // ESC 키로 닫기
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && isModalOpen()) {
        closeModal();
      }
    });
  }

  /**
   * 탭 관련 이벤트를 바인딩한다.
   */
  function bindTabEvents() {
    // 탭 전환 이벤트
    state.$modal.on("click", ".illegal-inquiry-tab", function () {
      var tabType = $(this).data("tab");
      switchTab(tabType);
    });
  }

  /**
   * 날짜 선택 관련 이벤트를 바인딩한다.
   */
  function bindDateEvents() {
    // 날짜 선택 이벤트 (상세정보 탭)
    state.$modal.on("click", "#detailDateList .illegal-inquiry-date-item", function () {
      var $button = $(this);
      var dateStr = $button.data("date");
      var seq = $button.data("seq");

      // 객체 형태로 전달
      selectDetailDate({
        OCRNDATES: dateStr,
        ILGLPRVUINFOSEQ: seq,
      });
    });

    // 날짜 선택 이벤트 (사진 탭)
    state.$modal.on("click", "#photoDateList .illegal-inquiry-date-item", function () {
      var $button = $(this);
      var dateStr = $button.data("date");
      var seq = $button.data("seq");

      // 객체 형태로 전달
      selectPhotoDate({
        ocrnDates: dateStr,
        ilglPrvuInfoSeq: seq,
      });
    });
  }

  /**
   * 사진 관련 이벤트를 바인딩한다.
   */
  function bindPhotoEvents() {
    // 사진 클릭 이벤트 (확대 보기)
    state.$modal.on("click", ".illegal-inquiry-photo-item", function () {
      var imagePath = $(this).data("path");
      var imageName = $(this).data("name");
      showPhotoModal(imagePath, imageName);
    });

    // 전체 다운로드 버튼
    state.$modal.on("click", "#downloadAllBtn", function () {
      downloadAllPhotos();
    });
  }

  /**
   * 모든 이벤트를 바인딩한다.
   */
  function bindEvents() {
    bindModalEvents();
    bindTabEvents();
    bindDateEvents();
    bindPhotoEvents();
  }

  /**
   * 모듈 초기화 함수.
   * - 모달 요소 초기화 및 이벤트 바인딩
   */
  function initialize() {
    state.$modal = $("#illegalInquiryModal");

    if (!state.$modal.length) {
      return;
    }

    bindEvents();
    clearAllData();
  }

  // DOM 준비 완료 시 초기화
  $(initialize);

  /**
   * 외부에서 접근 가능한 공개 메서드 모음.
   */
  window.InquiryModule = {
    open: openModal,
    close: closeModal,
    isOpen: isModalOpen,
  };

  // 하위 호환성을 위한 전역 객체 (기존 코드와의 호환성 유지)
  window.IllegalInquiryModal = {
    open: openModal,
    close: closeModal,
    isOpen: isModalOpen,
  };

  // 전역 변수로도 접근 가능하도록 설정
  window.illegalInquiryModal = window.IllegalInquiryModal;
})(window, window.jQuery);
