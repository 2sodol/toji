/**
 * 드론 이미지 다운로드 모달 제어 모듈
 */
(function () {
    "use strict";

    var DroneModal = {
        isOpen: false,
        $modal: null,
        $closeBtn: null,
        $searchBtn: null,
        $startDate: null,
        $endDate: null,
        $grid: null,
        $empty: null,
        $pagination: null,
        $downloadSelectedBtn: null,
        $downloadAllBtn: null,
        $selectedCount: null,

        // 데이터 관련
        mockData: [],
        currentData: [], // 현재 검색된 데이터
        selectedIds: new Set(), // 선택된 이미지 ID들
        currentPage: 1,
        pageSize: 12, // 한 페이지당 12개 (4열 x 3행)

        /**
         * 초기화
         */
        init: function () {
            this.$modal = $("#drone-modal");
            this.$closeBtn = $("#drone-modal-close");
            this.$searchBtn = $("#drone-search-btn");
            this.$startDate = $("#drone-start-date");
            this.$endDate = $("#drone-end-date");
            this.$grid = $("#drone-grid");
            this.$empty = $("#drone-empty");
            this.$pagination = $("#drone-pagination");
            this.$downloadSelectedBtn = $("#drone-download-selected");
            this.$downloadAllBtn = $("#drone-download-all");
            this.$selectedCount = $("#drone-selected-count");

            this.initMockData();
            this.bindEvents();

            // 오늘 날짜로 초기화
            var today = new Date().toISOString().split('T')[0];
            this.$startDate.val(today);
            this.$endDate.val(today);
        },

        /**
         * Mock 데이터 생성 (실제 샘플 이미지 사용)
         */
        initMockData: function () {
            var sampleImages = [
                "camera_105807.png", "camera_105810.png", "camera_105813.png", "camera_105815.png", "camera_105818.png",
                "camera_105820.png", "camera_105823.png", "camera_105825.png", "camera_105828.png", "camera_105831.png",
                "camera_105833.png", "camera_105836.png", "camera_105838.png", "camera_105841.png", "camera_105844.png",
                "camera_105846.png", "camera_105849.png", "camera_105851.png", "camera_105854.png", "camera_131347.png",
                "camera_131357.png", "camera_131359.png", "camera_131402.png", "camera_131404.png", "camera_131415.png",
                "camera_131418.png", "camera_131420.png", "camera_131422.png", "camera_131425.png", "camera_131428.png",
                "camera_131430.png", "camera_131433.png", "camera_131435.png", "camera_131438.png", "camera_131441.png",
                "camera_131443.png", "camera_131446.png", "camera_131448.png", "camera_131451.png", "camera_131453.png",
                "camera_131504.png", "camera_131507.png", "camera_131509.png", "camera_131512.png", "camera_131515.png"
            ];

            this.mockData = sampleImages.map(function (filename, index) {
                return {
                    id: "img_" + (index + 1),
                    url: "/resources/static/images/" + filename,
                    name: filename,
                    date: new Date().getTime()
                };
            });
        },

        /**
         * 이벤트 바인딩
         */
        bindEvents: function () {
            var self = this;

            // 닫기 버튼
            this.$closeBtn.on("click", function () {
                self.close();
            });

            // 열기 버튼 (슬라이드 패널에 위치)
            $("#drone-image-download-btn").on("click", function () {
                self.open();
            });

            // 모달 외부 클릭 시 닫기
            this.$modal.on("click", function (e) {
                if ($(e.target).is(self.$modal)) {
                    self.close();
                }
            });

            // 검색 버튼
            this.$searchBtn.on("click", function () {
                self.search();
            });

            // 다운로드 버튼
            this.$downloadSelectedBtn.on("click", function () {
                self.downloadSelected();
            });

            this.$downloadAllBtn.on("click", function () {
                self.downloadAll();
            });

            // 아이템 클릭 (위임)
            this.$grid.on("click", ".drone-modal__item", function (e) {
                if (!$(e.target).is("input[type='checkbox']")) {
                    var $checkbox = $(this).find(".drone-modal__checkbox");
                    $checkbox.prop("checked", !$checkbox.prop("checked")).trigger("change");
                }
            });

            // 체크박스 변경 (위임)
            this.$grid.on("change", ".drone-modal__checkbox", function () {
                var id = $(this).data("id");
                if ($(this).is(":checked")) {
                    self.selectedIds.add(id);
                    $(this).closest(".drone-modal__item").addClass("drone-modal__item--selected");
                } else {
                    self.selectedIds.delete(id);
                    $(this).closest(".drone-modal__item").removeClass("drone-modal__item--selected");
                }
                self.updateSelectedCount();
            });

            // 페이징 버튼 (위임)
            this.$pagination.on("click", ".drone-modal__page-btn", function () {
                var page = $(this).data("page");
                if (page) {
                    self.goToPage(page);
                }
            });
        },

        /**
         * 모달 열기
         */
        open: function () {
            this.isOpen = true;
            this.$modal.addClass("drone-modal--open");
            this.search();
        },

        /**
         * 모달 닫기
         */
        close: function () {
            this.isOpen = false;
            this.$modal.removeClass("drone-modal--open");
        },

        /**
         * 검색 실행
         */
        search: function () {
            var startDate = this.$startDate.val();
            var endDate = this.$endDate.val();

            if (!startDate || !endDate) {
                alert("시작 날짜와 종료 날짜를 선택해주세요.");
                return;
            }

            var startTimestamp = new Date(startDate).getTime();
            var endTimestamp = new Date(endDate).getTime();

            console.log("Search params:", { start: startTimestamp, end: endTimestamp });

            /*
            // 실제 API 연동 (추후 활성화)
            var self = this;
            $.ajax({
                url: "/drone/images", // 실제 API 엔드포인트로 변경 필요
                type: "GET",
                data: {
                    startDate: startTimestamp,
                    endDate: endTimestamp
                },
                success: function (data) {
                    // data는 이미지 객체 배열이어야 함: [{id, url, name, date}, ...]
                    self.currentData = data;
                    self.currentPage = 1;
                    self.selectedIds.clear();
                    self.updateSelectedCount();
                    self.render();
                },
                error: function (xhr, status, error) {
                    console.error("드론 이미지 조회 실패:", error);
                    alert("이미지 조회 중 오류가 발생했습니다.");
                }
            });
            return; // API 연동 시 아래 Mock 데이터 로직은 제거하거나 이 return으로 막아야 함
            */

            // Mock 데이터 사용
            this.currentData = this.mockData;
            this.currentPage = 1;
            this.selectedIds.clear();
            this.updateSelectedCount();
            this.render();
        },

        /**
         * 페이지 이동
         */
        goToPage: function (page) {
            this.currentPage = page;
            this.render();
        },

        /**
         * 렌더링 (리스트 + 페이징)
         */
        render: function () {
            this.renderList();
            this.renderPagination();
        },

        /**
         * 리스트 렌더링
         */
        renderList: function () {
            this.$grid.empty();

            if (this.currentData.length === 0) {
                this.$grid.hide();
                this.$empty.show();
                return;
            }

            this.$grid.show();
            this.$empty.hide();

            var start = (this.currentPage - 1) * this.pageSize;
            var end = start + this.pageSize;
            var pageData = this.currentData.slice(start, end);

            var self = this;
            pageData.forEach(function (item) {
                var isSelected = self.selectedIds.has(item.id);
                var $item = $(
                    '<div class="drone-modal__item ' + (isSelected ? "drone-modal__item--selected" : "") + '">' +
                    '<div class="drone-modal__thumb-wrapper">' +
                    '<input type="checkbox" class="drone-modal__checkbox" data-id="' + item.id + '" ' + (isSelected ? "checked" : "") + '>' +
                    '<img src="' + item.url + '" class="drone-modal__thumb" alt="' + item.name + '">' +
                    '</div>' +
                    '<div class="drone-modal__item-info">' + item.name + '</div>' +
                    '</div>'
                );
                self.$grid.append($item);
            });
        },

        /**
         * 페이징 렌더링
         */
        renderPagination: function () {
            this.$pagination.empty();

            var totalPages = Math.ceil(this.currentData.length / this.pageSize);
            if (totalPages <= 1) return;

            var $prevBtn = $('<button class="drone-modal__page-btn" data-page="' + (this.currentPage - 1) + '">&lt;</button>');
            if (this.currentPage === 1) $prevBtn.prop("disabled", true);
            this.$pagination.append($prevBtn);

            for (var i = 1; i <= totalPages; i++) {
                var $btn = $('<button class="drone-modal__page-btn" data-page="' + i + '">' + i + '</button>');
                if (i === this.currentPage) $btn.addClass("drone-modal__page-btn--active");
                this.$pagination.append($btn);
            }

            var $nextBtn = $('<button class="drone-modal__page-btn" data-page="' + (this.currentPage + 1) + '">&gt;</button>');
            if (this.currentPage === totalPages) $nextBtn.prop("disabled", true);
            this.$pagination.append($nextBtn);
        },

        /**
         * 선택된 개수 업데이트
         */
        updateSelectedCount: function () {
            this.$selectedCount.text(this.selectedIds.size);
        },

        /**
         * 선택 다운로드
         */
        downloadSelected: function () {
            if (this.selectedIds.size === 0) {
                alert("다운로드할 이미지를 선택해주세요.");
                return;
            }

            var self = this;
            var selectedItems = this.currentData.filter(function (item) {
                return self.selectedIds.has(item.id);
            });

            if (confirm(selectedItems.length + "개의 이미지를 다운로드하시겠습니까?")) {
                this.downloadImages(selectedItems);
            }
        },

        /**
         * 전체 다운로드
         */
        downloadAll: function () {
            if (this.currentData.length === 0) {
                alert("다운로드할 이미지가 없습니다.");
                return;
            }

            if (confirm("전체 " + this.currentData.length + "개의 이미지를 다운로드하시겠습니까?\n(이미지가 많을 경우 시간이 소요될 수 있습니다)")) {
                this.downloadImages(this.currentData);
            }
        },

        /**
         * 이미지 리스트 다운로드 (순차 처리)
         */
        /**
         * 이미지 리스트 다운로드 (단일: 직접 다운로드, 다중: ZIP 압축 다운로드)
         */
        downloadImages: function (items) {
            var self = this;

            if (items.length === 0) return;

            // 1개일 경우 그냥 다운로드
            if (items.length === 1) {
                this.downloadImage(items[0].url, items[0].name);
                return;
            }

            // 다중 선택 시 ZIP 압축
            var zip = new JSZip();
            var folder = zip.folder("drone_images");
            var promises = [];

            items.forEach(function (item) {
                var promise = fetch(item.url)
                    .then(function (response) {
                        if (!response.ok) throw new Error("Network response was not ok");
                        return response.blob();
                    })
                    .then(function (blob) {
                        folder.file(item.name, blob);
                    })
                    .catch(function (error) {
                        console.error("이미지 다운로드 실패:", item.name, error);
                    });
                promises.push(promise);
            });

            Promise.all(promises).then(function () {
                zip.generateAsync({ type: "blob" }).then(function (content) {
                    // FileSaver.js의 saveAs 사용
                    saveAs(content, "drone_images_" + new Date().getTime() + ".zip");
                });
            });
        },

        /**
         * 단일 이미지 다운로드
         */
        downloadImage: function (url, filename) {
            fetch(url)
                .then(function (response) {
                    return response.blob();
                })
                .then(function (blob) {
                    // FileSaver.js의 saveAs 사용 (더 안정적)
                    if (window.saveAs) {
                        saveAs(blob, filename);
                    } else {
                        // Fallback
                        var link = document.createElement("a");
                        var objectURL = window.URL.createObjectURL(blob);
                        link.href = objectURL;
                        link.download = filename;
                        link.style.display = "none";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(function () {
                            window.URL.revokeObjectURL(objectURL);
                        }, 100);
                    }
                })
                .catch(function (error) {
                    console.error("이미지 다운로드 실패:", filename, error);
                });
        }
    };

    // 초기화
    $(document).ready(function () {
        DroneModal.init();
    });

    // 전역 노출
    window.DroneModal = DroneModal;
})();
