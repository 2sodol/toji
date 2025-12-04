<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <style>
        /* Scoped styles for Drone Raw Photo Explorer Modal */
        .drp-modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .drp-modal-content {
            background-color: #fefefe;
            margin: 5vh auto;
            padding: 0;
            border: 1px solid #888;
            width: 90%;
            height: 90vh;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }

        .drp-modal-header {
            padding: 15px 20px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px 8px 0 0;
        }

        .drp-modal-title {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #333;
        }

        .drp-header-controls {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .drp-date-selector {
            padding: 6px 12px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 16px;
            color: #495057;
        }

        .drp-close-btn {
            color: #aaa;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
            line-height: 1;
        }

        .drp-close-btn:hover,
        .drp-close-btn:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }

        .drp-modal-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .drp-map-container {
            width: 75%;
            height: 100%;
            background-color: #e9ecef;
            position: relative;
            border-right: 1px solid #dee2e6;
        }

        .drp-list-container {
            width: 25%;
            height: 100%;
            overflow-y: auto;
            background-color: #fff;
            display: flex;
            flex-direction: column;
        }

        .drp-list-header {
            padding: 15px;
            border-bottom: 1px solid #eee;
            font-weight: 600;
            color: #555;
            background-color: #fff;
            position: sticky;
            top: 0;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .drp-photo-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .drp-photo-item {
            display: flex;
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .drp-photo-item:hover {
            background-color: #f8f9fa;
        }

        .drp-photo-item.active {
            background-color: #e8f0fe;
            border-left: 4px solid #007bff;
        }

        .drp-photo-thumb {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 15px;
            background-color: #eee;
        }

        .drp-photo-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .drp-photo-name {
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
            font-size: 15px;
        }

        .drp-photo-meta {
            font-size: 14px;
            color: #777;
        }

        .drp-download-btn {
            padding: 6px 12px;
            background-color: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            align-self: center;
            margin-left: 10px;
        }

        .drp-download-btn:hover {
            background-color: #5a6268;
        }

        .drp-empty-state {
            padding: 40px;
            text-align: center;
            color: #999;
        }
    </style>

    <div id="drp-modal" class="drp-modal">
        <div class="drp-modal-content">
            <div class="drp-modal-header">
                <h2 class="drp-modal-title">드론 원본 사진 탐색</h2>
                <div class="drp-header-controls">
                    <button id="drp-close-btn" class="drp-close-btn">&times;</button>
                </div>
            </div>
            <div class="drp-modal-body">
                <div id="drp-map" class="drp-map-container"></div>
                <div id="drp-list" class="drp-list-container">
                    <div class="drp-list-header">
                        <span>사진 목록 <span id="drp-photo-count">(0)</span></span>
                        <select id="drp-date-selector" class="drp-date-selector"
                            style="padding: 4px 8px; font-size: 14px;">
                            <option value="">날짜 선택</option>
                        </select>
                    </div>
                    <ul id="drp-photo-list-ul" class="drp-photo-list">
                        <!-- Photo items will be appended here -->
                    </ul>
                    <div id="drp-empty-state" class="drp-empty-state" style="display: none;">
                        해당 날짜에 촬영된 사진이 없습니다.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        (function ($) {
            // Global variables for this module
            var doneRawMap;
            var clusterSource;
            var vectorLayer;
            var isMapInitialized = false;

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

                // Close on click outside
                $(window).on('click', function (event) {
                    if (event.target == document.getElementById('drp-modal')) {
                        closeDrpModal();
                    }
                });
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
                        var style = styleCache[size];
                        if (!style) {
                            style = new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 10,
                                    stroke: new ol.style.Stroke({
                                        color: '#fff'
                                    }),
                                    fill: new ol.style.Fill({
                                        color: '#3399CC'
                                    })
                                }),
                                text: new ol.style.Text({
                                    text: size.toString(),
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })
                                })
                            });
                            styleCache[size] = style;
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
                        zoom: 7
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
                            // Zoom to cluster if multiple
                            if (features.length > 1) {
                                var extent = ol.extent.createEmpty();
                                features.forEach(function (f) {
                                    ol.extent.extend(extent, f.getGeometry().getExtent());
                                });
                                doneRawMap.getView().fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                            }

                            // Update list to show only these photos
                            var clusterPhotos = features.map(function (f) { return f.get('photoData'); });
                            updateList(clusterPhotos);
                        }
                    }
                });
            }

            // Update Map with Photos
            function updateMap(photos) {
                clusterSource.clear();

                if (!photos || photos.length === 0) return;

                var features = [];
                var extent = ol.extent.createEmpty();
                var hasValidGeo = false;

                photos.forEach(function (photo) {
                    if (!photo) return; // Skip null objects

                    if (photo.gpsLon && photo.gpsLat) {
                        var coordinate = ol.proj.fromLonLat([photo.gpsLon, photo.gpsLat]);
                        var feature = new ol.Feature({
                            geometry: new ol.geom.Point(coordinate),
                            photoData: photo
                        });
                        features.push(feature);
                        ol.extent.extend(extent, feature.getGeometry().getExtent());
                        hasValidGeo = true;
                    }
                });

                clusterSource.addFeatures(features);

                if (hasValidGeo) {
                    doneRawMap.getView().fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                }
            }

            // Update Photo List
            function updateList(photos) {
                var $ul = $('#drp-photo-list-ul');
                var $count = $('#drp-photo-count');
                var $empty = $('#drp-empty-state');

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

                    // Thumbnail placeholder or actual URL
                    var thumbSrc = '/api/drone/thumbnail/' + photo.photoSeq;
                    var $img = $('<img>').addClass('drp-photo-thumb').attr('src', thumbSrc).attr('alt', 'Photo');

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

                    $info.append($name).append($meta);

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

                        if (photo.gpsLon && photo.gpsLat) {
                            var coordinate = ol.proj.fromLonLat([photo.gpsLon, photo.gpsLat]);
                            doneRawMap.getView().animate({
                                center: coordinate,
                                zoom: 18,
                                duration: 500
                            });
                        }
                    });

                    $ul.append($li);
                });
            }

            // Initialize on document ready
            $(document).ready(function () {
                initDrpModal();
            });

        })(jQuery);
    </script>