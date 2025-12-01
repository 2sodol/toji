<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
        <!DOCTYPE html>
        <html lang="ko">

        <head>
            <meta charset="UTF-8">
            <title>드론 수집 결과 모니터링</title>

            <!-- Fonts -->
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
                rel="stylesheet">
            <!-- Bootstrap 4 CSS -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

            <style>
                :root {
                    --primary-color: #2c3e50;
                    --accent-color: #3498db;
                    --bg-color: #f8f9fa;
                    --text-color: #333;
                    --text-muted: #6c757d;
                    --border-radius: 12px;
                    --card-border-radius: 8px;
                }

                body {
                    font-family: 'Noto Sans KR', sans-serif;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                }

                /* 모달 커스텀 */
                .modal-lg {
                    max-width: 90%;
                    margin: 1.75rem auto;
                }

                .modal-content {
                    border: none;
                    border-radius: var(--border-radius);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    border-bottom: 1px solid #eee;
                    padding: 1.5rem 2rem;
                    background-color: #fff;
                    border-top-left-radius: var(--border-radius);
                    border-top-right-radius: var(--border-radius);
                    flex-shrink: 0;
                }

                .modal-title {
                    font-weight: 700;
                    color: var(--primary-color);
                }

                .modal-body {
                    padding: 0;
                    background-color: var(--bg-color);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    flex: 1;
                }

                /* 액션 바 */
                .action-bar {
                    background-color: #fff;
                    padding: 1rem 2rem;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                    z-index: 10;
                }

                .selection-info {
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                    color: var(--text-color);
                }

                .custom-checkbox-lg {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                /* 갤러리 영역 */
                .gallery-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                }

                .gallery-container::-webkit-scrollbar {
                    width: 8px;
                }

                .gallery-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .gallery-container::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 4px;
                }

                .gallery-container::-webkit-scrollbar-thumb:hover {
                    background: #aaa;
                }

                /* 그룹 섹션 */
                .group-section {
                    margin-bottom: 2.5rem;
                }

                .group-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #eee;
                }

                .group-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 0;
                    margin-right: 0.8rem;
                }

                .group-count {
                    background-color: #e9ecef;
                    color: var(--text-muted);
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                /* 갤러리 카드 */
                .gallery-card {
                    background: #fff;
                    border-radius: var(--card-border-radius);
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    position: relative;
                    border: 2px solid transparent;
                    height: 100%;
                }

                .gallery-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .gallery-card.selected {
                    border-color: var(--accent-color);
                    background-color: #f0f7ff;
                }

                .gallery-card.selected .card-check-indicator {
                    background-color: var(--accent-color);
                    border-color: var(--accent-color);
                }

                .gallery-card.selected .card-check-indicator i {
                    display: block;
                }

                .card-img-wrapper {
                    position: relative;
                    width: 100%;
                    padding-top: 75%;
                    /* 4:3 Aspect Ratio */
                    background-color: #eee;
                    overflow: hidden;
                }

                .card-img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .gallery-card:hover .card-img {
                    transform: scale(1.05);
                }

                .card-check-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 24px;
                    height: 24px;
                    background-color: rgba(255, 255, 255, 0.8);
                    border: 2px solid #ccc;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    transition: all 0.2s;
                }

                .card-check-indicator i {
                    color: white;
                    font-size: 12px;
                    display: none;
                }



                /* 버튼 스타일 */
                .btn-download-selected {
                    background-color: var(--accent-color);
                    border-color: var(--accent-color);
                    color: white;
                    border-radius: 50px;
                    padding: 0.5rem 1.5rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-download-selected:hover:not(:disabled) {
                    background-color: #2980b9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
                    color: white;
                }

                .btn-download-selected:disabled {
                    background-color: #bdc3c7;
                    border-color: #bdc3c7;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 5rem 0;
                    color: var(--text-muted);
                }

                .empty-state i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    color: #dee2e6;
                }

                /* Select Box */
                .custom-select-lg {
                    height: calc(2.875rem + 2px);
                    padding: .5rem 1rem;
                    font-size: 1rem;
                    border-radius: 0.3rem;
                    border: 1px solid #ced4da;
                }
            </style>
        </head>

        <body>

            <div class="container mt-5 text-center">
                <h2 class="mb-4 font-weight-bold">드론 영상 아카이브 시스템</h2>
                <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-primary btn-lg shadow-sm mr-3" id="btnOpenMonitor">
                        <i class="fas fa-search mr-2"></i>드론 수집 결과 조회
                    </button>
                    <button type="button" class="btn btn-secondary btn-lg shadow-sm"
                        onclick="location.href='<%=request.getContextPath()%>/'">
                        <i class="fas fa-map-marked-alt mr-2"></i>지도 화면으로 이동
                    </button>
                </div>
            </div>

            <!-- 모달 -->
            <div class="modal fade" id="droneMonitorModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="d-flex align-items-center w-100">
                                <h5 class="modal-title mr-4"><i class="fas fa-drone-alt mr-2"></i>드론 수집 이미지 조회</h5>
                                <div style="width: 250px;">
                                    <select class="custom-select" id="searchDate">
                                        <option value="">날짜를 선택하세요</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <div class="modal-body">
                            <!-- 액션 바 -->
                            <div class="action-bar">
                                <div class="selection-info">
                                    <div class="custom-control custom-checkbox mr-3">
                                        <input type="checkbox" class="custom-control-input" id="checkAll">
                                        <label class="custom-control-label" for="checkAll" style="cursor: pointer;">전체
                                            선택</label>
                                    </div>
                                    <span class="text-primary font-weight-bold" id="selectedCount">0</span>
                                    <span class="text-muted ml-1">개 선택됨</span>
                                </div>
                                <div>
                                    <button type="button" class="btn btn-download-selected" id="btnDownloadSelected"
                                        disabled>
                                        <i class="fas fa-download mr-2"></i>선택 다운로드
                                    </button>
                                </div>
                            </div>

                            <!-- 갤러리 영역 -->
                            <div class="gallery-container" id="galleryContainer">
                                <div class="empty-state">
                                    <i class="far fa-calendar-alt"></i>
                                    <p>상단에서 촬영 날짜를 선택해주세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scripts -->
            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>

            <script>
                $(document).ready(function () {
                    let currentData = []; // 현재 로드된 전체 데이터
                    let selectedIds = new Set(); // 선택된 이미지 ID (또는 고유 식별자)

                    // 모달 열기
                    $('#btnOpenMonitor').on('click', function () {
                        $('#droneMonitorModal').modal('show');
                        loadDateList();
                    });

                    // 날짜 변경
                    $('#searchDate').on('change', function () {
                        var date = $(this).val();
                        if (date) {
                            loadImgList(date);
                        } else {
                            renderEmptyState('날짜를 선택해주세요.');
                        }
                    });

                    // 전체 선택 체크박스
                    $('#checkAll').on('change', function () {
                        const isChecked = $(this).is(':checked');
                        if (isChecked) {
                            // 전체 선택
                            $('.gallery-card').addClass('selected');
                            currentData.forEach(item => selectedIds.add(item.fileName)); // fileName을 ID로 사용
                        } else {
                            // 전체 해제
                            $('.gallery-card').removeClass('selected');
                            selectedIds.clear();
                        }
                        updateSelectionUI();
                    });

                    // 선택 다운로드 버튼
                    $('#btnDownloadSelected').on('click', function () {
                        downloadSelectedImages();
                    });

                    // 날짜 목록 로드
                    function loadDateList() {
                        $.ajax({
                            url: '/drone/api/dates.do',
                            type: 'GET',
                            dataType: 'json',
                            success: function (data) {
                                var $select = $('#searchDate');
                                $select.empty();
                                $select.append('<option value="">날짜를 선택하세요</option>');

                                if (data && data.length > 0) {
                                    $.each(data, function (i, item) {
                                        var text = item.WORK_DATE + ' (' + item.PHOTO_CNT + '건)';
                                        $select.append($('<option>', {
                                            value: item.WORK_DATE,
                                            text: text
                                        }));
                                    });
                                    // 가장 최근 날짜 자동 선택 (옵션)
                                    // $select.val(data[0].WORK_DATE).trigger('change');
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error("날짜 목록 로드 실패:", error);
                            }
                        });
                    }

                    // 이미지 리스트 로드 및 렌더링
                    function loadImgList(date) {
                        $.ajax({
                            url: '/drone/api/list.do',
                            type: 'GET',
                            data: { date: date },
                            dataType: 'json',
                            success: function (data) {
                                currentData = data;
                                selectedIds.clear(); // 데이터 새로 로드 시 선택 초기화
                                $('#checkAll').prop('checked', false);
                                updateSelectionUI();

                                if (data && data.length > 0) {
                                    renderGallery(data);
                                } else {
                                    renderEmptyState('해당 날짜에 수집된 이미지가 없습니다.');
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error("이미지 목록 로드 실패:", error);
                                renderEmptyState('데이터 로드 중 오류가 발생했습니다.');
                            }
                        });
                    }

                    // 갤러리 렌더링 (그룹핑 로직 포함)
                    function renderGallery(data) {
                        const $container = $('#galleryContainer');
                        $container.empty();

                        // 1. 그룹핑 (ADDR_GROUP 기준)
                        const grouped = {};
                        data.forEach(item => {
                            const groupKey = item.addrGroup || '주소 미상';
                            if (!grouped[groupKey]) {
                                grouped[groupKey] = [];
                            }
                            grouped[groupKey].push(item);
                        });

                        // 2. 그룹별 섹션 생성
                        Object.keys(grouped).forEach(groupName => {
                            const items = grouped[groupName];

                            // 섹션 컨테이너
                            const $section = $('<div>').addClass('group-section');

                            // 헤더
                            const $header = $('<div>').addClass('group-header')
                                .append($('<h5>').addClass('group-title').text(groupName))
                                .append($('<span>').addClass('group-count').text(items.length + '장'));

                            $section.append($header);

                            // 그리드 로우
                            const $row = $('<div>').addClass('row');

                            // 아이템 카드 생성
                            items.forEach(item => {
                                const $col = $('<div>').addClass('col-6 col-md-4 col-lg-3 mb-4');
                                const $card = createGalleryCard(item);
                                $col.append($card);
                                $row.append($col);
                            });

                            $section.append($row);
                            $container.append($section);
                        });
                    }

                    // 카드 요소 생성
                    function createGalleryCard(item) {
                        // 시간 포맷팅
                        let timeStr = '-';
                        if (item.collectTime) {
                            const d = new Date(item.collectTime);
                            const hh = String(d.getHours()).padStart(2, '0');
                            const mm = String(d.getMinutes()).padStart(2, '0');
                            timeStr = hh + ':' + mm;
                        }

                        // 이미지 경로 처리
                        let webPath = '';
                        if (item.storePath) {
                            const splitKey = 'src/main/webapp';
                            const idx = item.storePath.indexOf(splitKey);
                            if (idx !== -1) {
                                webPath = item.storePath.substring(idx + splitKey.length);
                                webPath = webPath.replace(/\\/g, '/');
                            } else {
                                webPath = item.storePath;
                            }
                        }

                        const $card = $('<div>').addClass('gallery-card').attr('data-id', item.fileName).attr('data-url', webPath);

                        // 이미지 래퍼
                        const $imgWrapper = $('<div>').addClass('card-img-wrapper');
                        const $img = $('<img>').addClass('card-img').attr('src', webPath).attr('alt', item.fileName);

                        // 체크박스 인디케이터
                        const $indicator = $('<div>').addClass('card-check-indicator')
                            .append($('<i>').addClass('fas fa-check'));

                        $imgWrapper.append($img).append($indicator);

                        $card.append($imgWrapper);

                        // 클릭 이벤트 (토글)
                        $card.on('click', function () {
                            const id = $(this).attr('data-id');

                            if (selectedIds.has(id)) {
                                selectedIds.delete(id);
                                $(this).removeClass('selected');
                            } else {
                                selectedIds.add(id);
                                $(this).addClass('selected');
                            }
                            updateSelectionUI();
                        });

                        return $card;
                    }

                    // 선택 상태 UI 업데이트
                    function updateSelectionUI() {
                        const count = selectedIds.size;
                        $('#selectedCount').text(count);

                        // 다운로드 버튼 활성/비활성
                        if (count > 0) {
                            $('#btnDownloadSelected').prop('disabled', false);
                        } else {
                            $('#btnDownloadSelected').prop('disabled', true);
                        }

                        // 전체 선택 체크박스 상태 동기화
                        const totalCount = currentData.length;
                        if (totalCount > 0 && count === totalCount) {
                            $('#checkAll').prop('checked', true);
                        } else {
                            $('#checkAll').prop('checked', false);
                        }
                    }

                    // 빈 상태 렌더링
                    function renderEmptyState(msg) {
                        const $container = $('#galleryContainer');
                        $container.empty();
                        $container.append(
                            $('<div>').addClass('empty-state')
                                .append($('<i>').addClass('far fa-folder-open'))
                                .append($('<p>').text(msg))
                        );
                    }

                    // 선택된 이미지 다운로드
                    function downloadSelectedImages() {
                        if (selectedIds.size === 0) return;

                        // 선택된 카드의 URL 수집
                        const urls = [];
                        $('.gallery-card.selected').each(function () {
                            urls.push($(this).attr('data-url'));
                        });

                        if (urls.length === 0) return;

                        if (!confirm(urls.length + '개의 이미지를 다운로드 하시겠습니까?')) return;

                        // 순차 다운로드 트리거
                        urls.forEach((url, index) => {
                            setTimeout(() => {
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = ''; // 파일명은 브라우저가 결정하거나 URL 따름
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }, index * 500); // 0.5초 간격으로 다운로드 시도
                        });
                    }
                });
            </script>

        </body>

        </html>