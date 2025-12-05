(function ($) {
    // Global variables for this module
    var doneRawMap;
    var clusterSource;
    var vectorLayer;
    var isMapInitialized = false;
    var VWORLD_GEOCODER_KEY = "F0529714-44EF-31EC-BCD3-9BB544307DDB"; // 주소 검색용 키
    var isListClickMove = false; // 리스트 클릭에 의한 지도 이동인지 확인하는 플래그
    var selectedPhotoSeq = null; // 현재 선택된 사진 ID

    // Initialize Modal
    function initDrpModal() {
        // Event Listeners
        $('#drp-close-btn').on('click', closeDrpModal);
        $('#drp-date-selector').on('change', function () {
            var selectedDate = $(this).val();
            if (selectedDate) {
                loadPhotos(selectedDate);
            }
        });

        // Select All Checkbox
        $('#drp-select-all').on('change', function () {
            var isChecked = $(this).is(':checked');
            $('.drp-photo-checkbox').prop('checked', isChecked);
            updateDownloadBtnState();
        });

        // Download Selected Button
        $('#drp-download-selected-btn').on('click', downloadSelectedPhotos);

        // Close on click outside
        $(window).on('click', function (event) {
            if (event.target == document.getElementById('drp-modal')) {
                closeDrpModal();
            }
            // Close viewer on background click
            if (event.target == document.getElementById('drp-image-viewer')) {
                closeImageViewer();
            }
        });

        // Image Viewer Close Button
        $('#drp-viewer-close').on('click', closeImageViewer);
    }

    // Open Image Viewer
    function openImageViewer(photoSeq) {
        var imgSrc = '/api/drone/thumbnail/' + photoSeq; // Use existing endpoint as it returns full image

        $('#drp-viewer-img').attr('src', imgSrc);
        $('#drp-image-viewer').css('display', 'flex');
    }

    // Close Image Viewer
    function closeImageViewer() {
        $('#drp-image-viewer').hide();
        $('#drp-viewer-img').attr('src', ''); // Clear src to stop memory usage
    }

    // Open Modal
    window.openDrpModal = function () {
        $('#drp-modal').show();
        if (!isMapInitialized) {
            initMap();
            isMapInitialized = true;
        } else {
            setTimeout(function () {
                doneRawMap.updateSize();
            }, 200);
        }

        // Load dates every time modal opens to get latest
        loadDates();
    };

    // Close Modal
    function closeDrpModal() {
        $('#drp-modal').hide();
    }

    // Load Dates API
    function loadDates() {
        $.ajax({
            url: '/api/drone/dates',
            method: 'GET',
            success: function (dates) {
                var $selector = $('#drp-date-selector');
                $selector.empty();

                // Filter dates
                var validDates = [];
                var hasUnknownDate = false;

                dates.forEach(function (d) {
                    if (d.indexOf('1970-01-01') !== -1 || d.indexOf('19700101') !== -1) {
                        hasUnknownDate = true;
                    } else {
                        validDates.push(d);
                    }
                });

                if (validDates.length === 0 && !hasUnknownDate) {
                    $selector.append('<option value="">데이터 없음</option>');
                    return;
                }

                // Add valid dates
                validDates.forEach(function (date) {
                    $selector.append('<option value="' + date + '">' + date + '</option>');
                });

                // Add unknown date option if exists
                if (hasUnknownDate) {
                    $selector.append('<option value="1970-01-01">촬영일 정보 없음</option>');
                }

                // Select most recent date by default, or unknown if no valid dates
                if (validDates.length > 0) {
                    validDates.sort().reverse();
                    $selector.val(validDates[0]).trigger('change');
                } else if (hasUnknownDate) {
                    $selector.val('1970-01-01').trigger('change');
                }
            },
            error: function (err) {
                console.error('Failed to load dates', err);
                $('#drp-date-selector').html('<option value="">로드 실패</option>');
            }
        });
    }

    // Load Photos API
    function loadPhotos(date) {
        // console.log('[DRP] loadPhotos called for date:', date);
        $.ajax({
            url: '/api/drone/photos',
            method: 'GET',
            data: { date: date },
            success: function (photos) {
                updateMap(photos);
                updateList(photos);
            },
            error: function (err) {
                console.error('Failed to load photos', err);
            }
        });
    }

    // Initialize Map
    function initMap() {
        // console.log('[DRP] initMap called');
        // VWorld Base Layer
        var baseLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://api.vworld.kr/req/wmts/1.0.0/' + VWORLD_API_KEY + '/Base/{z}/{y}/{x}.png'
            })
        });

        clusterSource = new ol.source.Vector();

        // Cluster Source Wrapper
        var clusterSourceWrapper = new ol.source.Cluster({
            distance: 40,
            source: clusterSource
        });

        // Vector Layer for Clusters
        var styleCache = {};
        vectorLayer = new ol.layer.Vector({
            source: clusterSourceWrapper,
            style: function (feature) {
                var size = feature.get('features').length;
                var features = feature.get('features');
                var isSelected = false;

                // 클러스터 내에 선택된 사진이 있는지 확인
                if (selectedPhotoSeq) {
                    for (var i = 0; i < features.length; i++) {
                        if (features[i].get('photoData').photoSeq === selectedPhotoSeq) {
                            isSelected = true;
                            break;
                        }
                    }
                }

                var cacheKey = size + '_' + isSelected;
                var style = styleCache[cacheKey];

                if (!style) {
                    // 선택된 경우 붉은색(#FF5722), 기본은 파란색(#3399CC)
                    var color = isSelected ? '#FF5722' : '#3399CC';
                    // 선택된 경우 테두리 강조
                    var strokeColor = isSelected ? '#FFFF00' : '#fff';
                    var strokeWidth = isSelected ? 4 : 3;
                    var zIndex = isSelected ? 100 : 1; // 선택된 마커를 위로 올림

                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 20,
                            stroke: new ol.style.Stroke({
                                width: strokeWidth,
                                color: strokeColor
                            }),
                            fill: new ol.style.Fill({
                                color: color
                            })
                        }),
                        text: new ol.style.Text({
                            font: 'bold 16px sans-serif',
                            text: size.toString(),
                            fill: new ol.style.Fill({
                                color: '#fff'
                            })
                        }),
                        zIndex: zIndex
                    });
                    styleCache[cacheKey] = style;
                }
                return style;
            }
        });

        doneRawMap = new ol.Map({
            target: 'drp-map',
            layers: [baseLayer, vectorLayer],
            view: new ol.View({
                //center: ol.proj.fromLonLat([127.0, 37.5]), // Default center
                center: [14213121.711211301, 4338175.153863268],
                zoom: 6
            })
        });

        // Map Click Interaction
        doneRawMap.on('click', function (evt) {
            var feature = doneRawMap.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });

            if (feature) {
                var features = feature.get('features');
                if (features && features.length > 0) {
                    var center = feature.getGeometry().getCoordinates();

                    // Zoom to cluster if multiple
                    if (features.length > 1) {
                        // extent 대신 현재 클러스터 중심좌표로 일정 레벨만 확대
                        var currentZoom = doneRawMap.getView().getZoom();
                        var newZoom = currentZoom + 2; // 현재 줌에서 2단계 더 확대

                        // 최대 줌 레벨 제한을 22로 늘려 더 깊게 확대 가능하도록 함
                        if (newZoom > 22) newZoom = 22;

                        doneRawMap.getView().animate({
                            center: center,
                            zoom: newZoom,
                            duration: 500
                        });
                    } else {
                        // 단일 마커(사진 1장)인 경우: 선택 처리 및 중앙 이동
                        var photo = features[0].get('photoData');

                        // 1. 지도상 하이라이트 (선택된 사진 ID 업데이트)
                        selectedPhotoSeq = photo.photoSeq;
                        vectorLayer.changed();

                        // 2. 리스트에서 해당 아이템 하이라이트
                        isListClickMove = true; // 리스트 갱신 방지
                        $('.drp-photo-item').removeClass('active');

                        // 리스트 아이템 찾기 (현재 리스트에 렌더링된 항목 중에서)
                        var $targetItem = $('.drp-photo-item').filter(function () {
                            return $(this).find('.drp-photo-checkbox').val() == photo.photoSeq;
                        });

                        if ($targetItem.length > 0) {
                            $targetItem.addClass('active');
                            // 스크롤 이동
                            $targetItem[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }

                        // 3. 지도 중앙 이동
                        doneRawMap.getView().animate({
                            center: center,
                            duration: 500
                        });
                    }
                }
            }
        });

        // 지도 이동/줌 종료 시 현재 화면에 보이는 마커만 리스트에 표시
        doneRawMap.on('moveend', function () {
            // 리스트 아이템 클릭으로 인한 이동인 경우 리스트 갱신 건너뜀 (깜빡임 방지)
            if (isListClickMove) {
                isListClickMove = false;
                return;
            }

            // 사용자가 직접 지도를 이동/확대한 경우 선택 상태 초기화
            selectedPhotoSeq = null;
            vectorLayer.changed(); // 스타일 초기화

            var extent = doneRawMap.getView().calculateExtent(doneRawMap.getSize());
            var visiblePhotos = [];

            // 원본 벡터 소스에서 현재 화면 범위 내의 피처만 추출
            clusterSource.forEachFeatureInExtent(extent, function (feature) {
                var data = feature.get('photoData');
                if (data) {
                    visiblePhotos.push(data);
                }
            });

            updateList(visiblePhotos);
        });
    }

    // Update Map with Photos
    function updateMap(photos) {
        clusterSource.clear();

        if (!photos || photos.length === 0) return;

        var features = [];
        var hasValidGeo = false;
        var firstCoordinate = null;

        photos.forEach(function (photo) {
            if (!photo) return; // Skip null objects

            if (photo.gpsLon && photo.gpsLat) {
                var coordinate = ol.proj.fromLonLat([photo.gpsLon, photo.gpsLat]);
                var feature = new ol.Feature({
                    geometry: new ol.geom.Point(coordinate),
                    photoData: photo
                });
                features.push(feature);
                hasValidGeo = true;

                if (!firstCoordinate) {
                    firstCoordinate = coordinate;
                }
            }
        });

        clusterSource.addFeatures(features);

        if (hasValidGeo && firstCoordinate) {
            // Set view to the first photo's location with zoom 18, as requested
            doneRawMap.getView().setCenter(firstCoordinate);
            doneRawMap.getView().setZoom(18);
        }
    }

    // Update Photo List
    function updateList(photos) {
        var $ul = $('#drp-photo-list-ul');
        var $count = $('#drp-photo-count');
        var $empty = $('#drp-empty-state');

        // Reset select all checkbox
        $('#drp-select-all').prop('checked', false);
        updateDownloadBtnState();

        $ul.empty();
        $count.text('(' + photos.length + ')');

        if (photos.length === 0) {
            $empty.show();
            return;
        } else {
            $empty.hide();
        }

        photos.forEach(function (photo) {
            if (!photo) return; // Skip null objects

            var $li = $('<li>').addClass('drp-photo-item');

            // Checkbox
            var $checkbox = $('<input>').attr('type', 'checkbox')
                .addClass('drp-photo-checkbox drp-checkbox')
                .val(photo.photoSeq)
                .on('click', function (e) {
                    e.stopPropagation();
                    updateSelectAllState();
                });

            $li.append($checkbox);

            // Thumbnail placeholder or actual URL
            var thumbSrc = '/api/drone/thumbnail/' + photo.photoSeq;
            var $img = $('<img>').addClass('drp-photo-thumb').attr('src', thumbSrc).attr('alt', 'Photo')
                .css('cursor', 'zoom-in') // 커서 변경으로 클릭 가능함 암시
                .on('click', function (e) {
                    e.stopPropagation(); // 리스트 클릭 이벤트 전파 방지
                    openImageViewer(photo.photoSeq);
                });

            // Add error handler for image
            $img.on('error', function () {
                $(this).off('error');
                // 이미지가 없을 경우 텍스트로 대체
                var $placeholder = $('<div>').addClass('drp-photo-thumb').css({
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'color': '#aaa',
                    'font-size': '11px',
                    'background-color': '#f0f0f0'
                }).text('No Image');
                $(this).replaceWith($placeholder);
            });

            var $info = $('<div>').addClass('drp-photo-info');
            var $name = $('<div>').addClass('drp-photo-name').text(photo.fileNm || 'Unknown');

            // Date formatting logic
            var displayDate = '촬영일 정보 없음';
            if (photo.shootDt) {
                var dateStr = String(photo.shootDt);
                // Check for 1970 epoch (unknown date)
                if (dateStr.indexOf('1970-01-01') === -1 && dateStr.indexOf('19700101') === -1) {
                    var dateObj = new Date(dateStr);
                    if (!isNaN(dateObj.getTime())) {
                        var year = dateObj.getFullYear();
                        var month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
                        var day = ('0' + dateObj.getDate()).slice(-2);
                        displayDate = '촬영일 : ' + year + '-' + month + '-' + day;
                    } else {
                        displayDate = '촬영일 : ' + dateStr.substring(0, 10);
                    }
                }
            }

            var $meta = $('<div>').addClass('drp-photo-meta').text(displayDate);
            var $address = $('<div>').addClass('drp-photo-meta').css('margin-top', '2px').text('주소 로딩중...');

            $info.append($name).append($meta).append($address);

            // Fetch Address if GPS is available
            if (photo.gpsLon && photo.gpsLat) {
                getAddressFromCoords(photo.gpsLon, photo.gpsLat, $address);
            } else {
                $address.text('위치 정보 없음');
            }

            var $btn = $('<button>').addClass('drp-download-btn').text('다운로드');
            $btn.on('click', function (e) {
                e.stopPropagation();
                window.location.href = '/api/drone/download/' + photo.photoSeq;
            });

            $li.append($img).append($info).append($btn);

            $li.on('click', function () {
                // Highlight on map
                $('.drp-photo-item').removeClass('active');
                $(this).addClass('active');

                // 선택된 사진 ID 업데이트 및 지도 스타일 갱신
                selectedPhotoSeq = photo.photoSeq;
                vectorLayer.changed(); // 스타일 재적용 트리거

                if (photo.gpsLon && photo.gpsLat) {
                    // 리스트 클릭에 의한 이동임을 표시 (리스트 갱신 방지)
                    isListClickMove = true;

                    var coordinate = ol.proj.fromLonLat([photo.gpsLon, photo.gpsLat]);
                    var currentZoom = doneRawMap.getView().getZoom();
                    if (currentZoom > 18) {
                        doneRawMap.getView().animate({
                            center: coordinate,
                            duration: 500
                        });
                    } else {
                        doneRawMap.getView().animate({
                            center: coordinate,
                            zoom: 18,
                            duration: 500
                        });
                    }
                }
            });

            $ul.append($li);
        });
    }

    // Helper: Update "Select All" checkbox state based on individual checkboxes
    function updateSelectAllState() {
        var total = $('.drp-photo-checkbox').length;
        var checked = $('.drp-photo-checkbox:checked').length;

        $('#drp-select-all').prop('checked', total > 0 && total === checked);
        updateDownloadBtnState();
    }

    // Helper: Update Download Button visibility
    function updateDownloadBtnState() {
        var count = $('.drp-photo-checkbox:checked').length;
        var $btn = $('#drp-download-selected-btn');

        if (count > 0) {
            $btn.text(count + '개 다운로드').show();
        } else {
            $btn.hide();
        }
    }

    // Helper: Reverse Geocoding (VWorld API)
    function getAddressFromCoords(lon, lat, $element) {
        // GPS 오차 보정: 소수점 4자리(약 11m)로 반올림하여 미세한 위치 차이를 무시하고 동일 주소로 유도
        var fixedLon = parseFloat(lon).toFixed(4);
        var fixedLat = parseFloat(lat).toFixed(4);

        var url = "https://api.vworld.kr/req/address";
        var params = {
            service: "address",
            request: "getaddress",
            version: "2.0",
            crs: "epsg:4326",
            point: fixedLon + "," + fixedLat,
            format: "json",
            type: "both",
            zipcode: "false",
            simple: "false",
            key: VWORLD_GEOCODER_KEY
        };

        $.ajax({
            url: url,
            data: params,
            dataType: "jsonp",
            success: function (result) {
                if (result.response && result.response.status === "OK") {
                    // 도로명 주소 우선, 없으면 지번 주소
                    var addr = "";
                    if (result.response.result[0].text) {
                        addr = result.response.result[0].text;
                    } else {
                        // 구조가 다를 수 있으므로 확인
                        var items = result.response.result[0].structure;
                        if (items) {
                            // 필요시 상세 파싱
                            addr = "주소 정보 확인 필요";
                        }
                    }
                    $element.text("주소 : " + addr);
                } else {
                    $element.text("주소 정보 없음");
                }
            },
            error: function () {
                $element.text("주소 조회 실패");
            }
        });
    }

    // Action: Download selected photos as ZIP (Backend)
    function downloadSelectedPhotos() {
        var selectedIds = [];
        $('.drp-photo-checkbox:checked').each(function () {
            selectedIds.push($(this).val());
        });

        if (selectedIds.length === 0) {
            alert('선택된 사진이 없습니다.');
            return;
        }

        // Use a hidden form to submit POST request for download
        var $form = $('<form>').attr({
            method: 'POST',
            action: '/api/drone/download/zip', // Backend endpoint for ZIP download
            target: '_blank' // Optional: open in new tab if needed, or remove to download in same
        }).css('display', 'none');

        // Add IDs as input fields
        selectedIds.forEach(function (id) {
            $('<input>').attr({
                type: 'hidden',
                name: 'photoSeqs',
                value: id
            }).appendTo($form);
        });

        $('body').append($form);
        $form.submit();

        // Clean up
        setTimeout(function () {
            $form.remove();
        }, 1000);
    }

    // Initialize on document ready
    $(document).ready(function () {
        initDrpModal();
    });

})(jQuery);
