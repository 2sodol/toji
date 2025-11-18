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
    $paginationWrapper: null,
    $loading: null,
    $empty: null,
    $searchInput: null,
    $searchBtn: null,
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
      this.$paginationWrapper = $("#slide-panel-pagination-wrapper");
      this.$loading = $("#slide-panel-loading");
      this.$empty = $("#slide-panel-empty");
      this.$searchInput = $("#slide-panel-search-input");
      this.$searchBtn = $("#slide-panel-search-btn");

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

      // 검색 버튼 클릭 이벤트
      if (this.$searchBtn.length) {
        this.$searchBtn.on("click", this.handleSearch.bind(this));
      }

      // 검색 입력 엔터 키 이벤트
      if (this.$searchInput.length) {
        this.$searchInput.on("keypress", function (e) {
          if (e.which === 13) {
            SlidePanel.handleSearch();
          }
        });
      }

      // 리스트 아이템 클릭 이벤트
      this.$listContainer.on("click", ".slide-panel-list-item", this.handleItemClick.bind(this));
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
     * 패널 상태 확인
     */
    getState: function () {
      return {
        isOpen: this.isOpen,
      };
    },

    /**
     * 불법점용 리스트 로드
     */
    loadList: function (page) {
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
              self.renderList(data.list);
              self.renderPagination();
              self.hideLoading();
              self.hideEmpty();
            } else {
              self.hideLoading();
              self.showEmpty();
              self.$listContainer.find(".slide-panel-list-item").remove();
              self.$paginationWrapper.empty();
            }
          } else {
            self.hideLoading();
            self.showEmpty();
            console.error("리스트 조회 실패:", response.message);
          }
        })
        .fail(function (xhr, status, error) {
          self.hideLoading();
          self.showEmpty();
          console.error("리스트 조회 오류:", status, error);
        });
    },

    /**
     * 리스트 렌더링
     */
    renderList: function (list) {
      var self = this;

      // 헤더를 제외한 기존 리스트 아이템들만 제거
      this.$listContainer.find(".slide-panel-list-item").remove();

      if (!list || list.length === 0) {
        this.showEmpty();
        return;
      }

      list.forEach(function (item, index) {
        var sequenceNumber = (self.currentPage - 1) * self.pageSize + index + 1;
        var address = item.lndsLdnoAddr || "-";
        var gpsLgtd = item.gpsLgtd || "";
        var gpsLttd = item.gpsLttd || "";
        var itemHtml =
          '<div class="slide-panel-list-item" data-id="' +
          (item.ilglPrvuInfoSeq || "") +
          '" data-lnds-unq-no="' +
          (item.lndsUnqNo || "") +
          '" data-gps-lgtd="' +
          gpsLgtd +
          '" data-gps-lttd="' +
          gpsLttd +
          '">' +
          '<div class="slide-panel-list-item__cell slide-panel-list-item__cell--sequence">' +
          sequenceNumber +
          "</div>" +
          '<div class="slide-panel-list-item__cell slide-panel-list-item__cell--address">' +
          self.escapeHtml(address) +
          "</div>" +
          "</div>";

        self.$listContainer.append(itemHtml);
      });
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

      var paginationHtml = '<div class="slide-panel-pagination">';

      // 이전 버튼
      if (this.currentPage > 1) {
        paginationHtml +=
          '<button type="button" class="slide-panel-pagination__btn slide-panel-pagination__btn--prev" data-page="' +
          (this.currentPage - 1) +
          '">&lt;</button>';
      } else {
        paginationHtml +=
          '<button type="button" class="slide-panel-pagination__btn slide-panel-pagination__btn--prev slide-panel-pagination__btn--disabled" disabled>&lt;</button>';
      }

      // 페이지 번호 버튼
      var startPage = Math.max(1, this.currentPage - 2);
      var endPage = Math.min(this.totalPages, this.currentPage + 2);

      if (startPage > 1) {
        paginationHtml += '<button type="button" class="slide-panel-pagination__btn" data-page="1">1</button>';
        if (startPage > 2) {
          paginationHtml += '<span class="slide-panel-pagination__ellipsis">...</span>';
        }
      }

      for (var i = startPage; i <= endPage; i++) {
        if (i === this.currentPage) {
          paginationHtml +=
            '<button type="button" class="slide-panel-pagination__btn slide-panel-pagination__btn--active" data-page="' +
            i +
            '">' +
            i +
            "</button>";
        } else {
          paginationHtml +=
            '<button type="button" class="slide-panel-pagination__btn" data-page="' + i + '">' + i + "</button>";
        }
      }

      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          paginationHtml += '<span class="slide-panel-pagination__ellipsis">...</span>';
        }
        paginationHtml +=
          '<button type="button" class="slide-panel-pagination__btn" data-page="' +
          this.totalPages +
          '">' +
          this.totalPages +
          "</button>";
      }

      // 다음 버튼
      if (this.currentPage < this.totalPages) {
        paginationHtml +=
          '<button type="button" class="slide-panel-pagination__btn slide-panel-pagination__btn--next" data-page="' +
          (this.currentPage + 1) +
          '">&gt;</button>';
      } else {
        paginationHtml +=
          '<button type="button" class="slide-panel-pagination__btn slide-panel-pagination__btn--next slide-panel-pagination__btn--disabled" disabled>&gt;</button>';
      }

      paginationHtml += "</div>";

      this.$paginationWrapper.html(paginationHtml);

      // 페이징 버튼 클릭 이벤트
      this.$paginationWrapper.on("click", ".slide-panel-pagination__btn", function (e) {
        var $btn = $(e.currentTarget);
        if ($btn.hasClass("slide-panel-pagination__btn--disabled")) {
          return;
        }
        var page = parseInt($btn.data("page"));
        if (page && page !== self.currentPage) {
          self.loadList(page);
          // 스크롤을 상단으로 이동
          self.$panel.scrollTop(0);
        }
      });
    },

    /**
     * 검색 처리
     */
    handleSearch: function () {
      // 현재는 검색 기능 없이 전체 리스트만 표시
      // 추후 검색 기능이 필요하면 여기에 구현
      this.currentPage = 1;
      this.loadList(1);
    },

    /**
     * 리스트 아이템 클릭 처리
     */
    handleItemClick: function (e) {
      var $item = $(e.currentTarget);
      var id = $item.data("id");
      var gpsLgtd = $item.data("gps-lgtd");
      var gpsLttd = $item.data("gps-lttd");

      // GPS 좌표가 있는 경우에만 지도 이동
      if (gpsLgtd && gpsLttd && !isNaN(gpsLgtd) && !isNaN(gpsLttd)) {
        this.moveMapToLocation(parseFloat(gpsLgtd), parseFloat(gpsLttd));

        // 클릭된 아이템 하이라이트
        this.$listContainer.find(".slide-panel-list-item").removeClass("slide-panel-list-item--selected");
        $item.addClass("slide-panel-list-item--selected");

        // 조회 모달 열기
        if (window.illegalInquiryModal && typeof window.illegalInquiryModal.open === "function") {
          // LNDS_UNQ_NO를 추출해야 함 - 현재는 ID를 사용하지만 실제로는 LNDS_UNQ_NO가 필요
          // 임시로 ID를 사용하되, 실제 구현에서는 적절한 LNDS_UNQ_NO를 전달해야 함
          var lndsUnqNo = $item.data("lnds-unq-no"); // data-lnds-unq-no 속성 사용
          window.illegalInquiryModal.open(lndsUnqNo);
        } else {
          console.warn("조회 모달이 초기화되지 않았습니다.");
        }

        // 이벤트 발생 (다른 모듈에서 사용할 수 있도록)
        $(document).trigger("slidePanel:itemClicked", {
          id: id,
          gpsLgtd: gpsLgtd,
          gpsLttd: gpsLttd,
          element: $item,
        });
      } else {
        console.warn("GPS 좌표 정보가 없거나 유효하지 않습니다:", { id: id, gpsLgtd: gpsLgtd, gpsLttd: gpsLttd });
      }
    },

    /**
     * 지도를 특정 좌표로 이동
     */
    moveMapToLocation: function (longitude, latitude) {
      // 전역 지도 객체가 있는지 확인
      var mapObj = window.map || map;
      if (mapObj && mapObj.getView) {
        try {
          // DB에 저장된 좌표가 이미 EPSG:3857이므로 변환 없이 바로 사용
          var coordinate = [longitude, latitude];

          // 지도 중심 이동 (애니메이션 포함)
          mapObj.getView().animate({
            center: coordinate,
            zoom: 18,
            duration: 1000,
          });

          // 해당 위치에 핀(마커) 추가
          this.addMarkerAtLocation(coordinate);

          console.log("지도 이동 완료:", { longitude: longitude, latitude: latitude });
        } catch (error) {
          console.error("지도 이동 중 오류 발생:", error);
        }
      } else {
        console.warn("지도 객체를 찾을 수 없습니다. 지도가 초기화되었는지 확인해주세요.");
      }
    },

    /**
     * 특정 좌표에 마커(핀) 추가
     */
    addMarkerAtLocation: function (coordinate) {
      try {
        // 전역 highlightSource가 있는지 확인
        if (typeof window.highlightSource !== "undefined" && window.highlightSource) {
          // 기존 하이라이트 제거
          window.highlightSource.clear();

          // 마커 포인트 생성
          var markerPoint = new ol.geom.Point(coordinate);
          var markerFeature = new ol.Feature(markerPoint);

          // 마커 스타일 설정 (완전 오프라인 지원)
          // TODO: 추후 이미지로 대체 시 아래와 같이 변경
          // var markerStyle = new ol.style.Style({
          //   image: new ol.style.Icon({
          //     src: '/resources/images/marker-icon.png', // 마커 이미지 경로
          //     scale: 1.0, // 이미지 크기 조절 (1.0 = 원본 크기)
          //     anchor: [0.5, 1], // 앵커 포인트 (중앙 하단)
          //     anchorXUnits: 'fraction', // X 앵커 단위
          //     anchorYUnits: 'fraction'  // Y 앵커 단위
          //   })
          // });
          var markerStyle = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 8,
              fill: new ol.style.Fill({
                color: "#ff4444",
              }),
              stroke: new ol.style.Stroke({
                color: "#ffffff",
                width: 2,
              }),
            }),
          });

          // 마커에 스타일 적용
          markerFeature.setStyle(markerStyle);

          // 하이라이트 소스에 추가
          window.highlightSource.addFeature(markerFeature);

          console.log("마커 추가 완료:", coordinate);
        } else {
          console.warn("highlightSource를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("마커 추가 중 오류 발생:", error);
      }
    },

    /**
     * 로딩 표시
     */
    showLoading: function () {
      this.$loading.show();
      this.$listContainer.hide();
      this.$paginationWrapper.hide();
    },

    /**
     * 로딩 숨김
     */
    hideLoading: function () {
      this.$loading.hide();
      this.$listContainer.show();
      this.$paginationWrapper.show();
    },

    /**
     * 빈 상태 표시
     */
    showEmpty: function () {
      this.$empty.show();
      this.$listContainer.hide();
      this.$paginationWrapper.hide();
    },

    /**
     * 빈 상태 숨김
     */
    hideEmpty: function () {
      this.$empty.hide();
      this.$listContainer.show();
      this.$paginationWrapper.show();
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
