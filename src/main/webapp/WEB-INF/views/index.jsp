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

      // 데이터 존재 여부 확인 후 팝업 버튼 업데이트 및 스타일 적용
      function checkDataExistenceAndUpdateButtons(pnu, feature) {
        if (!pnu) {
          resetPopupButtons();
          // feature에 데이터 없음 표시
          if (feature) {
            feature.set('hasData', false);
          }
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
              // feature에 데이터 있음 표시 (붉은색 테두리)
              if (feature) {
                feature.set('hasData', true);
                feature.changed(); // 지도 다시 렌더링
              }
            } else {
              // 데이터가 없는 경우 - 등록 버튼만 표시
              resetPopupButtons();
              // feature에 데이터 없음 표시 (파란색 기본 스타일)
              if (feature) {
                feature.set('hasData', false);
                feature.changed(); // 지도 다시 렌더링
              }
            }
          } else {
            // API 호출은 성공했지만 데이터가 없는 경우
            resetPopupButtons();
            if (feature) {
              feature.set('hasData', false);
            }
          }
        })
        .fail(function(xhr, status, error) {
          console.warn("데이터 존재 여부 확인 실패:", status, error);
          // 실패 시에도 등록 버튼은 표시
          resetPopupButtons();
          if (feature) {
            feature.set('hasData', false);
          }
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

      // HTML 이스케이프 함수 (전역에 등록)
      window.escapeHtml = function(value) {
        if (value === undefined || value === null) {
          return "";
        }
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      };

      /**
       * 좌표로 지적 정보를 조회하고 영역 표시 + 팝업 표출하는 공통 함수 (전역에 등록)
       * @param {Object} options - 옵션 객체
       * @param {Array} options.coordinate - 클릭한 좌표 [x, y] (EPSG:3857)
       * @param {ol.layer.Tile} options.layer - 조회할 레이어 객체 (기본값: window.cadastralLayer)
       * @param {String} options.layerName - 레이어명 (기본값: "lp_pa_cbnd_bubun")
       * @param {Boolean} options.checkDataExistence - 데이터 존재 여부 확인 여부 (기본값: true)
       * @param {String} options.pnu - 필지번호 (선택, 있으면 버튼 체크에 사용)
       */
      window.showMapPopupAndHighlight = function(options) {
        var coordinate = options.coordinate;
        var layer = options.layer || window.cadastralLayer;
        var layerName = options.layerName || "lp_pa_cbnd_bubun";
        var checkDataExistence = options.checkDataExistence !== false; // 기본값: true
        var pnu = options.pnu || null;

        if (!coordinate || !Array.isArray(coordinate) || coordinate.length < 2) {
          console.error("showMapPopupAndHighlight: 유효하지 않은 좌표입니다.", coordinate);
          return;
        }

        if (!layer) {
          console.error("showMapPopupAndHighlight: 레이어가 초기화되지 않았습니다.");
          return;
        }

        if (!window.popupOverlay || !window.popupContent) {
          console.error("showMapPopupAndHighlight: 팝업 오버레이가 초기화되지 않았습니다.");
          return;
        }

        // 기존 선택 정보 초기화
        window.popupOverlay.setPosition(undefined);
        selectedProperties = null;
        selectedFeature = null;
        selectedRegionData = null;

        // WMS GetFeatureInfo 호출 URL 생성
        var viewResolution = window.map.getView().getResolution();
        var source = layer.getSource();
        var url = source.getGetFeatureInfoUrl(
          coordinate,
          viewResolution,
          "EPSG:3857",
          {
            INFO_FORMAT: "application/json",
            QUERY_LAYERS: layerName,
            FEATURE_COUNT: 1,
            //domain: "http://localhost",
            info_format: "text/javascript",
          }
        );

        if (!url) {
          console.error("showMapPopupAndHighlight: GetFeatureInfo URL을 생성할 수 없습니다.");
          return;
        }

        // Ajax로 featureData 조회
        $.ajax({
          url: url,
          dataType: "jsonp",
          jsonpCallback: "parseResponse",
        })
          .done(function (json) {
            window.highlightSource.clear();
            
            if (json.features && json.features.length > 0) {
              // 지적 정보가 있는 경우
              var featureData = json.features[0];
              selectedProperties = featureData.properties || {};
              var format = new ol.format.GeoJSON();
              selectedFeature = format.readFeature(featureData, {
                dataProjection: "EPSG:3857",
                featureProjection: "EPSG:3857",
              });
              
              // regionData 구성
              selectedRegionData = buildRegionData(
                selectedProperties,
                selectedFeature,
                coordinate
              );
              
              // PNU가 파라미터로 전달된 경우 사용 (패널에서 클릭한 경우)
              if (pnu && !selectedRegionData.pnu) {
                selectedRegionData.pnu = pnu;
              }
              
              // 초기에는 데이터 없음으로 설정 (기본 파란색 스타일)
              selectedFeature.set('hasData', false);
              
              // 영역 하이라이트 표시
              window.highlightSource.addFeature(selectedFeature);
              
              // 팝업 내용 생성
              window.popupContent.innerHTML = buildPopupContent(selectedRegionData);
              
              // 데이터 존재 여부 확인 후 버튼 표시 및 스타일 업데이트
              if (checkDataExistence) {
                var pnuToCheck = selectedRegionData.pnu || pnu;
                if (pnuToCheck) {
                  checkDataExistenceAndUpdateButtons(pnuToCheck, selectedFeature);
                } else {
                  resetPopupButtons();
                  selectedFeature.set('hasData', false);
                }
              } else {
                resetPopupButtons();
                selectedFeature.set('hasData', false);
              }
              
              // 팝업 표시
              window.popupOverlay.setPosition(coordinate);
            } else {
              // 지적 정보가 없는 경우
              selectedProperties = null;
              selectedFeature = null;
              selectedRegionData = null;
              window.popupContent.innerHTML =
                "<span>선택한 위치의 지적 정보가 없습니다.</span>";
              
              // 등록 버튼만 표시
              resetPopupButtons();
              
              // 팝업 표시
              window.popupOverlay.setPosition(coordinate);
            }
          })
          .fail(function (err) {
            console.error("GetFeatureInfo Error:", err);
            window.highlightSource.clear();
            window.popupOverlay.setPosition(undefined);
            resetPopupButtons();
          });
      };

      // 팝업에 표시할 내용을 HTML 템플릿으로 반환
      function buildPopupContent(region) {
        if (!region) {
          return "<span>선택된 정보를 불러올 수 없습니다.</span>";
        }
        return window.escapeHtml(region.address || "-");
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
        // 지적편집도 레이어 (전역 변수로 등록)
        window.cadastralLayer = new ol.layer.Tile({
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
        // 선택 영역 하이라이트 스타일 (동적 스타일 함수)
        // 데이터 없을 때: 파란색 + fill (기본 스타일)
        var defaultHighlightStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(0, 153, 255, 0.8)",
            width: 3,
          }),
          fill: new ol.style.Fill({ color: "rgba(0, 153, 255, 0.1)" }),
        });
        
        // 데이터 있을 때: 붉은색 테두리만 (fill 없음)
        var dataExistsHighlightStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(255, 0, 0, 0.8)",
            width: 3,
          }),
          // fill 없음
        });
        
        // 하이라이트 소스를 전역 변수로 선언
        window.highlightSource = new ol.source.Vector();
        var highlightLayer = new ol.layer.Vector({
          source: window.highlightSource,
          style: function(feature) {
            // feature의 hasData 속성에 따라 스타일 반환
            var hasData = feature.get('hasData');
            if (hasData === true) {
              return dataExistsHighlightStyle;
            } else {
              return defaultHighlightStyle;
            }
          },
          zIndex: 10, // 이미지 위에 표시되도록 높은 zIndex
        });

        // 타일 레이어 생성 (tile1, tile2, tile3)
        var contextPath = "<%=request.getContextPath()%>";
        var tile1Layer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: contextPath + "/data/tile1/{z}/{x}/{y}.png",
            minZoom: 15,
            maxZoom: 22,
            projection: 'EPSG:3857'
          }),
          zIndex: 1
        });

        var tile2Layer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: contextPath + "/data/tile2/{z}/{x}/{y}.png",
            minZoom: 15,
            maxZoom: 22,
            projection: 'EPSG:3857'
          }),
          zIndex: 1
        });

        var tile3Layer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: contextPath + "/data/tile3/{z}/{x}/{y}.png",
            minZoom: 15,
            maxZoom: 22,
            projection: 'EPSG:3857'
          }),
          zIndex: 1
        });

        // 지도 객체 생성 (전역 변수로 선언)
        window.map = new ol.Map({
          target: "map",
          layers: [baseLayer, tile1Layer, tile2Layer, tile3Layer, window.cadastralLayer, highlightLayer],
          view: view,
          // 이미지 렌더링 최적화 설정
          pixelRatio: window.devicePixelRatio || 1, // 고해상도 디스플레이 지원
        });


        // 팝업 관련 DOM 요소 레퍼런스 (전역 변수로 등록)
        var container = document.getElementById("popup");
        window.popupContent = document.getElementById("popup-content");
        var closer = document.getElementById("popup-closer");
        window.popupOverlay = new ol.Overlay({
          element: container,
          autoPan: true,
          autoPanAnimation: { duration: 250 },
        });
        window.map.addOverlay(window.popupOverlay);

        // 팝업 닫기 버튼 이벤트
        closer.onclick = function () {
          window.popupOverlay.setPosition(undefined);
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
            window.popupOverlay.setPosition(undefined);

            var toast = $("#toast-message");
            toast.stop().fadeIn(400, function () {
              setTimeout(function () {
                toast.fadeOut(400);
              }, 2000);
            });
            return;
          }

          // 공통 함수 호출
          window.showMapPopupAndHighlight({
            coordinate: evt.coordinate,
            layer: window.cadastralLayer,
            layerName: "lp_pa_cbnd_bubun",
            checkDataExistence: true
          });
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
      };
    </script>
  </body>
</html>
