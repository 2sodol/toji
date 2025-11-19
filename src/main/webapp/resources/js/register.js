(function (window, $) {
  /**
   * register.js
   * - 지역 불법 점유 등록 모달에서 사용하는 클라이언트 로직을 모두 포함한다.
   * - jQuery 기반의 이벤트 바인딩, 상태 관리, Ajax 요청 처리, 폼 초기화 등의 기능을 담당한다.
   */
  "use strict";

  if (!$) {
    console.error("register.js는 jQuery가 필요합니다.");
    return;
  }

  /**
   * 모듈 내부에서 공유되는 UI 상태 값.
   * selectedPhotoFiles: 사용자가 첨부한 사진 파일 목록 (File 객체 배열)
   */
  var state = {
    selectedPhotoFiles: [],
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
   * 조치 이력 행 DOM 요소를 생성한다.
   * @param {string} actionDate - 조치 일자 (yyyy-MM-dd)
   * @param {string} description - 조치 내용
   * @returns {jQuery} - 생성된 조치 이력 행의 jQuery 객체
   */
  function createActionHistoryRow(actionDate, description) {
    var safeDate = escapeHtml(actionDate || "");
    var safeDesc = escapeHtml(description || "");
    var $row = $("<div>", {
      class: "illegal-register-history__item",
    });

    var $dateDiv = $("<div>", {
      class: "illegal-register-history__date",
    });
    var $dateInput = $("<input>", {
      type: "date",
      class: "illegal-register-input illegal-register-history__date-input",
      value: safeDate,
    });
    $dateDiv.append($dateInput);

    var $descDiv = $("<div>", {
      class: "illegal-register-history__desc",
    });
    var $descInput = $("<input>", {
      type: "text",
      class: "illegal-register-input illegal-register-history__desc-input",
      placeholder: "예: 구두주의, 경고 등",
      maxlength: "500",
      value: safeDesc,
    });
    $descDiv.append($descInput);

    var $actionsDiv = $("<div>", {
      class: "illegal-register-history__actions",
    });
    var $removeBtn = $("<button>", {
      type: "button",
      class: "illegal-register-history__remove remove-action-history-btn",
      title: "삭제",
      "aria-label": "삭제",
    });
    var $icon = $("<i>", {
      class: "fas fa-minus",
      "aria-hidden": "true",
    });
    $removeBtn.append($icon);
    $actionsDiv.append($removeBtn);

    $row.append($dateDiv).append($descDiv).append($actionsDiv);

    return $row;
  }

  /**
   * 조치 이력 입력 리스트를 초기화한다.
   * - 기존 입력을 모두 제거하고 하나의 빈 행만 남긴다.
   * - 첫 행은 삭제 버튼을 제거하여 최소 1개 행은 항상 유지되도록 한다.
   */
  function resetActionHistoryList() {
    var $list = $("#actionHistoryList");
    $list.empty();
    $list.append(createActionHistoryRow());
    $list.find(".illegal-register-history__actions").first().empty();
  }

  /**
   * 첨부된 사진 파일 목록을 UI에 갱신한다.
   * - 파일이 없는 경우 플레이스홀더 문구를 표시한다.
   * - 각 파일 옆에는 삭제 버튼을 함께 표시한다.
   */
  function updatePhotoFileList() {
    var $list = $("#illegalPhotoFileList");

    $list.empty();

    if (!state.selectedPhotoFiles.length) {
      var $placeholder = $("<li>", {
        class: "illegal-register-photo__placeholder",
        id: "illegalPhotoFilePlaceholder",
        text: "선택된 파일이 없습니다.",
      });
      $list.append($placeholder);
      return;
    }

    $.each(state.selectedPhotoFiles, function (index, file) {
      var sizeLabel = file.size ? " (" + (file.size / 1024).toFixed(1) + " KB)" : "";
      var $listItem = $("<li>", {
        class: "illegal-register-photo__item",
      });

      var $nameSpan = $("<span>", {
        class: "illegal-register-photo__name",
        text: escapeHtml(file.name) + sizeLabel,
      });

      var $removeBtn = $("<button>", {
        type: "button",
        class: "illegal-register-photo__remove remove-photo-file-btn",
        "data-index": index,
        text: "삭제",
      });

      $listItem.append($nameSpan).append($removeBtn);
      $list.append($listItem);
    });
  }

  /**
   * 등록 모달 내 폼 전체를 초기 상태로 되돌린다.
   * - 입력 필드 리셋
   * - 토글/라디오 버튼 초기화
   * - 조치 이력, 사진 첨부 목록 초기화
   * - 히든 필드 초기화
   */
  function resetRegisterForm() {
    var $form = $("#illegalRegisterForm");
    if ($form.length && $form[0]) {
      $form[0].reset();
    }

    $('input[name="strcClssCd"][value="GENERAL"]').prop("checked", true);
    $('input[name="ilglPrvuActnStatVal"][value="IN_PROGRESS"]').prop("checked", true);

    resetActionHistoryList();
    state.selectedPhotoFiles = [];
    updatePhotoFileList();
    $("#illegalPhotoFileInput").val("");

    var today = new Date().toISOString().split("T")[0];
    $("#illegalPhotoRegisteredAtInput").val(today);

    // 히든 필드 초기화
    $("#lndsUnqNo").val("");
    $("#gpsLgtd").val("");
    $("#gpsLttd").val("");
  }

  /**
   * 조치 이력 입력 필드에서 유효한 항목만 추출한다.
   * @returns {Array<{actnDttm: string, actnCtnt: string}>}
   */
  function collectActionHistories() {
    var histories = [];

    $("#actionHistoryList .illegal-register-history__item").each(function () {
      var dateValue = $(this).find(".illegal-register-history__date-input").val();
      var descValue = $(this).find(".illegal-register-history__desc-input").val().trim();

      if (dateValue && descValue) {
        // 날짜 문자열을 ISO 8601 형식으로 변환 (LocalDateTime 형식)
        var dateTimeValue = dateValue + "T00:00:00";
        histories.push({
          actnDttm: dateTimeValue,
          actnCtnt: descValue,
        });
      }
    });

    return histories;
  }

  /**
   * 저장 버튼 로딩 상태를 토글한다.
   * @param {boolean} isLoading - true면 로딩 중 상태로 전환
   */
  function toggleSubmitLoading(isLoading) {
    var $btn = $("#illegalRegisterSubmitBtn");

    if (isLoading) {
      $btn.data("original-text", $btn.text());
      $btn.prop("disabled", true).text("저장 중...");
    } else {
      var original = $btn.data("original-text") || "저장";
      $btn.prop("disabled", false).text(original);
    }
  }

  /**
   * 토스트 메시지를 표시한다.
   * @param {"success"|"danger"|"warning"|"info"} type - 알림 타입
   * @param {string} message - 사용자에게 보여줄 메시지
   */
  function showRegisterAlert(type, message) {
    // 토스트 컨테이너가 없으면 생성
    var $container = $("#registerToastContainer");
    if (!$container.length) {
      $container = $("<div>", {
        id: "registerToastContainer",
        class: "register-toast-container",
      });
      $("body").append($container);
    }

    // 타입별 아이콘과 클래스 설정
    var iconClass = "";
    var toastClass = "register-toast register-toast--" + type;
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
      class: "register-toast__icon-wrapper",
    });

    var $icon = $("<i>", {
      class: iconClass,
    });

    $iconWrapper.append($icon);

    // 메시지 텍스트
    var $message = $("<span>", {
      class: "register-toast__message",
      text: message,
    });

    // 닫기 버튼
    var $closeBtn = $("<button>", {
      type: "button",
      class: "register-toast__close",
      "aria-label": "닫기",
    });
    var $closeIcon = $("<i>", {
      class: "fas fa-times",
    });
    $closeBtn.append($closeIcon);

    // 닫기 버튼 클릭 이벤트
    $closeBtn.on("click", function () {
      $toast.removeClass("register-toast--show");
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
      $toast.addClass("register-toast--show");
    }, 10);

    // 3초 후 자동으로 제거
    setTimeout(function () {
      $toast.removeClass("register-toast--show");
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
   * 외부에서 전달된 지역 정보를 기반으로 폼에 값 채우기.
   * @param {Object} region - 지역 정보 객체
   */
  function fillRegisterForm(region) {
    if (!region) {
      return;
    }

    var $detailAddressInput = $("#lndsLdnoAddr");
    if (!$detailAddressInput.length) {
      return;
    }

    var resolvedAddress = region.address || region.roadAddress || region.jibunAddress || "";
    $detailAddressInput.val(resolvedAddress);

    // PNU 및 좌표 정보를 히든 필드에 설정
    if (region.pnu) {
      $("#lndsUnqNo").val(region.pnu);
    }
    if (region.coordinateX !== undefined && region.coordinateX !== null) {
      $("#gpsLgtd").val(region.coordinateX);
    }
    if (region.coordinateY !== undefined && region.coordinateY !== null) {
      $("#gpsLttd").val(region.coordinateY);
    }

    // 기본값 하드코딩: 본부, 지사, 노선, 주행방향, 이정
    var $headOfficeInput = $("#hdqrNm");
    if ($headOfficeInput.length && !$headOfficeInput.val().trim()) {
      $headOfficeInput.val("서울본부");
    }

    var $branchOfficeInput = $("#mtnofNm");
    if ($branchOfficeInput.length && !$branchOfficeInput.val().trim()) {
      $branchOfficeInput.val("서울지사");
    }

    var $routeInput = $("#routeCd");
    if ($routeInput.length && !$routeInput.val().trim()) {
      $routeInput.val("경부고속도로");
    }

    var $drivingDirectionSelect = $("#drveDrctCd");
    if ($drivingDirectionSelect.length && !$drivingDirectionSelect.val()) {
      $drivingDirectionSelect.val("UP");
    }

    var $distanceMarkInput = $("#routeDstnc");
    if ($distanceMarkInput.length && !$distanceMarkInput.val().trim()) {
      $distanceMarkInput.val("123.5");
    }
  }

  /**
   * 모달 표시/숨김 시점에 대한 이벤트를 등록한다.
   * - 모달이 열릴 때 오늘 날짜 기본 설정 및 포커스 이동
   * - 모달이 닫힐 때 폼 초기화
   */
  function registerModalEvents() {
    var $modal = $("#illegalRegisterModal");
    if (!$modal.length) {
      return;
    }

    // 모달이 열릴 때만 실행되는 이벤트 리스너
    $modal.on("illegalRegisterModal:open", function () {
      if (!$("#illegalPhotoRegisteredAtInput").val()) {
        var today = new Date().toISOString().split("T")[0];
        $("#illegalPhotoRegisteredAtInput").val(today);
      }
      updatePhotoFileList();

      // 모달이 열릴 때 서버에서 초기 데이터를 가져오는 Ajax 호출
      $.ajax({
        url: "/api/initial-data", // 실제 엔드포인트로 변경 필요
        method: "GET",
        dataType: "json",
      })
        .done(function (response) {
          // 성공 시 처리 로직
          console.log("초기 데이터 로드 성공:", response);

          // 예시: 서버에서 받은 데이터로 폼 필드 채우기
          if (response.defaultValues) {
            var $branchInput = $("#mtnofNm");
            var $routeInput = $("#routeCd");

            if (response.defaultValues.mtnofNm && $branchInput.length) {
              $branchInput.val(response.defaultValues.mtnofNm);
            }
            if (response.defaultValues.routeCd && $routeInput.length) {
              $routeInput.val(response.defaultValues.routeCd);
            }
          }
        })
        .fail(function (xhr, status, error) {
          // 실패 시 처리 로직 (선택사항)
          console.warn("초기 데이터 로드 실패:", status, error);
          // 에러가 발생해도 모달은 정상적으로 열리도록 함
        });
    });

    // 모달이 닫힐 때만 실행되는 이벤트 리스너
    $modal.on("illegalRegisterModal:close", function () {
      resetRegisterForm();
    });
  }

  /**
   * 조치 이력 추가/삭제 버튼에 대한 이벤트를 바인딩한다.
   */
  function bindActionHistoryEvents() {
    $("#addActionHistoryBtn").on("click", function () {
      $("#actionHistoryList").append(createActionHistoryRow());
    });

    $("#actionHistoryList").on("click", ".remove-action-history-btn", function () {
      var $targetItem = $(this).closest(".illegal-register-history__item");
      var $items = $("#actionHistoryList .illegal-register-history__item");

      if ($items.length <= 1) {
        $targetItem.find("input").val("");
        return;
      }

      $targetItem.remove();
    });
  }

  /**
   * 사진 업로드 관련 이벤트를 바인딩한다.
   * - 업로드 버튼 클릭 시 파일 선택창 열기
   * - 파일 선택 시 상태 저장 및 리스트 갱신
   * - 리스트 내 삭제 버튼 처리
   */
  function bindPhotoUploadEvents() {
    $("#illegalPhotoUploadBtn").on("click", function () {
      var $fileInput = $("#illegalPhotoFileInput");
      $fileInput.trigger("click");
    });

    $("#illegalPhotoFileInput").on("change", function () {
      var $input = $(this);
      var files = $input[0].files || [];
      state.selectedPhotoFiles = $.makeArray(files);
      updatePhotoFileList();
      $input.val("");
    });

    $("#illegalPhotoFileList").on("click", ".remove-photo-file-btn", function () {
      var $btn = $(this);
      var index = parseInt($btn.data("index"), 10);

      if (!isNaN(index) && index >= 0 && index < state.selectedPhotoFiles.length) {
        state.selectedPhotoFiles.splice(index, 1);
        updatePhotoFileList();
      }
    });
  }

  /**
   * 주소 검색 버튼/링크에 대한 이벤트를 바인딩한다.
   * - 전역에 정의된 openAddressModal 함수가 있으면 실행
   * - 없으면 준비 중 알림
   */
  function bindAddressEvents() {
    $("#lndsLdnoAddrSearchBtn").on("click", function () {
      if (typeof window.openAddressModal === "function") {
        window.openAddressModal();
      } else {
        alert("주소 검색 기능은 준비 중입니다.");
      }
    });

    $("[data-register-address-target]").on("click", function () {
      if (typeof window.openAddressModal === "function") {
        window.openAddressModal();
      } else {
        alert("주소 검색 기능은 준비 중입니다.");
      }
    });
  }

  /**
   * 숫자 입력 필드에 대해 빈 값은 null, 숫자가 아니면 경고 메시지를 보여준다.
   * @param {string} rawValue - 사용자가 입력한 원본 값
   * @param {string} warningMessage - 숫자가 아닐 때 표시할 경고 메시지
   * @param {jQuery} $input - 포커스를 줄 입력 요소
   * @returns {number|null|undefined} - 유효한 숫자, null(빈 값), undefined(에러)
   */
  function parseOptionalNumber(rawValue, warningMessage, $input) {
    if (!rawValue || rawValue === "") {
      return null;
    }

    var parsed = parseFloat(rawValue);
    if (isNaN(parsed)) {
      showRegisterAlert("warning", warningMessage);
      if ($input && $input.length) {
        $input.trigger("focus");
      }
      return undefined;
    }

    return parsed;
  }

  /**
   * 등록 버튼 클릭 시 실행되는 메인 핸들러.
   * - 입력값 검증
   * - 조치 이력/사진 데이터 수집
   * - 서버로 Ajax POST 요청 전송
   */
  function handleSubmit() {
    var $headOfficeInput = $("#hdqrNm");
    var $branchOfficeInput = $("#mtnofNm");
    var $routeNameInput = $("#routeCd");
    var $drivingDirectionSelect = $("#drveDrctCd");
    var $distanceMarkInput = $("#routeDstnc");
    var $detailAddressInput = $("#lndsLdnoAddr");
    var $incidentDateInput = $("#ocrnDates");
    var $managerNameInput = $("#prchEmno");
    var $actorNameInput = $("#trnrNm");
    var $relatedPersonInput = $("#rltrNm");
    var $actorAddressInput = $("#trnrAddr");
    var $relatedAddressInput = $("#rltrAddr");
    var $occupancyRateInput = $("#ilglPssrt");
    var $occupancyAreaInput = $("#ilglPssnSqms");
    var $photoRegisteredAtInput = $("#illegalPhotoRegisteredAtInput");
    var $lndsUnqNoInput = $("#lndsUnqNo");
    var $gpsLgtdInput = $("#gpsLgtd");
    var $gpsLttdInput = $("#gpsLttd");

    var headOffice = $headOfficeInput.val().trim();
    var branchOffice = $branchOfficeInput.val().trim();
    var routeName = $routeNameInput.val().trim();
    var drivingDirection = $drivingDirectionSelect.val();
    var distanceMark = $distanceMarkInput.val().trim();
    var category = $('input[name="strcClssCd"]:checked').val();
    var detailAddress = $detailAddressInput.val().trim();
    var incidentDate = $incidentDateInput.val();
    var managerName = $managerNameInput.val().trim();
    var actorName = $actorNameInput.val().trim();
    var relatedPersonName = $relatedPersonInput.val().trim();
    var actorAddress = $actorAddressInput.val().trim();
    var relatedAddress = $relatedAddressInput.val().trim();
    var occupancyRateValue = $occupancyRateInput.val();
    var occupancyAreaValue = $occupancyAreaInput.val();
    var actionStatus = $('input[name="ilglPrvuActnStatVal"]:checked').val();
    var photoRegisteredAt = $photoRegisteredAtInput.val();
    var lndsUnqNo = $lndsUnqNoInput.val().trim();
    var gpsLgtdValue = $gpsLgtdInput.val().trim();
    var gpsLttdValue = $gpsLttdInput.val().trim();
    var memoValue = null;

    if (!headOffice) {
      showRegisterAlert("warning", "본부를 입력해주세요.");
      $headOfficeInput.trigger("focus");
      return;
    }
    if (!branchOffice) {
      showRegisterAlert("warning", "지사를 입력해주세요.");
      $branchOfficeInput.trigger("focus");
      return;
    }
    if (!routeName) {
      showRegisterAlert("warning", "노선명을 입력해주세요.");
      $routeNameInput.trigger("focus");
      return;
    }
    if (!drivingDirection) {
      showRegisterAlert("warning", "주행방향을 선택해주세요.");
      $drivingDirectionSelect.trigger("focus");
      return;
    }
    if (!incidentDate) {
      showRegisterAlert("warning", "발생일자를 선택해주세요.");
      $incidentDateInput.trigger("focus");
      return;
    }
    if (!managerName) {
      showRegisterAlert("warning", "담당자를 입력해주세요.");
      $managerNameInput.trigger("focus");
      return;
    }
    if (!actorName) {
      showRegisterAlert("warning", "행위자명을 입력해주세요.");
      $actorNameInput.trigger("focus");
      return;
    }
    if (!actionStatus) {
      showRegisterAlert("warning", "조치상태를 선택해주세요.");
      return;
    }

    var occupancyRate = parseOptionalNumber(occupancyRateValue, "점유율은 숫자로 입력해주세요.", $occupancyRateInput);
    if (occupancyRate === undefined) {
      return;
    }

    var occupancyArea = parseOptionalNumber(occupancyAreaValue, "점유면적은 숫자로 입력해주세요.", $occupancyAreaInput);
    if (occupancyArea === undefined) {
      return;
    }

    var actionHistories = collectActionHistories();

    // GPS 좌표 파싱
    var gpsLgtd = parseOptionalNumber(gpsLgtdValue, "경도는 숫자로 입력해주세요.", $gpsLgtdInput);
    if (gpsLgtd === undefined && gpsLgtdValue) {
      return;
    }

    var gpsLttd = parseOptionalNumber(gpsLttdValue, "위도는 숫자로 입력해주세요.", $gpsLttdInput);
    if (gpsLttd === undefined && gpsLttdValue) {
      return;
    }

    // 발생일자를 yyyyMMdd 형식으로 변환
    var ocrnDates = null;
    if (incidentDate) {
      var date = new Date(incidentDate);
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var day = String(date.getDate()).padStart(2, "0");
      ocrnDates = year + month + day;
    }

    // 거리표지판을 BigDecimal로 변환
    var routeDstnc = null;
    if (distanceMark) {
      routeDstnc = parseOptionalNumber(distanceMark, "거리표지판은 숫자로 입력해주세요.", $distanceMarkInput);
      if (routeDstnc === undefined) {
        return;
      }
    }

    var payload = {
      hdqrNm: headOffice,
      mtnofNm: branchOffice,
      routeCd: routeName,
      drveDrctCd: drivingDirection,
      routeDstnc: routeDstnc,
      strcClssCd: category,
      lndsLdnoAddr: detailAddress || null,
      ocrnDates: ocrnDates,
      prchEmno: managerName,
      trnrNm: actorName,
      rltrNm: relatedPersonName || null,
      trnrAddr: actorAddress || null,
      rltrAddr: relatedAddress || null,
      ilglPssrt: occupancyRate,
      ilglPssnSqms: occupancyArea,
      ilglPrvuActnStatVal: actionStatus,
      actionHistories: actionHistories,
      lndsUnqNo: lndsUnqNo || null,
      gpsLgtd: gpsLgtd,
      gpsLttd: gpsLttd,
    };

    toggleSubmitLoading(true);

    $.ajax({
      url: "/regions/register",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
    })
      .done(function () {
        // 성공 토스트 메시지 표시
        showRegisterAlert("success", "등록이 완료되었습니다.");

        // 최근 등록 목록 갱신
        if (typeof window.loadRecentRegions === "function") {
          window.loadRecentRegions();
        }

        // 모달 닫기 (토스트가 표시된 후 약간의 지연을 두고 닫음)
        setTimeout(function () {
          if (window.IllegalRegisterModal && typeof window.IllegalRegisterModal.close === "function") {
            window.IllegalRegisterModal.close();
          }
        }, 500);
      })
      .fail(function (xhr) {
        var message = "저장 중 오류가 발생했습니다.";
        var responseJSON = xhr.responseJSON || {};

        if (responseJSON.message) {
          message = responseJSON.message;
        }

        showRegisterAlert("danger", message);
      })
      .always(function () {
        toggleSubmitLoading(false);
      });
  }

  /**
   * 모듈 초기화 함수.
   * - 각종 이벤트 바인딩 및 초기 상태 설정
   */
  function initialize() {
    resetRegisterForm();
    registerModalEvents();
    bindActionHistoryEvents();
    bindPhotoUploadEvents();
    bindAddressEvents();
    $("#illegalRegisterSubmitBtn").on("click", handleSubmit);
  }

  $(initialize);

  /**
   * 외부에서 접근 가능한 공개 메서드 모음.
   */
  window.RegisterModule = {
    fillForm: fillRegisterForm,
    resetForm: resetRegisterForm,
  };

  window.escapeHtml = escapeHtml;
})(window, window.jQuery);
