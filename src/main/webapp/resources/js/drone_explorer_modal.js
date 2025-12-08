(function ($) {
    // =========================================================================
    // 1. 설정 및 상태 관리
    // =========================================================================
    const EXTERNAL_API_URL = "https://dsc.ex.co.kr:9550/ex/drone/images";
    const INTERNAL_API_SCHEDULE = "http://localhost:8080/api/drone/schedule"; // 필요시 호스트 조정

    var map;
    var clusterSource;
    var vectorLayer;
    var availableDates = []; // YYYYMMDD 목록
    var isMapInitialized = false;

    // 테스트용 Mock Data (실제 API 호출 대신 사용)
    const MOCK_DATA_SOURCE = [
        'http://172.16.164.220:9630/flight/1731653711981/images/20241115_155843.png',
        'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204271518.png',
        'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204273122.png',
        'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204275793.png',
        'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204277380.png',
        'http://172.16.164.220:9630/flight/1733206081751/images/capture_image_1733206168700.png',
        'http://172.16.164.220:9630/flight/1733206081751/images/capture_image_1733206171736.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206858540.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206862304.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206868753.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206872216.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206874346.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206914025.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206930353.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206932607.png',
        'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206934746.png',
        'http://172.16.164.220:9630/flight/1735192803061/images/capture_image_1735192729406.png',
        'http://172.16.164.220:9630/flight/1735192803061/images/capture_image_1735192731221.png',
        'http://172.16.164.220:9630/flight/1735192803061/images/capture_image_1735192733439.png',
        'http://172.16.164.220:9630/flight/1735195345041/images/capture_image_1735195501447.png',
        'http://172.16.164.220:9630/flight/1735195345041/images/capture_image_1735195502848.png',
        'http://172.16.164.220:9630/flight/1735195345041/images/capture_image_1735195504024.png',
        'https://dsc.ex.co.kr:9630/flight/1761109100226/images/20251022_135903.png',
        'https://dsc.ex.co.kr:9630/flight/1761109100226/images/20251022_135903.png',
        'https://dsc.ex.co.kr:9630/flight/1761110212221/images/20251022_141720.png',
        'https://dsc.ex.co.kr:9630/flight/1761110614433/images/20251022_142402.png',
        'https://dsc.ex.co.kr:9630/flight/1761110614433/images/20251022_142419.png',
        'https://dsc.ex.co.kr:9630/flight/1761115259689/images/20251022_154127.png',
        'https://dsc.ex.co.kr:9630/flight/1761115259689/images/20251022_154143.png',
        'https://dsc.ex.co.kr:9630/flight/1761115886857/images/20251022_155155.png',
        'https://dsc.ex.co.kr:9630/flight/1761115886857/images/20251022_155207.png',
        'https://dsc.ex.co.kr:9630/flight/1761116155313/images/20251022_155622.png',
        'https://dsc.ex.co.kr:9630/flight/1761116155313/images/20251022_155634.png',
        'https://dsc.ex.co.kr:9630/flight/1761116273952/images/20251022_155828.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110336.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110339.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110342.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110350.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110356.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110402.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110411.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110418.png',
        'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110422.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140226.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140230.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140238.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140247.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140252.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140259.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140307.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140310.png',
        'https://dsc.ex.co.kr:9630/flight/1761627673325/images/camera_140313.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145350.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145355.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145402.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145412.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145417.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145423.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145431.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145434.png',
        'https://dsc.ex.co.kr:9630/flight/1761630752024/images/camera_145438.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101618.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101621.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101625.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101628.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101631.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101635.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101638.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101641.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101645.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101648.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101652.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101655.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101659.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101702.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101705.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101709.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101712.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101716.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101719.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101723.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101726.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101729.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101733.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101736.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101740.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101743.png',
        'https://dsc.ex.co.kr:9630/flight/1761786898136/images/camera_101746.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111700.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111702.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111705.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111708.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111718.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111721.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111723.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111726.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111728.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111731.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111733.png',
        'https://dsc.ex.co.kr:9630/flight/1761790538548/images/camera_111736.png'
    ];

    // =========================================================================
    // 2. 초기화 (Initialization)
    // =========================================================================
    window.openDroneExplorer = function () {
        $('#drp-modal').show();

        // UI 초기화
        $('#drp-photo-list-ul').hide();
        $('#drp-empty-state').show().text("데이터 동기화 중입니다...");
        $('#drp-loading-state').hide();
        $('#drp-download-bar').hide();

        // 날짜 선택 박스 초기화
        $('#drp-date-select').empty().append($('<option>', { value: '', text: '동기화 중...' }));

        if (!isMapInitialized) {
            initMap();
            isMapInitialized = true;
        } else {
            setTimeout(() => map.updateSize(), 200);
        }

        // 동기화 후 일정 로드 시작
        syncAndLoadSchedule();
    };

    function closeDrpModal() {
        $('#drp-modal').hide();
    }

    $('#drp-close-btn').on('click', closeDrpModal);
    $('#drp-viewer-close').on('click', function () { $('#drp-image-viewer').hide(); });


    // =========================================================================
    // 3. 데이터 동기화 및 일정 로드 (Sync & Load Schedule)
    // =========================================================================

    // 3-1. 동기화 및 DB 저장, 이후 로드
    function syncAndLoadSchedule() {
        console.log("Starting Sync...");

        // 최근 1개월(30일) 데이터 요청 타임스탬프 계산
        var now = new Date();
        var endTimestamp = now.getTime();
        var startTimestamp = endTimestamp - (30 * 24 * 60 * 60 * 1000); // 30일 전

        // [MOCK MODE] 실제 API는 주석 처리, MOCK 데이터 사용
        // 실제 API 호출 로직 (운영 시 주석 해제)
        /*
        $.ajax({
            url: EXTERNAL_API_URL,
            method: 'GET',
            data: {
                start_timestamp: startTimestamp,
                end_timestamp: endTimestamp
            },
            success: function (response) { 
                processSyncResponse(response); 
            },
            error: function (err) {
                console.error("External API Failed", err);
                // 실패 시에도 DB에 기존 데이터가 있을 수 있으므로 로드 시도
                loadScheduleFromDB();
            }
        });
        */

        // MOCK 데이터로 진행
        setTimeout(function () {
            processSyncResponse(MOCK_DATA_SOURCE);
        }, 500);
    }

    // 3-2. 응답 데이터 처리 및 DB Sync
    function processSyncResponse(response) {
        // 응답 Parsing (Single Quote 배열 대응)
        var urlList;
        if (typeof response === 'string') {
            try {
                urlList = JSON.parse(response);
            } catch (e) {
                try {
                    var fixedResponse = response.replace(/'/g, '"');
                    urlList = JSON.parse(fixedResponse);
                } catch (e2) {
                    console.error("Failed to parse response", response);
                    urlList = [];
                }
            }
        } else {
            urlList = response || [];
        }

        var uniqueDates = new Set();

        // 날짜 추출 로직
        urlList.forEach(function (url) {
            // 패턴 1: .../YYYYMMDD_HHMMSS...
            var match = url.match(/(\d{8})_\d{6}/);
            if (match && match[1]) {
                uniqueDates.add(match[1]);
            } else {
                // 패턴 2: 경로 내 타임스탬프 .../flight/TIMESTAMP/...
                var tsMatch = url.match(/\/flight\/(\d+)\//);
                if (tsMatch && tsMatch[1]) {
                    var date = new Date(parseInt(tsMatch[1]));
                    var yyyy = date.getFullYear();
                    var mm = String(date.getMonth() + 1).padStart(2, '0');
                    var dd = String(date.getDate()).padStart(2, '0');
                    uniqueDates.add(yyyy + mm + dd);
                }
            }
        });

        var dateArray = Array.from(uniqueDates);
        console.log("Found dates:", dateArray);

        // 2. 추출한 날짜를 DB에 저장 (Sync)
        if (dateArray.length > 0) {
            $.ajax({
                url: '/api/drone/schedule/sync',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dateArray),
                success: function () {
                    console.log("Sync Complete.");
                    loadScheduleFromDB();
                },
                error: function (err) {
                    console.error("Sync Failed", err);
                    // Sync fail simulates fallback to local load
                    loadScheduleFromDB();
                }
            });
        } else {
            loadScheduleFromDB();
        }
    }

    // 3-3. DB에서 일정 조회 후 Select Box 렌더링
    function loadScheduleFromDB() {
        $.get("/api/drone/schedule", function (dates) {
            availableDates = dates || [];
            var $select = $('#drp-date-select');
            $select.empty();

            if (availableDates.length > 0) {
                // 내림차순 정렬
                availableDates.sort(function (a, b) { return b - a; });

                $select.append($('<option>', { value: '', text: '날짜 선택' }));

                availableDates.forEach(function (dateStr) {
                    var formatted = dateStr;
                    if (dateStr.length === 8) {
                        formatted = dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
                    }
                    $select.append($('<option>', { value: dateStr, text: formatted }));
                });

                $('#drp-empty-state').text("사진을 보려면 날짜를 선택하세요.");

            } else {
                $select.append($('<option>', { value: '', text: '촬영일 없음', disabled: true, selected: true }));
                $('#drp-empty-state').show().text("조회된 촬영일이 없습니다.");
            }
        }).fail(function () {
            $('#drp-date-select').empty().append($('<option>', { value: '', text: '로드 실패' }));
            $('#drp-empty-state').show().text("일정을 불러오는데 실패했습니다.");
        });
    }

    // 날짜 선택 이벤트
    $('#drp-date-select').on('change', function () {
        var selectedDate = $(this).val();
        if (selectedDate) {
            loadImagesForDate(selectedDate);
        } else {
            $('#drp-photo-list-ul').hide();
            $('#drp-empty-state').show().text("사진을 보려면 날짜를 선택하세요.");
            $('#drp-download-bar').hide();
            $('#drp-photo-count').text("(0)");
            clusterSource.clear();
        }
    });

    // =========================================================================
    // 4. 이미지 로딩 및 GPS 추출 (Image Loading & GPS Extraction)
    // =========================================================================
    async function loadImagesForDate(ymd) {
        // UI 초기화
        $('#drp-empty-state').hide();
        $('#drp-photo-list-ul').hide();
        $('#drp-loading-state').show();
        $('#drp-download-bar').hide();
        $('#drp-select-all-btn').removeClass('active').find('i').attr('class', 'fa fa-check-circle-o');
        clusterSource.clear();

        try {
            // 1. 날짜(YYYYMMDD)를 Timestamp로 변환
            var listDate = parseYMD(ymd); // Date Object
            if (!listDate) throw new Error("Invalid Date Format");

            var startTimestamp = listDate.getTime();
            var endTimestamp = startTimestamp + (24 * 60 * 60 * 1000) - 1;

            console.log(`Searching Images for ${ymd}: ${startTimestamp} ~ ${endTimestamp}`);

            // [MOCK MODE] 실제 API는 주석 처리, MOCK 데이터 사용
            // 실제 호출
            /*
            let response = await $.ajax({ 
                url: EXTERNAL_API_URL, 
                method: 'GET',
                data: {
                    start_timestamp: startTimestamp,
                    end_timestamp: endTimestamp
                }
            });
            */

            // Mock Response 사용 (필요시 필터링 로직 구현 가능하지만, 여기선 전체 리턴)
            // 실제로는 API가 날짜별로 필터링해서 준다고 가정.
            let response = MOCK_DATA_SOURCE;

            // 응답 Parsing (Single Quote 배열 대응)
            let targetUrls = [];
            if (typeof response === 'string') {
                try {
                    targetUrls = JSON.parse(response);
                } catch (e) {
                    try {
                        targetUrls = JSON.parse(response.replace(/'/g, '"'));
                    } catch (e2) {
                        console.error("Failed to parse image list response", response);
                    }
                }
            } else {
                targetUrls = response || [];
            }

            // (권장) 클라이언트 측 날짜 필터링이 필요하다면 여기서 수행
            // 현재는 API가 필터링해준다고 가정하거나 Mock Data 전체를 표시

            $('#drp-photo-count').text("(" + targetUrls.length + ")");

            // 3. 각 URL을 처리하여 GPS 추출
            let features = [];
            let processed = 0;

            const promises = targetUrls.map(async (url) => {
                try {
                    // exifr 라이브러리로 GPS 추출
                    let gps = await exifr.gps(url);

                    if (gps && gps.latitude && gps.longitude) {
                        let coord = ol.proj.fromLonLat([gps.longitude, gps.latitude]);
                        let feature = new ol.Feature({
                            geometry: new ol.geom.Point(coord),
                            data: {
                                url: url,
                                name: url.split('/').pop(),
                                lat: gps.latitude,
                                lon: gps.longitude,
                                address: "주소 정보 로딩 중..."
                            }
                        });
                        features.push(feature);
                    }
                } catch (e) {
                    // console.warn("No GPS or Error for " + url, e); // 너무 많은 로그 방지
                } finally {
                    processed++;
                    $('#drp-progress-text').text(`${processed} / ${targetUrls.length}`);
                }
            });

            await Promise.all(promises);

            // 4. 지도 및 리스트 업데이트
            $('#drp-loading-state').hide();

            if (features.length > 0) {
                $('#drp-photo-list-ul').show();
                clusterSource.addFeatures(features);
                updateList(features);

                let extent = vectorLayer.getSource().getExtent();
                if (extent) map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 18 });
            } else {
                $('#drp-empty-state').show().text("해당 날짜에 사진이 없습니다.");
            }

        } catch (err) {
            console.error(err);
            $('#drp-loading-state').hide();
            $('#drp-empty-state').show().text("사진을 불러오는데 실패했습니다.");
        }
    }

    function parseYMD(ymd) {
        if (!ymd || ymd.length !== 8) return null;
        var y = parseInt(ymd.substring(0, 4));
        var m = parseInt(ymd.substring(4, 6)) - 1;
        var d = parseInt(ymd.substring(6, 8));
        return new Date(y, m, d);
    }

    function updateList(features) {
        var $ul = $('#drp-photo-list-ul');
        $ul.empty();

        features.forEach((f, index) => {
            var d = f.get('data');
            // Mock Address
            var mockAddr = "경기도 성남시 분당구 판교역로 " + (100 + index);

            var $li = $('<li>').addClass('drp-photo-item').attr('data-id', index);

            var $checkIcon = $('<i>').addClass('drp-item-check fa fa-circle-o');
            var $img = $('<img>').addClass('drp-photo-thumb').attr('src', d.url);

            var $info = $('<div>').addClass('drp-photo-info');
            $info.append($('<div>').addClass('drp-photo-name').text(d.name));
            $info.append($('<div>').addClass('drp-photo-meta').text(mockAddr));

            var $zoomBtn = $('<i>').addClass('drp-item-zoom fa fa-search-plus');
            $zoomBtn.on('click', function (e) {
                e.stopPropagation();
                $('#drp-viewer-img').attr('src', d.url);
                $('#drp-image-viewer').css('display', 'flex');
            });

            $li.append($checkIcon).append($img).append($info).append($zoomBtn);

            $li.on('click', function () {
                toggleItemSelection($(this));
                var coord = f.getGeometry().getCoordinates();
                map.getView().animate({ center: coord, zoom: 19 });
            });

            $ul.append($li);
        });
    }

    // =========================================================================
    // 5. 선택 로직 (Selection Logic)
    // =========================================================================
    function toggleItemSelection($li) {
        $li.toggleClass('selected');
        var $icon = $li.find('.drp-item-check');
        if ($li.hasClass('selected')) {
            $icon.removeClass('fa-circle-o').addClass('fa-check-circle');
        } else {
            $icon.removeClass('fa-check-circle').addClass('fa-circle-o');
        }
        updateFooterState();
    }

    function updateFooterState() {
        var selectedCount = $('.drp-photo-item.selected').length;
        var totalCount = $('.drp-photo-item').length;

        $('#drp-selected-count').text(selectedCount);

        if (selectedCount > 0) {
            $('#drp-download-bar').css('display', 'flex');
        } else {
            $('#drp-download-bar').hide();
        }

        var $selectAllBtn = $('#drp-select-all-btn');
        if (totalCount > 0 && selectedCount === totalCount) {
            $selectAllBtn.addClass('active');
            $selectAllBtn.find('i').removeClass('fa-check-circle-o').addClass('fa-check-circle');
        } else {
            $selectAllBtn.removeClass('active');
            $selectAllBtn.find('i').removeClass('fa-check-circle').addClass('fa-check-circle-o');
        }
    }

    // Select All Event
    $('#drp-select-all-btn').on('click', function () {
        var $this = $(this);
        var totalCount = $('.drp-photo-item').length;
        var selectedCount = $('.drp-photo-item.selected').length;
        var isAllSelected = (totalCount > 0 && totalCount === selectedCount);

        if (isAllSelected) {
            $('.drp-photo-item').removeClass('selected');
            $('.drp-item-check').removeClass('fa-check-circle').addClass('fa-circle-o');
            $this.removeClass('active');
        } else {
            $('.drp-photo-item').addClass('selected');
            $('.drp-item-check').removeClass('fa-circle-o').addClass('fa-check-circle');
            $this.addClass('active');
        }
        updateFooterState();
    });

    // Download Button Event
    $('#drp-download-btn').on('click', function () {
        var selectedCount = $('.drp-photo-item.selected').length;
        if (selectedCount === 0) return;

        alert(selectedCount + "개의 사진을 다운로드합니다 (구현 예정).");
    });

    // =========================================================================
    // 6. 지도 초기화 (Map Initialization)
    // =========================================================================
    function initMap() {
        var apiKey = window.VWORLD_API_KEY || "B13ADD16-4164-347A-A733-CD9022E8FB3B";

        var raster = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://api.vworld.kr/req/wmts/1.0.0/" + apiKey + "/Base/{z}/{y}/{x}.png"
            })
        });

        clusterSource = new ol.source.Vector();

        var clusterSourceWrap = new ol.source.Cluster({
            distance: 40,
            source: clusterSource
        });

        var styleCache = {};
        vectorLayer = new ol.layer.Vector({
            source: clusterSourceWrap,
            style: function (feature) {
                var size = feature.get('features').length;
                var style = styleCache[size];
                if (!style) {
                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 10 + Math.min(size, 20),
                            stroke: new ol.style.Stroke({ color: '#fff' }),
                            fill: new ol.style.Fill({ color: '#3399CC' })
                        }),
                        text: new ol.style.Text({
                            text: size.toString(),
                            fill: new ol.style.Fill({ color: '#fff' })
                        })
                    });
                    styleCache[size] = style;
                }
                return style;
            }
        });

        map = new ol.Map({
            target: 'drp-map',
            layers: [raster, vectorLayer],
            view: new ol.View({
                center: ol.proj.fromLonLat([128.1746, 36.1171]), // 한국도로공사 본사
                zoom: 14,
                minZoom: 7
            })
        });

        map.on('click', function (evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
            if (feature) {
                var features = feature.get('features');
                if (features.length > 1) {
                    var extent = ol.extent.createEmpty();
                    features.forEach(function (f) { ol.extent.extend(extent, f.getGeometry().getExtent()); });
                    map.getView().fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                }
            }
        });
    }

})(jQuery);
