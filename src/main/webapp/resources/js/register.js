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
    var $row = $('<div class="illegal-register-history__item"></div>');

    $row.append(
      '<div class="illegal-register-history__date">' +
        '<input type="date" class="illegal-register-input illegal-register-history__date-input" value="' +
        safeDate +
        '">' +
        "</div>"
    );

    $row.append(
      '<div class="illegal-register-history__desc">' +
        '<input type="text" class="illegal-register-input illegal-register-history__desc-input" placeholder="예: 구두주의, 경고 등" maxlength="500" value="' +
        safeDesc +
        '">' +
        "</div>"
    );

    $row.append(
      '<div class="illegal-register-history__actions">' +
        '<button type="button" class="illegal-register-history__remove remove-action-history-btn" title="삭제" aria-label="삭제">' +
        '<i class="fas fa-minus" aria-hidden="true"></i>' +
        "</button>" +
        "</div>"
    );

    return $row;
  }

  /**
   * 조치 이력 입력 리스트를 초기화한다.
   * - 기존 입력을 모두 제거하고 하나의 빈 행만 남긴다.
   * - 첫 행은 삭제 버튼을 제거하여 최소 1개 행은 항상 유지되도록 한다.
   */
  function resetActionHistoryList() {
    var $list = $("#illegalActionHistoryList");
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
      $list.append(
        '<li class="illegal-register-photo__placeholder" id="illegalPhotoFilePlaceholder">선택된 파일이 없습니다.</li>'
      );
      return;
    }

    state.selectedPhotoFiles.forEach(function (file, index) {
      var sizeLabel = file.size
        ? " (" + (file.size / 1024).toFixed(1) + " KB)"
        : "";
      var listItem =
        "" +
        '<li class="illegal-register-photo__item">' +
        '<span class="illegal-register-photo__name">' +
        escapeHtml(file.name) +
        sizeLabel +
        "</span>" +
        '<button type="button" class="illegal-register-photo__remove remove-photo-file-btn" data-index="' +
        index +
        '">삭제</button>' +
        "</li>";
      $list.append(listItem);
    });
  }

  /**
   * 등록 모달 내 폼 전체를 초기 상태로 되돌린다.
   * - 입력 필드 리셋
   * - 토글/라디오 버튼 초기화
   * - 조치 이력, 사진 첨부 목록 초기화
   * - 알림 메시지 제거
   */
  function resetRegisterForm() {
    var formElement = $("#illegalRegisterForm")[0];
    if (formElement) {
      formElement.reset();
    }

    $('input[name="categoryOptions"][value="GENERAL"]').prop("checked", true);
    $('input[name="actionStatusOptions"][value="IN_PROGRESS"]').prop(
      "checked",
      true
    );

    resetActionHistoryList();
    state.selectedPhotoFiles = [];
    updatePhotoFileList();
    $("#illegalPhotoFileInput").val("");

    var today = new Date().toISOString().split("T")[0];
    $("#illegalPhotoRegisteredAtInput").val(today);

    clearRegisterAlert();
  }

  /**
   * 조치 이력 입력 필드에서 유효한 항목만 추출한다.
   * @returns {Array<{actionDate: string, description: string}>}
   */
  function collectActionHistories() {
    var histories = [];

    $("#illegalActionHistoryList .illegal-register-history__item").each(
      function () {
        var dateValue = $(this)
          .find(".illegal-register-history__date-input")
          .val();
        var descValue = $(this)
          .find(".illegal-register-history__desc-input")
          .val()
          .trim();

        if (dateValue && descValue) {
          histories.push({
            actionDate: dateValue,
            description: descValue,
          });
        }
      }
    );

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
   * 상단 알림 영역에 메시지를 표시한다.
   * @param {"success"|"danger"|"warning"|"info"} type - 알림 타입
   * @param {string} message - 사용자에게 보여줄 메시지
   */
  function showRegisterAlert(type, message) {
    var $alert = $("#illegalRegisterAlert");
    var modifierClass =
      {
        success: "illegal-register-alert--success",
        danger: "illegal-register-alert--danger",
        warning: "illegal-register-alert--warning",
        info: "illegal-register-alert--info",
      }[type] || "illegal-register-alert--info";

    $alert
      .removeClass(
        "illegal-register-alert--success illegal-register-alert--danger illegal-register-alert--warning illegal-register-alert--info is-visible"
      )
      .addClass(modifierClass + " is-visible")
      .text(message)
      .removeAttr("hidden");
  }

  /**
   * 알림 영역을 숨기고 기본 상태로 초기화한다.
   */
  function clearRegisterAlert() {
    $("#illegalRegisterAlert")
      .removeClass(
        "illegal-register-alert--success illegal-register-alert--danger illegal-register-alert--warning illegal-register-alert--info is-visible"
      )
      .attr("hidden", true)
      .text("");
  }

  /**
   * 외부에서 전달된 지역 정보를 기반으로 폼에 값 채우기.
   * @param {Object} region - 지역 정보 객체
   */
  function fillRegisterForm(region) {
    if (!region) {
      return;
    }
    var resolvedAddress =
      region.address || region.roadAddress || region.jibunAddress || "";
    $("#illegalDetailAddressInput").val(resolvedAddress);
  }

  /**
   * 모달 표시/숨김 시점에 대한 이벤트를 등록한다.
   * - 모달이 열릴 때 오늘 날짜 기본 설정 및 포커스 이동
   * - 모달이 닫힐 때 폼 초기화
   */
  function registerModalEvents() {
    var modalElement = document.getElementById("illegalRegisterModal");
    if (!modalElement) {
      return;
    }

    modalElement.addEventListener("illegalRegisterModal:open", function () {
      if (!$("#illegalPhotoRegisteredAtInput").val()) {
        var today = new Date().toISOString().split("T")[0];
        $("#illegalPhotoRegisteredAtInput").val(today);
      }
      $("#illegalHeadOfficeInput").trigger("focus");
      updatePhotoFileList();
    });

    modalElement.addEventListener("illegalRegisterModal:close", function () {
      resetRegisterForm();
    });
  }

  /**
   * 조치 이력 추가/삭제 버튼에 대한 이벤트를 바인딩한다.
   */
  function bindActionHistoryEvents() {
    $("#illegalAddActionHistoryBtn").on("click", function () {
      $("#illegalActionHistoryList").append(createActionHistoryRow());
    });

    $("#illegalActionHistoryList").on(
      "click",
      ".remove-action-history-btn",
      function () {
        var $items = $(
          "#illegalActionHistoryList .illegal-register-history__item"
        );
        var $targetItem = $(this).closest(".illegal-register-history__item");
        if ($items.length <= 1) {
          $targetItem.find("input").val("");
          return;
        }
        $targetItem.remove();
      }
    );
  }

  /**
   * 사진 업로드 관련 이벤트를 바인딩한다.
   * - 업로드 버튼 클릭 시 파일 선택창 열기
   * - 파일 선택 시 상태 저장 및 리스트 갱신
   * - 리스트 내 삭제 버튼 처리
   */
  function bindPhotoUploadEvents() {
    $("#illegalPhotoUploadBtn").on("click", function () {
      $("#illegalPhotoFileInput").trigger("click");
    });

    $("#illegalPhotoFileInput").on("change", function (event) {
      state.selectedPhotoFiles = Array.from(event.target.files || []);
      updatePhotoFileList();
      $("#illegalPhotoFileInput").val("");
    });

    $("#illegalPhotoFileList").on(
      "click",
      ".remove-photo-file-btn",
      function () {
        var index = Number($(this).data("index"));
        if (!isNaN(index) && index >= 0) {
          state.selectedPhotoFiles.splice(index, 1);
          updatePhotoFileList();
        }
      }
    );
  }

  /**
   * 주소 검색 버튼/링크에 대한 이벤트를 바인딩한다.
   * - 전역에 정의된 openAddressModal 함수가 있으면 실행
   * - 없으면 준비 중 알림
   */
  function bindAddressEvents() {
    $("#illegalDetailAddressSearchBtn").on("click", function () {
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
    if (rawValue === "") {
      return null;
    }

    var parsed = Number(rawValue);
    if (isNaN(parsed)) {
      showRegisterAlert("warning", warningMessage);
      if ($input && $input.length) {
        $input.focus();
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
    var headOffice = $("#illegalHeadOfficeInput").val().trim();
    var branchOffice = $("#illegalBranchOfficeInput").val().trim();
    var routeName = $("#illegalRouteNameInput").val().trim();
    var drivingDirection = $("#illegalDrivingDirectionSelect").val();
    var distanceMark = $("#illegalDistanceMarkInput").val().trim();
    var category = $('input[name="categoryOptions"]:checked').val();
    var detailAddress = $("#illegalDetailAddressInput").val().trim();
    var incidentDate = $("#illegalIncidentDateInput").val();
    var managerName = $("#illegalManagerNameInput").val().trim();
    var actorName = $("#illegalActorNameInput").val().trim();
    var relatedPersonName = $("#illegalRelatedPersonInput").val().trim();
    var actorAddress = $("#illegalActorAddressInput").val().trim();
    var relatedAddress = $("#illegalRelatedAddressInput").val().trim();
    var occupancyRateValue = $("#illegalOccupancyRateInput").val();
    var occupancyAreaValue = $("#illegalOccupancyAreaInput").val();
    var actionStatus = $('input[name="actionStatusOptions"]:checked').val();
    var photoRegisteredAt = $("#illegalPhotoRegisteredAtInput").val();
    var memoValue = null;

    if (!headOffice) {
      showRegisterAlert("warning", "본부를 입력해주세요.");
      $("#illegalHeadOfficeInput").focus();
      return;
    }
    if (!branchOffice) {
      showRegisterAlert("warning", "지사를 입력해주세요.");
      $("#illegalBranchOfficeInput").focus();
      return;
    }
    if (!routeName) {
      showRegisterAlert("warning", "노선명을 입력해주세요.");
      $("#illegalRouteNameInput").focus();
      return;
    }
    if (!drivingDirection) {
      showRegisterAlert("warning", "주행방향을 선택해주세요.");
      $("#illegalDrivingDirectionSelect").focus();
      return;
    }
    if (!incidentDate) {
      showRegisterAlert("warning", "발생일자를 선택해주세요.");
      $("#illegalIncidentDateInput").focus();
      return;
    }
    if (!managerName) {
      showRegisterAlert("warning", "담당자를 입력해주세요.");
      $("#illegalManagerNameInput").focus();
      return;
    }
    if (!actorName) {
      showRegisterAlert("warning", "행위자명을 입력해주세요.");
      $("#illegalActorNameInput").focus();
      return;
    }
    if (!actionStatus) {
      showRegisterAlert("warning", "조치상태를 선택해주세요.");
      return;
    }
    if (!photoRegisteredAt) {
      showRegisterAlert("warning", "사진 등록일을 선택해주세요.");
      $("#illegalPhotoRegisteredAtInput").focus();
      return;
    }

    var occupancyRate = parseOptionalNumber(
      occupancyRateValue,
      "점유율은 숫자로 입력해주세요.",
      $("#illegalOccupancyRateInput")
    );
    if (occupancyRate === undefined) {
      return;
    }

    var occupancyArea = parseOptionalNumber(
      occupancyAreaValue,
      "점유면적은 숫자로 입력해주세요.",
      $("#illegalOccupancyAreaInput")
    );
    if (occupancyArea === undefined) {
      return;
    }

    var actionHistories = collectActionHistories();

    if (state.selectedPhotoFiles.length > 0 && !photoRegisteredAt) {
      showRegisterAlert(
        "warning",
        "사진 등록일을 선택한 뒤 파일을 첨부해주세요."
      );
      $("#illegalPhotoRegisteredAtInput").focus();
      return;
    }

    var photos = state.selectedPhotoFiles.map(function (file) {
      return {
        photoDate: photoRegisteredAt,
        fileName: file.name,
        fileSize: file.size,
        filePath: null,
      };
    });

    var payload = {
      headOffice: headOffice,
      branchOffice: branchOffice,
      routeName: routeName,
      drivingDirection: drivingDirection,
      distanceMark: distanceMark || null,
      category: category,
      detailAddress: detailAddress || null,
      incidentDate: incidentDate,
      managerName: managerName,
      actorName: actorName,
      relatedPersonName: relatedPersonName || null,
      actorAddress: actorAddress || null,
      relatedAddress: relatedAddress || null,
      occupancyRate: occupancyRate,
      occupancyArea: occupancyArea,
      actionStatus: actionStatus,
      photoRegisteredAt: photoRegisteredAt,
      memo: memoValue,
      actionHistories: actionHistories,
      photos: photos,
    };

    toggleSubmitLoading(true);

    $.ajax({
      url: "/regions",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
    })
      .done(function () {
        showRegisterAlert("success", "등록이 완료되었습니다.");
        if (typeof window.loadRecentRegions === "function") {
          window.loadRecentRegions();
        }
      })
      .fail(function (xhr) {
        var message = "저장 중 오류가 발생했습니다.";
        if (xhr.responseJSON && xhr.responseJSON.message) {
          message = xhr.responseJSON.message;
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
    clearAlert: clearRegisterAlert,
    resetForm: resetRegisterForm,
  };

  window.escapeHtml = escapeHtml;
})(window, window.jQuery);
