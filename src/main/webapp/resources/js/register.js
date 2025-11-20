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
   * selectedFiles: 각 파일 타입별로 선택된 파일 정보
   *   - images: 이미지 파일 배열 (날짜와 매핑) [{ date: string, file: File, base64: string, preview: string, id: string }]
   *   - kml: KML 파일
   */
  var state = {
    selectedFiles: {
      images: [], // 날짜와 매핑된 이미지 파일 배열
      kml: null,
    },
    imageItemCounter: 0, // 이미지 아이템 ID 생성용 카운터
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
   * 이미지 아이템 DOM 요소를 생성한다.
   * @param {string} itemId - 아이템 고유 ID
   * @param {string} date - 이미지 등록일 (yyyy-MM-dd)
   * @param {Object} fileData - 파일 데이터 (없으면 null)
   * @returns {jQuery} - 생성된 이미지 아이템의 jQuery 객체
   */
  function createImageItem(itemId, date, fileData) {
    var safeDate = escapeHtml(date || "");
    var $item = $("<div>", {
      class: "illegal-register-image-item",
      "data-image-item-id": itemId,
    });

    var $header = $("<div>", {
      class: "illegal-register-image-item__header",
    });
    var $title = $("<label>", {
      class: "illegal-register-label",
      text: "이미지 #" + (state.selectedFiles.images.length + 1),
    });
    var $removeBtn = $("<button>", {
      type: "button",
      class: "illegal-register-image-item__remove remove-image-item-btn",
      "data-image-item-id": itemId,
      title: "삭제",
      "aria-label": "삭제",
    });
    var $removeIcon = $("<i>", {
      class: "fas fa-times",
    });
    $removeBtn.append($removeIcon);
    $header.append($title).append($removeBtn);

    var $content = $("<div>", {
      class: "illegal-register-image-item__content",
    });

    var $fields = $("<div>", {
      class: "illegal-register-image-item__fields",
    });
    var $dateField = $("<div>", {
      class: "illegal-register-field",
    });
    var $dateLabel = $("<label>", {
      class: "illegal-register-label",
      for: "imageDate_" + itemId,
      html: '이미지 등록일 <span class="illegal-register-form__required">*</span>',
    });
    var $dateInput = $("<input>", {
      type: "date",
      class: "illegal-register-input image-date-input",
      id: "imageDate_" + itemId,
      "data-image-item-id": itemId,
      value: safeDate,
      required: true,
    });
    $dateField.append($dateLabel).append($dateInput);

    var $fileField = $("<div>", {
      class: "illegal-register-field",
    });
    var $fileLabel = $("<label>", {
      class: "illegal-register-label",
      for: "imageFileBtn_" + itemId,
      text: "파일 선택",
    });
    var $fileBtn = $("<button>", {
      type: "button",
      class: "illegal-register-button illegal-register-button--outline image-file-btn",
      id: "imageFileBtn_" + itemId,
      "data-image-item-id": itemId,
    });
    var $fileIcon = $("<i>", {
      class: "fas fa-upload",
      "aria-hidden": "true",
    });
    var $fileText = $("<span>", {
      class: "illegal-register-button__text",
      text: "PNG 파일 선택",
    });
    $fileBtn.append($fileIcon).append($fileText);
    $fileField.append($fileLabel).append($fileBtn);

    var $fileInput = $("<input>", {
      type: "file",
      class: "image-file-input",
      id: "imageFileInput_" + itemId,
      "data-image-item-id": itemId,
      accept: ".png",
      hidden: true,
    });

    $fields.append($dateField).append($fileField);

    var $preview = $("<div>", {
      class: "illegal-register-image-item__preview",
      id: "imagePreview_" + itemId,
    });

    if (fileData && fileData.preview) {
      var $previewItem = createImagePreviewItem(fileData);
      $preview.append($previewItem);
    } else {
      var $placeholder = $("<div>", {
        class: "illegal-register-image-item__preview-empty",
        text: "선택된 파일이 없습니다.",
      });
      $preview.append($placeholder);
    }

    $content.append($fields).append($preview).append($fileInput);
    $item.append($header).append($content);

    return $item;
  }

  /**
   * 이미지 미리보기 아이템을 생성한다.
   * @param {Object} fileData - 파일 데이터 객체
   * @returns {jQuery} - 생성된 미리보기 아이템의 jQuery 객체
   */
  function createImagePreviewItem(fileData) {
    var $item = $("<div>", {
      class: "illegal-register-file-upload__item",
    });

    var $itemInfo = $("<div>", {
      class: "illegal-register-file-upload__item-info",
    });

    var $icon = $("<div>", {
      class: "illegal-register-file-upload__item-icon illegal-register-file-upload__item-icon--image",
    });
    var $iconElement = $("<i>", {
      class: "fas fa-image",
    });
    $icon.append($iconElement);

    var $details = $("<div>", {
      class: "illegal-register-file-upload__item-details",
    });
    var $name = $("<div>", {
      class: "illegal-register-file-upload__item-name",
      text: escapeHtml(fileData.file.name),
    });
    var $size = $("<div>", {
      class: "illegal-register-file-upload__item-size",
      text: formatFileSize(fileData.file.size),
    });
    $details.append($name).append($size);

    $itemInfo.append($icon).append($details);

    if (fileData.preview) {
      var $previewImg = $("<img>", {
        class: "illegal-register-file-upload__item-preview",
        src: fileData.preview,
        alt: escapeHtml(fileData.file.name),
      });
      $itemInfo.append($previewImg);
    }

    $item.append($itemInfo);

    return $item;
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
   * 파일을 base64로 인코딩한다.
   * @param {File} file - 인코딩할 파일 객체
   * @returns {Promise<string>} - base64 인코딩된 문자열 (data URL 형식)
   */
  function encodeFileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function (error) {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * 파일 타입에 따른 아이콘 클래스를 반환한다.
   * @param {string} fileType - 파일 타입 ('image', 'kml')
   * @returns {string} - FontAwesome 아이콘 클래스
   */
  function getFileIconClass(fileType) {
    switch (fileType) {
      case "image":
        return "fas fa-image";
      case "kml":
        return "fas fa-map";
      default:
        return "fas fa-file";
    }
  }

  /**
   * 파일 크기를 읽기 쉬운 형식으로 변환한다.
   * @param {number} bytes - 바이트 단위 크기
   * @returns {string} - 변환된 크기 문자열
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    var k = 1024;
    var sizes = ["Bytes", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * 특정 이미지 아이템의 미리보기를 갱신한다.
   * @param {string} itemId - 이미지 아이템 ID
   */
  function updateImageItemPreview(itemId) {
    var $preview = $("#imagePreview_" + itemId);
    var imageItem = state.selectedFiles.images.find(function (img) {
      return img.id === itemId;
    });

    $preview.empty();

    if (!imageItem || !imageItem.fileData) {
      var $placeholder = $("<div>", {
        class: "illegal-register-image-item__preview-empty",
        text: "선택된 파일이 없습니다.",
      });
      $preview.append($placeholder);
      return;
    }

    var $previewItem = createImagePreviewItem(imageItem.fileData);
    $preview.append($previewItem);
  }

  /**
   * 모든 파일 미리보기를 갱신한다.
   */
  function updateAllFilePreviews() {
    // 이미지 아이템들의 미리보기를 갱신
    $("#imageList .illegal-register-image-item").each(function () {
      var itemId = $(this).data("image-item-id");
      if (itemId) {
        updateImageItemPreview(itemId);
      }
    });
    // KML 파일 미리보기 갱신
    updateKmlPreview();
  }

  /**
   * KML 파일 미리보기를 갱신한다.
   */
  function updateKmlPreview() {
    var $preview = $("#kmlFilePreview");
    var fileData = state.selectedFiles.kml;

    $preview.empty();

    if (!fileData) {
      var $placeholder = $("<div>", {
        class: "illegal-register-file-upload__placeholder",
        text: "선택된 파일이 없습니다.",
      });
      $preview.append($placeholder);
      return;
    }

    var $item = $("<div>", {
      class: "illegal-register-file-upload__item",
    });

    var $itemInfo = $("<div>", {
      class: "illegal-register-file-upload__item-info",
    });

    var $icon = $("<div>", {
      class: "illegal-register-file-upload__item-icon illegal-register-file-upload__item-icon--kml",
    });
    var $iconElement = $("<i>", {
      class: "fas fa-map",
    });
    $icon.append($iconElement);

    var $details = $("<div>", {
      class: "illegal-register-file-upload__item-details",
    });
    var $name = $("<div>", {
      class: "illegal-register-file-upload__item-name",
      text: escapeHtml(fileData.file.name),
    });
    var $size = $("<div>", {
      class: "illegal-register-file-upload__item-size",
      text: formatFileSize(fileData.file.size),
    });
    $details.append($name).append($size);

    $itemInfo.append($icon).append($details);

    var $removeBtn = $("<button>", {
      type: "button",
      class: "illegal-register-file-upload__item-remove",
      "data-file-type": "kml",
      title: "삭제",
      "aria-label": "삭제",
    });
    var $removeIcon = $("<i>", {
      class: "fas fa-times",
    });
    $removeBtn.append($removeIcon);

    $item.append($itemInfo).append($removeBtn);
    $preview.append($item);
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
    state.selectedFiles = {
      images: [],
      kml: null,
    };
    state.imageItemCounter = 0;
    $("#imageList").empty();
    updateAllFilePreviews();
    $("#kmlFileInput").val("");

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
      updateAllFilePreviews();

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
   * 파일 업로드 관련 이벤트를 바인딩한다.
   * - 각 파일 타입별 업로드 버튼 클릭 시 파일 선택창 열기
   * - 파일 선택 시 base64 인코딩 및 상태 저장
   * - 미리보기 갱신 및 삭제 버튼 처리
   */
  function bindFileUploadEvents() {
    // 이미지 추가 버튼 이벤트는 register-modal.jsp에서 처리하므로 제거
    // $("#addImageBtn").on("click", function () {
    //   var itemId = "image_" + (++state.imageItemCounter);
    //   var today = new Date().toISOString().split("T")[0];
    //   var $imageItem = createImageItem(itemId, today, null);
    //   $("#imageList").append($imageItem);
    // });

    // 동적으로 추가된 이미지 파일 버튼 클릭 이벤트
    $(document).on("click", ".image-file-btn", function () {
      var itemId = $(this).data("image-item-id");
      var $fileInput = $("#imageFileInput_" + itemId);
      $fileInput.trigger("click");
    });

    // 동적으로 추가된 이미지 파일 선택 이벤트
    $(document).on("change", ".image-file-input", function () {
      var $input = $(this);
      var itemId = $input.data("image-item-id");
      var file = $input[0].files && $input[0].files[0];

      if (!file) {
        return;
      }

      // PNG 파일만 허용
      var fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".png")) {
        showRegisterAlert("warning", "PNG 파일만 선택할 수 있습니다.");
        $input.val("");
        return;
      }

      // 파일 크기 제한 (예: 50MB)
      var maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        showRegisterAlert("warning", "파일 크기는 50MB 이하여야 합니다.");
        $input.val("");
        return;
      }

      // base64 인코딩 및 미리보기 생성
      encodeFileToBase64(file)
        .then(function (base64) {
          var fileData = {
            file: file,
            base64: base64,
            preview: base64, // PNG 이미지는 base64를 그대로 사용
          };

          // 이미지 아이템 찾기 또는 생성
          var imageItem = state.selectedFiles.images.find(function (img) {
            return img.id === itemId;
          });

          if (!imageItem) {
            imageItem = {
              id: itemId,
              date: $("#imageDate_" + itemId).val() || "",
              fileData: fileData,
            };
            state.selectedFiles.images.push(imageItem);
          } else {
            imageItem.fileData = fileData;
          }

          updateImageItemPreview(itemId);
          $input.val("");
        })
        .catch(function (error) {
          console.error("파일 인코딩 오류:", error);
          showRegisterAlert("danger", "파일을 읽는 중 오류가 발생했습니다.");
          $input.val("");
        });
    });

    // 이미지 날짜 변경 이벤트
    $(document).on("change", ".image-date-input", function () {
      var itemId = $(this).data("image-item-id");
      var date = $(this).val();
      var imageItem = state.selectedFiles.images.find(function (img) {
        return img.id === itemId;
      });

      if (imageItem) {
        imageItem.date = date || "";
      }
    });

    // 이미지 아이템 삭제 버튼 이벤트
    $(document).on("click", ".remove-image-item-btn", function () {
      var itemId = $(this).data("image-item-id");
      var $item = $("[data-image-item-id='" + itemId + "']");
      $item.remove();

      // 상태에서도 제거
      state.selectedFiles.images = state.selectedFiles.images.filter(function (img) {
        return img.id !== itemId;
      });
    });

    // KML 파일 업로드 버튼 이벤트
    $("#kmlFileUploadBtn").on("click", function () {
      $("#kmlFileInput").trigger("click");
    });

    // KML 파일 선택 이벤트
    $("#kmlFileInput").on("change", function () {
      var $input = $(this);
      var file = $input[0].files && $input[0].files[0];

      if (!file) {
        return;
      }

      // KML 파일 검증
      if (!file.name.toLowerCase().endsWith(".kml")) {
        showRegisterAlert("warning", "올바른 KML 파일을 선택해주세요.");
        $input.val("");
        return;
      }

      // 파일 크기 제한 (예: 50MB)
      var maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        showRegisterAlert("warning", "파일 크기는 50MB 이하여야 합니다.");
        $input.val("");
        return;
      }

      // base64 인코딩
      encodeFileToBase64(file)
        .then(function (base64) {
          state.selectedFiles.kml = {
            file: file,
            base64: base64,
          };
          updateKmlPreview();
          $input.val("");
        })
        .catch(function (error) {
          console.error("파일 인코딩 오류:", error);
          showRegisterAlert("danger", "파일을 읽는 중 오류가 발생했습니다.");
          $input.val("");
        });
    });

    // KML 파일 삭제 버튼 이벤트
    $(document).on("click", ".illegal-register-file-upload__item-remove[data-file-type='kml']", function () {
      state.selectedFiles.kml = null;
      updateKmlPreview();
      $("#kmlFileInput").val("");
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

    // 이미지 데이터 검증 및 수집 (register-modal.jsp의 히든 필드에서 읽기)
    var images = [];
    var hasInvalidImage = false;

    // register-modal.jsp에서 생성된 모든 imageMappingData 히든 필드 수집
    var $mappingDataInputs = $('input[name="imageMappingData[]"]');

    $mappingDataInputs.each(function () {
      var $input = $(this);
      var mappingData = $input.val();

      if (!mappingData || mappingData.trim() === "") {
        return; // 매핑 데이터가 없으면 건너뛰기
      }

      // 날짜:base64||날짜:base64 형식으로 저장된 데이터 파싱
      var mappings = mappingData.split("||");

      mappings.forEach(function (mapping) {
        if (!mapping || mapping.trim() === "") {
          return;
        }

        var parts = mapping.split(":");
        if (parts.length !== 2) {
          return; // 형식이 맞지 않으면 건너뛰기
        }

        var imageDate = parts[0]; // yyyy-MM-dd 형식
        var base64Content = parts[1]; // base64 데이터 (data:image/xxx;base64, 제외)

        if (!imageDate || imageDate.trim() === "") {
          hasInvalidImage = true;
          return;
        }

        // base64를 완전한 형식으로 변환 (확장자 추정)
        var mimeType = "image/png";
        var extension = "png";

        // base64 데이터 시작 부분을 확인하여 타입 판단
        var firstChars = base64Content.substring(0, 10);
        if (
          firstChars.startsWith("/9j/") ||
          base64Content.substring(0, 20).includes("JFIF") ||
          base64Content.substring(0, 20).includes("Exif")
        ) {
          // JPEG
          mimeType = "image/jpeg";
          extension = "jpg";
        } else if (firstChars.startsWith("iVBORw0KGgo")) {
          // PNG
          mimeType = "image/png";
          extension = "png";
        } else {
          // 기본값 PNG
          mimeType = "image/png";
          extension = "png";
        }

        var fullBase64 = "data:" + mimeType + ";base64," + base64Content;

        // base64에서 파일 크기 추정 (대략적)
        var size = Math.round(base64Content.length * 0.75);

        // 이미지 등록일을 yyyyMMdd 형식으로 변환
        var dateObj = new Date(imageDate);
        if (isNaN(dateObj.getTime())) {
          hasInvalidImage = true;
          return;
        }

        var year = dateObj.getFullYear();
        var month = String(dateObj.getMonth() + 1).padStart(2, "0");
        var day = String(dateObj.getDate()).padStart(2, "0");
        var imageOcrnDatesFormatted = year + month + day;

        // 파일명 생성 (날짜 기반)
        var filename =
          "image_" +
          imageOcrnDatesFormatted +
          "_" +
          Date.now() +
          "_" +
          Math.floor(Math.random() * 10000) +
          "." +
          extension;

        images.push({
          filename: filename,
          base64: fullBase64,
          size: size,
          extension: extension,
          ocrnDates: imageOcrnDatesFormatted,
          date: imageDate,
        });
      });
    });

    // 기존 state.selectedFiles.images도 확인 (하위 호환성)
    if (state.selectedFiles && state.selectedFiles.images && state.selectedFiles.images.length > 0) {
      state.selectedFiles.images.forEach(function (imageItem) {
        if (!imageItem.fileData) {
          return;
        }

        if (!imageItem.date || imageItem.date.trim() === "") {
          showRegisterAlert("warning", "모든 이미지의 등록일을 선택해주세요.");
          $("#imageDate_" + imageItem.id).trigger("focus");
          hasInvalidImage = true;
          return;
        }

        var date = new Date(imageItem.date);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        var imageOcrnDatesFormatted = year + month + day;

        images.push({
          filename: imageItem.fileData.file.name,
          base64: imageItem.fileData.base64,
          size: imageItem.fileData.file.size,
          extension: "png",
          ocrnDates: imageOcrnDatesFormatted,
          date: imageItem.date,
        });
      });
    }

    if (hasInvalidImage) {
      showRegisterAlert("warning", "모든 이미지의 등록일을 선택해주세요.");
      return;
    }

    // 파일 데이터 수집 (base64 인코딩된 데이터)
    var files = {
      images: images, // 날짜와 매핑된 이미지 배열
      kml: null,
    };

    if (state.selectedFiles.kml) {
      files.kml = {
        filename: state.selectedFiles.kml.file.name,
        base64: state.selectedFiles.kml.base64,
        size: state.selectedFiles.kml.file.size,
      };
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
      files: files,
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
    bindFileUploadEvents();
    bindAddressEvents();
    $("#illegalRegisterSubmitBtn").on("click", handleSubmit);

    // 모달이 열릴 때 이미지 아이템 하나 자동 추가
    $("#illegalRegisterModal").on("illegalRegisterModal:open", function () {
      if ($("#imageList .illegal-register-image-item").length === 0) {
        $("#addImageBtn").trigger("click");
      }
    });
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
