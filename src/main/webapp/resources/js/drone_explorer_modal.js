(function ($) {
    // 설정
    const EXTERNAL_API_URL = "https://dsc.ex.co.kr:9550/ex/drone/images";
    const INTERNAL_API_SCHEDULE = "http://localhost:8080/api/drone/schedule"; // 필요시 호스트 조정

    // 상태 관리
    var map;
    var clusterSource;
    var vectorLayer;
    var availableDates = []; // YYYYMMDD 목록
    var isMapInitialized = false;

    // --- 1. 초기화 ---
    window.openDroneExplorer = function () {
        $('#drp-modal').show();

        // UI 초기화
        $('#drp-photo-list-ul').hide();
        $('#drp-empty-state').show().text("사진을 보려면 날짜를 선택하세요.");
        $('#drp-loading-state').hide();
        $('#drp-download-bar').hide();

        if (!isMapInitialized) {
            initMap();
            isMapInitialized = true;
        } else {
            setTimeout(() => map.updateSize(), 200);
        }

        loadScheduleFromDB();
    };

    function closeDrpModal() {
        $('#drp-modal').hide();
    }

    $('#drp-close-btn').on('click', closeDrpModal);
    $('#drp-viewer-close').on('click', function () { $('#drp-image-viewer').hide(); });

    // --- 2. 일정 및 동기화 ---
    function loadScheduleFromDB() {
        $.get("/api/drone/schedule", function (dates) {
            availableDates = dates || []; // ['20251204', ...]
            var $select = $('#drp-date-select');
            $select.empty();

            if (availableDates.length > 0) {
                // 내림차순 정렬 (최신 날짜가 위로)
                availableDates.sort(function (a, b) { return b - a; }); // Assuming string YYYYMMDD comparison works

                // 기본 옵션 (선택 안함)
                $select.append($('<option>', { value: '', text: '날짜 선택' }));

                availableDates.forEach(function (dateStr) {
                    // dateStr format expected: YYYYMMDD
                    var formatted = dateStr;
                    if (dateStr.length === 8) {
                        formatted = dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
                    }
                    $select.append($('<option>', { value: dateStr, text: formatted }));
                });
            } else {
                $select.append($('<option>', { value: '', text: '촬영일 없음', disabled: true, selected: true }));
                $('#drp-empty-state').show().text("조회된 촬영일이 없습니다.");
            }
        }).fail(function () {
            var $select = $('#drp-date-select');
            $select.empty();
            $select.append($('<option>', { value: '', text: '로드 실패' }));
            $('#drp-empty-state').show().text("일정을 불러오는데 실패했습니다.");
        });
    }

    // 날짜 선택 이벤트
    $('#drp-date-select').on('change', function () {
        var selectedDate = $(this).val();
        if (selectedDate) {
            loadImagesForDate(selectedDate);
        } else {
            // Reset UI if 'Select Date' is chosen or empty
            $('#drp-photo-list-ul').hide();
            $('#drp-empty-state').show().text("사진을 보려면 날짜를 선택하세요.");
            $('#drp-download-bar').hide();
            $('#drp-photo-count').text("(0)");
            clusterSource.clear();
        }
    });

    // --- 3. 이미지 로딩 및 GPS 추출 ---
    async function loadImagesForDate(ymd) {
        // 로딩 시작 상태
        $('#drp-empty-state').hide();
        $('#drp-photo-list-ul').hide();
        $('#drp-loading-state').show();
        $('#drp-download-bar').hide();
        $('#drp-select-all-btn').removeClass('active').find('i').attr('class', 'fa fa-check-circle-o'); // Reset Select All
        clusterSource.clear();

        try {
            // 1. 전체 URL 조회
            // 실제 API 연동:
            // let response = await $.ajax({ url: EXTERNAL_API_URL, method: 'GET' });
            // let allUrls = (typeof response === 'string') ? JSON.parse(response) : response;

            // FIXME: 테스트용 Mock Data (실제 연동 시 위 코드로 교체)
            // 현재는 EXTERNAL_API_URL 호출 결과를 사용한다고 가정
            let response = await $.ajax({ url: EXTERNAL_API_URL, method: 'GET' });
            let allUrls = (typeof response === 'string') ? JSON.parse(response) : response;

            // 2. 클라이언트 사이드 필터링
            let targetUrls = allUrls.filter(url => {
                if (url.indexOf(ymd) !== -1) return true;
                return false;
            });

            $('#drp-photo-count').text("(" + targetUrls.length + ")");

            // 3. 각 URL을 처리하여 GPS 추출
            let features = [];
            let processed = 0;

            const promises = targetUrls.map(async (url) => {
                try {
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
                    console.warn("No GPS or Error for " + url, e);
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

                // 지도 영역 맞춤
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

    function updateList(features) {
        var $ul = $('#drp-photo-list-ul');
        $ul.empty();

        features.forEach((f, index) => {
            var d = f.get('data');
            // Mock Address for demo visual
            var mockAddr = "경기도 성남시 분당구 판교역로 " + (100 + index);

            var $li = $('<li>').addClass('drp-photo-item').attr('data-id', index);

            // Checkbox Icon
            var $checkIcon = $('<i>').addClass('drp-item-check fa fa-circle-o'); // Default unchecked circle

            // Thumb
            var $img = $('<img>').addClass('drp-photo-thumb').attr('src', d.url);

            // Info
            var $info = $('<div>').addClass('drp-photo-info');
            $info.append($('<div>').addClass('drp-photo-name').text(d.name));
            $info.append($('<div>').addClass('drp-photo-meta').text(mockAddr)); // Display Address

            // Zoom Icon
            var $zoomBtn = $('<i>').addClass('drp-item-zoom fa fa-search-plus');
            $zoomBtn.on('click', function (e) {
                e.stopPropagation();
                $('#drp-viewer-img').attr('src', d.url);
                $('#drp-image-viewer').css('display', 'flex');
            });

            $li.append($checkIcon).append($img).append($info).append($zoomBtn);

            // Item Click Event (Select & Pan)
            $li.on('click', function () {
                toggleItemSelection($(this));
                var coord = f.getGeometry().getCoordinates();
                map.getView().animate({ center: coord, zoom: 19 });
            });

            $ul.append($li);
        });
    }

    // --- Selection Logic ---
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
            $('#drp-download-bar').css('display', 'flex'); // Show footer
        } else {
            $('#drp-download-bar').hide();
        }

        // Update Select All Button State
        var $selectAllBtn = $('#drp-select-all-btn');
        if (totalCount > 0 && selectedCount === totalCount) {
            $selectAllBtn.addClass('active');
            $selectAllBtn.find('i').removeClass('fa-check-circle-o').addClass('fa-check-circle');
        } else {
            $selectAllBtn.removeClass('active');
            $selectAllBtn.find('i').removeClass('fa-check-circle').addClass('fa-check-circle-o'); // Fixed logic: inactive state usually just circle-o or check-circle with gray? Keeping circle-o for inactive.
        }
    }

    // Select All Event
    $('#drp-select-all-btn').on('click', function () {
        var $this = $(this);
        // Better logic for select all toggle:
        // If not all selected -> Select All
        // If all selected -> Deselect All
        var totalCount = $('.drp-photo-item').length;
        var selectedCount = $('.drp-photo-item.selected').length;
        var isAllSelected = (totalCount > 0 && totalCount === selectedCount);

        if (isAllSelected) {
            // Deselect All
            $('.drp-photo-item').removeClass('selected');
            $('.drp-item-check').removeClass('fa-check-circle').addClass('fa-circle-o');
            $this.removeClass('active');
            // $this.find('i').removeClass('fa-check-circle').addClass('fa-check-circle-o'); // Assuming button icon logic
        } else {
            // Select All
            $('.drp-photo-item').addClass('selected');
            $('.drp-item-check').removeClass('fa-circle-o').addClass('fa-check-circle');
            $this.addClass('active');
            // $this.find('i').removeClass('fa-check-circle-o').addClass('fa-check-circle');
        }
        updateFooterState();
    });

    // Download Button Event
    $('#drp-download-btn').on('click', function () {
        var selectedCount = $('.drp-photo-item.selected').length;
        if (selectedCount === 0) return;

        alert(selectedCount + "개의 사진을 다운로드합니다 (구현 예정).\n\n실제 구현: 선택된 URL들을 ZIP으로 묶거나 개별 다운로드 실행.");
        // Implement actual download logic here:
        // Collect URLs from selected items data -> send to backend zipper or trigger client download
    });

    // --- 4. OpenLayers 지도 ---
    function initMap() {
        // VWorld API 키 (전역 변수 또는 기본값 사용)
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
                            radius: 10 + Math.min(size, 20), // Dynamic size
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
                center: ol.proj.fromLonLat([128.1746, 36.1171]), // 한국도로공사 본사 (김천)
                zoom: 14,
                minZoom: 7
            })
        });

        // 클러스터 클릭 이벤트
        map.on('click', function (evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
            if (feature) {
                var features = feature.get('features');
                if (features.length > 1) {
                    // 영역으로 줌 이동
                    var extent = ol.extent.createEmpty();
                    features.forEach(function (f) { ol.extent.extend(extent, f.getGeometry().getExtent()); });
                    map.getView().fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                } else {
                    // 단일 Feature 클릭 -> 하이라이트 로직 (선택 사항)
                }
            }
        });
    }

})(jQuery);
