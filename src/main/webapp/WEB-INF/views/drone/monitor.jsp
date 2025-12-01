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
                }

                body {
                    font-family: 'Noto Sans KR', sans-serif;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                }

                /* 모달 커스텀 */
                .modal-lg {
                    max-width: 95%;
                    /* 더 넓게 */
                }

                .modal-content {
                    border: none;
                    border-radius: var(--border-radius);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }

                .modal-header {
                    border-bottom: 1px solid #eee;
                    padding: 1.5rem 2rem;
                    background-color: #fff;
                    border-top-left-radius: var(--border-radius);
                    border-top-right-radius: var(--border-radius);
                }

                .modal-title {
                    font-weight: 700;
                    color: var(--primary-color);
                }

                .modal-body {
                    padding: 2rem;
                    background-color: var(--bg-color);
                    min-height: 70vh;
                }

                /* 좌측 리스트 영역 */
                .list-container {
                    background: #fff;
                    border-radius: var(--border-radius);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .list-header {
                    padding: 1.2rem;
                    border-bottom: 1px solid #f0f0f0;
                    font-weight: 600;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .img-list-group {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.5rem;
                }

                /* 커스텀 스크롤바 */
                .img-list-group::-webkit-scrollbar {
                    width: 6px;
                }

                .img-list-group::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .img-list-group::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 3px;
                }

                .img-list-group::-webkit-scrollbar-thumb:hover {
                    background: #aaa;
                }

                /* 리스트 아이템 (카드 스타일) */
                .list-card {
                    display: block;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    text-decoration: none !important;
                    color: var(--text-color);
                    position: relative;
                    overflow: hidden;
                }

                .list-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border-color: var(--accent-color);
                }

                .list-card.active {
                    background-color: #f0f7ff;
                    border-color: var(--accent-color);
                    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
                }

                .list-card.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background-color: var(--accent-color);
                }

                .list-card-time {
                    font-size: 0.85rem;
                    color: var(--accent-color);
                    font-weight: 600;
                    margin-bottom: 0.2rem;
                }

                .list-card-addr {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #2c3e50;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* 우측 프리뷰 영역 */
                .preview-container {
                    background: #fff;
                    border-radius: var(--border-radius);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
                    height: 100%;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                }

                .img-wrapper {
                    width: 100%;
                    height: 400px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    border: 1px solid #eee;
                }

                .preview-img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    color: var(--text-muted);
                }

                .empty-state i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    color: #dee2e6;
                }

                /* 상세 정보 (Description List) */
                .info-dl {
                    display: grid;
                    grid-template-columns: 100px 1fr;
                    gap: 0.8rem 1rem;
                    font-size: 0.95rem;
                }

                .info-dt {
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .info-dd {
                    color: var(--text-color);
                    margin-bottom: 0;
                }

                .btn-download {
                    background-color: var(--accent-color);
                    border-color: var(--accent-color);
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 500;
                    box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
                    transition: all 0.2s;
                }

                .btn-download:hover {
                    background-color: #2980b9;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px rgba(52, 152, 219, 0.3);
                    color: white;
                }

                .btn-download.disabled {
                    background-color: #bdc3c7;
                    border-color: #bdc3c7;
                    box-shadow: none;
                }

                /* Select Box Custom */
                .custom-select-lg {
                    height: calc(2.875rem + 2px);
                    padding: .5rem 1rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    border-radius: 0.3rem;
                    border: 1px solid #ced4da;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
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
                            <h5 class="modal-title"><i class="fas fa-drone-alt mr-2"></i>드론 수집 이미지 조회</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <!-- 상단 필터 -->
                            <div class="d-flex align-items-center mb-4">
                                <label for="searchDate" class="mr-3 mb-0 font-weight-bold text-muted">촬영 일자</label>
                                <div style="width: 300px;">
                                    <select class="custom-select custom-select-lg" id="searchDate">
                                        <option value="">날짜를 선택하세요</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row h-100" style="min-height: 500px;">
                                <!-- 좌측 리스트 -->
                                <div class="col-md-4 h-100">
                                    <div class="list-container">
                                        <div class="list-header">
                                            <span>이미지 목록</span>
                                            <span class="badge badge-primary badge-pill" id="listCount">0</span>
                                        </div>
                                        <div class="img-list-group" id="imgList">
                                            <!-- JS로 렌더링 -->
                                            <div class="text-center py-5 text-muted">
                                                <i class="far fa-calendar-alt mb-2 d-block"
                                                    style="font-size: 2rem;"></i>
                                                날짜를 선택해주세요.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 우측 프리뷰 -->
                                <div class="col-md-8 h-100">
                                    <div class="preview-container">
                                        <!-- 이미지 영역 -->
                                        <div class="img-wrapper">
                                            <img src="" class="preview-img" id="previewImg" alt="이미지 미리보기"
                                                style="display:none;">
                                            <div id="previewPlaceholder" class="empty-state">
                                                <i class="far fa-image"></i>
                                                <p>목록에서 이미지를 선택해주세요.</p>
                                            </div>
                                        </div>

                                        <!-- 상세 정보 영역 -->
                                        <div class="d-flex justify-content-between align-items-end">
                                            <div class="info-dl">
                                                <div class="info-dt">파일명</div>
                                                <div class="info-dd" id="infoFileName">-</div>

                                                <div class="info-dt">촬영일시</div>
                                                <div class="info-dd" id="infoCollectTime">-</div>

                                                <div class="info-dt">위치</div>
                                                <div class="info-dd" id="infoAddrFull">-</div>

                                                <div class="info-dt">좌표</div>
                                                <div class="info-dd" id="infoGps">-</div>
                                            </div>

                                            <div>
                                                <a href="#" class="btn btn-download disabled" id="btnDownload" download>
                                                    <i class="fas fa-download mr-1"></i> 원본 다운로드
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> <!-- modal-body -->
                    </div>
                </div>
            </div>

            <!-- Scripts -->
            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>

            <script>
                $(document).ready(function () {

                    // 모달 열기 버튼 클릭
                    $('#btnOpenMonitor').on('click', function () {
                        $('#droneMonitorModal').modal('show');
                        loadDateList();
                    });

                    // 날짜 변경 시 리스트 조회
                    $('#searchDate').on('change', function () {
                        var date = $(this).val();
                        if (date) {
                            loadImgList(date);
                        } else {
                            renderEmptyList('날짜를 선택해주세요.');
                            resetPreview();
                        }
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

                                if (data && data.length > 0) {
                                    $.each(data, function (i, item) {
                                        var text = item.WORK_DATE + ' (' + item.PHOTO_CNT + '건)';
                                        $select.append($('<option>', {
                                            value: item.WORK_DATE,
                                            text: text
                                        }));
                                    });
                                    $select.trigger('change');
                                } else {
                                    $select.append('<option value="">데이터 없음</option>');
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error("날짜 목록 로드 실패:", error);
                            }
                        });
                    }

                    // 이미지 리스트 로드
                    function loadImgList(date) {
                        $.ajax({
                            url: '/drone/api/list.do',
                            type: 'GET',
                            data: { date: date },
                            dataType: 'json',
                            success: function (data) {
                                var $list = $('#imgList');
                                $list.empty();
                                $('#listCount').text(data.length);

                                if (data && data.length > 0) {
                                    $.each(data, function (i, item) {
                                        // 시간 포맷팅 (HH:mm)
                                        var timeStr = '-';
                                        if (item.collectTime) {
                                            var d = new Date(item.collectTime);
                                            var hh = String(d.getHours()).padStart(2, '0');
                                            var mm = String(d.getMinutes()).padStart(2, '0');
                                            timeStr = hh + ':' + mm;
                                        }

                                        // 주소 포맷팅 (번지 제거)
                                        // 예: "충남 천안시 서북구 성정동 123-1" -> "충남 천안시 서북구 성정동"
                                        var displayAddr = item.addrFull || '주소미상';
                                        // 정규식: 공백 뒤에 숫자(-숫자)로 끝나는 패턴 제거
                                        displayAddr = displayAddr.replace(/\s[\d]+(-[\d]+)?$/, '');

                                        var $card = $('<a>', {
                                            class: 'list-card',
                                            href: '#',
                                            html: '<div class="list-card-time"><i class="far fa-clock mr-1"></i>' + timeStr + '</div>' +
                                                '<div class="list-card-addr" title="' + displayAddr + '">' + displayAddr + '</div>'
                                        });

                                        $card.data('info', item);

                                        $card.on('click', function (e) {
                                            e.preventDefault();
                                            $list.find('.active').removeClass('active');
                                            $(this).addClass('active');
                                            showPreview(item);
                                        });

                                        $list.append($card);
                                    });
                                } else {
                                    renderEmptyList('데이터가 없습니다.');
                                    resetPreview();
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error("이미지 목록 로드 실패:", error);
                            }
                        });
                    }

                    function renderEmptyList(msg) {
                        $('#imgList').html(
                            '<div class="text-center py-5 text-muted">' +
                            '<i class="far fa-folder-open mb-2 d-block" style="font-size: 2rem;"></i>' +
                            msg + '</div>'
                        );
                        $('#listCount').text('0');
                    }

                    // 프리뷰 표시
                    function showPreview(item) {
                        // 경로 변환
                        var webPath = '';
                        if (item.storePath) {
                            var splitKey = 'src/main/webapp';
                            var idx = item.storePath.indexOf(splitKey);
                            if (idx !== -1) {
                                webPath = item.storePath.substring(idx + splitKey.length);
                                webPath = webPath.replace(/\\/g, '/');
                            } else {
                                webPath = item.storePath;
                            }
                        }

                        // 이미지 로드
                        var $img = $('#previewImg');
                        $img.attr('src', webPath).hide();
                        $img.on('load', function () {
                            $(this).fadeIn(300);
                        });

                        $('#previewPlaceholder').hide();

                        // 상세 정보 바인딩
                        $('#infoFileName').text(item.fileName);

                        var d = new Date(item.collectTime);
                        $('#infoCollectTime').text(d.toLocaleString());

                        $('#infoAddrFull').text(item.addrFull || '-');

                        var gpsText = '-';
                        if (item.latitude && item.longitude) {
                            gpsText = item.latitude.toFixed(5) + ', ' + item.longitude.toFixed(5);
                        }
                        $('#infoGps').text(gpsText);

                        // 다운로드 버튼 활성화
                        $('#btnDownload').attr('href', webPath).removeClass('disabled');
                    }

                    // 프리뷰 초기화
                    function resetPreview() {
                        $('#previewImg').attr('src', '').hide();
                        $('#previewPlaceholder').show();
                        $('#infoFileName').text('-');
                        $('#infoCollectTime').text('-');
                        $('#infoAddrFull').text('-');
                        $('#infoGps').text('-');
                        $('#btnDownload').attr('href', '#').addClass('disabled');
                    }
                });
            </script>

        </body>

        </html>