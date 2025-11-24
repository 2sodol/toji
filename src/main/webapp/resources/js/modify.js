(function (window, $) {
  /**
   * modify.js
   * - 불법 점유 수정 모달에서 사용하는 클라이언트 로직
   * - register.js에서 수정 기능을 분리하여 독립적으로 관리
   */
  "use strict";

  if (!$) {
    console.error("modify.js는 jQuery가 필요합니다.");
    return;
  }

  /**
   * 모듈 내부에서 공유되는 상태 값
   */
  var state = {
    selectedFiles: {
      images: [],
      kml: null,
    },
    imageItemCounter: 0,
    modifySeq: null, // 수정할 불법점용정보 SEQ
    deletedFileIds: [], // 삭제된 파일 ID 목록
  };

  /**
   * XSS 방지를 위한 HTML 이스케이프 유틸 함수
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
   * 토스트 메시지 표시
   * @param {"success"|"danger"|"warning"|"info"} type - 알림 타입
   * @param {string} message - 사용자에게 보여줄 메시지
   */
  function showModifyAlert(type, message) {
    // register.js의 showRegisterAlert 재사용
    if (typeof window.showRegisterAlert === "function") {
      window.showRegisterAlert(type, message);
    } else {
      alert(message);
    }
  }

  /**
   * 수정 모달을 열고 기존 데이터를 로드한다
   * @param {number} seq - 불법점용정보 SEQ
   */
  function openModifyModal(seq) {
    try {
      // seq 파라미터 검증
      if (seq === undefined || seq === null) {
        showModifyAlert("warning", "수정할 데이터 정보가 없습니다.");
        return;
      }

      // seq가 문자열이면 숫자로 변환
      var modifySeq = seq;
      if (typeof modifySeq === "string") {
        modifySeq = parseInt(modifySeq, 10);
      }

      if (!modifySeq || isNaN(modifySeq)) {
        showModifyAlert("warning", "올바르지 않은 데이터 정보입니다.");
        return;
      }

      // 상태 저장
      state.modifySeq = modifySeq;

      // 삭제 버튼 표시
      $("#illegalModifyDeleteBtn").show();

      // 모달 열기
      if (window.IllegalModifyModal && typeof window.IllegalModifyModal.open === "function") {
        window.IllegalModifyModal.open();
      } else {
        showModifyAlert("danger", "모달을 열 수 없습니다.");
        return;
      }

      // 기존 데이터 로드
      loadModifyData(modifySeq);
    } catch (error) {
      showModifyAlert("danger", "수정 모달을 열 수 없습니다: " + error.message);
    }
  }

  /**
   * 서버에서 수정할 데이터를 로드한다
   * @param {number} seq - 불법점용정보 SEQ
   */
  function loadModifyData(seq) {
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
          fillModifyForm(response.data);
        } else {
          showModifyAlert("warning", "데이터를 불러올 수 없습니다.");
        }
      })
      .fail(function (xhr, status, error) {
        showModifyAlert("danger", "서버 오류가 발생했습니다.");
      });
  }

  /**
   * 수정 폼에 기존 데이터를 채운다
   * @param {Object} data - 상세정보 데이터
   */
  function fillModifyForm(data) {
    var basicInfo = data.basicInfo;
    var actionHistories = data.actionHistories || [];

    if (!basicInfo) {
      return;
    }

    // 기본정보 필드 채우기 (modify-modal.jsp의 ID 사용)
    $("#modifyhdqrNm").val(basicInfo.hdqrNm || "");
    $("#modifymtnofNm").val(basicInfo.mtnofNm || "");
    $("#modifyrouteCd").val(basicInfo.routeCd || "");
    $("#modifydrveDrctCd")
      .val(basicInfo.drveDrctCd || "")
      .prop("disabled", false);
    $("#modifyrouteDstnc")
      .val(basicInfo.routeDstnc || "")
      .prop("readonly", false);
    $('input[name="modifystrcClssCd"][value="' + (basicInfo.strcClssCd || "GENERAL") + '"]').prop("checked", true);
    $("#modifylndsLdnoAddr").val(basicInfo.lndsLdnoAddr || "");

    // 발생 및 관계자 정보
    if (basicInfo.ocrnDates) {
      var ocrnDatesStr = String(basicInfo.ocrnDates);
      if (ocrnDatesStr.length === 8) {
        var formattedDate =
          ocrnDatesStr.substring(0, 4) + "-" + ocrnDatesStr.substring(4, 6) + "-" + ocrnDatesStr.substring(6, 8);
        $("#modifyocrnDates").val(formattedDate);
      }
    }
    $("#modifyprchEmno").val(basicInfo.prchEmno || "");
    $("#modifytrnrNm").val(basicInfo.trnrNm || "");
    $("#modifyrltrNm").val(basicInfo.rltrNm || "");
    $("#modifytrnrAddr").val(basicInfo.trnrAddr || "");
    $("#modifyrltrAddr").val(basicInfo.rltrAddr || "");

    // 점유 및 조치 정보
    $("#modifyilglPssrt").val(basicInfo.ilglPssrt || "");
    $("#modifyilglPssnSqms").val(basicInfo.ilglPssnSqms || "");
    $('input[name="modifyilglPrvuActnStatVal"][value="' + (basicInfo.ilglPrvuActnStatVal || "IN_PROGRESS") + '"]').prop(
      "checked",
      true
    );

    // 히든 필드
    $("#modifylndsUnqNo").val(basicInfo.lndsUnqNo || "");
    $("#modifygpsLgtd").val(basicInfo.gpsLgtd || "");
    $("#modifygpsLttd").val(basicInfo.gpsLttd || "");

    // 조치 이력 채우기
    $("#modifyactionHistoryList").empty();
    if (actionHistories && actionHistories.length > 0) {
      actionHistories.forEach(function (history) {
        var formattedDate = "";
        if (history.actnDttm) {
          try {
            var dateStr = String(history.actnDttm);
            if (dateStr.length >= 8) {
              var date = new Date(
                dateStr.substring(0, 4),
                parseInt(dateStr.substring(4, 6)) - 1,
                dateStr.substring(6, 8)
              );
              formattedDate =
                date.getFullYear() +
                "-" +
                String(date.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(date.getDate()).padStart(2, "0");
            }
          } catch (error) {
            formattedDate = "";
          }
        }

        var $row = createActionHistoryRow(formattedDate, history.actnCtnt || "");
        $("#modifyactionHistoryList").append($row);
      });
    } else {
      $("#modifyactionHistoryList").append(createActionHistoryRow());
    }

    // 이미지 로드
    if (state.modifySeq) {
      loadModifyImages(state.modifySeq);
    }
  }

  /**
   * 조치 이력 행 DOM 요소를 생성한다
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
      name: "actnDttm",
      class: "illegal-register-input illegal-register-history__date-input",
      value: safeDate,
    });
    $dateDiv.append($dateInput);

    var $descDiv = $("<div>", {
      class: "illegal-register-history__desc",
    });
    var $descInput = $("<input>", {
      type: "text",
      name: "actnCtnt",
      class: "illegal-register-input illegal-register-history__desc-input",
      placeholder: "예: 구두주의, 경고 등",
      maxlength: "500",
      value: safeDesc,
    });
    $descDiv.append($descInput);

    var $actionsDiv = $("<div>", {
      class: "illegal-register-history__actions",
    });

    // 삭제 버튼 추가 (첫 번째 행이 아닌 경우)
    var currentCount = $("#modifyactionHistoryList .illegal-register-history__item").length;
    if (currentCount > 0) {
      var $removeBtn = $("<button>", {
        type: "button",
        class: "illegal-register-history__remove",
        title: "삭제",
        "aria-label": "삭제",
      });
      var $removeIcon = $("<i>", {
        class: "fas fa-times",
        "aria-hidden": "true",
      });
      $removeBtn.append($removeIcon);
      $removeBtn.on("click", function () {
        $(this).closest(".illegal-register-history__item").remove();
      });
      $actionsDiv.append($removeBtn);
    }

    $row.append($dateDiv).append($descDiv).append($actionsDiv);
    return $row;
  }

  /**
   * 수정 모드에서 기존 이미지를 로드한다
   * @param {number} seq - 불법점용정보 SEQ
   */
  function loadModifyImages(seq) {
    $.ajax({
      url: "/regions/photos",
      method: "GET",
      data: {
        ilglPrvuInfoSeq: seq,
      },
      dataType: "json",
    })
      .done(function (response) {
        if (response.success && response.data && response.data.photos) {
          renderModifyImages(response.data.photos);
        }
      })
      .fail(function (xhr, status, error) {
        // 이미지 로드 실패 시 무시
      });
  }

  /**
   * 수정 모드에서 기존 이미지를 렌더링한다
   * @param {Array} photos - 이미지 배열
   */
  function renderModifyImages(photos) {
    // 이미지 리스트 초기화
    $("#modifyimageList").empty();
    state.selectedFiles.images = [];

    if (!photos || photos.length === 0) {
      // 이미지가 없으면 기본 아이템 하나 추가
      $("#modifyaddImageBtn").trigger("click");
      return;
    }

    // 날짜별로 그룹화
    var imagesByDate = {};
    photos.forEach(function (photo) {
      var date = photo.ocrnDates || "";
      if (!imagesByDate[date]) {
        imagesByDate[date] = [];
      }
      imagesByDate[date].push(photo);
    });

    // 날짜별로 이미지 아이템 생성
    Object.keys(imagesByDate).forEach(function (date) {
      var datePhotos = imagesByDate[date];
      var formattedDate = "";

      if (date && date.length === 8) {
        formattedDate = date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
      }

      state.imageItemCounter++;
      var itemId = "modifyimageItem_" + state.imageItemCounter;

      // modify-modal.jsp의 이미지 아이템 구조 사용
      var $imageItem = $("<div>", {
        class: "illegal-register-image-item",
        "data-item-id": itemId,
      });

      var $content = $("<div>", {
        class: "illegal-register-image-item__content",
      });

      var $header = $("<div>", {
        class: "illegal-register-image-item__header",
      });

      var $numberSpan = $("<span>", {
        class: "illegal-register-image-item__number",
        text: "#" + state.imageItemCounter,
      });

      $header.append($numberSpan);

      // 삭제 버튼 (첫 번째 아이템이 아닌 경우)
      if (state.imageItemCounter > 1) {
        var $removeBtn = $("<button>", {
          type: "button",
          class: "illegal-register-image-item__remove",
          "data-item-id": itemId,
          title: "삭제",
          "aria-label": "삭제",
        });
        var $removeIcon = $("<i>", {
          class: "fas fa-times",
          "aria-hidden": "true",
        });
        $removeBtn.append($removeIcon);
        $removeBtn.on("click", function () {
          var id = $(this).data("item-id");
          $('[data-item-id="' + id + '"]').remove();
        });
        $header.append($removeBtn);
      }

      var $row = $("<div>", {
        class: "illegal-register-image-item__row",
      });

      var $dateField = $("<div>", {
        class: "illegal-register-field illegal-register-field--inline",
        style: "position: relative;",
      });

      var $dateInput = $("<input>", {
        type: "date",
        class: "illegal-register-input",
        id: "modifyimageDate_" + itemId,
        value: formattedDate,
        required: true,
      });

      var $requiredMark = $("<span>", {
        class: "illegal-register-form__required",
        style: "position: absolute; top: -5px; right: -10px;",
        text: "*",
      });

      $dateField.append($dateInput).append($requiredMark);

      var $selectBtn = $("<button>", {
        type: "button",
        class:
          "illegal-register-button illegal-register-button--outline illegal-register-button--sm illegal-register-image-item__select-btn",
        "data-item-id": itemId,
      });

      var $uploadIcon = $("<i>", {
        class: "fas fa-upload",
        "aria-hidden": "true",
      });

      var $btnText = $("<span>", {
        class: "illegal-register-button__text",
        text: "선택",
      });

      $selectBtn.append($uploadIcon).append($btnText);
      $selectBtn.on("click", function () {
        var id = $(this).data("item-id");
        $("#modifyimageFileInput_" + id).click();
      });

      $row.append($dateField).append($selectBtn);

      var $previewSection = $("<div>", {
        class: "illegal-register-image-item__preview-section",
      });

      var $preview = $("<div>", {
        class: "illegal-register-image-item__preview has-images",
        id: "modifyimagePreview_" + itemId,
      });

      // 이미지 썸네일 추가
      datePhotos.forEach(function (photo) {
        var imageId = "modifyimg_" + photo.ilglAttflSeq;
        var imageUrl = "/regions/photo/" + photo.ilglAttflSeq;

        var $thumbnail = $("<div>", {
          class: "illegal-register-image-thumbnail",
          "data-image-id": imageId,
        });

        var $img = $("<img>", {
          class: "illegal-register-image-thumbnail__img",
          src: imageUrl,
          alt: photo.attflNm || "이미지",
        });

        var $removeBtn = $("<button>", {
          type: "button",
          class: "illegal-register-image-thumbnail__remove",
          "aria-label": "삭제",
        });

        var $removeIcon = $("<i>", {
          class: "fas fa-times",
          "aria-hidden": "true",
        });

        $removeBtn.append($removeIcon);
        $removeBtn.on("click", function (e) {
          e.stopPropagation();
          // 삭제된 파일 ID 추가
          state.deletedFileIds.push(photo.ilglAttflSeq);
          $thumbnail.remove();

          // 남은 썸네일이 없으면 플레이스홀더 표시
          if ($preview.find(".illegal-register-image-thumbnail").length === 0) {
            $preview.removeClass("has-images");
            var $placeholder = $("<span>", {
              class: "illegal-register-image-item__preview-empty",
              html: '<i class="fas fa-image" aria-hidden="true"></i>선택된 파일이 없습니다.',
            });
            $preview.append($placeholder);
          }
        });

        $thumbnail.append($img).append($removeBtn);
        $preview.append($thumbnail);

        // 상태에 추가
        state.selectedFiles.images.push({
          id: itemId + "_" + photo.ilglAttflSeq,
          date: formattedDate,
          isExisting: true,
          existingId: photo.ilglAttflSeq,
        });
      });

      $previewSection.append($preview);

      // 숨겨진 파일 입력
      var $fileInput = $("<input>", {
        type: "file",
        class: "image-file-input",
        id: "modifyimageFileInput_" + itemId,
        "data-item-id": itemId,
        accept: ".png,.jpg,.jpeg",
        hidden: true,
      });

      // 숨겨진 매핑 데이터 입력
      var $mappingInput = $("<input>", {
        type: "hidden",
        id: "mappingData_" + itemId,
        name: "imageMappingData[]",
      });

      $content.append($header).append($row).append($previewSection).append($fileInput).append($mappingInput);
      $imageItem.append($content);

      $("#modifyimageList").append($imageItem);
    });

    // 이미지가 없으면 기본 아이템 하나 추가
    if ($("#modifyimageList .illegal-register-image-item").length === 0) {
      $("#modifyaddImageBtn").trigger("click");
    }
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
   * 이미지 아이템을 생성한다 (빈 입력 폼)
   */
  function createImageItem() {
    state.imageItemCounter++;
    var itemId = "modifyimageItem_" + state.imageItemCounter;

    var $imageItem = $("<div>", {
      class: "illegal-register-image-item",
      "data-item-id": itemId,
    });

    var $content = $("<div>", {
      class: "illegal-register-image-item__content",
    });

    var $header = $("<div>", {
      class: "illegal-register-image-item__header",
    });

    var $numberSpan = $("<span>", {
      class: "illegal-register-image-item__number",
      text: "#" + state.imageItemCounter,
    });

    $header.append($numberSpan);

    // 삭제 버튼 (첫 번째 아이템이 아닌 경우)
    if (state.imageItemCounter > 1) {
      var $removeBtn = $("<button>", {
        type: "button",
        class: "illegal-register-image-item__remove",
        "data-item-id": itemId,
        title: "삭제",
        "aria-label": "삭제",
      });
      var $removeIcon = $("<i>", {
        class: "fas fa-times",
        "aria-hidden": "true",
      });
      $removeBtn.append($removeIcon);
      $removeBtn.on("click", function () {
        var id = $(this).data("item-id");
        $('[data-item-id="' + id + '"]').remove();
      });
      $header.append($removeBtn);
    }

    var $row = $("<div>", {
      class: "illegal-register-image-item__row",
    });

    var $dateField = $("<div>", {
      class: "illegal-register-field illegal-register-field--inline",
      style: "position: relative;",
    });

    var $dateInput = $("<input>", {
      type: "date",
      class: "illegal-register-input",
      id: "modifyimageDate_" + itemId,
      required: true,
    });

    var $requiredMark = $("<span>", {
      class: "illegal-register-form__required",
      style: "position: absolute; top: -5px; right: -10px;",
      text: "*",
    });

    $dateField.append($dateInput).append($requiredMark);

    var $selectBtn = $("<button>", {
      type: "button",
      class:
        "illegal-register-button illegal-register-button--outline illegal-register-button--sm illegal-register-image-item__select-btn",
      "data-item-id": itemId,
    });

    var $uploadIcon = $("<i>", {
      class: "fas fa-upload",
      "aria-hidden": "true",
    });

    var $btnText = $("<span>", {
      class: "illegal-register-button__text",
      text: "선택",
    });

    $selectBtn.append($uploadIcon).append($btnText);
    $selectBtn.on("click", function () {
      var id = $(this).data("item-id");
      $("#modifyimageFileInput_" + id).click();
    });

    $row.append($dateField).append($selectBtn);

    var $previewSection = $("<div>", {
      class: "illegal-register-image-item__preview-section",
    });

    var $preview = $("<div>", {
      class: "illegal-register-image-item__preview",
      id: "modifyimagePreview_" + itemId,
    });

    var $placeholder = $("<span>", {
      class: "illegal-register-image-item__preview-empty",
      html: '<i class="fas fa-image" aria-hidden="true"></i>선택된 파일이 없습니다.',
    });
    $preview.append($placeholder);

    $previewSection.append($preview);

    // 숨겨진 파일 입력
    var $fileInput = $("<input>", {
      type: "file",
      class: "image-file-input",
      id: "modifyimageFileInput_" + itemId,
      "data-item-id": itemId,
      accept: ".png,.jpg,.jpeg",
      hidden: true,
    });

    // 숨겨진 매핑 데이터 입력
    var $mappingInput = $("<input>", {
      type: "hidden",
      id: "mappingData_" + itemId, // modify-modal.jsp와 패턴이 다를 수 있으므로 확인 필요하나 일단 이렇게 생성
      name: "imageMappingData[]",
    });
    // 주의: handleModifySubmit에서는 $mappingDataInputs.each ... inputId.indexOf('modifyimageItem_') === -1 체크함
    // 따라서 ID를 modifyimageItem_ 패턴을 포함하도록 해야 함?
    // handleModifySubmit 로직:
    // var inputId = $input.attr('id');
    // if (!inputId || inputId.indexOf('modifyimageItem_') === -1) return;
    // 따라서 hidden input ID는 modifyimageItem_을 포함해야 함.
    // 하지만 위 코드는 input type=file만 있고 hidden input이 없음.
    // renderModifyImages에서도 hidden input을 생성하지 않고 있음. JSP에서 생성된 구조를 사용하는 것 같음.
    // 하지만 동적으로 추가할 때는 JS가 생성해야 함.

    // renderModifyImages 코드를 다시 보면, hidden input name="imageMappingData[]"를 가진 input이 없음.
    // 아, JSP에서 imageMappingData[]를 가진 input이 생성되어야 하는데,
    // renderModifyImages는 기존 이미지만 보여주고, 파일 업로드 시에는 handleImageFileSelect가 hidden input을 채워야 함.
    // handleImageFileSelect에서 hidden input을 생성하거나 값을 설정해야 함.

    // renderModifyImages에서는 imageMappingData[] input을 생성하지 않고 있음.
    // 이는 기존 이미지가 수정되지 않는다는 전제 하에 그런 것일 수도 있음.
    // 하지만 기존 이미지를 삭제하거나 새 이미지를 추가할 때 문제가 됨.

    // 다시 handleModifySubmit을 보면:
    // $('input[name="imageMappingData[]"]').each(...)
    // 따라서 동적으로 추가된 아이템에도 name="imageMappingData[]" 인 input이 있어야 함.

    // createRegisterImageItemHtml (JSP 내장 스크립트) 참고:
    // '<input type="hidden" id="mappingData_' + itemId + '" name="imageMappingData[]" />'

    // 따라서 여기서도 추가해야 함.
    // itemId는 modifyimageItem_X 형식이므로, inputId.indexOf('modifyimageItem_') 체크를 통과하려면
    // id="mappingData_modifyimageItem_X" 와 같이 하면 됨.

    $mappingInput.attr("id", "mappingData_" + itemId);

    $content.append($header).append($row).append($previewSection).append($fileInput).append($mappingInput);
    $imageItem.append($content);

    $("#modifyimageList").append($imageItem);
  }

  /**
   * 파일 선택 시 처리 핸들러
   */
  function handleImageFileSelect(event) {
    var $input = $(event.target);
    var itemId = $input.data("item-id");
    var files = event.target.files;

    if (!files || files.length === 0) return;

    var file = files[0];

    // 유효성 검사
    if (!file.name.toLowerCase().endsWith(".png")) {
      showModifyAlert("warning", "PNG 파일만 선택할 수 있습니다.");
      $input.val("");
      return;
    }

    var maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      showModifyAlert("warning", "파일 크기는 50MB 이하여야 합니다.");
      $input.val("");
      return;
    }

    // 날짜 선택 확인
    var $dateInput = $("#modifyimageDate_" + itemId);
    var imageDate = $dateInput.val();

    if (!imageDate) {
      showModifyAlert("warning", "이미지 등록일을 먼저 선택해주세요.");
      $input.val("");
      $dateInput.trigger("focus");
      return;
    }

    encodeFileToBase64(file)
      .then(function (base64) {
        // base64 content (data:image/png;base64, 제거)
        var base64Content = base64.split(",")[1];

        // 미리보기 생성
        var $preview = $("#modifyimagePreview_" + itemId);
        $preview.empty();
        $preview.addClass("has-images");

        var imageId = "modifyimg_new_" + Date.now();

        var $thumbnail = $("<div>", {
          class: "illegal-register-image-thumbnail",
          "data-image-id": imageId,
        });

        var $img = $("<img>", {
          class: "illegal-register-image-thumbnail__img",
          src: base64,
          alt: file.name,
        });

        var $removeBtn = $("<button>", {
          type: "button",
          class: "illegal-register-image-thumbnail__remove",
          "aria-label": "삭제",
        });

        var $removeIcon = $("<i>", {
          class: "fas fa-times",
          "aria-hidden": "true",
        });

        $removeBtn.append($removeIcon);
        $removeBtn.on("click", function (e) {
          e.stopPropagation();
          $thumbnail.remove();

          // 매핑 데이터 초기화
          $("#mappingData_" + itemId).val("");
          $input.val("");

          if ($preview.find(".illegal-register-image-thumbnail").length === 0) {
            $preview.removeClass("has-images");
            var $placeholder = $("<span>", {
              class: "illegal-register-image-item__preview-empty",
              html: '<i class="fas fa-image" aria-hidden="true"></i>선택된 파일이 없습니다.',
            });
            $preview.append($placeholder);
          }
        });

        $thumbnail.append($img).append($removeBtn);
        $preview.append($thumbnail);

        // 매핑 데이터 저장 (날짜:base64)
        // handleModifySubmit에서 || 로 구분하여 여러 개 처리 가능하지만
        // 현재 UI상 1아이템 1이미지인 경우 덮어쓰기로 처리
        var mappingData = imageDate + ":" + base64Content;
        $("#mappingData_" + itemId).val(mappingData);

        // 입력값 초기화 (같은 파일 다시 선택 가능하도록)
        // $input.val(""); // 초기화하면 handleModifySubmit에서 input[type=file]을 읽을 필요 없음.
        // 하지만 handleModifySubmit은 hidden input을 읽으므로 초기화해도 됨.
        $input.val("");
      })
      .catch(function (error) {
        console.error("파일 변환 오류:", error);
        showModifyAlert("danger", "파일 처리 중 오류가 발생했습니다.");
        $input.val("");
      });
  }

  /**
   * 모달 닫기
   */
  function closeModal() {
    if (window.IllegalModifyModal && typeof window.IllegalModifyModal.close === "function") {
      window.IllegalModifyModal.close();
    }
    // 폼 및 상태 초기화
    resetModifyForm();
    resetModifyMode();
  }

  /**
   * 수정 폼을 초기화한다
   */
  function resetModifyForm() {
    var $form = $("#illegalModifyForm");
    if ($form.length && $form[0]) {
      $form[0].reset();
    }

    $('input[name="modifystrcClssCd"][value="GENERAL"]').prop("checked", true);
    $('input[name="modifyilglPrvuActnStatVal"][value="IN_PROGRESS"]').prop("checked", true);

    $("#modifyactionHistoryList").empty();
    $("#modifyactionHistoryList").append(createActionHistoryRow());
    $("#modifyactionHistoryList .illegal-register-history__actions").first().empty();

    state.selectedFiles = {
      images: [],
      kml: null,
    };
    state.deletedFileIds = [];
    state.imageItemCounter = 0;
    $("#modifyimageList").empty();

    // 히든 필드 초기화
    $("#modifylndsUnqNo").val("");
    $("#modifygpsLgtd").val("");
    $("#modifygpsLttd").val("");
  }

  /**
   * 수정 모드 초기화
   */
  function resetModifyMode() {
    state.modifySeq = null;
    $("#illegalModifyDeleteBtn").hide();
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
      showModifyAlert("warning", warningMessage);
      if ($input && $input.length) {
        $input.trigger("focus");
      }
      return undefined;
    }

    return parsed;
  }

  /**
   * 조치 이력 입력 필드에서 유효한 항목만 추출한다.
   * @returns {Array<{actnDttm: string, actnCtnt: string}>}
   */
  function collectActionHistories() {
    var histories = [];

    $("#modifyactionHistoryList .illegal-register-history__item").each(function () {
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
   * 수정 버튼 클릭 핸들러
   */
  function handleModifySubmit() {
    if (!state.modifySeq) {
      return;
    }

    var $headOfficeInput = $("#modifyhdqrNm");
    var $branchOfficeInput = $("#modifymtnofNm");
    var $routeNameInput = $("#modifyrouteCd");
    var $drivingDirectionSelect = $("#modifydrveDrctCd");
    var $distanceMarkInput = $("#modifyrouteDstnc");
    var $detailAddressInput = $("#modifylndsLdnoAddr");
    var $incidentDateInput = $("#modifyocrnDates");
    var $managerNameInput = $("#modifyprchEmno");
    var $actorNameInput = $("#modifytrnrNm");
    var $relatedPersonInput = $("#modifyrltrNm");
    var $actorAddressInput = $("#modifytrnrAddr");
    var $relatedAddressInput = $("#modifyrltrAddr");
    var $occupancyRateInput = $("#modifyilglPssrt");
    var $occupancyAreaInput = $("#modifyilglPssnSqms");
    var $lndsUnqNoInput = $("#modifylndsUnqNo");
    var $gpsLgtdInput = $("#modifygpsLgtd");
    var $gpsLttdInput = $("#modifygpsLttd");

    var headOffice = $headOfficeInput.val().trim();
    var branchOffice = $branchOfficeInput.val().trim();
    var routeName = $routeNameInput.val().trim();
    var drivingDirection = $drivingDirectionSelect.val();
    var distanceMark = $distanceMarkInput.val().trim();
    var category = $('input[name="modifystrcClssCd"]:checked').val();
    var detailAddress = $detailAddressInput.val().trim();
    var incidentDate = $incidentDateInput.val();
    var managerName = $managerNameInput.val().trim();
    var actorName = $actorNameInput.val().trim();
    var relatedPersonName = $relatedPersonInput.val().trim();
    var actorAddress = $actorAddressInput.val().trim();
    var relatedAddress = $relatedAddressInput.val().trim();
    var occupancyRateValue = $occupancyRateInput.val();
    var occupancyAreaValue = $occupancyAreaInput.val();
    var actionStatus = $('input[name="modifyilglPrvuActnStatVal"]:checked').val();
    var lndsUnqNo = $lndsUnqNoInput.val().trim();
    var gpsLgtdValue = $gpsLgtdInput.val().trim();
    var gpsLttdValue = $gpsLttdInput.val().trim();

    if (!headOffice) {
      showModifyAlert("warning", "본부를 입력해주세요.");
      return;
    }
    if (!branchOffice) {
      showModifyAlert("warning", "지사를 입력해주세요.");
      return;
    }
    if (!routeName) {
      showModifyAlert("warning", "노선명을 입력해주세요.");
      return;
    }
    if (!drivingDirection) {
      showModifyAlert("warning", "주행방향을 선택해주세요.");
      return;
    }
    if (!incidentDate) {
      showModifyAlert("warning", "발생일자를 선택해주세요.");
      $incidentDateInput.trigger("focus");
      return;
    }
    if (!managerName) {
      showModifyAlert("warning", "담당자를 입력해주세요.");
      $managerNameInput.trigger("focus");
      return;
    }
    if (!actorName) {
      showModifyAlert("warning", "행위자명을 입력해주세요.");
      $actorNameInput.trigger("focus");
      return;
    }
    if (!actionStatus) {
      showModifyAlert("warning", "조치상태를 선택해주세요.");
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

    // 이미지 데이터 수집
    var images = [];
    var hasInvalidImage = false;

    // modify-modal.jsp에서 생성된 모든 imageMappingData 히든 필드 수집 (ID 패턴 주의: mappingData_modifyimageItem_X)
    var $mappingDataInputs = $('input[name="imageMappingData[]"]');

    $mappingDataInputs.each(function () {
      var $input = $(this);
      var inputId = $input.attr("id");
      // modify 모달의 이미지 아이템인지 확인 (modifyimageItem_)
      if (!inputId || inputId.indexOf("modifyimageItem_") === -1) {
        return;
      }

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
        var base64Content = parts[1]; // base64 데이터

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
        }

        var fullBase64 = "data:" + mimeType + ";base64," + base64Content;
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

    if (hasInvalidImage) {
      showModifyAlert("warning", "모든 이미지의 등록일을 선택해주세요.");
      return;
    }

    var files = {
      images: images,
      kml: null,
    };

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
      deletedFileIds: state.deletedFileIds || [],
    };

    // 버튼 로딩 상태
    var $btn = $("#illegalModifySubmitBtn");
    $btn.prop("disabled", true).text("저장 중...");

    $.ajax({
      url: "/regions/update?ilglPrvuInfoSeq=" + state.modifySeq,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
    })
      .done(function () {
        showModifyAlert("success", "수정이 완료되었습니다.");

        // 목록 갱신
        if (typeof window.loadRecentRegions === "function") {
          window.loadRecentRegions();
        }
        if (window.SlidePanel && typeof window.SlidePanel.loadList === "function") {
          window.SlidePanel.loadList(1);
        }

        // 모달 닫기
        setTimeout(function () {
          if (window.IllegalModifyModal && typeof window.IllegalModifyModal.close === "function") {
            window.IllegalModifyModal.close();
          }
        }, 500);
      })
      .fail(function (xhr) {
        var message = "수정 중 오류가 발생했습니다.";
        var responseJSON = xhr.responseJSON || {};

        if (responseJSON.message) {
          message = responseJSON.message;
        }

        showModifyAlert("danger", message);
      })
      .always(function () {
        $btn.prop("disabled", false).text("수정");
      });
  }

  /**
   * 삭제 버튼 클릭 핸들러
   */
  function handleModifyDelete() {
    if (!state.modifySeq) {
      return;
    }

    if (!confirm("정말로 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) {
      return;
    }

    $.ajax({
      url: "/regions/delete",
      method: "POST",
      data: {
        ilglPrvuInfoSeq: state.modifySeq,
      },
      dataType: "json",
    })
      .done(function () {
        showModifyAlert("success", "삭제가 완료되었습니다.");

        // 목록 갱신
        if (typeof window.loadRecentRegions === "function") {
          window.loadRecentRegions();
        }

        // 모달 닫기
        setTimeout(function () {
          if (window.IllegalModifyModal && typeof window.IllegalModifyModal.close === "function") {
            window.IllegalModifyModal.close();
          }
        }, 500);
      })
      .fail(function (xhr) {
        var message = "삭제 중 오류가 발생했습니다.";
        var responseJSON = xhr.responseJSON || {};

        if (responseJSON.message) {
          message = responseJSON.message;
        }

        showModifyAlert("danger", message);
      });
  }

  /**
   * 조치 이력 이벤트 바인딩
   */
  function bindActionHistoryEvents() {
    $("#modifyaddActionHistoryBtn").on("click", function () {
      var $row = createActionHistoryRow();
      $("#modifyactionHistoryList").append($row);
    });
  }

  /**
   * 이벤트 바인딩
   */
  function bindEvents() {
    var $modal = $("#illegalModifyModal");
    var $closeButtons = $modal.find("[data-register-modal-close]");
    var $imageList = $("#modifyimageList");

    // 이미지 추가 버튼
    $("#modifyaddImageBtn").on("click", function () {
      createImageItem();
    });

    // 파일 선택 시 처리
    $(document).on("change", 'input[type="file"][accept*=".png"]', handleImageFileSelect);

    // 날짜 중복 선택 방지
    $(document).on("change", '.illegal-register-image-item input[type="date"]', function () {
      var $this = $(this);
      var selectedDate = $this.val();
      var currentItemId = $this.closest(".illegal-register-image-item").data("item-id");

      if (!selectedDate) return;

      var isDuplicate = false;
      $('.illegal-register-image-item input[type="date"]').each(function () {
        var $other = $(this);
        var otherItemId = $other.closest(".illegal-register-image-item").data("item-id");

        if (currentItemId !== otherItemId && $other.val() === selectedDate) {
          isDuplicate = true;
          return false;
        }
      });

      if (isDuplicate) {
        alert("이미 선택된 날짜입니다. 다른 날짜를 선택해주세요.");
        $this.val("");
      }
    });

    // 모달 바깥 클릭 시 닫기
    $modal.on("click", function (event) {
      if (event.target === $modal[0]) {
        closeModal();
      }
    });

    // 닫기 버튼 클릭
    $closeButtons.on("click", closeModal);

    // ESC 키 누르면 닫기
    $(document).on("keydown", function (event) {
      if (event.key === "Escape" && $modal.hasClass("is-open")) {
        closeModal();
      }
    });

    // 모달 열릴 때
    $modal.on("illegalModifyModal:open", function () {
      // 이미지가 없으면 하나 추가
      if ($imageList.children().length === 0) {
        createImageItem();
      }
    });
  }

  /**
   * 초기화 함수
   */
  function initialize() {
    resetModifyForm();
    bindEvents();
    bindActionHistoryEvents();

    $("#illegalModifySubmitBtn").on("click", handleModifySubmit);
    $("#illegalModifyDeleteBtn").on("click", handleModifyDelete);

    // 삭제 버튼 초기 상태 설정
    $("#illegalModifyDeleteBtn").hide();
  }

  // 초기화 실행
  $(document).ready(function () {
    initialize();
  });

  /**
   * 외부에서 접근 가능한 공개 메서드
   */
  window.ModifyModule = {
    open: openModifyModal,
    reset: resetModifyForm,
  };
})(window, window.jQuery);
