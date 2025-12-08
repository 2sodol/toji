(function ($) {
    // =========================================================================
    // 1. 설정 및 상태 관리
    // =========================================================================
    const EXTERNAL_API_URL = "https://dsc.ex.co.kr:9550/ex/drone/images";
    const INTERNAL_API_SCHEDULE = "http://localhost:8080/api/drone/schedule"; // 필요시 호스트 조정
    const VWORLD_API_KEY = window.VWORLD_API_KEY || "B13ADD16-4164-347A-A733-CD9022E8FB3B";

    var map;
    var clusterSource;
    var vectorLayer;
    var availableDates = []; // YYYYMMDD 목록
    var isMapInitialized = false;

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
        $('#drp-photo-list-ul').hide();
        $('#drp-loading-state').show();
        $('#drp-download-bar').hide();
        $('#drp-select-all-btn').removeClass('active').find('i').attr('class', 'fa fa-check-circle-o');
        clusterSource.clear();

        try {
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
            let targetUrls = JSON.parse(response.replace(/'/g, '"')); 
            */

            // 2. Mock Data 사용 (테스트 로직)
            let mockUrls = MOCK_IMAGE_MAP[ymd] || [];
            if (mockUrls.length === 0) {
                // 매핑 안된 날짜는 기본적으로 몇개 넣어줌 (테스트 편의상)
                mockUrls = [
                    '/resources/static/images/camera_105807.png',
                    '/resources/static/images/camera_105810.png'
                ];
            }
            let targetUrls = mockUrls;


            $('#drp-photo-count').text("(" + targetUrls.length + ")");

            // 3. 각 URL을 처리하여 GPS 및 주소 추출
            let features = [];
            let processed = 0;

            const promises = targetUrls.map(async (url) => {
                try {
                    // (1) exifr로 Metadata (GPS) 추출
                    let gps = await exifr.gps(url);

                    if (gps && gps.latitude && gps.longitude) {
                        // (2) V-World API로 주소 조회 (Reverse Geocoding)
                        let addressInfo = await getAddressFromCoords(gps.latitude, gps.longitude);
                        let finalAddress = addressInfo || "주소 미확인";

                        // (3) 지도 객체 생성
                        let coord = ol.proj.fromLonLat([gps.longitude, gps.latitude]);
                        let feature = new ol.Feature({
                            geometry: new ol.geom.Point(coord),
                            data: {
                                url: url,
                                name: url.split('/').pop(),
                                lat: gps.latitude,
                                lon: gps.longitude,
                                address: finalAddress
                            }
                        });
                        features.push(feature);
                    } else {
                        console.warn("No GPS found in " + url);
                    }
                } catch (e) {
                    console.warn("Processing error for " + url, e);
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

                // extent fit 대신 중심좌표 계산 후 setCenter/setZoom 사용
                if (features.length > 0) {
                    var sumLat = 0, sumLon = 0;
                    features.forEach(f => {
                        var coords = f.getGeometry().getCoordinates();
                        // Web Mercator -> LonLat 변환 불필요 (이미 Web Mercator 좌표임)
                        sumLat += coords[1];
                        sumLon += coords[0];
                    });
                    var center = [sumLon / features.length, sumLat / features.length];

                    map.getView().setCenter(center);
                    map.getView().setZoom(16); // 고정 줌 레벨 사용
                }
            } else {
                $('#drp-empty-state').show().text("해당 날짜에 표출할 사진(GPS 포함)이 없습니다.");
            }

        } catch (err) {
            console.error(err);
            $('#drp-loading-state').hide();
            $('#drp-empty-state').show().text("사진을 불러오는데 실패했습니다.");
        }
    }

    // V-World 주소 조회 함수
    async function getAddressFromCoords(lat, lon) {
        return new Promise((resolve) => {
            $.ajax({
                url: "https://api.vworld.kr/req/address",
                type: "GET",
                dataType: "jsonp", // VWorld는 JSONP 지원
                data: {
                    service: "address",
                    request: "getAddress",
                    version: "2.0",
                    crs: "epsg:4326",
                    point: `${lon},${lat}`,
                    format: "json",
                    type: "parcel", // 지번 주소 (도로명은 'road' 사용 가능)
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

    function updateList(features) {
        var $ul = $('#drp-photo-list-ul');
        $ul.empty();

        features.forEach((f, index) => {
            var d = f.get('data');

            var $li = $('<li>').addClass('drp-photo-item').attr('data-id', index);

            var $checkIcon = $('<i>').addClass('drp-item-check');
            // 체크박스 클릭 시에만 선택 토글
            $checkIcon.on('click', function (e) {
                e.stopPropagation();
                toggleItemSelection($li);
            });

            var $img = $('<img>').addClass('drp-photo-thumb').attr('src', d.url);

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

            $li.append($checkIcon).append($img).append($info).append($zoomBtn);

            // 로우 클릭 시 지도 이동 (선택 토글 X)
            $li.on('click', function () {
                var coord = f.getGeometry().getCoordinates();
                var currentZoom = map.getView().getZoom();
                var targetZoom = (currentZoom >= 19) ? currentZoom : 19;

                map.getView().animate({ center: coord, zoom: targetZoom });
                highlightFeature(f);
            });

            // 지도 -> 리스트 연동을 위해 피처에 인덱스 저장
            f.set('listIndex', index);

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

    $('#drp-download-btn').on('click', function () {
        var selectedCount = $('.drp-photo-item.selected').length;
        if (selectedCount === 0) return;
        alert(selectedCount + "개의 사진을 다운로드합니다 (구현 예정).");
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
                    // extent 대신 현재 중심에서 2단계 줌인 (너무 급격한 확대 방지)
                    var clusterCoord = feature.getGeometry().getCoordinates();
                    var currentZoom = map.getView().getZoom();
                    map.getView().animate({ center: clusterCoord, zoom: currentZoom + 2, duration: 500 });
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
