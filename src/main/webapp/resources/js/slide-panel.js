/**
 * 슬라이드 패널 제어 모듈
 */
(function () {
  "use strict";

  var SlidePanel = {
    isOpen: false,
    $panel: null,
    $toggle: null,
    $overlay: null,
    $body: null,
    $closeBtn: null,
    $listContainer: null,
    $listItems: null,
    $paginationWrapper: null,
    $loading: null,
    $empty: null,
    $searchInput: null,
    $searchBtn: null,
    $searchClearBtn: null,
    searchKeyword: "",
    currentPage: 1,
    pageSize: 5,
    totalPages: 0,
    totalCount: 0,

    /**
     * 초기화
     */
    init: function () {
      this.$panel = $("#slide-panel");
      this.$toggle = $("#slide-panel-toggle");
      this.$overlay = $(".slide-panel-overlay");
      this.$body = $("body");
      this.$closeBtn = $("#slide-panel-close-btn");
      this.$listContainer = $("#slide-panel-list-container");
      this.$listItems = $("#slide-panel-list-items");
      this.$paginationWrapper = $("#slide-panel-pagination-wrapper");
      this.$loading = $("#slide-panel-loading");
      this.$empty = $("#slide-panel-empty");
      this.$searchInput = $("#slide-panel-search-input");
      this.$searchBtn = $("#slide-panel-search-btn");
      this.$searchClearBtn = $("#slide-panel-search-clear");

      // 토글 버튼 클릭 이벤트
      if (this.$toggle.length) {
        this.$toggle.on("click", this.toggle.bind(this));
      }

      // 닫기 버튼 클릭 이벤트
      if (this.$closeBtn.length) {
        this.$closeBtn.on("click", this.close.bind(this));
      }

      // 오버레이 클릭 시 닫기
      if (this.$overlay.length) {
        this.$overlay.on("click", this.close.bind(this));
      }

      // ESC 키로 닫기
      $(document).on("keydown", function (e) {
        if (e.key === "Escape" && SlidePanel.isOpen) {
          SlidePanel.close();
        }
      });

      // 리스트 아이템 클릭 이벤트
      this.$listContainer.on("click", ".slide-panel-list-item", this.handleItemClick.bind(this));
      // 이미지 표시 체크박스 이벤트
      var $imageToggle = $("#slide-panel-image-toggle");
      if ($imageToggle.length) {
        $imageToggle.on("change", this.handleImageToggle.bind(this));
      }

      // 지적도 표시 체크박스 이벤트
      var $cadastralToggle = $("#slide-panel-cadastral-toggle");
      if ($cadastralToggle.length) {
        $cadastralToggle.on("change", function () {
          var isChecked = $(this).is(":checked");
          if (window.cadastralLayer) {
            window.cadastralLayer.setVisible(isChecked);
          }
        });
      }

      // 검색 이벤트
      if (this.$searchBtn.length) {
        this.$searchBtn.on("click", this.search.bind(this));
      }

      if (this.$searchInput.length) {
        var self = this;
        this.$searchInput.on("keydown", function (e) {
          if (e.key === "Enter") {
            self.search();
          }
        });

        // 입력 시 X 버튼 표시 제어
        this.$searchInput.on("input", function () {
          self.toggleClearBtn();
        });
      }

      // 검색 초기화 버튼 이벤트
      if (this.$searchClearBtn.length) {
        this.$searchClearBtn.on("click", this.clearSearch.bind(this));
      }

      // 드론 촬영 이미지 다운로드 버튼 클릭 이벤트
      $("#drone-image-download-btn").on("click", function () {
        if (typeof window.openDroneExplorer === "function") {
          window.openDroneExplorer();
        } else {
          console.error("openDroneExplorer function is not defined");
        }
      });
    },

    /**
     * 패널 열기
     */
    open: function () {
      if (this.isOpen) return;

      this.isOpen = true;
      this.$panel.addClass("slide-panel--open");
      this.$toggle.addClass("slide-panel-toggle--open");
      this.$body.addClass("slide-panel-open");
      this.$overlay.addClass("slide-panel-overlay--show");

      // 이벤트 발생
      $(document).trigger("slidePanel:opened");

      // 패널이 열릴 때 리스트 자동 로드
      this.loadList(1);
    },

    /**
     * 패널 닫기
     */
    close: function () {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.$panel.removeClass("slide-panel--open");
      this.$toggle.removeClass("slide-panel-toggle--open");
      this.$body.removeClass("slide-panel-open");
      this.$overlay.removeClass("slide-panel-overlay--show");

      // 이벤트 발생
      $(document).trigger("slidePanel:closed");
    },

    /**
     * 패널 토글
     */
    toggle: function () {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    /**
     * 검색
     */
    search: function () {
      var keyword = this.$searchInput.val().trim();
      this.searchKeyword = keyword;
      this.toggleClearBtn();
      this.loadList(1);
    },

    /**
     * 검색 초기화
     */
    clearSearch: function () {
      this.$searchInput.val("");
      this.searchKeyword = "";
      this.toggleClearBtn();
      this.loadList(1);
    },

    /**
     * 검색 초기화 버튼 표시 토글
     */
    toggleClearBtn: function () {
      if (this.$searchInput.val().length > 0) {
        this.$searchClearBtn.show();
      } else {
        this.$searchClearBtn.hide();
      }
    },

    /**
     * 리스트 데이터 로드
     */
    loadList: function (page) {
      // 초기화가 안 되어 있다면 초기화 실행
      if (!this.$loading) {
        this.init();
      }

      if (page) {
        this.currentPage = page;
      }

      this.showLoading();
      this.hideEmpty();

      var self = this;
      $.ajax({
        url: "/regions/list",
        method: "GET",
        data: {
          page: this.currentPage,
          size: this.pageSize,
          keyword: this.searchKeyword,
        },
        dataType: "json",
      })
        .done(function (response) {
          if (response.success && response.data) {
            var data = response.data;
            self.totalCount = data.totalCount || 0;
            self.totalPages = data.totalPages || 0;
            self.currentPage = data.currentPage || 1;

            if (data.list && data.list.length > 0) {
              // 데이터 존재 여부 캐시 업데이트 (깜빡임 방지)
              if (window.dataExistenceCache) {
                data.list.forEach(function (item) {
                  if (item.lndsUnqNo) {
                    window.dataExistenceCache[item.lndsUnqNo] = item.hasData === true;
                  }
                });
              }

              self.renderList(data.list);
              self.renderPagination();
              self.hideLoading();
            } else {
              self.hideLoading();
              self.showEmpty();
              self.clearList();
            }
          } else {
            self.hideLoading();
            self.showEmpty();
            self.clearList();
            console.error("리스트 조회 실패:", response.message);
          }
        })
        .fail(function (xhr, status, error) {
          self.hideLoading();
          self.showEmpty();
          self.clearList();
          console.error("리스트 조회 오류:", status, error);
        });
    },

    /**
     * 리스트 렌더링
     */
    renderList: function (list) {
      var self = this;

      this.clearListItems();

      // 고정 하이라이트 레이어 초기화 (새 페이지 로드 시 기존 것 제거)
      if (window.fixedHighlightSource) window.fixedHighlightSource.clear();

      // 지도상의 이미지 레이어 초기화
      if (typeof window.clearImageLayer === "function") {
        window.clearImageLayer();
      }

      if (!list || list.length === 0) {
        this.showEmpty();
        return;
      }

      var pnuListForHighlight = [];

      list.forEach(function (item, index) {
        var sequenceNumber = (self.currentPage - 1) * self.pageSize + index + 1;
        var address = item.lndsLdnoAddr || "-";
        var gpsLgtd = item.gpsLgtd || "";
        var gpsLttd = item.gpsLttd || "";
        var fieldNumber = item.fieldNumber || item.field_number || item.fieldNum || item.field_num || item.field || 1;

        var imagePath = item.imagePath || "";
        var hasData = item.hasData === true || item.hasData === "true" || item.hasData === 1;

        var $item = $('<div class="slide-panel-list-item"></div>')
          .attr({
            "data-id": item.ilglPrvuInfoSeq || "",
            "data-lnds-unq-no": item.lndsUnqNo || "",
            "data-gps-lgtd": gpsLgtd,
            "data-gps-lttd": gpsLttd,
            "data-field-number": fieldNumber,
            "data-image-path": imagePath,
            "data-has-data": hasData ? "true" : "false",
          })
          .html(
            '<div class="slide-panel-list-item__cell slide-panel-list-item__cell--sequence">' +
            sequenceNumber +
            "</div>" +
            '<div class="slide-panel-list-item__cell slide-panel-list-item__cell--address">' +
            self.escapeHtml(address) +
            "</div>"
          );

        self.$listItems.append($item);

        // 이미지 레이어 추가 (리스트 로드 시 모든 이미지 표시)
        if (imagePath && imagePath.trim().length > 0 && gpsLgtd && gpsLttd && typeof window.updateImageLayer === "function") {
          window.updateImageLayer(parseFloat(gpsLgtd), parseFloat(gpsLttd), imagePath);
        }

        // PNU 수집
        if (item.lndsUnqNo) {
          pnuListForHighlight.push(item.lndsUnqNo);
        }
      });

      // 일괄 경계선 하이라이트 요청
      if (pnuListForHighlight.length > 0 && typeof window.addBoundaryHighlights === "function") {
        window.addBoundaryHighlights(pnuListForHighlight);
      }
    },

    /**
     * 페이징 렌더링
     */
    renderPagination: function () {
      var self = this;
      this.$paginationWrapper.empty();

      if (this.totalPages <= 1) {
        return;
      }

      var $pagination = $('<div class="slide-panel-pagination"></div>');

      // 이전 버튼
      var $prevBtn = $(
        '<button type="button" class="slide-panel-pagination__btn slide-panel-pagination__btn--prev"></button>'
      )
        .html('<i class="fas fa-chevron-left"></i>')
        .attr("data-page", this.currentPage - 1);

      if (this.currentPage <= 1) {
        $prevBtn.addClass("slide-panel-pagination__btn--disabled").prop("disabled", true);
      }
      $pagination.append($prevBtn);

      // 페이지 번호 버튼
      var startPage = Math.max(1, this.currentPage - 2);
      var endPage = Math.min(this.totalPages, this.currentPage + 2);

      if (startPage > 1) {
        $pagination.append(this.createPageButton(1));
        if (startPage > 2) {
          $pagination.append('<span class="slide-panel-pagination__ellipsis">...</span>');
        }
      }

      for (var i = startPage; i <= endPage; i++) {
        $pagination.append(this.createPageButton(i, i === this.currentPage));
      }

      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          $pagination.append('<span class="slide-panel-pagination__ellipsis">...</span>');
        }
        $pagination.append(this.createPageButton(this.totalPages));
      }

      // 다음 버튼
      var $nextBtn = $(
        '<button type="button" class="slide-panel-pagination__btn slide-panel-pagination__btn--next"></button>'
      )
        .html('<i class="fas fa-chevron-right"></i>')
        .attr("data-page", this.currentPage + 1);

      if (this.currentPage >= this.totalPages) {
        $nextBtn.addClass("slide-panel-pagination__btn--disabled").prop("disabled", true);
      }
      $pagination.append($nextBtn);

      this.$paginationWrapper.html($pagination);

      // 페이징 버튼 클릭 이벤트
      this.$paginationWrapper.on("click", ".slide-panel-pagination__btn", function (e) {
        var $btn = $(e.currentTarget);
        if ($btn.hasClass("slide-panel-pagination__btn--disabled")) {
          return;
        }
        var page = parseInt($btn.data("page"));
        if (page && page !== self.currentPage) {
          self.loadList(page);
          self.$panel.scrollTop(0);
        }
      });
    },

    /**
     * 페이지 버튼 생성
     */
    createPageButton: function (page, isActive) {
      var $btn = $('<button type="button" class="slide-panel-pagination__btn"></button>')
        .text(page)
        .attr("data-page", page);

      if (isActive) {
        $btn.addClass("slide-panel-pagination__btn--active");
      }

      return $btn;
    },

    /**
     * 리스트 아이템 클릭 처리
     */
    handleItemClick: function (e) {
      var $item = $(e.currentTarget);
      var id = $item.data("id");
      // gpsLgtd = GEOTIFF_CENTER_X, gpsLttd = GEOTIFF_CENTER_Y
      var gpsLgtd = $item.data("gps-lgtd");
      var gpsLttd = $item.data("gps-lttd");
      var fieldNumber = $item.data("field-number") || 1;

      // GEOTIFF 중심 좌표가 있는 경우에만 처리
      if (!gpsLgtd || !gpsLttd || isNaN(gpsLgtd) || isNaN(gpsLttd)) {
        return;
      }

      var self = this;
      var geotiffCenterX = parseFloat(gpsLgtd);
      var geotiffCenterY = parseFloat(gpsLttd);
      var lndsUnqNo = $item.data("lnds-unq-no");
      var imagePath = $item.data("image-path");
      var hasData = $item.data("has-data") === true || $item.data("has-data") === "true";

      // 지도 이동
      this.moveMapToLocation(geotiffCenterX, geotiffCenterY);

      // 이미지 레이어 업데이트 (리스트 로드 시 이미 추가되므로 클릭 시 중복 추가 방지)
      // if (imagePath && imagePath.trim && imagePath.trim().length > 0 && typeof window.updateImageLayer === "function") {
      //   window.updateImageLayer(geotiffCenterX, geotiffCenterY, imagePath);
      // }

      // 클릭된 아이템 하이라이트 (리스트 UI)
      this.highlightItem($item);

      // 지도 이동 애니메이션 완료 후 팝업 표시 (사용자 요청으로 제거)
      // setTimeout(function () {
      //   self.showMapPopup(geotiffCenterX, geotiffCenterY, lndsUnqNo, hasData);
      // }, 1000);

      // 이벤트 발생
      $(document).trigger("slidePanel:itemClicked", {
        id: id,
        gpsLgtd: gpsLgtd,
        gpsLttd: gpsLttd,
        element: $item,
      });
    },

    /**
     * 지도를 특정 좌표로 이동
     */
    moveMapToLocation: function (longitude, latitude) {
      var mapObj = window.map || map;
      if (!mapObj || !mapObj.getView) {
        console.warn("지도 객체를 찾을 수 없습니다. 지도가 초기화되었는지 확인해주세요.");
        return;
      }

      try {
        var coordinate = [longitude, latitude];
        mapObj.getView().animate({
          center: coordinate,
          zoom: 18,
          duration: 1000,
        });
      } catch (error) {
        console.error("지도 이동 중 오류 발생:", error);
      }
    },

    /**
     * 리스트 아이템 하이라이트
     */
    highlightItem: function ($item) {
      this.$listContainer.find(".slide-panel-list-item").removeClass("slide-panel-list-item--selected");
      $item.addClass("slide-panel-list-item--selected");
    },

    /**
     * 지도 팝업 표시
     */
    showMapPopup: function (geotiffCenterX, geotiffCenterY, lndsUnqNo, hasData) {
      if (typeof window.showMapPopupAndHighlight !== "function") {
        console.warn("showMapPopupAndHighlight 함수를 찾을 수 없습니다.");
        return;
      }

      if (!window.cadastralLayer) {
        console.warn("cadastralLayer가 아직 초기화되지 않았습니다.");
        return;
      }

      if (!window.popupOverlay) {
        console.warn("popupOverlay가 아직 초기화되지 않았습니다.");
        return;
      }

      // hasData 정보를 캐시에 저장하여 즉시 UI 업데이트
      if (lndsUnqNo && window.dataExistenceCache) {
        window.dataExistenceCache[lndsUnqNo] = hasData === true;
      }

      window.showMapPopupAndHighlight({
        coordinate: [geotiffCenterX, geotiffCenterY],
        layer: window.cadastralLayer,
        layerName: "lp_pa_cbnd_bubun",
        checkDataExistence: true,
        pnu: lndsUnqNo || null,
        useOriginalCoordinate: true, // 패널 호출 시 DB에 저장된 원본 좌표 사용
        hasData: hasData, // 미리 알려진 hasData 정보 전달
      });
    },

    /**
     * 리스트 아이템 제거
     */
    clearListItems: function () {
      this.$listItems.empty();
    },

    /**
     * 리스트 및 페이징 초기화
     */
    clearList: function () {
      this.clearListItems();
      this.$paginationWrapper.empty();
      if (typeof window.clearImageLayer === "function") {
        window.clearImageLayer();
      }

      // 검색 결과가 없을 때 지도 선택 해제 (팝업 및 하이라이트 제거)
      if (typeof window.clearSelection === "function") {
        window.clearSelection();
      }
    },

    /**
     * 로딩 표시
     */
    showLoading: function () {
      this.$loading.show();
      // 리스트 아이템은 숨기지 않고 오버레이로 덮음
      this.$empty.hide();
      // 페이징은 유지
    },

    /**
     * 로딩 숨김
     */
    hideLoading: function () {
      this.$loading.hide();
      // this.$listItems.show(); // 이미 보여지고 있음
      this.$paginationWrapper.show();
    },

    /**
     * 빈 상태 표시
     */
    showEmpty: function () {
      this.$empty.show();
      this.$listItems.hide();
      this.$loading.hide();
      this.$paginationWrapper.hide();
    },

    /**
     * 빈 상태 숨김
     */
    hideEmpty: function () {
      this.$empty.hide();
      this.$listItems.show();
      this.$paginationWrapper.show();
    },

    /**
     * 이미지 표시 체크박스 토글 처리
     */
    handleImageToggle: function (e) {
      var isChecked = $(e.target).is(":checked");
      if (typeof window.toggleImageLayer === "function") {
        window.toggleImageLayer(isChecked);
      }
    },

    /**
     * HTML 이스케이프
     */
    escapeHtml: function (text) {
      if (!text) {
        return "";
      }
      var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return String(text).replace(/[&<>"']/g, function (m) {
        return map[m];
      });
    },
  };

  // DOM 로드 완료 시 초기화
  $(document).ready(function () {
    SlidePanel.init();
  });

  // 전역으로 노출
  window.SlidePanel = SlidePanel;
})();
