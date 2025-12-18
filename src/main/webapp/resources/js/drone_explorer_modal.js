(function ($) {
    // =========================================================================
    // 1. 설정 및 상태 관리
    // =========================================================================
    const EXTERNAL_API_URL = "https://dsc.ex.co.kr:9550/ex/drone/images";
    const INTERNAL_API_SCHEDULE = "http://localhost:8080/api/drone/schedule"; // 필요시 호스트 조정
    const VWORLD_API_KEY = window.VWORLD_API_KEY || "B13ADD16-4164-347A-A733-CD9022E8FB3B";

    var droneMap;
    var clusterSource;
    var vectorLayer;
    var availableDates = []; // YYYYMMDD 목록
    var isMapInitialized = false;
    var currentRequestId = 0; // 요청 취소를 위한 ID

    // 테스트용 Mock Data (Sync용 - 날짜 추출을 위한 더미 URL 포함)
    // 20241203, 20251022, 20241115, 20241226, 20251028, 20251030
    const MOCK_DATA_SOURCE = [
        'http://mock/20241203_000000.png',
        'http://mock/20251022_000000.png',
        'http://mock/20241115_000000.png',
        'http://mock/20241226_000000.png',
        'http://mock/20251028_000000.png',
        'http://mock/20251030_000000.png'
    ];

    // 날짜별 Mock 이미지 리스트 (로컬 정적 파일 사용)
    const MOCK_IMAGE_MAP = {
        '20241203': ['/resources/static/images/camera_105807.png', '/resources/static/images/camera_105810.png'],
        '20251022': ['/resources/static/images/camera_105813.png', '/resources/static/images/camera_105815.png'],
        '20241115': ['/resources/static/images/camera_105818.png', '/resources/static/images/camera_105820.png'],
        '20241226': ['/resources/static/images/camera_105823.png', '/resources/static/images/camera_105825.png'],
        '20251028': ['/resources/static/images/camera_105828.png', '/resources/static/images/camera_105831.png'],
        '20251030': ['/resources/static/images/camera_105833.png', '/resources/static/images/camera_105836.png']
    };

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
            setTimeout(() => droneMap.updateSize(), 200);
        }

        // 동기화 후 일정 로드 시작
        syncAndLoadSchedule();
    };

    function closeDrpModal() {
        $('#drp-modal').hide();
        resetModalState();
    }

    // 모달 닫기 시 상태 초기화 및 진행 중인 요청 취소
    function resetModalState() {
        // 1. 진행 중인 이미지 로딩 루프 중단 (ID 증가로 기존 요청 무효화)
        currentRequestId++;

        // 2. UI 요소 초기화
        $('#drp-photo-list-ul').empty().hide();
        $('#drp-loading-state').hide();
        $('#drp-progress-text').text('');

        // 3. 지도 데이터 초기화
        if (clusterSource) {
            clusterSource.clear();
        }
        highlightedFeature = null;
        if (typeof vectorLayer !== 'undefined' && vectorLayer) {
            vectorLayer.changed();
        }

        // 4. 다운로드 바 및 선택 상태 리셋
        $('#drp-download-bar').hide();
        $('#drp-selected-count').text('0');
        $('.drp-photo-item').removeClass('selected');

        var $selectAllBtn = $('#drp-select-all-btn');
        $selectAllBtn.removeClass('active');
        $selectAllBtn.find('i').removeClass('fa-check-circle').addClass('fa-check-circle-o');

        // 5. 날짜 선택바 상태 복구
        $('#drp-date-select').val('').prop('disabled', false);

        // 6. 카운트 및 안내 문구 초기화
        $('#drp-photo-count').text('(0)');
        // openDroneExplorer에서 "데이터 동기화 중..."으로 덮어씌우지만, 
        // 닫힌 상태에서의 깔끔한 초기화를 위해 기본 메시지 설정
        $('#drp-empty-state').show().text("사진을 보려면 날짜를 선택하세요.");
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
        // 응답 Parsing
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
            var match = url.match(/(\d{8})_\d{6}/);
            if (match && match[1]) {
                uniqueDates.add(match[1]);
            } else {
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

        // DB에 저장 (Sync)
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
                    loadScheduleFromDB();
                }
            });
        } else {
            loadScheduleFromDB();
        }
    }

    // 3-3. DB에서 일정 조회
    function loadScheduleFromDB() {
        $.get("/api/drone/schedule", function (dates) {
            availableDates = dates || [];
            var $select = $('#drp-date-select');
            $select.empty();

            if (availableDates.length > 0) {
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
    // 4. 이미지 로딩, GPS 추출 및 주소 반환 (Image & V-World Address)
    // =========================================================================
    async function loadImagesForDate(ymd) {
        // UI 초기화
        $('#drp-empty-state').hide();
        $('#drp-date-select').prop('disabled', true); // 로딩 중 선택 방지
        var $ul = $('#drp-photo-list-ul');
        $ul.empty().hide(); // 리스트 초기화
        $('#drp-loading-state').show();
        $('#drp-download-bar').hide();
        $('#drp-select-all-btn').removeClass('active').find('i').attr('class', 'fa fa-check-circle-o');
        clusterSource.clear();

        try {
            var requestId = ++currentRequestId; // 새로운 요청 ID 발급

            var listDate = parseYMD(ymd); // Date Object
            if (!listDate) throw new Error("Invalid Date Format");

            var startTimestamp = listDate.getTime();
            var endTimestamp = startTimestamp + (24 * 60 * 60 * 1000) - 1;

            console.log(`Searching Images for ${ymd}`);

            // 1. 외부 API 호출 (실제 로직 - 주석 처리)
            /*
            let response = await $.ajax({
                url: EXTERNAL_API_URL,
                method: 'GET',
                data: {
                    start_timestamp: startTimestamp,
                    end_timestamp: endTimestamp
                }
            });

            let targetUrls = [];
            if (typeof response === 'string') {
                try {
                    targetUrls = JSON.parse(response.replace(/'/g, '"'));
                } catch (e) {
                    console.error("Failed to parse API response", e);
                    targetUrls = [];
                }
            } else if (Array.isArray(response)) {
                targetUrls = response;
            }

            console.log("Fetched Target URLs:", targetUrls);
            */
            let targetUrls = [];

            // MOCK DATA Logic (테스트 로직)
            let mockUrls = MOCK_IMAGE_MAP[ymd] || [];
            if (mockUrls.length === 0) {
                mockUrls = [
                    '/resources/static/images/camera_105807.png',
                    '/resources/static/images/camera_105810.png'
                ];
            }
            targetUrls = mockUrls;

            if (targetUrls.length === 0) {
                $('#drp-loading-state').hide();
                $('#drp-empty-state').show().text("해당 날짜에 촬영된 사진이 없습니다.");
                return;
            }

            $('#drp-photo-count').text("(" + targetUrls.length + ")");
            $('#drp-photo-list-ul').show();

            // 2. 청크 단위로 이미지 처리 (Chunk Processing)
            const BATCH_SIZE = 15;
            let processed = 0;
            let hasCenteredMap = false;

            for (let i = 0; i < targetUrls.length; i += BATCH_SIZE) {
                // 추가 요청 들어왔으면 중단
                if (requestId !== currentRequestId) return;

                let chunkUrls = targetUrls.slice(i, i + BATCH_SIZE);
                let chunkAllFeatures = [];
                let chunkMapFeatures = [];

                let promises = chunkUrls.map(async (url) => {
                    try {
                        let gps = await exifr.gps(url);
                        let hasGPS = isValidGPS(gps);
                        let finalAddress = "위치 정보 없음";
                        let geometry = null;
                        let lat = null, lon = null;

                        if (hasGPS) {
                            lat = gps.latitude;
                            lon = gps.longitude;
                            let addressInfo = await getAddressFromCoords(lat, lon);
                            finalAddress = addressInfo || "주소 미확인";
                            let coord = ol.proj.fromLonLat([lon, lat]);
                            geometry = new ol.geom.Point(coord);
                        }

                        let feature = new ol.Feature({
                            geometry: geometry, // GPS 없으면 null
                            data: {
                                url: url,
                                name: url.split('/').pop(),
                                lat: lat,
                                lon: lon,
                                address: finalAddress
                            }
                        });

                        return { feature: feature, hasGPS: hasGPS };

                    } catch (e) {
                        console.warn("Processing error for " + url, e);
                        // 에러가 나도 이미지는 보여주기 (GPS 없음으로 처리)
                        let feature = new ol.Feature({
                            geometry: null,
                            data: {
                                url: url,
                                name: url.split('/').pop(),
                                lat: null,
                                lon: null,
                                address: "정보 확인 불가"
                            }
                        });
                        return { feature: feature, hasGPS: false };
                    }
                });

                let results = await Promise.all(promises);

                // [중요] 비동기 작업 후 현재 요청이 여전히 유효한지 확인 (날짜 변경 등)
                if (requestId !== currentRequestId) return;

                // 결과 분류
                results.forEach(res => {
                    if (res) {
                        chunkAllFeatures.push(res.feature);
                        if (res.hasGPS) {
                            chunkMapFeatures.push(res.feature);
                        }
                    }
                });

                // UI 업데이트 (부분 렌더링)
                if (chunkAllFeatures.length > 0) {
                    appendToList(chunkAllFeatures, processed);
                }

                if (chunkMapFeatures.length > 0) {
                    clusterSource.addFeatures(chunkMapFeatures);

                    // 첫 번째로 유효한 좌표가 들어왔을 때 지도 중심 이동
                    if (!hasCenteredMap) {
                        var sumLat = 0, sumLon = 0;
                        chunkMapFeatures.forEach(f => {
                            var coords = f.getGeometry().getCoordinates();
                            sumLat += coords[1];
                            sumLon += coords[0];
                        });
                        var center = [sumLon / chunkMapFeatures.length, sumLat / chunkMapFeatures.length];
                        droneMap.getView().setCenter(center);
                        droneMap.getView().setZoom(16);
                        hasCenteredMap = true;
                    }
                }

                processed += chunkUrls.length;
                $('#drp-progress-text').text(`${Math.min(processed, targetUrls.length)} / ${targetUrls.length}`);

                // UI 렌더링을 위해 약간의 지연
                await new Promise(r => setTimeout(r, 50));
            }

            $('#drp-loading-state').hide();
            $('#drp-progress-text').text(''); // 진행 메시지 초기화

        } catch (err) {
            console.error(err);
            $('#drp-loading-state').hide();
            $('#drp-empty-state').show().text("사진을 불러오는데 실패했습니다.");
        } finally {
            // 현재 요청이 마지막 요청일(취소되지 않았을) 때만 활성화
            if (requestId === currentRequestId) {
                $('#drp-date-select').prop('disabled', false);
            }
        }
    }

    function isValidGPS(gps) {
        if (!gps) return false;
        var lat = gps.latitude;
        var lon = gps.longitude;

        // 1. 숫자 타입 체크
        if (typeof lat !== 'number' || typeof lon !== 'number') return false;
        if (isNaN(lat) || isNaN(lon)) return false;

        // 2. 유효 범위 체크
        if (lat < -90 || lat > 90) return false;
        if (lon < -180 || lon > 180) return false;

        // 3. 0,0 좌표 제외 (GPS 미수신 시 0으로 오는 경우 방지)
        if (Math.abs(lat) < 0.000001 && Math.abs(lon) < 0.000001) return false;

        return true;
    }

    // V-World 주소 조회 함수
    async function getAddressFromCoords(lat, lon) {
        return new Promise((resolve) => {
            $.ajax({
                url: "https://api.vworld.kr/req/address",
                type: "GET",
                dataType: "jsonp", // VWorld는 JSONP 지원
                timeout: 3000, // 3초 타임아웃 유지
                data: {
                    service: "address",
                    request: "getAddress",
                    version: "2.0",
                    crs: "epsg:4326",
                    point: `${lon},${lat}`,
                    format: "json",
                    type: "parcel", // 지번 주소 전용으로 복구
                    zipcode: "false",
                    simple: "false",
                    key: VWORLD_API_KEY
                },
                success: function (res) {
                    if (res.response.status === "OK") {
                        // 결과 텍스트 조합
                        // res.response.result[0].text 가 전체 주소
                        resolve(res.response.result[0].text);
                    } else {
                        resolve(null);
                    }
                },
                error: function () {
                    resolve(null);
                }
            });
        });
    }

    function parseYMD(ymd) {
        if (!ymd || ymd.length !== 8) return null;
        var y = parseInt(ymd.substring(0, 4));
        var m = parseInt(ymd.substring(4, 6)) - 1;
        var d = parseInt(ymd.substring(6, 8));
        return new Date(y, m, d);
    }

    function appendToList(features, startIndex) {
        var $ul = $('#drp-photo-list-ul');
        // $ul.empty(); // 제거: 추가 모드

        features.forEach((f, index) => {
            var globalIndex = startIndex + index;
            var d = f.get('data');

            var $li = $('<li>').addClass('drp-photo-item').attr('data-id', globalIndex);

            var $checkIcon = $('<i>').addClass('drp-item-check');
            // 체크박스 클릭 시에만 선택 토글
            $checkIcon.on('click', function (e) {
                e.stopPropagation();
                toggleItemSelection($li);
            });

            // 썸네일 레퍼 및 스피너 생성
            var $thumbWrapper = $('<div>').addClass('drp-thumb-wrapper');
            var $spinner = $('<i>').addClass('fa fa-spinner fa-spin drp-thumb-spinner');
            var $img = $('<img>').addClass('drp-photo-thumb').attr('src', d.url);

            $img.on('load', function () {
                $(this).addClass('loaded');
                $spinner.hide();
            });

            $img.on('error', function () {
                $spinner.hide();
            });

            $thumbWrapper.append($spinner).append($img);

            var $info = $('<div>').addClass('drp-photo-info');
            $info.append($('<div>').addClass('drp-photo-name').text(d.name));
            // 주소 표시 (조회된 값 사용)
            $info.append($('<div>').addClass('drp-photo-meta').text(d.address));

            var $zoomBtn = $('<i>').addClass('drp-item-zoom fa fa-search-plus');
            $zoomBtn.on('click', function (e) {
                e.stopPropagation();
                $('#drp-viewer-img').attr('src', d.url);
                $('#drp-image-viewer').css('display', 'flex');
            });
            $li.append($checkIcon).append($thumbWrapper).append($info).append($zoomBtn);

            // 로우 클릭 시 지도 이동 (선택 토글 X)
            $li.on('click', function () {
                var geometry = f.getGeometry();
                if (geometry) {
                    var coord = geometry.getCoordinates();
                    var currentZoom = droneMap.getView().getZoom();
                    // 클러스터가 1개로 풀릴 때까지 충분히 확대 (최대 22)
                    var targetZoom = (currentZoom >= 22) ? currentZoom : 22;

                    droneMap.getView().animate({ center: coord, zoom: targetZoom });
                    highlightFeature(f);
                } else {
                    // GPS 없는 경우
                    console.log("No geometry for this image.");
                }
            });

            f.set('listIndex', globalIndex);

            $ul.append($li);
        });
    }

    // =========================================================================
    // 5. 선택 로직 (Selection Logic)
    // =========================================================================
    function toggleItemSelection($li) {
        $li.toggleClass('selected');
        // CSS로 스타일 제어하므로 아이콘 클래스 조작 불필요
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
            // 버튼 아이콘은 FA 유지 (만약 안보이면 CSS로 대체 필요하나 우선 유지)
            $selectAllBtn.find('i').removeClass('fa-check-circle-o').addClass('fa-check-circle');
        } else {
            $selectAllBtn.removeClass('active');
            $selectAllBtn.find('i').removeClass('fa-check-circle').addClass('fa-check-circle-o');
        }
    }

    $('#drp-select-all-btn').on('click', function () {
        var $this = $(this);
        var totalCount = $('.drp-photo-item').length;
        var selectedCount = $('.drp-photo-item.selected').length;
        var isAllSelected = (totalCount > 0 && totalCount === selectedCount);

        if (isAllSelected) {
            $('.drp-photo-item').removeClass('selected');
            $this.removeClass('active');
            $this.find('i').removeClass('fa-check-circle').addClass('fa-check-circle-o');
        } else {
            $('.drp-photo-item').addClass('selected');
            $this.addClass('active');
            $this.find('i').removeClass('fa-check-circle-o').addClass('fa-check-circle');
        }
        updateFooterState();
    });

    $('#drp-download-btn').on('click', async function () {
        var $btn = $(this);
        var originalText = $btn.html();
        var $selectedItems = $('.drp-photo-item.selected');
        var selectedCount = $selectedItems.length;

        if (selectedCount === 0) return;

        $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 다운로드 중...');

        try {
            if (selectedCount === 1) {
                // 1개일 경우: 단일 파일 다운로드
                var $item = $selectedItems.first();
                var fileName = $item.find('.drp-photo-name').text().trim();
                var url = $item.find('.drp-photo-thumb').attr('src');

                const response = await fetch(url);
                const blob = await response.blob();
                saveAs(blob, fileName);
            } else {
                // 2개 이상일 경우: ZIP 압축 다운로드 (JSZip 사용)
                var zip = new JSZip();
                var folder = zip.folder("drone_images");

                // Promise.all로 병렬 처리하여 속도 향상
                var promises = [];

                $selectedItems.each(function (index) {
                    var $item = $(this);
                    var fileName = $item.find('.drp-photo-name').text().trim();
                    var url = $item.find('.drp-photo-thumb').attr('src');

                    var promise = fetch(url)
                        .then(response => response.blob())
                        .then(blob => {
                            // 파일명 중복 방지 (단순 인덱스 활용)
                            // 실제로는 확장자 체크 등이 필요할 수 있음
                            if (folder.file(fileName)) {
                                var ext = fileName.split('.').pop();
                                var base = fileName.substring(0, fileName.lastIndexOf('.'));
                                fileName = base + '_' + index + '.' + ext;
                            }
                            folder.file(fileName, blob);
                        });
                    promises.push(promise);
                });

                await Promise.all(promises);

                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "drone_images.zip");
            }
        } catch (err) {
            console.error("Download failed", err);
            alert("다운로드 중 오류가 발생했습니다: " + err.message);
        } finally {
            $btn.prop('disabled', false).html(originalText);
        }
    });

    // =========================================================================
    // 6. 지도 초기화 (Map Initialization)
    // =========================================================================
    var highlightedFeature = null; // 현재 하이라이트된 피처

    function highlightFeature(feature) {
        highlightedFeature = feature;
        vectorLayer.changed(); // 스타일 다시 적용
    }

    function initMap() {
        var raster = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://api.vworld.kr/req/wmts/1.0.0/" + VWORLD_API_KEY + "/Base/{z}/{y}/{x}.png"
            })
        });

        clusterSource = new ol.source.Vector();

        var clusterSourceWrap = new ol.source.Cluster({
            distance: 40,
            source: clusterSource
        });

        var styleCache = {};

        // 하이라이트 스타일 (빨간색)
        var highlightStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 15,
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
                fill: new ol.style.Fill({ color: '#e74c3c' }) // Red
            }),
            zIndex: 999
        });

        vectorLayer = new ol.layer.Vector({
            source: clusterSourceWrap,
            style: function (feature) {
                var features = feature.get('features');
                var size = features.length;

                var isHighlighted = false;
                if (highlightedFeature) {
                    isHighlighted = features.some(f => f === highlightedFeature);
                }

                // 1. 하이라이트된 피처가 포함된 경우
                if (isHighlighted) {
                    // 단일 피처인 경우 -> 기존 하이라이트 스타일 사용
                    if (size === 1) {
                        return highlightStyle;
                    }
                    // 클러스터(여러개)인 경우 -> 빨간색 클러스터 스타일 생성
                    return new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 13 + Math.min(size, 22),
                            stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
                            fill: new ol.style.Fill({ color: '#e74c3c' }) // Red (Highlight)
                        }),
                        text: new ol.style.Text({
                            text: size.toString(),
                            font: 'bold 15px sans-serif',
                            fill: new ol.style.Fill({ color: '#fff' })
                        }),
                        zIndex: 999
                    });
                }

                // 2. 일반 스타일 (캐시 사용)
                var style = styleCache[size];
                if (!style) {
                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 13 + Math.min(size, 22),
                            stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
                            fill: new ol.style.Fill({ color: '#005fcc' }) // Blue
                        }),
                        text: new ol.style.Text({
                            text: size.toString(),
                            font: 'bold 15px sans-serif',
                            fill: new ol.style.Fill({ color: '#fff' })
                        })
                    });
                    styleCache[size] = style;
                }
                return style;
            }
        });

        droneMap = new ol.Map({
            target: 'drp-map',
            layers: [raster, vectorLayer],
            view: new ol.View({
                center: ol.proj.fromLonLat([128.1746, 36.1171]), // 한국도로공사 본사
                zoom: 14,
                minZoom: 7
            })
        });

        droneMap.on('click', function (evt) {
            var feature = droneMap.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
            if (feature) {
                var features = feature.get('features');
                if (features.length > 1) {
                    // extent 대신 현재 중심에서 2단계 줌인 (너무 급격한 확대 방지)
                    var clusterCoord = feature.getGeometry().getCoordinates();
                    var currentZoom = droneMap.getView().getZoom();
                    droneMap.getView().animate({ center: clusterCoord, zoom: currentZoom + 2, duration: 500 });
                } else {
                    // 단일 피처 클릭 시 리스트 연동
                    var targetFeature = features[0];
                    highlightFeature(targetFeature);

                    var listIndex = targetFeature.get('listIndex');
                    if (listIndex !== undefined) {
                        var $li = $('.drp-photo-item[data-id="' + listIndex + '"]');
                        if ($li.length) {
                            // 스크롤 이동
                            var $ul = $('#drp-photo-list-ul');
                            // 선택된 아이템이 리스트의 중앙에 오도록 스크롤
                            var scrollTop = $ul.scrollTop() + $li.position().top - ($ul.height() / 2) + ($li.height() / 2);
                            $ul.animate({ scrollTop: scrollTop }, 300);

                            // 기존 선택 초기화 및 해당 아이템 선택
                            $('.drp-photo-item').removeClass('selected');
                            $li.addClass('selected');
                            updateFooterState();
                        }
                    }
                }
            }
        });
    }

})(jQuery);
