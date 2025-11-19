<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>Spring/JSP VWorld 지도</title>

    <!-- OpenLayers 지도 렌더링 관련 CSS / JS -->
    <link
      rel="stylesheet"
      href="https://openlayers.org/en/v3.20.1/css/ol.css"
      type="text/css"
    />
    <script src="https://openlayers.org/en/v3.20.1/build/ol.js"></script>

    <!-- UI 구성 및 아이콘 사용을 위한 외부 라이브러리 -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
    />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
    />
    <link
      rel="stylesheet"
      href="<%=request.getContextPath()%>/resources/css/index.css"
    />
    <link
      rel="stylesheet"
      href="<%=request.getContextPath()%>/resources/css/slide-panel.css"
    />
    <link
      rel="stylesheet"
      href="<%=request.getContextPath()%>/resources/css/inquiry-modal.css"
    />
  </head>
  <body>
    <!-- 슬라이드 패널 JSP 포함 -->
    <jsp:include page="slide-panel.jsp" />

    <!-- 지도 렌더링 컨테이너 -->
    <div id="map"></div>

    <!-- 줌 안내 토스트 메시지 -->
    <div id="toast-message" class="toast-message">
      <i class="fas fa-search-plus"></i> 지도를 더 확대하여 영역을 선택해주세요.
    </div>

    <!-- 지도 선택 결과를 보여주는 팝업 -->
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-header" class="ol-popup-header">
        <h3 class="ol-popup-title">불법점용점검</h3>
      </div>
      <div id="popup-content"></div>
      <div id="popup-buttons">
        <button id="popup-register-btn" class="map-register-btn">
          <i class="fas fa-plus"></i>등록
        </button>
        <button id="popup-inquiry-btn" class="map-inquiry-btn" style="display: none;">
          <i class="fas fa-search"></i>조회
        </button>
      </div>
    </div>

    <!-- 등록 모달 JSP 포함 -->
    <jsp:include page="register-modal.jsp" />

    <!-- 조회 모달 JSP 포함 -->
    <jsp:include page="inquiry-modal.jsp" />

    <script src="<%=request.getContextPath()%>/resources/js/register.js"></script>
    <script src="<%=request.getContextPath()%>/resources/js/slide-panel.js"></script>
    <script src="<%=request.getContextPath()%>/resources/js/inquiry-modal.js"></script>

    <script type="text/javascript">
      // 지도에서 선택된 피처 및 속성 정보 저장용 전역 변수
      var selectedProperties = null;
      var selectedFeature = null;
      var selectedRegionData = null;

      // props 객체에서 사용할 수 있는 첫 번째 키 값을 반환
      function getFirstAvailable(props, keys) {
        if (!props) {
          return null;
        }
        for (var i = 0; i < keys.length; i++) {
          var value = props[keys[i]];
          if (value !== undefined && value !== null) {
            var trimmed = String(value).trim();
            if (trimmed.length > 0) {
              return trimmed;
            }
          }
        }
        return null;
      }

      // 팝업 및 등록 폼에서 사용될 주소 데이터 구성
      function buildRegionData(props, feature, coordinate) {
        var region = {};
        region.address = getFirstAvailable(props, [
          "addr",
          "address",
          "full_addr",
          "fullname",
        ]);
        region.jibunAddress = getFirstAvailable(props, [
          "jibun",
          "jibun_address",
          "land_address",
        ]);
        // PNU 값 추출
        region.pnu = getFirstAvailable(props, ["pnu", "PNU", "pnu_code"]);
        // 좌표 정보 (coordinate가 있을 경우)
        if (coordinate && Array.isArray(coordinate) && coordinate.length >= 2) {
          region.coordinateX = coordinate[0];
          region.coordinateY = coordinate[1];
        }

        return region;
      }

      // 데이터 존재 여부 확인 후 팝업 버튼 업데이트
      function checkDataExistenceAndUpdateButtons(pnu) {
        if (!pnu) {
          resetPopupButtons();
          return;
        }

        // LNDS_UNQ_NO로 데이터 존재 여부 확인
        $.ajax({
          url: "/regions/dates",
          method: "GET",
          data: {
            lndsUnqNo: pnu,
            type: "detail"
          },
          dataType: "json"
        })
        .done(function(response) {
          if (response.success && response.data && response.data.dates) {
            var dates = response.data.dates;
            if (Array.isArray(dates) && dates.length > 0) {
              // 데이터가 존재하는 경우 - 등록 버튼과 조회 버튼 모두 표시
              showBothButtons();
            } else {
              // 데이터가 없는 경우 - 등록 버튼만 표시
              resetPopupButtons();
            }
          } else {
            // API 호출은 성공했지만 데이터가 없는 경우
            resetPopupButtons();
          }
        })
        .fail(function(xhr, status, error) {
          console.warn("데이터 존재 여부 확인 실패:", status, error);
          // 실패 시에도 등록 버튼은 표시
          resetPopupButtons();
        });
      }

      // 팝업 버튼을 기본 상태로 리셋 (등록 버튼만 표시)
      function resetPopupButtons() {
        $("#popup-register-btn").show();
        $("#popup-inquiry-btn").hide();
      }

      // 등록 버튼과 조회 버튼 모두 표시
      function showBothButtons() {
        $("#popup-register-btn").show();
        $("#popup-inquiry-btn").show();
      }

      // 팝업에 표시할 내용을 HTML 템플릿으로 반환
      function buildPopupContent(region) {
        if (!region) {
          return "<span>선택된 정보를 불러올 수 없습니다.</span>";
        }
        return escapeHtml(region.address || "-") + "</div>";
      }

      // 등록 모달 폼에 선택된 지역 데이터를 채움
      function fillRegisterForm(region) {
        if (!region) {
          return;
        }
        var resolvedAddress = region.address || region.jibunAddress || "";
        $("#illegalDetailAddressInput").val(resolvedAddress);
      }

      // 모달 폼을 초기 상태로 리셋
      window.onload = function () {
        console.log("페이지 로드 완료");
        // VWorld API 키 (임시 키 - 실제 서비스에서는 환경 변수로 관리 권장)
        var VWORLD_API_KEY = "B13ADD16-4164-347A-A733-CD9022E8FB3B";

        // 서울 시청 좌표를 기본 중심으로 하는 맵 뷰 설정
        var view = new ol.View({
          center: ol.proj.transform(
            [126.978, 37.5665],
            "EPSG:4326",
            "EPSG:3857"
          ),
          zoom: 17,
        });
        // 기본 지도 레이어
        var baseLayer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            url:
              "https://api.vworld.kr/req/wmts/1.0.0/" +
              VWORLD_API_KEY +
              "/Base/{z}/{y}/{x}.png",
          }),
        });
        // 지적편집도 레이어
        var cadastralLayer = new ol.layer.Tile({
          source: new ol.source.TileWMS({
            url: "https://api.vworld.kr/req/wms",
            params: {
              LAYERS: "lp_pa_cbnd_bubun",
              STYLES: "lp_pa_cbnd_bubun",
              CRS: "EPSG:3857",
              FORMAT: "image/png",
              TRANSPARENT: true,
              KEY: VWORLD_API_KEY,
            },
          }),
          zIndex: 5, // 이미지 위에 표시되도록 설정
        });
        // 선택 영역 하이라이트 스타일
        var highlightStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(0, 153, 255, 0.8)",
            width: 3,
          }),
          fill: new ol.style.Fill({ color: "rgba(0, 153, 255, 0.1)" }),
        });
        // 하이라이트 소스를 전역 변수로 선언
        window.highlightSource = new ol.source.Vector();
        var highlightLayer = new ol.layer.Vector({
          source: window.highlightSource,
          style: highlightStyle,
          zIndex: 10, // 이미지 위에 표시되도록 높은 zIndex
        });

        // 이미지 오버레이 레이어들 생성
        var imageLayers = [];
        var allImageExtents = []; // 모든 이미지의 범위를 저장
        var imageOverlays = [
          {
            name: "필지1",
            displayName: "1103-1",
            basePath: "<%=request.getContextPath()%>/data/field1/",
            kmlPath: "0/0/0.kml",
            imagePath: "0/0/0.png",
            bounds: {
              north: 36.223108,
              south: 36.22267,
              east: 127.9156,
              west: 127.915091,
            },
          },
          {
            name: "필지2",
            displayName: "1103-2",
            basePath: "<%=request.getContextPath()%>/data/field2/",
            kmlPath: "0/0/0.kml",
            imagePath: "0/0/0.png",
            bounds: {
              north: 36.222395,
              south: 36.222085,
              east: 127.914286,
              west: 127.913918,
            },
          },
          {
            name: "필지3",
            displayName: "1103-3",
            basePath: "<%=request.getContextPath()%>/data/filed3/",
            kmlPath: "0/0/0.kml",
            imagePath: "0/0/0.png",
            bounds: {
              north: 36.210323,
              south: 36.209927,
              east: 127.95447,
              west: 127.953603,
            },
          },
        ];

        // 각 이미지 오버레이를 처리하는 함수
        function createImageOverlay(overlay, index) {
          console.log("KML 로드 시도:", overlay.basePath + overlay.kmlPath);
          $.get(overlay.basePath + overlay.kmlPath)
            .done(function (kmlData) {
              console.log("KML 로드 성공:", overlay.name);
              var parser = new DOMParser();
              var kmlDoc = parser.parseFromString(kmlData, "text/xml");
              // GroundOverlay의 gx:LatLonQuad에서 좌표 찾기
              var groundOverlay = kmlDoc.querySelector("GroundOverlay");
              var coordinates = null;
              var latLonQuad = null;

              if (groundOverlay) {
                // gx:LatLonQuad 요소 찾기 (네임스페이스 고려)
                latLonQuad =
                  groundOverlay.querySelector("*[localName='LatLonQuad']") ||
                  groundOverlay.querySelector("LatLonQuad") ||
                  groundOverlay.querySelector("gx\\:LatLonQuad");

                if (latLonQuad) {
                  coordinates = latLonQuad.querySelector("coordinates");
                }
              }

              console.log("GroundOverlay 요소:", groundOverlay);
              console.log("LatLonQuad 요소:", latLonQuad);
              console.log("찾은 좌표 요소:", coordinates);

              if (coordinates) {
                var coordText = coordinates.textContent.trim();
                console.log("좌표 텍스트:", coordText);

                // 좌표 텍스트를 줄바꿈과 공백으로 분리
                var coordPairs = coordText
                  .split(/[\s\n\r\t]+/)
                  .filter(function (item) {
                    return item.trim().length > 0;
                  });
                console.log("좌표 쌍들:", coordPairs);

                var coords = [];
                for (var i = 0; i < coordPairs.length; i++) {
                  var parts = coordPairs[i].split(",");
                  if (parts.length >= 2) {
                    var lon = parseFloat(parts[0]);
                    var lat = parseFloat(parts[1]);
                    if (!isNaN(lon) && !isNaN(lat)) {
                      coords.push([lon, lat]);
                    }
                  }
                }

                console.log("파싱된 좌표들:", coords);

                if (coords.length === 4) {
                  // 좌표를 EPSG:3857로 변환
                  var transformedCoords = coords.map(function (coord) {
                    return ol.proj.transform(coord, "EPSG:4326", "EPSG:3857");
                  });

                  // 이미지 레이어 생성
                  var imageLayer = new ol.layer.Image({
                    source: new ol.source.ImageStatic({
                      url: overlay.basePath + overlay.imagePath,
                      imageExtent: ol.extent.boundingExtent(transformedCoords),
                      projection: "EPSG:3857",
                    }),
                    opacity: 1.0, // 완전 불투명으로 설정하여 선명도 향상
                    zIndex: 1,
                    visible: true,
                  });

                  imageLayer.set("name", overlay.name);
                  imageLayers.push(imageLayer);
                  window.map.addLayer(imageLayer);

                  // 이미지 범위를 전체 범위 배열에 추가
                  var extent = ol.extent.boundingExtent(transformedCoords);
                  allImageExtents.push(extent);

                  // 각 필지별 범위 저장
                  window.imageExtents[overlay.name] = extent;
                  console.log("필지 범위 저장됨:", overlay.name, extent);

                  // 이미지 범위 저장만 수행 (자동 줌 조정 제거됨)
                } else {
                  console.error("좌표가 4개가 아님:", coords.length, coords);
                  console.log("대안: 미리 정의된 bounds 사용");
                  createImageFromBounds(overlay, index);
                }
              } else {
                console.error("좌표 요소를 찾을 수 없음:", overlay.name);
                console.log("대안: 미리 정의된 bounds 사용");
                createImageFromBounds(overlay, index);
              }
            })
            .fail(function (xhr, status, error) {
              console.error("KML 로드 실패:", overlay.name);
              console.error("상태:", status);
              console.error("오류:", error);
              console.error("응답:", xhr.responseText);
              console.log("대안: 미리 정의된 bounds 사용");
              createImageFromBounds(overlay, index);
            });
        }

        // 미리 정의된 bounds를 사용하여 이미지 레이어 생성
        function createImageFromBounds(overlay, index) {
          console.log("Bounds로 이미지 생성:", overlay.name, overlay.bounds);

          // bounds를 좌표 배열로 변환 (좌하, 우하, 우상, 좌상 순서)
          var coords = [
            [overlay.bounds.west, overlay.bounds.south], // 좌하
            [overlay.bounds.east, overlay.bounds.south], // 우하
            [overlay.bounds.east, overlay.bounds.north], // 우상
            [overlay.bounds.west, overlay.bounds.north], // 좌상
          ];

          // 좌표를 EPSG:3857로 변환
          var transformedCoords = coords.map(function (coord) {
            return ol.proj.transform(coord, "EPSG:4326", "EPSG:3857");
          });

          // 이미지 레이어 생성
          var imageLayer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
              url: overlay.basePath + overlay.imagePath,
              imageExtent: ol.extent.boundingExtent(transformedCoords),
              projection: "EPSG:3857",
            }),
            opacity: 1.0, // 완전 불투명으로 설정하여 선명도 향상
            zIndex: 1,
            visible: true,
          });

          imageLayer.set("name", overlay.name);
          imageLayers.push(imageLayer);
          window.map.addLayer(imageLayer);

          // 이미지 범위를 전체 범위 배열에 추가
          var extent = ol.extent.boundingExtent(transformedCoords);
          allImageExtents.push(extent);

          // 각 필지별 범위 저장
          window.imageExtents[overlay.name] = extent;
          console.log("필지 범위 저장됨 (bounds):", overlay.name, extent);

          // 이미지 범위 저장만 수행 (자동 줌 조정 제거됨)
        }

        // 테스트: 첫 번째 KML 파일 직접 접근 테스트
        var testUrl = "<%=request.getContextPath()%>/data/field1/0/0/0.kml";
        console.log("테스트 URL:", testUrl);

        $.get(testUrl)
          .done(function (data) {
            console.log("✅ KML 파일 접근 성공!");
            console.log("데이터 길이:", data.length);

            // 모든 이미지 오버레이 생성
            console.log("이미지 오버레이 생성 시작");
            imageOverlays.forEach(createImageOverlay);
          })
          .fail(function (xhr, status, error) {
            console.error("❌ KML 파일 접근 실패");
            console.error("상태:", status);
            console.error("오류:", error);
            console.error("상태 코드:", xhr.status);
            console.error("응답:", xhr.responseText);
          });

        // 지도 객체 생성 (전역 변수로 선언)
        window.map = new ol.Map({
          target: "map",
          layers: [baseLayer, cadastralLayer, highlightLayer],
          view: view,
          // 이미지 렌더링 최적화 설정
          pixelRatio: window.devicePixelRatio || 1, // 고해상도 디스플레이 지원
        });

        // 이미지 레이어들을 전역 변수로 저장
        window.imageLayers = imageLayers;
        window.imageExtents = {}; // 각 필지별 범위 저장

        // 팝업 관련 DOM 요소 레퍼런스
        var container = document.getElementById("popup");
        var content = document.getElementById("popup-content");
        var closer = document.getElementById("popup-closer");
        var overlay = new ol.Overlay({
          element: container,
          autoPan: true,
          autoPanAnimation: { duration: 250 },
        });
        window.map.addOverlay(overlay);

        // 팝업 닫기 버튼 이벤트
        closer.onclick = function () {
          overlay.setPosition(undefined);
          closer.blur();
          selectedProperties = null;
          selectedFeature = null;
          selectedRegionData = null;
          resetPopupButtons(); // 팝업 닫을 때 버튼 상태 리셋
          return false;
        };

        // 단일 클릭 시 지적 정보 조회
        window.map.on("singleclick", function (evt) {
          var currentZoom = view.getZoom();

          // 너무 낮은 줌 레벨에서는 토스트 메시지만 노출
          if (currentZoom < 18) {
            window.highlightSource.clear();
            overlay.setPosition(undefined);

            var toast = $("#toast-message");
            toast.stop().fadeIn(400, function () {
              setTimeout(function () {
                toast.fadeOut(400);
              }, 2000);
            });
            return;
          }

          var coordinate = evt.coordinate;
          overlay.setPosition(undefined);
          selectedProperties = null;
          selectedFeature = null;
          selectedRegionData = null;

          // WMS GetFeatureInfo 호출 URL 생성
          var viewResolution = window.map.getView().getResolution();
          var source = cadastralLayer.getSource();
          var url = source.getGetFeatureInfoUrl(
            coordinate,
            viewResolution,
            "EPSG:3857",
            {
              INFO_FORMAT: "application/json",
              QUERY_LAYERS: "lp_pa_cbnd_bubun",
              FEATURE_COUNT: 1,
              domain: "http://localhost",
              info_format: "text/javascript",
            }
          );
          console.log(url);
          if (url) {
            $.ajax({
              url: url,
              dataType: "jsonp",
              jsonpCallback: "parseResponse",
            })
              .done(function (json) {
                window.highlightSource.clear();
                console.log(json);
                if (json.features && json.features.length > 0) {
                  var featureData = json.features[0];
                  selectedProperties = featureData.properties || {};
                  var format = new ol.format.GeoJSON();
                  selectedFeature = format.readFeature(featureData, {
                    dataProjection: "EPSG:3857",
                    featureProjection: "EPSG:3857",
                  });
                  window.highlightSource.addFeature(selectedFeature);
                  selectedRegionData = buildRegionData(
                    selectedProperties,
                    selectedFeature,
                    coordinate
                  );
                  content.innerHTML = buildPopupContent(selectedRegionData);
                  
                  // 데이터 존재 여부 확인 후 버튼 표시
                  checkDataExistenceAndUpdateButtons(selectedRegionData.pnu);
                  
                  overlay.setPosition(coordinate);
                } else {
                  selectedProperties = null;
                  selectedFeature = null;
                  selectedRegionData = null;
                  content.innerHTML =
                    "<span>선택한 위치의 지적 정보가 없습니다.</span>";
                  
                  // 지적 정보가 없는 경우 등록 버튼만 표시
                  resetPopupButtons();
                  
                  overlay.setPosition(coordinate);
                }
              })
              .fail(function (err) {
                console.error("GetFeatureInfo Error:", err);
                window.highlightSource.clear();
                overlay.setPosition(undefined);
                resetPopupButtons(); // 에러 시에도 버튼 상태 리셋
              });
          }
        });

        // 팝업 내 등록 버튼 클릭 시 모달 띄우기
        $("#popup-register-btn").on("click", function () {
          if (selectedRegionData) {
            if (
              window.RegisterModule &&
              typeof window.RegisterModule.fillForm === "function"
            ) {
              window.RegisterModule.fillForm(selectedRegionData);
            }
            // PNU 및 좌표 정보를 히든 필드에 설정
            if (selectedRegionData.pnu) {
              $("#lndsUnqNo").val(selectedRegionData.pnu);
            }
            if (selectedRegionData.coordinateX !== undefined) {
              $("#gpsLgtd").val(selectedRegionData.coordinateX);
            }
            if (selectedRegionData.coordinateY !== undefined) {
              $("#gpsLttd").val(selectedRegionData.coordinateY);
            }
            if (
              window.RegisterModule &&
              typeof window.RegisterModule.clearAlert === "function"
            ) {
              window.RegisterModule.clearAlert();
            }
            if (
              window.IllegalRegisterModal &&
              typeof window.IllegalRegisterModal.open === "function"
            ) {
              window.IllegalRegisterModal.open();
            } else {
              console.warn("IllegalRegisterModal이 초기화되지 않았습니다.");
            }
          } else {
            alert("등록할 정보가 없습니다. 지도를 다시 클릭해주세요.");
          }
        });

        // 팝업 내 조회 버튼 클릭 시 조회 모달 띄우기
        $("#popup-inquiry-btn").on("click", function () {
          if (selectedRegionData && selectedRegionData.pnu) {
            if (
              window.illegalInquiryModal &&
              typeof window.illegalInquiryModal.open === "function"
            ) {
              window.illegalInquiryModal.open(selectedRegionData.pnu);
            } else {
              console.warn("IllegalInquiryModal이 초기화되지 않았습니다.");
            }
          } else {
            alert("조회할 정보가 없습니다. 지도를 다시 클릭해주세요.");
          }
        });

        // 조회 모달 초기화
        if (typeof IllegalInquiryModal === "function") {
          illegalInquiryModal = new IllegalInquiryModal();
        }

        // 이미지 레이어 토글 기능
        $("#layer-field1").on("change", function () {
          var layer = window.imageLayers.find(function (l) {
            return l.get("name") === "필지1";
          });
          if (layer) {
            layer.setVisible(this.checked);
          }
        });

        $("#layer-field2").on("change", function () {
          var layer = window.imageLayers.find(function (l) {
            return l.get("name") === "필지2";
          });
          if (layer) {
            layer.setVisible(this.checked);
          }
        });

        $("#layer-field3").on("change", function () {
          var layer = window.imageLayers.find(function (l) {
            return l.get("name") === "필지3";
          });
          if (layer) {
            layer.setVisible(this.checked);
          }
        });

        // 개별 필지로 이동하는 기능
        $(document).on("click", ".kml-layer-control__goto-btn", function () {
          console.log("이동 버튼 클릭됨");
          var fieldName = $(this).data("field");
          console.log("필드명:", fieldName);
          var layerName = "";

          switch (fieldName) {
            case "field1":
              layerName = "필지1";
              break;
            case "field2":
              layerName = "필지2";
              break;
            case "field3":
              layerName = "필지3";
              break;
          }

          console.log("레이어명:", layerName);
          console.log("저장된 범위들:", window.imageExtents);

          if (
            layerName &&
            window.imageExtents &&
            window.imageExtents[layerName]
          ) {
            console.log("이동 실행:", window.imageExtents[layerName]);
            // 현재 줌 레벨을 유지하면서 중심점만 이동
            var extent = window.imageExtents[layerName];
            var center = ol.extent.getCenter(extent);
            window.map.getView().animate({
              center: center,
              duration: 800
            });
          } else {
            console.log("이동 실패 - 범위 정보 없음");
            alert(
              "아직 이미지가 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
            );
          }
        });
      };
    </script>
  </body>
</html>
