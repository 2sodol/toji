<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <!DOCTYPE html>
    <html>

    <head>
        <style>
            /* CSS reused from drone-raw-photo-modal.css and adapted */
            .drp-modal {
                display: none;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background-color: rgba(0, 0, 0, 0.6);
                font-family: 'Noto Sans KR', sans-serif;
            }

            .drp-modal-content {
                background-color: #fefefe;
                margin: 2% auto;
                padding: 0;
                border-radius: 8px;
                width: 95%;
                height: 92%;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                max-width: 1600px;
            }

            .drp-modal-header {
                padding: 15px 20px;
                background-color: #34495e;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }

            .drp-modal-title {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
            }

            .drp-close-btn {
                color: #ddd;
                font-size: 28px;
                font-weight: bold;
                background: none;
                border: none;
                cursor: pointer;
                line-height: 1;
            }

            .drp-close-btn:hover {
                color: #fff;
            }

            .drp-modal-body {
                display: flex;
                flex: 1;
                overflow: hidden;
                position: relative;
            }

            /* Map Section */
            .drp-map-container {
                flex: 2;
                height: 100%;
                background-color: #eee;
                position: relative;
            }

            /* List Section */
            .drp-list-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                border-left: 1px solid #ddd;
                background-color: #fff;
                min-width: 350px;
                max-width: 500px;
            }

            .drp-list-header {
                padding: 15px;
                border-bottom: 1px solid #eee;
                background-color: #fafafa;
            }

            .drp-list-header-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .drp-date-selector {
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .drp-sync-container {
                margin-left: 10px;
            }

            .drp-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                color: white;
            }

            .drp-sync-btn {
                background-color: #27ae60;
            }

            .drp-download-btn {
                background-color: #3498db;
            }

            .drp-photo-list {
                flex: 1;
                overflow-y: auto;
                padding: 0;
                margin: 0;
                list-style: none;
            }

            .drp-photo-item {
                display: flex;
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .drp-photo-item:hover {
                background-color: #f5f5f5;
            }

            .drp-photo-item.active {
                background-color: #e8f6fd;
                border-left: 4px solid #3498db;
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
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 4px;
                word-break: break-all;
            }

            .drp-photo-meta {
                font-size: 12px;
                color: #888;
            }

            .drp-checkbox {
                margin-right: 10px;
                margin-top: 25px;
            }

            .drp-empty-state {
                text-align: center;
                padding: 50px 20px;
                color: #999;
            }

            /* Highlight for existing schedules in Datepicker */
            .ui-datepicker td.has-schedule a {
                background-color: #e6ffe6 !important;
                border: 1px solid #27ae60 !important;
                color: #27ae60 !important;
                font-weight: bold;
            }

            /* Image Viewer */
            .drp-image-viewer {
                display: none;
                position: fixed;
                z-index: 3000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                justify-content: center;
                align-items: center;
            }

            .drp-viewer-content {
                max-width: 90%;
                max-height: 90%;
            }

            .drp-viewer-img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }

            .drp-viewer-close {
                position: absolute;
                top: 20px;
                right: 35px;
                color: #f1f1f1;
                font-size: 40px;
                font-weight: bold;
                cursor: pointer;
            }
        </style>
        <!-- Libraries: Assuming jQuery and OpenLayers CSS/JS are loaded in parent or here -->
        <!-- Using CDN for exifr as requested -->
        <script src="https://cdn.jsdelivr.net/npm/exifr/dist/full.umd.js"></script>

    </head>

    <body>

        <div id="drp-modal" class="drp-modal">
            <div class="drp-modal-content">
                <div class="drp-modal-header">
                    <h2 class="drp-modal-title">Drone Raw Photo Explorer (Client-Side)</h2>
                    <div class="drp-header-controls">
                        <button id="drp-close-btn" class="drp-close-btn">&times;</button>
                    </div>
                </div>
                <div class="drp-modal-body">
                    <div id="drp-map" class="drp-map-container"></div>

                    <div id="drp-list" class="drp-list-container">
                        <div class="drp-list-header">
                            <div class="drp-list-header-top">
                                <span>Photos: <span id="drp-photo-count">0</span></span>
                                <div class="drp-sync-container">
                                    <button id="drp-sync-btn" class="drp-btn drp-sync-btn">Sync API</button>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <input type="text" id="drp-datepicker" placeholder="Select Date"
                                    class="drp-date-selector" style="width: 100%; box-sizing: border-box;">
                            </div>

                            <div class="drp-list-controls">
                                <!-- Example Download All placeholder -->
                            </div>
                        </div>

                        <ul id="drp-photo-list-ul" class="drp-photo-list">
                            <!-- Photo Items -->
                        </ul>

                        <div id="drp-empty-state" class="drp-empty-state">
                            Select a date to view photos.
                        </div>
                        <div id="drp-loading-state" class="drp-empty-state" style="display:none;">
                            Loading Photos & Metadata... <br>
                            <span id="drp-progress-text"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Viewer -->
        <div id="drp-image-viewer" class="drp-image-viewer">
            <span id="drp-viewer-close" class="drp-viewer-close">&times;</span>
            <div class="drp-viewer-content">
                <img id="drp-viewer-img" class="drp-viewer-img" src="">
            </div>
        </div>

        <script>
            (function ($) {
                // Configuration
                const EXTERNAL_API_URL = "https://dsc.ex.co.kr:9550/ex/drone/images";
                const INTERNAL_API_SCHEDULE = "http://localhost:8080/api/drone/schedule"; // Adjust host if needed

                // State
                var map;
                var clusterSource;
                var vectorLayer;
                var availableDates = []; // List of YYYYMMDD
                var isMapInitialized = false;

                // --- 1. Initialization ---
                window.openDroneExplorer = function () {
                    $('#drp-modal').show();

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

                // --- 2. Schedule & Sync ---
                function loadScheduleFromDB() {
                    $.get("/api/drone/schedule", function (dates) {
                        availableDates = dates || []; // ['20251204', ...]
                        initDatepicker();
                    });
                }

                $('#drp-sync-btn').on('click', function () {
                    if (!confirm("Sync flight schedule from External API?")) return;

                    // Fetch All from External
                    $.ajax({
                        url: EXTERNAL_API_URL,
                        method: 'GET',
                        success: function (response) {
                            // Mock response if array is empty (for testing)
                            // response = ["http://.../images/20251204_000000.png", ...];

                            var uniqueDates = new Set();
                            var urlList = (typeof response === 'string') ? JSON.parse(response) : response;

                            urlList.forEach(function (url) {
                                // Extract Date from URL or Filename
                                // Pattern: .../images/20241115_155843.png
                                // Regex find YYYYMMDD
                                var match = url.match(/(\d{8})_\d{6}/);
                                if (match && match[1]) {
                                    uniqueDates.add(match[1]);
                                } else {
                                    // Attempt fallback from timestamp in path
                                    // .../flight/1731653711981/...
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

                            // Send to Internal DB
                            $.ajax({
                                url: '/api/drone/schedule/sync',
                                method: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(dateArray),
                                success: function () {
                                    alert("Sync Complete! " + dateArray.length + " dates found.");
                                    loadScheduleFromDB();
                                },
                                error: function () { alert("Failed to save schedule to DB."); }
                            });
                        },
                        error: function () { alert("Failed to fetch from External API."); }
                    });
                });

                function initDatepicker() {
                    $('#drp-datepicker').datepicker('destroy').datepicker({
                        dateFormat: 'yymmdd',
                        beforeShowDay: function (date) {
                            var y = date.getFullYear();
                            var m = String(date.getMonth() + 1).padStart(2, '0');
                            var d = String(date.getDate()).padStart(2, '0');
                            var ymd = y + m + d;

                            if (availableDates.includes(ymd)) {
                                return [true, "has-schedule", "Photos Available"]; // Class for highlighting
                            }
                            return [true, "", ""];
                        },
                        onSelect: function (dateText) {
                            loadImagesForDate(dateText); // dateText is YYYYMMDD
                        }
                    });
                }

                // --- 3. Image Loading & GPS Extraction ---
                async function loadImagesForDate(ymd) {
                    $('#drp-empty-state').hide();
                    $('#drp-loading-state').show();
                    $('#drp-photo-list-ul').empty();
                    clusterSource.clear();

                    try {
                        // 1. Fetch All URLs (Since we assume API returns all, we filter here)
                        // Real implementation would pass ?date=... if API supports it.
                        // For now, fetching all and filtering.
                        let response = await $.ajax({ url: EXTERNAL_API_URL, method: 'GET' });
                        let allUrls = (typeof response === 'string') ? JSON.parse(response) : response;

                        // 2. Filter Client Side (Naive approach for prototype)
                        // We need to match 'ymd' (e.g. 20241115) with the URL
                        let targetUrls = allUrls.filter(url => {
                            // Check filename YYYYMMDD
                            if (url.indexOf(ymd) !== -1) return true;

                            // Check timestamp logic if filename doesn't match
                            // Convert ymd to timestamp range? 
                            // Simplify: Just check string containment for prototype
                            return false;
                        });

                        // If empty, standard logic might fail.
                        // Let's also check strict parsing if containment is too loose.

                        $('#drp-photo-count').text(targetUrls.length);

                        // 3. Process each URL to get GPS
                        let features = [];
                        let processed = 0;

                        // Parallel processing for speed
                        const promises = targetUrls.map(async (url) => {
                            try {
                                // Use exifr to extract GPS (Range request)
                                let gps = await exifr.gps(url);

                                if (gps && gps.latitude && gps.longitude) {
                                    // Create Feature
                                    let coord = ol.proj.fromLonLat([gps.longitude, gps.latitude]);
                                    let feature = new ol.Feature({
                                        geometry: new ol.geom.Point(coord),
                                        data: {
                                            url: url,
                                            name: url.split('/').pop(),
                                            lat: gps.latitude,
                                            lon: gps.longitude
                                        }
                                    });
                                    features.push(feature);

                                    // Add to list (Simple append, can be optimized)
                                    // Note: doing DOM manipulation in async loop is bad for perf, 
                                    // better to batch. For now, pushing to array.
                                }
                            } catch (e) {
                                console.warn("No GPS or Error for " + url, e);
                            } finally {
                                processed++;
                                $('#drp-progress-text').text(`${processed} / ${targetUrls.length}`);
                            }
                        });

                        await Promise.all(promises);

                        // 4. Update Map & List
                        clusterSource.addFeatures(features);
                        updateList(features);

                        if (features.length > 0) {
                            // Fit map
                            let extent = vectorLayer.getSource().getExtent();
                            if (extent) map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 18 });
                        }

                    } catch (err) {
                        console.error(err);
                        alert("Error loading photos.");
                    } finally {
                        $('#drp-loading-state').hide();
                    }
                }

                function updateList(features) {
                    var $ul = $('#drp-photo-list-ul');
                    $ul.empty();

                    features.forEach(f => {
                        var d = f.get('data');
                        var $li = $('<li>').addClass('drp-photo-item');

                        var $img = $('<img>').addClass('drp-photo-thumb').attr('src', d.url);
                        $img.on('click', function (e) {
                            e.stopPropagation();
                            $('#drp-viewer-img').attr('src', d.url);
                            $('#drp-image-viewer').css('display', 'flex');
                        });

                        var $info = $('<div>').addClass('drp-photo-info');
                        $info.append($('<div>').addClass('drp-photo-name').text(d.name));
                        $info.append($('<div>').addClass('drp-photo-meta').text(`Lat: ${d.lat.toFixed(5)}, Lon: ${d.lon.toFixed(5)}`));

                        $li.append($img).append($info);

                        $li.on('click', function () {
                            var coord = f.getGeometry().getCoordinates();
                            map.getView().animate({ center: coord, zoom: 19 });
                        });

                        $ul.append($li);
                    });
                }

                // --- 4. OpenLayers Map ---
                function initMap() {
                    var raster = new ol.layer.Tile({
                        source: new ol.source.OSM() // Or VWorld
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
                            center: ol.proj.fromLonLat([127.0, 37.5]),
                            zoom: 7
                        })
                    });

                    // Cluster Click
                    map.on('click', function (evt) {
                        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
                        if (feature) {
                            var features = feature.get('features');
                            if (features.length > 1) {
                                // Zoom to extent
                                var extent = ol.extent.createEmpty();
                                features.forEach(function (f) { ol.extent.extend(extent, f.getGeometry().getExtent()); });
                                map.getView().fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                            } else {
                                // Single feature click -> highlight logic optional
                            }
                        }
                    });
                }

            })(jQuery);
        </script>
    </body>

    </html>