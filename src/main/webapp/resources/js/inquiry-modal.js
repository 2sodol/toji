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
   * $modal: 모달 jQuery 객체
   */
  var state = {
    currentLndsUnqNo: null,
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
    return (
      dateStr.substring(0, 4) +
      "-" +
      dateStr.substring(4, 6) +
      "-" +
      dateStr.substring(6, 8)
    );
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
    clearDetailForm();
  }

  /**
   * 상세정보 폼 초기화
   */
  function clearDetailForm() {
    $("#detailForm .illegal-inquiry-text").text("");
    $("#detailActionHistory").html(
      '<div class="illegal-inquiry-action-empty">데이터가 없습니다.</div>'
    );
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
   * 상세정보 날짜 리스트 렌더링
   * @param {Array} dates - 날짜 정보 배열 [{OCRNDATES, PRCHEMNO, ILGLPRVUINFOSEQ}]
   */
  function renderDetailDates(dates) {
    var $container = $("#detailDateList");
    $container.empty();

    if (!dates || dates.length === 0) {
      $container.html(
        '<div class="illegal-inquiry-action-empty">등록된 상세정보가 없습니다.</div>'
      );
      clearDetailForm();
      return;
    }

    dates.forEach(function (dateInfo, index) {
      var dateStr = dateInfo.OCRNDATES;
      var managerName = dateInfo.PRCHEMNO || "";
      var seq = dateInfo.ILGLPRVUINFOSEQ;
      var formattedDate = formatDate(dateStr);
      var displayText = formattedDate + " (" + escapeHtml(managerName) + ")";

      var $item = $("<button>", {
        type: "button",
        class: "illegal-inquiry-date-item",
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
   * 상세정보 날짜 선택
   * @param {string|Object} date - 날짜 문자열 또는 날짜 정보 객체 {OCRNDATES, ILGLPRVUINFOSEQ}
   */
  function selectDetailDate(date) {
    var dateStr = typeof date === "string" ? date : date.OCRNDATES;
    var seq = typeof date === "object" ? date.ILGLPRVUINFOSEQ : null;

    // 모든 버튼에서 active 클래스 제거
    $("#detailDateList .illegal-inquiry-date-item").removeClass(
      "illegal-inquiry-date-item--active"
    );

    // seq 값으로 정확한 버튼 찾기 (같은 날짜가 여러 개일 수 있으므로 seq 사용)
    var $activeButton = null;
    if (seq) {
      $activeButton = $(
        "#detailDateList .illegal-inquiry-date-item[data-seq='" + seq + "']"
      );
    } else if (dateStr) {
      // seq가 없으면 날짜로 찾되, 첫 번째 것만 선택
      $activeButton = $(
        "#detailDateList .illegal-inquiry-date-item[data-date='" +
          dateStr +
          "']"
      ).first();
      // 버튼에서 seq 값 가져오기
      if ($activeButton.length > 0) {
        seq = $activeButton.data("seq");
      }
    }

    // 버튼 활성화
    if ($activeButton && $activeButton.length > 0) {
      $activeButton.addClass("illegal-inquiry-date-item--active");
    }

    // seq 값이 없으면 오류 처리
    if (!seq) {
      showInquiryAlert("warning", "상세정보를 조회할 수 없습니다.");
      return;
    }

    // 상세정보 로드
    loadDetailBySeq(seq);
  }

  /**
   * SEQ로 상세정보 로드
   * @param {number} seq - 불법점용정보 SEQ
   */
  function loadDetailBySeq(seq) {
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
    $("#detail_ilglPrvuActnStatVal").text(
      formatIlglPrvuActnStatVal(basicInfo.ilglPrvuActnStatVal)
    );

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
      $container.html(
        '<div class="illegal-inquiry-action-empty">등록된 조치이력이 없습니다.</div>'
      );
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
   * 날짜 선택 관련 이벤트를 바인딩한다.
   */
  function bindDateEvents() {
    // 날짜 선택 이벤트
    state.$modal.on(
      "click",
      "#detailDateList .illegal-inquiry-date-item",
      function () {
        var $button = $(this);
        selectDetailDate({
          OCRNDATES: $button.data("date"),
          ILGLPRVUINFOSEQ: $button.data("seq"),
        });
      }
    );
  }

  /**
   * 모든 이벤트를 바인딩한다.
   */
  function bindEvents() {
    bindModalEvents();
    bindDateEvents();
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
  window.IllegalInquiryModal = {
    open: openModal,
    close: closeModal,
    isOpen: isModalOpen,
  };

  // 전역 변수로도 접근 가능하도록 설정
  window.illegalInquiryModal = window.IllegalInquiryModal;
})(window, window.jQuery);
