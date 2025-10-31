<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Spring/JSP VWorld 지도</title>
    
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.
    css">
    <link rel="stylesheet" href="https://openlayers.org/en/v3.20.1/css/ol.css" type="text/css">
    <script src="https://openlayers.org/en/v3.20.1/build/ol.js"></script>
    <link rel="stylesheet" href="https://openlayers.org/en/v3.20.1/css/ol.css" type="text/css">
    <script src="https://openlayers.org/en/v3.20.1/build/ol.js"></script>
    
    <style>
        /* HTML과 Body의 높이를 100%로 설정해야 지도가 꽉 찹니다. */
        html, body {
            margin: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
        }
        #map {
            width: 100%;
            height: 100%;
        }
        #info {
            position: absolute;
            top: 20px;
            left: 20px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid #ccc;
            border-radius: 5px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="info">지도를 확대하여 지적 경계를 클릭하세요.</div>

    <script type="text/javascript">
        // 본인의 VWorld API 키를 입력하세요.
        var VWORLD_API_KEY = "B13ADD16-4164-347A-A733-CD9022E8FB3B";

        // 페이지 로드가 완료되면 지도 초기화 함수를 실행합니다.
        window.onload = function() {
            // 1. 지도 뷰 설정 (서울 시청 근처, 확대)
            var view = new ol.View({
                center: ol.proj.transform([126.9780, 37.5665], 'EPSG:4326', 'EPSG:3857'),
                zoom: 17
            });
            // 2. 배경 지도 레이어
            var baseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://api.vworld.kr/req/wmts/1.0.0/' + VWORLD_API_KEY + '/Base/{z}/{y}/{x}.png'
                })
            });
            // 3. 연속지적도 레이어 (WMS)
            var cadastralLayer = new ol.layer.Tile({ 
                source: new ol.source.TileWMS({    
                    url: 'https://api.vworld.kr/req/wms',
                    params: {
                        'LAYERS': 'lp_pa_cbnd_bubun',
                        'STYLES': 'lp_pa_cbnd_bubun',
                        'CRS': 'EPSG:3857',
                        'FORMAT': 'image/png',
                        'TRANSPARENT': true,
                        'KEY': VWORLD_API_KEY,
                    },
                })
            });
            // 4. 지도 객체 생성 (레이어 순서 주의!)
            var map = new ol.Map({
                target: 'map',
                layers: [baseLayer, cadastralLayer],
                view: view
            });


            // 5. 클릭 이벤트 처리
            map.on('singleclick', function (evt) {
                var infoDiv = document.getElementById('info');
                infoDiv.innerHTML = '정보를 조회하는 중...';

                var coordinate = evt.coordinate;
                var source = cadastralLayer.getSource();
                var viewResolution = view.getResolution();
                
                var url = source.getGetFeatureInfoUrl(
                    coordinate,
                    viewResolution,
                    'EPSG:3857',
                    {
                        'INFO_FORMAT': 'application/json',
                        'QUERY_LAYERS': 'lp_pa_cbnd_bubun'
                    }
                );

                if (url) {
                    fetch(url)
                        .then(function (response) { return response.json(); })
                        .then(function (data) {
                            if (data.features && data.features.length > 0) {
                                var jibun = data.features[0].properties.jibun;
                                var lonLat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                                
                                var html = '<strong>지번 주소:</strong> ' + jibun + '<br>';
                                html += '<strong>GPS:</strong> ' + lonLat[1].toFixed(6) + ', ' + lonLat[0].toFixed(6);
                                infoDiv.innerHTML = html;
                            } else {
                                infoDiv.innerHTML = '해당 위치에 지번 정보가 없습니다.';
                            }
                        })
                        .catch(function(error) {
                            console.error('정보 조회 실패:', error);
                            infoDiv.innerHTML = '정보를 가져오는 데 실패했습니다.';
                        });
                }
            });
        };
    </script>
</body>
</html>