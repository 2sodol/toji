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
        var itemHtml =
          '<div class="slide-panel-list-item" data-id="' +
          (item.ilglPrvuInfoSeq || "") +
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
