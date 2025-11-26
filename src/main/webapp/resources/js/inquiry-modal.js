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
   * currentSeq: 현재 선택된 불법점용정보 SEQ
   * $modal: 모달 jQuery 객체
   */
  var state = {
    currentLndsUnqNo: null,
    currentSeq: null,
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
    var dateStr = String(dateTimeStr);
    // yyyyMMdd 형식인 경우 yyyy-MM-dd로 변환
    if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
      return (
        dateStr.substring(0, 4) +
        "-" +
        dateStr.substring(4, 6) +
        "-" +
        dateStr.substring(6, 8)
      );
    }
    // 기존 형식 (ISO 8601 등) 처리
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
    $("#inq_detailDateList").empty();
    clearDetailForm();
  }

  /**
   * 상세정보 폼 초기화
   */
  function clearDetailForm() {
    $("#inq_detailForm .illegal-inquiry-text").text("");
    $("#inq_detailActionHistory").html('<div class="illegal-inquiry-action-empty">데이터가 없습니다.</div>');
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
    // 포커스 해제 (aria-hidden 경고 방지)
    if (document.activeElement) {
      document.activeElement.blur();
    }
    state.$modal.attr("aria-hidden", "true");
    $("body").removeClass("modal-open");

    // 데이터 초기화
    state.currentLndsUnqNo = null;
    state.currentSeq = null;
    clearAllData();
  }

  /**
   * 상세정보 탭의 등록일 리스트 로드
   */
  function loadDetailDates() {
    if (!state.currentLndsUnqNo) {
      return;
    }

    // 상세정보 날짜와 사진 날짜를 모두 조회
    $.when(
      $.ajax({
        url: "/regions/dates",
        method: "GET",
        data: {
          lndsUnqNo: state.currentLndsUnqNo,
          type: "detail",
        },
        dataType: "json",
      }),
      $.ajax({
        url: "/regions/dates",
        method: "GET",
        data: {
          lndsUnqNo: state.currentLndsUnqNo,
          type: "photo",
        },
        dataType: "json",
      })
    )
      .done(function (detailResponse, photoResponse) {
        var detailData = detailResponse[0];
        var photoData = photoResponse[0];

        if (detailData.success && detailData.data) {
          var photoDates = photoData.success && photoData.data ? photoData.data.dates : [];
          renderDetailDates(detailData.data.dates, photoDates);
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
   * @param {Array} photoDates - 사진 날짜 정보 배열 (선택사항)
   */
  function renderDetailDates(dates, photoDates) {
    var $container = $("#inq_detailDateList");
    $container.empty();

    if (!dates || dates.length === 0) {
      $container.html('<div class="illegal-inquiry-action-empty">등록된 상세정보가 없습니다.</div>');
      clearDetailForm();
      return;
    }

    dates.forEach(function (dateInfo, index) {
      // 대소문자 구분 없이 키 접근
      var dateStr = dateInfo.OCRNDATES || dateInfo.ocrnDates || dateInfo.ocrn_dates;
      var managerName = dateInfo.PRCHEMNO || dateInfo.prchEmno || dateInfo.prch_emno || "";
      var seq = dateInfo.ILGLPRVUINFOSEQ || dateInfo.ilglPrvuInfoSeq || dateInfo.ilgl_prvu_info_seq;

      if (!seq) {
        return;
      }

      var formattedDate = formatDate(dateStr);
      var displayText = formattedDate;

      // 사진 개수 정보 추가
      if (photoDates && photoDates.length > 0) {
        // 해당 날짜의 사진 개수 세기
        var photosForDate = photoDates.filter(function (photo) {
          var photoDate = photo.OCRNDATES || photo.ocrnDates;
          return photoDate === dateStr;
        });

        if (photosForDate.length > 1) {
          // 여러 장이 있을 때만 번호 표시
          displayText += " (" + photosForDate.length + "장)";
        }
      }

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
    var dateStr = null;
    var seq = null;

    if (typeof date === "string") {
      dateStr = date;
      seq = null;
    } else if (typeof date === "object" && date !== null) {
      // 대소문자 구분 없이 키 접근
      dateStr = date.OCRNDATES || date.ocrnDates || date.ocrn_dates || null;
      seq = date.ILGLPRVUINFOSEQ || date.ilglPrvuInfoSeq || date.ilgl_prvu_info_seq || null;
    }

    // 모든 버튼에서 active 클래스 제거
    $("#inq_detailDateList .illegal-inquiry-date-item").removeClass("illegal-inquiry-date-item--active");

    // seq 값으로 정확한 버튼 찾기 (같은 날짜가 여러 개일 수 있으므로 seq 사용)
    var $activeButton = null;
    if (seq) {
      $activeButton = $("#inq_detailDateList .illegal-inquiry-date-item[data-seq='" + seq + "']");
    } else if (dateStr) {
      // seq가 없으면 날짜로 찾되, 첫 번째 것만 선택
      $activeButton = $("#inq_detailDateList .illegal-inquiry-date-item[data-date='" + dateStr + "']").first();
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

    // 현재 선택된 seq 저장
    state.currentSeq = seq;

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
    $("#inq_detail_hdqrNm").text(basicInfo.hdqrNm || "-");
    $("#inq_detail_mtnofNm").text(basicInfo.mtnofNm || "-");
    $("#inq_detail_routeCd").text(basicInfo.routeCd || "-");
    $("#inq_detail_drveDrctCd").text(formatDrveDrctCd(basicInfo.drveDrctCd));
    $("#inq_detail_routeDstnc").text(basicInfo.routeDstnc || "-");
    $("#inq_detail_strcClssCd").text(formatStrcClssCd(basicInfo.strcClssCd));
    $("#inq_detail_lndsLdnoAddr").text(basicInfo.lndsLdnoAddr || "-");
    var formattedDate = formatDate(basicInfo.ocrnDates);
    $("#inq_detail_ocrnDates").text(formattedDate || "-");
    $("#inq_detail_prchEmno").text(basicInfo.prchEmno || "-");
    $("#inq_detail_trnrNm").text(basicInfo.trnrNm || "-");
    $("#inq_detail_rltrNm").text(basicInfo.rltrNm || "-");
    $("#inq_detail_trnrAddr").text(basicInfo.trnrAddr || "-");
    $("#inq_detail_rltrAddr").text(basicInfo.rltrAddr || "-");
    $("#inq_detail_ilglPssrt").text(basicInfo.ilglPssrt || "-");
    $("#inq_detail_ilglPssnSqms").text(basicInfo.ilglPssnSqms || "-");
    $("#inq_detail_ilglPrvuActnStatVal").text(formatIlglPrvuActnStatVal(basicInfo.ilglPrvuActnStatVal));

    // 조치이력 렌더링
    renderActionHistories(actionHistories);
  }

  /**
   * 조치이력 렌더링
   * @param {Array} actionHistories - 조치이력 배열
   */
  function renderActionHistories(actionHistories) {
    var $container = $("#inq_detailActionHistory");
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
   * 수정 버튼 클릭 이벤트 처리
   */
  function handleEditClick() {
    // 현재 선택된 날짜 버튼에서 seq 가져오기
    var $activeButton = $("#inq_detailDateList .illegal-inquiry-date-item--active");
    var seq = null;

    if ($activeButton.length > 0) {
      seq = $activeButton.data("seq");
    } else if (state.currentSeq) {
      seq = state.currentSeq;
    } else {
      // 활성화된 버튼이 없으면 첫 번째 버튼 사용
      var $firstButton = $("#inq_detailDateList .illegal-inquiry-date-item").first();
      if ($firstButton.length > 0) {
        var firstSeq = $firstButton.data("seq");
        if (firstSeq) {
          seq = firstSeq;
          var firstDateStr = $firstButton.data("date");
          try {
            selectDetailDate({
              OCRNDATES: firstDateStr,
              ILGLPRVUINFOSEQ: firstSeq,
            });
          } catch (error) {
            // 오류 무시하고 계속 진행
          }
        }
      }
    }

    if (!seq) {
      showInquiryAlert("warning", "수정할 데이터가 선택되지 않았습니다.");
      return;
    }

    // seq 값을 변수에 저장 (closeModal 호출 전에)
    var editSeq = seq;

    // 조회 모달 닫기 (state가 초기화되지만 editSeq는 유지됨)
    closeModal();

    // 등록 모달을 수정 모드로 열기
    if (window.ModifyModule && typeof window.ModifyModule.open === "function") {
      // 약간의 지연을 두어 모달이 완전히 닫힌 후 열기
      setTimeout(function () {
        try {
          window.ModifyModule.open(editSeq);
        } catch (error) {
          showInquiryAlert("danger", "수정 모달을 열 수 없습니다: " + error.message);
        }
      }, 100);
    } else {
      showInquiryAlert("danger", "수정 기능을 사용할 수 없습니다.");
    }
  }

  /**
   * 사진 비교 모달 열기
   */
  function openCompareModal() {
    if (!state.currentLndsUnqNo) {
      showInquiryAlert("warning", "토지 정보가 없습니다.");
      return;
    }

    state.$compareModal = $("#photoCompareModal");
    if (!state.$compareModal.length) {
      return;
    }

    // 모달 표시
    state.$compareModal.attr("aria-hidden", "false");

    // 사진 날짜 리스트를 API로 조회
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
        if (response.success && response.data && response.data.dates) {
          var photoDates = response.data.dates;
          var dates = [];

          // 각 사진을 개별 항목으로 변환
          photoDates.forEach(function (item, index) {
            var ocrnDates = item.OCRNDATES || item.ocrnDates;
            var ilglAttflSeq = item.ILGLATTFLSEQ || item.ilglAttflSeq;
            var ilglPrvuInfoSeq = item.ILGLPRVUINFOSEQ || item.ilglPrvuInfoSeq;

            // 날짜 포맷팅 (yyyyMMdd -> yyyy-MM-dd)
            var formattedDate = ocrnDates;
            if (ocrnDates && ocrnDates.length === 8) {
              formattedDate =
                ocrnDates.substring(0, 4) + "-" + ocrnDates.substring(4, 6) + "-" + ocrnDates.substring(6, 8);
            }

            // 같은 날짜의 사진 개수 세기
            var sameDate = photoDates.filter(function (d) {
              return (d.OCRNDATES || d.ocrnDates) === ocrnDates;
            });

            var photoNumber = "";
            if (sameDate.length > 1) {
              // 같은 날짜에 여러 사진이 있으면 번호 추가
              var currentIndex = sameDate.findIndex(function (d) {
                return (d.ILGLATTFLSEQ || d.ilglAttflSeq) === ilglAttflSeq;
              });
              photoNumber = " (" + (currentIndex + 1) + "/" + sameDate.length + ")";
            }

            dates.push({
              seq: ilglPrvuInfoSeq, // 기본 정보 SEQ (이미지 조회용)
              attflSeq: ilglAttflSeq, // 첨부파일 SEQ (개별 사진 식별용)
              date: ocrnDates,
              text: formattedDate + photoNumber,
              value: ilglPrvuInfoSeq + "|" + ilglAttflSeq, // 고유 식별값
            });
          });

          // 날짜 선택 박스 채우기
          updateCompareSelects(dates);

          // 지도 초기화 (모달 렌더링 후 실행)
          setTimeout(function () {
            initializeCompareMaps();

            // 기본값 자동 선택 로직
            if (dates.length > 0) {
              var val1 = dates[0].value;
              var val2 = dates.length >= 2 ? dates[1].value : dates[0].value;
              var val3 = dates.length >= 3 ? dates[2].value : dates.length === 2 ? dates[1].value : dates[0].value;

              $("#compareDate1").val(val1).trigger("change");
              $("#compareDate2").val(val2).trigger("change");
              $("#compareDate3").val(val3).trigger("change");
            }
          }, 200);
        } else {
          showInquiryAlert("warning", "사진 정보를 불러올 수 없습니다.");
        }
      })
      .fail(function (err) {
        console.error("사진 날짜 리스트 조회 실패:", err);
        showInquiryAlert("danger", "사진 정보를 불러오는데 실패했습니다.");
      });
  }

  /**
   * 사진 비교 모달 닫기
   */
  function closeCompareModal() {
    if (state.$compareModal) {
      state.$compareModal.attr("aria-hidden", "true");
    }

    // 지도 객체 정리 및 초기화 (좌표가 다른 용지 조회 시 뷰 갱신을 위해 필수)
    if (state.compareMaps && state.compareMaps.length > 0) {
      state.compareMaps.forEach(function (map) {
        map.setTarget(null);
      });
      state.compareMaps = [];
    }

    // 지도 컨테이너 비우기
    $(".photo-compare-map").empty();

    // 날짜 선택박스 초기화
    $(".photo-compare-select").empty().append('<option value="">날짜 선택</option>');
  }

  /**
   * 비교용 지도 3개 초기화
   */
  function initializeCompareMaps() {
    if (state.compareMaps && state.compareMaps.length > 0) {
      state.compareMaps.forEach(function (map) {
        map.updateSize();
      });
      return;
    }

    state.compareMaps = [];

    // 메인 지도의 뷰 상태 가져오기
    var center = [14239470.615841, 4331333.304951];
    var zoom = 17;

    // 선택된 영역 데이터가 있으면 그 좌표를 중심으로 설정
    if (window.selectedRegionData && window.selectedRegionData.coordinateX && window.selectedRegionData.coordinateY) {
      center = [window.selectedRegionData.coordinateX, window.selectedRegionData.coordinateY];
    } else if (window.map) {
      var view = window.map.getView();
      center = view.getCenter();
      zoom = view.getZoom();
    }

    // 줌 레벨 19(minZoom) 기준의 extent 계산
    // 이를 통해 축소 시에는 이동 불가, 확대 시에는 초기 영역 내에서만 이동 가능하도록 설정
    var minZoom = 19;
    var extent = undefined;
    var $map1 = $("#compareMap1");

    if ($map1.length > 0) {
      var width = $map1.width();
      var height = $map1.height();

      if (width && height) {
        // EPSG:3857의 줌 0 해상도 = 156543.03392804097
        var resolution = 156543.03392804097 / Math.pow(2, minZoom);
        var halfWidth = (width * resolution) / 2;
        var halfHeight = (height * resolution) / 2;

        extent = [center[0] - halfWidth, center[1] - halfHeight, center[0] + halfWidth, center[1] + halfHeight];
      }
    }

    // 공유 뷰 생성
    var sharedView = new ol.View({
      center: center,
      zoom: zoom,
      projection: "EPSG:3857",
      minZoom: minZoom,
      maxZoom: 24,
      extent: extent, // 계산된 제한 영역 적용
    });

    // 3개의 지도 생성
    for (var i = 1; i <= 3; i++) {
      var targetId = "compareMap" + i;
      var $target = $("#" + targetId);

      if ($target.length === 0) continue;

      // 로딩 인디케이터 주입 (없으면)
      if ($target.find(".photo-compare-loader").length === 0) {
        $target.append('<div class="photo-compare-loader"></div>');
      }

      // 투명도 슬라이더 주입 (없으면)
      var $controls = $target.closest(".photo-compare-item").find(".photo-compare-controls");
      if ($controls.length > 0 && $controls.find(".photo-compare-opacity").length === 0) {
        var sliderHtml =
          '<div class="photo-compare-opacity">' +
          "<label>투명도</label>" +
          '<input type="range" min="0" max="1" step="0.1" value="1" data-map-index="' +
          (i - 1) +
          '">' +
          "</div>";
        $controls.append(sliderHtml);
      }

      // VWorld 배경 레이어 (일반 - GRAPHIC)
      var baseLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: "https://api.vworld.kr/req/wmts/1.0.0/" + VWORLD_API_KEY + "/Base/{z}/{y}/{x}.png",
          crossOrigin: "anonymous",
        }),
        visible: true,
      });

      // VWorld 위성 레이어 (위성 - PHOTO)
      var satelliteLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: "https://api.vworld.kr/req/wmts/1.0.0/" + VWORLD_API_KEY + "/Satellite/{z}/{y}/{x}.jpeg",
          crossOrigin: "anonymous",
        }),
        visible: false,
      });

      var map = new ol.Map({
        target: targetId,
        layers: [baseLayer, satelliteLayer],
        view: sharedView,
        controls: [], // 컨트롤 제거
        // interactions 옵션을 제거하여 기본 상호작용(드래그, 줌 등) 활성화
        // 단, view의 extent 설정으로 인해 이동 범위는 제한됨
      });

      map.customImageLayer = null;
      // 레이어 참조 저장
      map.baseLayer = baseLayer;
      map.satelliteLayer = satelliteLayer;

      state.compareMaps.push(map);
    }

    // 초기 라디오 버튼 상태에 따라 레이어 가시성 설정
    var selectedType = $("input[name='compareMapType']:checked").val();
    toggleCompareMapLayers(selectedType);
  }

  /**
   * 비교 지도 레이어 토글 (GRAPHIC / PHOTO)
   */
  function toggleCompareMapLayers(type) {
    if (!state.compareMaps) return;

    state.compareMaps.forEach(function (map) {
      if (type === "PHOTO") {
        if (map.baseLayer) map.baseLayer.setVisible(false);
        if (map.satelliteLayer) map.satelliteLayer.setVisible(true);
      } else {
        // GRAPHIC
        if (map.baseLayer) map.baseLayer.setVisible(true);
        if (map.satelliteLayer) map.satelliteLayer.setVisible(false);
      }
    });
  }

  /**
   * 비교용 날짜 선택 박스 업데이트
   */
  function updateCompareSelects(dates) {
    var $selects = $(".photo-compare-select");
    $selects.empty();
    $selects.append('<option value="">날짜 선택</option>');

    dates.forEach(function (d) {
      $selects.append(
        $("<option>", {
          value: d.value,
          text: d.text,
        })
      );
    });
  }

  /**
   * 선택된 날짜의 이미지 로드 및 지도에 표시
   */
  /**
   * 선택된 날짜의 이미지 로드 및 지도에 표시
   */
  function loadCompareImage(mapIndex, seqValue) {
    var map = state.compareMaps[mapIndex];
    if (!map) {
      return;
    }

    // 기존 이미지 레이어 제거
    if (map.customImageLayer) {
      map.removeLayer(map.customImageLayer);
      map.customImageLayer = null;
    }

    if (!seqValue) return;

    // seqValue 파싱 (ilglPrvuInfoSeq|ilglAttflSeq)
    var infoSeq = seqValue;
    var attflSeq = null;

    if (String(seqValue).indexOf("|") > -1) {
      var parts = String(seqValue).split("|");
      infoSeq = parts[0];
      attflSeq = parts[1];
    }

    // 이미지 정보 조회
    var $target = $(map.getTargetElement());
    var $loader = $target.find(".photo-compare-loader");
    $loader.addClass("active");

    $.ajax({
      url: "/regions/photos",
      method: "GET",
      data: { ilglPrvuInfoSeq: infoSeq },
      dataType: "json",
    })
      .done(function (response) {
        if (response.success && response.data && response.data.photos && response.data.photos.length > 0) {
          var photo = null;

          if (attflSeq) {
            // attflSeq가 일치하는 사진 찾기
            // 데이터 타입이 다를 수 있으므로 == 비교 사용
            photo = response.data.photos.find(function (p) {
              return (p.ILGLATTFLSEQ || p.ilglAttflSeq) == attflSeq;
            });
          }

          // 찾지 못했거나 attflSeq가 없으면 첫 번째 사진 사용
          if (!photo) {
            photo = response.data.photos[0];
          }

          // webPath가 있으면 사용, 없으면 기존 로직 사용

          // webPath가 있으면 사용, 없으면 기존 로직 사용
          var imageUrl;
          if (photo.webPath) {
            imageUrl = photo.webPath;
          } else {
            var rawPath = photo.attflPath;
            var fileName = photo.attflNm;
            imageUrl = rawPath;

            // 1. 경로 정규화 (src/main/resources/static 제거)
            if (imageUrl && imageUrl.indexOf("src/main/resources/static") !== -1) {
              var parts = imageUrl.split("src/main/resources/static");
              if (parts.length > 1) {
                imageUrl = parts[1];
              }
            }

            // 2. 슬래시 정규화
            if (imageUrl) {
              imageUrl = imageUrl.replace(/\\/g, "/");
            }

            // 3. 파일명 결합 (경로에 파일명이 포함되지 않은 경우)
            if (fileName && imageUrl) {
              if (!imageUrl.endsWith(fileName)) {
                if (!imageUrl.endsWith("/")) {
                  imageUrl += "/";
                }
                imageUrl += fileName;
              }
            }

            // 4. 중복 슬래시 제거 및 선행 슬래시 보장
            if (imageUrl) {
              imageUrl = imageUrl.replace(/\/\//g, "/");
              if (!imageUrl.startsWith("/")) {
                imageUrl = "/" + imageUrl;
              }
            }
          }

          if (!imageUrl) return;

          // 좌표 설정
          var centerX, centerY;

          if (window.selectedRegionData && window.selectedRegionData.coordinateX) {
            centerX = window.selectedRegionData.coordinateX;
            centerY = window.selectedRegionData.coordinateY;
          } else {
            var center = map.getView().getCenter();
            centerX = center[0];
            centerY = center[1];
          }

          var IMAGE_HALF_SIZE_RANGE = 29;
          var extent = [
            centerX - IMAGE_HALF_SIZE_RANGE,
            centerY - IMAGE_HALF_SIZE_RANGE,
            centerX + IMAGE_HALF_SIZE_RANGE,
            centerY + IMAGE_HALF_SIZE_RANGE,
          ];

          var source = new ol.source.ImageStatic({
            url: imageUrl,
            imageExtent: extent,
            projection: "EPSG:3857",
            crossOrigin: "anonymous",
          });

          var layer = new ol.layer.Image({
            source: source,
            opacity: parseFloat($target.closest(".photo-compare-item").find("input[type=range]").val()) || 1.0,
            zIndex: 999,
          });

          map.addLayer(layer);
          map.customImageLayer = layer;
          map.render();
        }
      })
      .fail(function (err) {
        console.error("이미지 로드 실패:", err);
        showInquiryAlert("danger", "이미지를 불러오는데 실패했습니다.");
      })
      .always(function () {
        $loader.removeClass("active");
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

    // 수정 버튼 클릭 이벤트
    state.$modal.on("click", "#inquiryEditBtn", function () {
      handleEditClick();
    });

    // 사진 비교 버튼 클릭
    state.$modal.on("click", "#inq_photoCompareBtn", function () {
      openCompareModal();
    });

    // 사진 비교 모달 닫기
    $(document).on("click", "[data-compare-modal-close]", function () {
      closeCompareModal();
    });

    // 비교 날짜 선택 변경
    $(document).on("change", ".photo-compare-select", function () {
      var $select = $(this);
      var mapIndex = $select.data("map-index");
      var seq = $select.val();
      loadCompareImage(mapIndex, seq);
    });

    // 비교 지도 타입 변경 (일반/위성)
    $(document).on("change", "input[name='compareMapType']", function () {
      var type = $(this).val();
      toggleCompareMapLayers(type);
    });

    // 투명도 슬라이더 변경
    $(document).on("input change", ".photo-compare-opacity input[type='range']", function () {
      var $input = $(this);
      var mapIndex = $input.data("map-index");
      var opacity = parseFloat($input.val());

      var map = state.compareMaps[mapIndex];
      if (map && map.customImageLayer) {
        map.customImageLayer.setOpacity(opacity);
      }
    });

    // 모달 외부 클릭 시 닫기
    state.$modal.on("click", function (e) {
      if (e.target === state.$modal[0]) {
        closeModal();
      }
    });

    // ESC 키로 닫기
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") {
        if (state.$compareModal && state.$compareModal.attr("aria-hidden") === "false") {
          closeCompareModal();
        } else if (isModalOpen()) {
          closeModal();
        }
      }
    });
  }

  /**
   * 날짜 선택 관련 이벤트를 바인딩한다.
   */
  function bindDateEvents() {
    // 날짜 선택 이벤트
    state.$modal.on("click", "#inq_detailDateList .illegal-inquiry-date-item", function () {
      var $button = $(this);
      var dateStr = $button.data("date");
      var seq = $button.data("seq");

      selectDetailDate({
        OCRNDATES: dateStr,
        ILGLPRVUINFOSEQ: seq,
      });
    });
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
