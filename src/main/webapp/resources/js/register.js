(function (window, $) {
    /**
     * register.js
     * - 불법 점유 등록 모달 전용 스크립트
     */
    "use strict";

    if (!$) {
        console.error("jQuery is required for register.js");
        return;
    }

    // ===== Constants & Config =====
    var CONSTANTS = {
        API_URL: "/regions/register",
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_EXTENSIONS: ["png", "jpg", "jpeg"],
        EMPTY_PREVIEW_HTML:
            '<span class="illegal-register-image-item__preview-empty"><i class="fas fa-image" aria-hidden="true"></i>선택된 파일이 없습니다.</span>',
    };

    // ===== State Management =====
    var state = {
        imageItemCounter: 0,
    };

    // ===== Helper Functions =====
    /**
     * 파일을 Base64 문자열로 변환합니다.
     * @param {File} file - 변환할 파일 객체
     * @returns {Promise<string>} Base64 문자열
     */
    function fileToBase64(file) {
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

    // ===== Validation Helper Functions =====
    /**
     * 입력 필드에 에러 메시지를 표시합니다.
     * @param {jQuery} $element - 에러를 표시할 입력 요소
     * @param {string} message - 표시할 에러 메시지
     */
    function showError($element, message) {
        $element.addClass("is-invalid");
        var $err = $element.siblings(".illegal-register-error-text");
        if ($err.length === 0) {
            $err = $('<div class="illegal-register-error-text"></div>');
            // input-group 처리: 부모가 input-group이면 그 뒤에 에러 메시지 추가
            if ($element.parent().hasClass('illegal-register-input-group')) {
                $element.parent().after($err);
            } else {
                $element.after($err);
            }
        }
        $err.text(message).show();
    }

    /**
     * 입력 필드의 에러 메시지를 숨깁니다.
     * @param {jQuery} $element - 에러를 숨길 입력 요소
     */
    function clearError($element) {
        $element.removeClass("is-invalid");
        var $err;
        if ($element.parent().hasClass('illegal-register-input-group')) {
            $err = $element.parent().siblings(".illegal-register-error-text");
        } else {
            $err = $element.siblings(".illegal-register-error-text");
        }
        $err.hide();
    }

    // ===== DOM Generation =====
    /**
     * 조치 이력 행의 삭제 버튼 표시 여부를 업데이트합니다.
     * 행이 1개일 때는 삭제 버튼을 숨깁니다.
     */
    function updateActionHistoryButtons() {
        var $rows = $("#reg_actionHistoryList .illegal-register-history__item");
        if ($rows.length <= 1) {
            $rows.find(".remove-action-history-btn").hide();
        } else {
            $rows.find(".remove-action-history-btn").show();
        }
    }

    /**
     * 새로운 조치 이력 행 DOM 요소를 생성합니다.
     * @returns {jQuery} 생성된 조치 이력 행 요소
     */
    function createActionHistoryRow() {
        var $row = $("<div>", { class: "illegal-register-history__item" });

        // Date
        var $dateDiv = $("<div>", { class: "illegal-register-history__date" });
        $dateDiv.append(
            $("<input>", {
                type: "date",
                name: "actnDttm",
                class: "illegal-register-input illegal-register-history__date-input",
            })
        );

        // Content
        var $descDiv = $("<div>", { class: "illegal-register-history__desc" });
        $descDiv.append(
            $("<input>", {
                type: "text",
                name: "actnCtnt",
                class: "illegal-register-input illegal-register-history__desc-input",
                placeholder: "예: 구두주의, 경고 등",
                maxlength: "500",
            })
        );

        // Remove Button
        var $actionsDiv = $("<div>", { class: "illegal-register-history__actions" });
        var $removeBtn = $("<button>", {
            type: "button",
            class: "illegal-register-history__remove remove-action-history-btn",
            title: "삭제",
            "aria-label": "삭제",
        }).append($("<i>", { class: "fas fa-minus", "aria-hidden": "true" }));

        $actionsDiv.append($removeBtn);
        $row.append($dateDiv).append($descDiv).append($actionsDiv);
        return $row;
    }

    /**
     * 이미지 등록 아이템(날짜 선택 + 파일 업로드) DOM 요소를 생성합니다.
     * @param {string} itemId - 아이템 고유 ID
     * @param {number} number - 표시될 순번
     * @returns {jQuery} 생성된 이미지 아이템 요소
     */
    function createImageItem(itemId, number) {
        // Main Container
        var $item = $("<div>", {
            class: "illegal-register-image-item",
            "data-item-id": itemId,
        });

        // Header & Content Wrapper
        var $content = $("<div>", { class: "illegal-register-image-item__content" });
        var $header = $("<div>", { class: "illegal-register-image-item__header" });

        // Numbering
        $header.append(
            $("<span>", {
                class: "illegal-register-image-item__number",
                text: "#" + number,
            })
        );

        // Remove Item Button (Only if not #1, logic handled in renumber)
        var $removeBtn = $("<button>", {
            type: "button",
            class: "illegal-register-image-item__remove remove-image-item-btn",
            "data-item-id": itemId,
            "aria-label": "항목 삭제",
        }).append($("<i>", { class: "fas fa-times", "aria-hidden": "true" }));
        $header.append($removeBtn);

        // Row: Date Input + File Select Button
        var $row = $("<div>", { class: "illegal-register-image-item__row" });

        var $dateField = $("<div>", {
            class: "illegal-register-field illegal-register-field--inline",
            style: "position: relative;",
        });
        $dateField.append(
            $("<input>", {
                type: "date",
                class: "illegal-register-input image-date-input",
                id: "imageDate_" + itemId,
                required: true,
            })
        );
        $dateField.append(
            $("<span>", {
                class: "illegal-register-form__required",
                style: "position: absolute; top: -5px; right: -10px;",
                text: "*",
            })
        );

        var $selectBtn = $("<button>", {
            type: "button",
            class:
                "illegal-register-button illegal-register-button--outline illegal-register-button--sm illegal-register-image-item__select-btn image-file-select-btn",
            "data-item-id": itemId,
        })
            .append($("<i>", { class: "fas fa-upload", "aria-hidden": "true" }))
            .append($("<span>", { class: "illegal-register-button__text", text: "선택" }));

        $row.append($dateField).append($selectBtn);

        // Preview Section
        var $previewSection = $("<div>", { class: "illegal-register-image-item__preview-section" });
        var $preview = $("<div>", {
            class: "illegal-register-image-item__preview",
            id: "preview_" + itemId,
        }).html(CONSTANTS.EMPTY_PREVIEW_HTML);
        $previewSection.append($preview);

        // Hidden Inputs
        var $fileInput = $("<input>", {
            type: "file",
            id: "fileInput_" + itemId,
            accept: ".png,.jpg,.jpeg",
            hidden: true,
            "data-item-id": itemId,
        });

        // Stores "date:base64||date:base64"
        var $mappingInput = $("<input>", {
            type: "hidden",
            id: "mappingData_" + itemId,
            name: "imageMappingData[]",
        });

        $content.append($header).append($row).append($previewSection).append($fileInput).append($mappingInput);
        $item.append($content);

        return $item;
    }

    /**
     * 이미지 썸네일 DOM 요소를 생성합니다.
     * @param {string} imageId - 이미지 고유 ID
     * @param {string} base64 - 이미지 Base64 문자열
     * @param {string} fileName - 파일명
     * @param {string} itemId - 부모 아이템 ID
     * @returns {jQuery} 생성된 썸네일 요소
     */
    function createImageThumbnail(imageId, base64, fileName, itemId) {
        var $thumb = $("<div>", {
            class: "illegal-register-image-thumbnail",
            "data-image-id": imageId,
        });

        $thumb.append(
            $("<img>", {
                src: base64,
                class: "illegal-register-image-thumbnail__img",
                alt: fileName,
            })
        );

        var $removeBtn = $("<button>", {
            type: "button",
            class: "illegal-register-image-thumbnail__remove remove-thumbnail-btn",
            "data-image-id": imageId,
            "data-item-id": itemId,
            "aria-label": "이미지 삭제",
        }).append($("<i>", { class: "fas fa-times", "aria-hidden": "true" }));

        $thumb.append($removeBtn);
        return $thumb;
    }

    // ===== Logic: Image Handling =====
    /**
     * 이미지 등록 행을 추가합니다.
     */
    function addImageRow() {
        state.imageItemCounter++;
        var itemId = "imgItem_" + state.imageItemCounter;
        var currentCount = $("#reg_imageList .illegal-register-image-item").length;
        var $item = createImageItem(itemId, currentCount + 1);
        $("#reg_imageList").append($item);
        renumberImageItems();
    }

    /**
     * 이미지 아이템들의 순번을 재정렬합니다.
     * 첫 번째 아이템의 삭제 버튼은 숨깁니다.
     */
    function renumberImageItems() {
        var $items = $("#reg_imageList .illegal-register-image-item");
        $items.each(function (index) {
            var number = index + 1;
            $(this)
                .find(".illegal-register-image-item__number")
                .text("#" + number);

            // First item cannot be removed (unless logic changes, but usually keep at least one)
            var $removeBtn = $(this).find(".remove-image-item-btn");
            if (number === 1) {
                $removeBtn.hide();
            } else {
                $removeBtn.show();
            }
        });
    }

    /**
     * 파일 선택 이벤트를 처리합니다.
     * 파일을 읽어 Base64로 변환하고 미리보기를 생성합니다.
     * @param {Event} e - 파일 선택 이벤트
     */
    function handleFileSelect(e) {
        var $input = $(e.target);
        var itemId = $input.data("item-id");
        var file = e.target.files[0]; // Single file selection per click
        var $dateInput = $("#imageDate_" + itemId);
        var dateVal = $dateInput.val();

        // 1. Date Check
        if (!dateVal) {
            alert("이미지 등록일을 먼저 선택해주세요.");
            $input.val(""); // Clear input
            setTimeout(function () {
                $dateInput.focus();
            }, 100);
            return;
        }

        if (!file) return;

        // 2. Validation
        var ext = file.name.split(".").pop().toLowerCase();
        if (CONSTANTS.ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
            alert("PNG, JPG 파일만 업로드 가능합니다.");
            $input.val("");
            return;
        }
        if (file.size > CONSTANTS.MAX_FILE_SIZE) {
            alert("파일 크기는 10MB를 초과할 수 없습니다.");
            $input.val("");
            return;
        }

        // 3. Process
        fileToBase64(file)
            .then(function (base64) {
                var imageId = "img_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                // Format: date:base64Content (remove data prefix for server if needed, strictly following requirement "date:Base64data")
                var base64Content = base64.split(",")[1];
                var mappingValue = dateVal + ":" + base64Content;

                // Append to hidden input
                var $mappingInput = $("#mappingData_" + itemId);
                // 날짜별 1장 제한: 기존 값 무시하고 새 값으로 덮어쓰기 (여러 장일 경우 || 로 연결하던 기존 로직 대체)
                $mappingInput.val(mappingValue);

                // Update Preview
                var $preview = $("#preview_" + itemId);
                // 기존 이미지가 있다면 제거 (1장 제한)
                $preview.empty().addClass("has-images");

                var $thumb = createImageThumbnail(imageId, base64, file.name, itemId);
                // Store mapping string in data for removal
                $thumb.data("mapping", mappingValue);
                $preview.append($thumb);

                // Reset input for next selection
                $input.val("");
            })
            .catch(function (err) {
                console.error("File Error:", err);
                alert("파일 처리 중 오류가 발생했습니다.");
                $input.val("");
            });
    }

    /**
     * 등록된 이미지를 삭제합니다.
     * @param {string} imageId - 삭제할 이미지 ID
     * @param {string} itemId - 부모 아이템 ID
     */
    function removeImage(imageId, itemId) {
        var $thumb = $(".illegal-register-image-thumbnail[data-image-id='" + imageId + "']");
        var mappingToRemove = $thumb.data("mapping");

        // Update Hidden Input
        var $mappingInput = $("#mappingData_" + itemId);
        var currentVal = $mappingInput.val();
        if (currentVal && mappingToRemove) {
            var parts = currentVal.split("||");
            var newParts = parts.filter(function (p) {
                return p !== mappingToRemove;
            });
            $mappingInput.val(newParts.join("||"));
        }

        // Update UI
        $thumb.remove();
        var $preview = $("#preview_" + itemId);
        if ($preview.find(".illegal-register-image-thumbnail").length === 0) {
            $preview.removeClass("has-images").html(CONSTANTS.EMPTY_PREVIEW_HTML);
        }
    }

    // ===== Logic: Form Submission =====
    /**
     * 폼 데이터를 수집하고 유효성을 검사합니다.
     * @returns {Object|null} 수집된 데이터 객체 또는 유효성 검사 실패 시 null
     */
    function collectFormData() {
        // Basic Validation
        var isValid = true;
        var requiredFields = [
            { id: "reg_hdqrNm", name: "본부" },
            { id: "reg_mtnofNm", name: "지사" },
            { id: "reg_routeCd", name: "노선명" },
            { id: "reg_ocrnDates", name: "발생일자" },
            { id: "reg_prchEmno", name: "담당자" },
            { id: "reg_trnrNm", name: "행위자명" },
        ];

        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];
            var $el = $("#" + field.id);
            var val = $el.val();
            if (!val || !val.trim()) {
                showError($el, field.name + "을(를) 입력해주세요.");
                isValid = false;
            } else {
                clearError($el);
            }
        }

        if (!isValid) return null;

        // GPS Coordinate Validation
        var gpsLgtd = $("#reg_gpsLgtd").val();
        var gpsLttd = $("#reg_gpsLttd").val();

        if (!gpsLgtd || !gpsLttd) {
            alert("위치 정보가 없습니다. 지도에서 위치를 선택해주세요.");
            return null;
        }

        // Collect Action History
        var histories = [];
        $("#reg_actionHistoryList .illegal-register-history__item").each(function () {
            var date = $(this).find(".illegal-register-history__date-input").val();
            var desc = $(this).find(".illegal-register-history__desc-input").val();
            if (date && desc) {
                histories.push({ actnDttm: date + "T00:00:00", actnCtnt: desc });
            }
        });

        // Collect Images
        var images = [];
        $("input[name='imageMappingData[]']").each(function () {
            var val = $(this).val();
            if (!val) return;

            var items = val.split("||");
            items.forEach(function (item) {
                if (!item) return;
                var parts = item.split(":");
                if (parts.length === 2) {
                    images.push({
                        date: parts[0],
                        base64Content: parts[1],
                        extension: "png",
                        filename: "upload_" + Date.now() + ".png",
                    });
                }
            });
        });

        // Construct Payload
        var payload = {
            hdqrNm: $("#reg_hdqrNm").val(),
            mtnofNm: $("#reg_mtnofNm").val(),
            routeCd: $("#reg_routeCd").val(),
            drveDrctCd: $("#reg_drveDrctCd").val(),
            routeDstnc: $("#reg_routeDstnc").val(),
            strcClssCd: $('input[name="reg_strcClssCd"]:checked').val(),
            lndsLdnoAddr: $("#reg_lndsLdnoAddr").val(),
            ocrnDates: $("#reg_ocrnDates").val().replace(/-/g, ""), // yyyyMMdd
            prchEmno: $("#reg_prchEmno").val(),
            trnrNm: $("#reg_trnrNm").val(),
            rltrNm: $("#reg_rltrNm").val(),
            trnrAddr: $("#reg_trnrAddr").val(),
            rltrAddr: $("#reg_rltrAddr").val(),
            ilglPssrt: $("#reg_ilglPssrt").val(),
            ilglPssnSqms: $("#reg_ilglPssnSqms").val(),
            ilglPrvuActnStatVal: $('input[name="reg_ilglPrvuActnStatVal"]:checked').val(),
            actionHistories: histories,
            files: {
                images: images.map(function (img) {
                    return {
                        ocrnDates: img.date.replace(/-/g, ""),
                        base64: "data:image/png;base64," + img.base64Content,
                        filename: img.filename,
                        extension: img.extension,
                        size: Math.round(img.base64Content.length * 0.75),
                    };
                }),
            },
            // Coordinates
            lndsUnqNo: $("#reg_lndsUnqNo").val(),
            gpsLgtd: $("#reg_gpsLgtd").val(),
            gpsLttd: $("#reg_gpsLttd").val(),
        };

        return payload;
    }

    /**
     * 등록 폼을 제출합니다.
     */
    function submitRegister() {
        var payload = collectFormData();
        if (!payload) return;

        if (!confirm("등록하시겠습니까?")) return;

        var $btn = $("#illegalRegisterSubmitBtn");
        var originalText = $btn.text();
        $btn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i> 저장 중...');

        $.ajax({
            url: CONSTANTS.API_URL,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            dataType: "json",
        })
            .done(function (res) {
                alert("등록이 완료되었습니다.");
                RegisterModule.close();
                // Refresh lists if callbacks exist
                if (window.loadRecentRegions) window.loadRecentRegions();
                if (window.refreshMapState) window.refreshMapState();
            })
            .fail(function (xhr) {
                var msg = "등록 중 오류가 발생했습니다.";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                alert(msg);
            })
            .always(function () {
                $btn.prop("disabled", false).text(originalText);
            });
    }

    // ===== Public Functions =====
    var RegisterModule = {
        /**
         * 모듈을 초기화합니다.
         */
        init: function () {
            this.bindEvents();
            this.reset();
        },

        /**
         * 폼과 상태를 초기화합니다.
         */
        reset: function () {
            $("#illegalRegisterForm")[0].reset();
            $("#reg_imageList").empty();
            $("#reg_actionHistoryList").empty().append(createActionHistoryRow());
            updateActionHistoryButtons();
            state.imageItemCounter = 0;

            // Clear all inline error messages
            $(".is-invalid").removeClass("is-invalid");
            $(".error-message").remove();

            // Add default image row
            addImageRow();
        },

        /**
         * 모달을 엽니다.
         * @param {Object} initialData - 초기 데이터 (선택 사항)
         */
        open: function (initialData) {
            this.reset();
            $("#illegalRegisterModal").addClass("is-open").attr("aria-hidden", "false");
            $("body").addClass("illegal-register-modal-open");

            // 초기 데이터가 있으면 채움
            if (initialData) {
                this.fillForm(initialData);
            }
        },

        /**
         * 외부 데이터를 사용하여 폼을 채웁니다.
         * @param {Object} data - 폼 데이터
         */
        fillForm: function (data) {
            console.log("RegisterModule.fillForm called with data:", data);

            if (!data) {
                console.warn("RegisterModule.fillForm: No data provided");
                return;
            }

            // 요소 존재 확인
            if ($("#reg_lndsLdnoAddr").length === 0) {
                console.error("Error: #reg_lndsLdnoAddr element not found in DOM!");
                return;
            }

            var resolvedAddress = data.address || data.roadAddress || data.jibunAddress || "";
            console.log("Resolved Address:", resolvedAddress);
            $("#reg_lndsLdnoAddr").val(resolvedAddress);

            // Set Default Values
            $("#reg_hdqrNm").val("서울본부");
            $("#reg_mtnofNm").val("서울지사");
            $("#reg_routeCd").val("경부고속도로");
            $("#reg_drveDrctCd").val("UP"); // 상행
            $("#reg_routeDstnc").val("123.5");

            // PNU 및 좌표 정보를 히든 필드에 설정
            if (data.pnu) {
                console.log("Setting PNU:", data.pnu);
                $("#reg_lndsUnqNo").val(data.pnu);
            }
            if (data.coordinateX !== undefined && data.coordinateX !== null) {
                console.log("Setting CoordinateX:", data.coordinateX);
                $("#reg_gpsLgtd").val(data.coordinateX);
            }
            if (data.coordinateY !== undefined && data.coordinateY !== null) {
                console.log("Setting CoordinateY:", data.coordinateY);
                $("#reg_gpsLttd").val(data.coordinateY);
            }
        },

        /**
         * 모달을 닫습니다.
         */
        close: function () {
            $("#illegalRegisterModal").removeClass("is-open").attr("aria-hidden", "true");
            $("body").removeClass("illegal-register-modal-open");
            this.reset(); // Clean up on close
        },

        /**
         * 이벤트를 바인딩합니다.
         */
        bindEvents: function () {
            var self = this;

            // Modal Close
            $("[data-register-modal-close]").on("click", function () {
                self.close();
            });

            // Image Add Row
            $("#reg_addImageBtn").on("click", function () {
                addImageRow();
            });

            // Image Select (Trigger Hidden Input)
            $(document).on("click", ".image-file-select-btn", function () {
                var itemId = $(this).data("item-id");
                $("#fileInput_" + itemId).trigger("click");
            });

            // Image File Change
            $(document).on("change", "input[type=file][id^='fileInput_']", handleFileSelect);

            // Image Item Remove (Row)
            $(document).on("click", ".remove-image-item-btn", function () {
                var itemId = $(this).data("item-id");
                $(".illegal-register-image-item[data-item-id='" + itemId + "']").remove();
                renumberImageItems();
            });

            // Image Thumbnail Remove (Individual Image)
            $(document).on("click", ".remove-thumbnail-btn", function (e) {
                e.stopPropagation();
                var imageId = $(this).data("image-id");
                var itemId = $(this).data("item-id");
                removeImage(imageId, itemId);
            });

            // Action History Add
            $("#reg_addActionHistoryBtn").on("click", function () {
                $("#reg_actionHistoryList").append(createActionHistoryRow());
                updateActionHistoryButtons();
            });

            // Action History Remove
            $(document).on("click", ".remove-action-history-btn", function () {
                var $rows = $("#reg_actionHistoryList .illegal-register-history__item");
                if ($rows.length > 1) {
                    $(this).closest(".illegal-register-history__item").remove();
                    updateActionHistoryButtons();
                } else {
                    // If last one, just clear inputs
                    $(this).closest(".illegal-register-history__item").find("input").val("");
                }
            });

            // Submit
            $("#illegalRegisterSubmitBtn").on("click", submitRegister);

            // Clear Error on Input
            $(document).on("input change", ".illegal-register-input, .illegal-register-select", function () {
                clearError($(this));
            });
        },
    };

    // Expose to window
    window.RegisterModule = RegisterModule;
    window.IllegalRegisterModal = {
        open: function (data) {
            RegisterModule.open(data);
        },
        close: function () {
            RegisterModule.close();
        },
    };

    // Auto Init
    $(document).ready(function () {
        RegisterModule.init();
    });
})(window, window.jQuery);
