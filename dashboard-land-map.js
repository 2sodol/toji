var dashboardOverlayFn = {};
var dashboardFn = {};
var dashboardCache = {};

// 정밀도로 정보 표출용 오브레이 표출전 콜백
dashboardOverlayFn.beforePrecisionInfoOverlay = function (element, layerName, wfsData, evt) {
  if (wfsData && wfsData.features && wfsData.features.length > 0) {
    var properties = wfsData.features[0].properties;

    var table = $(element).find('.card-table');
    table.find('.card-title-label').hide();

    var arr = wfsData.features[0].id.split('.');
    var layer = arr[0];
    var id = arr[1];
    var type = properties['type'];
    var layerInfo = DtjpCommonMap.precision.getLayerInfo(id, type);

    // 10M이정에 대한 처리
    layerInfo.layerName = DtjpCommonMap.precision.layerOrder[layer].name;
    if (layer == 'CPOKMPOST_10') {
      layerInfo.typeName = '10M이정';
    }

    // 레이어명, 타입명
    var rows = table.find('>.card-tbody');
    var rowIdx = 0;
    // 0 시설종류
    rows.eq(rowIdx).find('.card-td').text(layerInfo.layerName);
    // 1 구분
    rowIdx++;
    if (typeof type !== 'undefined') {
      var typeText = type ? type + ' (' + layerInfo.typeName + ')' : '';
      rows.eq(rowIdx).find('.card-td').text(typeText);
      rows.eq(rowIdx).show();
    } else {
      rows.eq(rowIdx).hide();
    }
    // 노선, 방향계산
    var mtnofCd = 'N02025';
    var roadNo = properties['roadno'].padStart(4, '0');
    var routeNm = dashboardCache.route.getRouteName(roadNo);
    var drctNm = dashboardCache.route.getRouteDrctName(mtnofCd, roadNo, properties['direction']);
    // 2 노선
    rowIdx++;
    rows.eq(rowIdx).find('.card-td').text(routeNm);
    // 3 방향
    rowIdx++;
    rows.eq(rowIdx).find('.card-td').text(drctNm);
    // 4 이정
    rowIdx++;
    var stpnt = '',
      edpnt;
    if (properties['distance']) {
      stpnt = properties['distance'];
    } else if (properties['kmpost']) {
      stpnt = properties['kmpost'];
    } else if (properties['stpnt']) {
      stpnt = properties['stpnt'];
      edpnt = properties['edpnt'];
    }
    if (typeof edpnt !== 'undefined') {
      stpnt = stpnt + ' ~ ' + edpnt;
    }

    rows.eq(rowIdx).find('.card-td').text(stpnt);
    // 5 명칭
    rowIdx++;
    var name = properties['name'];
    if (typeof name !== 'undefined') {
      rows.eq(rowIdx).find('.card-td').text(name);
      rows.eq(rowIdx).show();
    } else {
      rows.eq(rowIdx).hide();
    }
    // 6 길이
    rowIdx++;
    var length = properties['length'];
    if (typeof length !== 'undefined') {
      rows.eq(rowIdx).find('.card-td').text(length);
      rows.eq(rowIdx).show();
    } else {
      rows.eq(rowIdx).hide();
    }
    // 7 차선
    rowIdx++;
    var lane = properties['lane'];
    if (typeof lane !== 'undefined') {
      rows.eq(rowIdx).find('.card-td').text(lane);
      rows.eq(rowIdx).show();
    } else {
      rows.eq(rowIdx).hide();
    }
    // 8 도로재질(차로면)
    rowIdx++;
    var roadQlmt = properties['road_qlmt'];
    if (layer == 'APGROAD' && typeof roadQlmt !== 'undefined') {
      var roadQlmtNm;
      switch (roadQlmt) {
        case '1':
          roadQlmtNm = '아스팔트';
          break;
        case '2':
          roadQlmtNm = 'CON';
          break;
        case '3':
          roadQlmtNm = '아스콘';
          break;
        default:
          roadQlmtNm = '';
          break;
      }
      rows.eq(rowIdx).find('.card-td').text(roadQlmtNm);
      rows.eq(rowIdx).show();
    } else {
      rows.eq(rowIdx).hide();
    }
    // 9 시설물ID
    rowIdx++;
    var systemId = properties['system_id'];
    if (systemId /* typeof systemId !== 'undefined' */) {
      var btnSystem = rows.eq(rowIdx).find('.card-td .btn_system');
      if (systemId) {
        var bOpen = false;

        switch (layer) {
          case 'CPGBRIDGE':
          case 'CPGINCLINE':
          case 'CPGTUNNEL':
          case 'CPGCULVERT':
            bOpen = true;
            break;

          default:
            break;
        }
        if (bOpen) {
          btnSystem.addClass('btn_name');
        } else {
          btnSystem.removeClass('btn_name');
        }
        btnSystem.text(systemId).data('systemId', systemId).data('layer', layer).data('type', type).show();
      } else {
        btnSystem.text(systemId).hide();
      }
      rows.eq(rowIdx).show();
    } else {
      rows.eq(rowIdx).hide();
    }
    return true;
  } else {
    return false;
  }
};

// 마커 정보 오버레이 표출전 콜백
// dashboardOverlayFn.beforeMarkerOverlay = function (element, layerName,
// feature, evt) {
// // 李⑤웾�뺣낫 �ㅻ툕�덉씠 �쒖텧
// if (layerName == 'VehicleLayer') {
// //return dashboardOverlayFn.setVehicleContent(element, feature);
// } else if (layerName == 'ConstructionLayer') {
// // �ш퀬�뺣낫 蹂닿퀬�� 議고쉶�� onSelectFeature �먯꽌 泥섎━
// return dashboardOverlayFn.setSituationContent(layerName, element, feature);
// } else {
// return false;
// }
// };

// 유휴지 오버레이 표출전 콜백
dashboardOverlayFn.beforunUsedLandOverlay = function(element, layerName, featre, evt){

	var table = $(element).find('.card-table');
  var rows = table.find('>.card-tbody');

	rows.eq(0).find('.card-td').text(featre.get('시도명'));
	rows.eq(1).find('.card-td').text(featre.get('읍면동명'));
	rows.eq(2).find('.card-td').text(featre.get('편입지번'));
	rows.eq(3).find('.card-td').text(featre.get('면적'));
	rows.eq(4).find('.card-td').text(featre.get('소유자'));
	rows.eq(5).find('.card-td').text(featre.get('-'));
	rows.eq(6).find('.card-td').text(featre.get(' 공시지가 '));
	rows.eq(7).find('.card-td').text(featre.get('시군구명'));
	rows.eq(8).find('.card-td').text(featre.get('리명'));
	rows.eq(9).find('.card-td').text(featre.get('지목'));
	rows.eq(10).find('.card-td').text(featre.get('용도'));
	rows.eq(11).find('.card-td').text(featre.get('소유권'));
	rows.eq(12).find('.card-td').text(featre.get('변동일자'));
	rows.eq(13).find('.card-td').text(featre.get('공유인수'));

  $('#landPnu').val(featre.get('PNU'));
  $('#featreData').val(featre);
  return true;
}

// 유휴지 오버레이 표출전 콜백
dashboardOverlayFn.beforunRentalLandOverlay = function(element, layerName, featre, evt){

	var table = $(element).find('.card-table');
  var rows = table.find('>.card-tbody');

	var addr = featre.get('소재지').split(' ');

	rows.eq(0).find('.card-td').text(addr[0]);
	rows.eq(1).find('.card-td').text(addr[2]);
	rows.eq(2).find('.card-td').text(featre.get('지번'));
	rows.eq(3).find('.card-td').text(featre.get('원면적'));
	rows.eq(4).find('.card-td').text(featre.get('소유자'));
	rows.eq(5).find('.card-td').text(featre.get('-'));
	rows.eq(6).find('.card-td').text(featre.get(' 공시지가 '));
	rows.eq(7).find('.card-td').text(addr[1]);
	rows.eq(8).find('.card-td').text(addr[3]);
	rows.eq(9).find('.card-td').text(featre.get('지도'));
	rows.eq(10).find('.card-td').text(featre.get('용도'));
	rows.eq(11).find('.card-td').text(featre.get('소유권'));
	rows.eq(12).find('.card-td').text(featre.get('변동일자'));
	rows.eq(13).find('.card-td').text(featre.get('공유인수'));

  $('#landPnu').val(featre.get('PNU'));
  $('#featreData').val(featre);
  return true;
}

//�좏쑕吏� �ㅻ툕�덉씠 �쒖텧�� 肄쒕갚
dashboardOverlayFn.beforunSquatLandOverlay = function(element,layerName,featre,evt){

	var table = $(element).find('.card-table');
    var rows = table.find('>.card-tbody');

    /*
	rows.eq(0).find('.card-td').text(featre.get('湲곌�'));
	rows.eq(1).find('.card-td').text(featre.get('�몄꽑紐�'));
	rows.eq(2).find('.card-td').text('-');
	rows.eq(3).find('.card-td').text('�곷룞吏���');
	rows.eq(4).find('.card-td').text('-');
	rows.eq(5).find('.card-td').text('-');
	rows.eq(6).find('.card-td').text('-');
	rows.eq(7).find('.card-td').text('-');
	rows.eq(8).find('.card-td').text('-');
   */

	rows.eq(0).find('.card-td').text(featre.get('�쒕룄紐�'));
	rows.eq(1).find('.card-td').text(featre.get('�띾㈃�숇챸'));
	rows.eq(2).find('.card-td').text(featre.get('�몄엯吏�踰�'));
	rows.eq(3).find('.card-td').text(featre.get('硫댁쟻'));
	rows.eq(4).find('.card-td').text(featre.get('�뚯쑀��'));
	rows.eq(5).find('.card-td').text(featre.get('-'));
	rows.eq(6).find('.card-td').text(featre.get(' 怨듭떆吏�媛� '));
	rows.eq(7).find('.card-td').text(featre.get('�쒓뎔援щ챸'));
	rows.eq(8).find('.card-td').text(featre.get('由щ챸'));
	rows.eq(9).find('.card-td').text(featre.get('吏�紐�'));
	rows.eq(10).find('.card-td').text(featre.get('�⑸룄'));
	rows.eq(11).find('.card-td').text(featre.get('�뚯쑀沅�'));
	rows.eq(12).find('.card-td').text(featre.get('蹂��숈씪��'));
	rows.eq(13).find('.card-td').text(featre.get('怨듭쑀�몄닔'));

    $('#landPnu').val(featre.get('PNU'));
    $('#featreData').val(featre);
    return true;
}

//�좏쑕吏� �ㅻ툕�덉씠 �쒖텧�� 肄쒕갚
dashboardOverlayFn.beforunProjectLandOverlay = function(element,layerName,featre,evt){

	var table = $(element).find('.card-table');
    var rows = table.find('>.card-tbody');


	rows.eq(0).find('.card-td').text(featre.get('湲곌�'));
	rows.eq(1).find('.card-td').text(featre.get('�몄꽑紐�'));
	rows.eq(2).find('.card-td').text('-');
	rows.eq(3).find('.card-td').text('�곷룞吏���');
	rows.eq(4).find('.card-td').text('-');
	rows.eq(5).find('.card-td').text('-');
	rows.eq(6).find('.card-td').text(featre.get('�ъ뾽援щ텇')+'('+featre.get('�ъ뾽 醫낅쪟')+')');
	rows.eq(7).find('.card-td').text(featre.get('湲고�'));
	rows.eq(8).find('.card-td').text('-');

	/*
	rows.eq(0).find('.card-td').text(featre.get('�쒕룄紐�'));
	rows.eq(1).find('.card-td').text(featre.get('�띾㈃�숇챸'));
	rows.eq(2).find('.card-td').text(featre.get('�몄엯吏�踰�'));
	rows.eq(3).find('.card-td').text(featre.get('硫댁쟻'));
	rows.eq(4).find('.card-td').text(featre.get('�뚯쑀��'));
	rows.eq(5).find('.card-td').text(featre.get('-'));
	rows.eq(6).find('.card-td').text(featre.get(' 怨듭떆吏�媛� '));
	rows.eq(7).find('.card-td').text(featre.get('�쒓뎔援щ챸'));
	rows.eq(8).find('.card-td').text(featre.get('由щ챸'));
	rows.eq(9).find('.card-td').text(featre.get('吏�紐�'));
	rows.eq(10).find('.card-td').text(featre.get('�⑸룄'));
	rows.eq(11).find('.card-td').text(featre.get('�뚯쑀沅�'));
	rows.eq(12).find('.card-td').text(featre.get('蹂��숈씪��'));
	rows.eq(13).find('.card-td').text(featre.get('怨듭쑀�몄닔'));
	*/
    $('#landPnu').val(featre.get('PNU'));
    $('#featreData').val(featre);
    return true;
}


// 李⑤웾 �뺣낫 �ㅻ툕�덉씠 �쒖텧�� 肄쒕갚
dashboardOverlayFn.beforeCarInfoOverlay = function (element, layerName, feature, evt) {
  var table = $(element).find('.card-table');
  var rows = table.find('>.card-tbody');
  // �꾧났踰덊샇
  rows
    .eq(0)
    .find('.card-td')
    .text(feature.get('MTNOF_NM') + '_' + feature.get('EX_EQPM_IDNT_ID'));
  // �λ퉬紐�
  rows.eq(1).find('.card-td').text(feature.get('EQPM_NM'));
  // 李⑤웾�꾩튂
  var position =
    (feature.get('USE_ROTNM') ? feature.get('USE_ROTNM') : '') +
    ' ' +
    (feature.get('ROUTE_DSTNC') ? feature.get('ROUTE_DSTNC') : '') +
    '��';
  rows.eq(2).find('.card-td').text(position);
  // 李⑤웾踰덊샇
  rows.eq(3).find('.card-td').text(feature.get('EQPM_RGST_CTNT'));
  // �댁쟾�먮챸
  rows.eq(4).find('.card-td').text(feature.get('DRVR_NM'));
  // �몃뱶��
  rows.eq(5).find('.card-td').text(feature.get('DRVR_PRTBL_TELNO'));
  // �댄뻾紐⑹쟻
  rows.eq(6).find('.card-td').text(feature.get('JOB_CTNT'));
  // �묒냽�쒓컙
  var accesst = feature.get('EQPM_INFO_APRC_SEQ');
  accesst =
    accesst.substr(0, 4) +
    '-' +
    accesst.substr(4, 2) +
    '-' +
    accesst.substr(6, 2) +
    ' ' +
    accesst.substr(8, 2) +
    ':' +
    accesst.substr(10, 2) +
    ':' +
    accesst.substr(12, 2);
  rows.eq(7).find('.card-td').text(accesst);

  return true;
};
// �ㅻ쭏�� 李⑤웾 愿��� �뺣낫 �ㅻ툕�덉씠 �쒖텧�� 肄쒕갚
dashboardOverlayFn.beforeSmartCarInfoOverlay = function (element, layerName, feature, evt) {
  var table = $(element).find('.card-table');
  var rows = table.find('>.card-tbody');

  // ALCR_END_TIME: "1400"
  // ALCR_STRT_DATES: "20220124"
  // ALCR_STRT_TIME: "0900"
  // DRVE_DRCT: 0
  // DRVR_EMNO_NM: "�좎쁺踰�"
  // DRVR_TELNO: "01023007079"
  // DTJ_VHCL_CLSS_CD: "01"
  // EQPM_CD: "31020817"
  // EQPM_NM: "�덉쟾�쒖같李�"
  // EQPM_RGST_CTNT: "334��4215"
  // ETC_RMRK: "�좎�蹂댁닔 �뚯뒪��"
  // EX_EQPM_IDNT_ID: "112"
  // JOB_PLAC_NM: "�덉쁺IC"
  // LOCT_XCORD: 127.130104
  // LOCT_YCORD: 37.41307
  // LSTTM_ALTR_DTTM: "20220124131138"
  // RUM: 1
  // RUN_YN: "N" // �댄뻾�щ�
  // STNDS_NM: null

  // �λ퉬紐�
  var eqpmNm = feature.get('EQPM_NM') + (feature.get('EX_EQPM_IDNT_ID') ? ' / ' + feature.get('EX_EQPM_IDNT_ID') : '');
  rows.eq(0).find('.card-td').text(eqpmNm);
  // 李⑤웾踰덊샇
  rows.eq(1).find('.card-td').text(feature.get('EQPM_RGST_CTNT'));
  // �댁쟾�먮챸
  rows.eq(2).find('.card-td').text(feature.get('DRVR_EMNO_NM'));
  // �쒓컙
  var time = feature.get('ALCR_STRT_TIME').substring(0, 2) + ' ~ ' + feature.get('ALCR_END_TIME').substring(0, 2);
  rows.eq(3).find('.card-td').text(time);
  // �곕씫泥�
  rows.eq(4).find('.card-td').text(feature.get('DRVR_TELNO'));
  // 紐⑹쟻吏�
  rows.eq(5).find('.card-td').text(feature.get('JOB_PLAC_NM'));
  // �댄뻾紐⑹쟻
  rows.eq(6).find('.card-td').text(feature.get('ETC_RMRK'));
  // �묒냽�쒓컙
  var altDttm = moment(feature.get('LSTTM_ALTR_DTTM'), 'YYYYMMDDhhmmss').format('YYYY-MM-DD hh:mm:ss');
  rows.eq(7).find('.card-td').text(altDttm);

  return true;
};

// 怨듭궗 �뺣낫 �ㅻ툕�덉씠 �쒖텧�� 肄쒕갚
dashboardOverlayFn.beforeConstructionOverlay = function (element, layerName, feature, evt) {

  var table = $(element).find('.card-table');
  var rows = table.find('>.card-tbody');

  // �곹솴踰덊샇
  rows.eq(0).find('.card-td').text(feature.get('RPRQ_CRCM_SEQ'));
  // �곹솴�좏삎
  rows.eq(1).find('.card-td').text(feature.get('RPRQ_CRCM_TYPE_NM'));
  // 愿��좎���
  rows.eq(2).find('.card-td').text(feature.get('RGDPT_NM'));
  // �묐낫�쒓컖
  rows
    .eq(3)
    .find('.card-td')
    .text(feature.get('RPRQ_OCRN_DATE') + ' ' + feature.get('RPRQ_OCRN_TIME'));
  // �묐낫�댁슜
  rows
    .eq(4)
    .find('.card-td')
    .text(feature.get('RPRQ_CTNT') + ' / ' + feature.get('RPRQ_CTNT_2'));
  // 議곗튂�ы빆
  rows.eq(5).find('.card-td').text('');
  // 議곗튂�ы빆 議고쉶
  $.ajax({
    dataType: 'json',
    type: 'POST',
    url: '/ajaxAccidentProcSelect.do',
    data: { rprqseq: feature.get('RPRQ_CRCM_SEQ') }, // '11413063'
    async: true,
    cache: false
  })
    .done(function (data) {
      if (data.accidentActionListData.length != 0) {
        var listHtml = '<ul>';
        for (var i = 0; i < data.accidentActionListData.length; i++) {
          listHtml += '<li> - ' + data.accidentActionListData[i].ACTN_TIME + ' ';
          if (data.accidentProc.RPRQ_MTNOF_CD != data.accidentActionListData[i].RSNT_DPTCD) {
            listHtml += data.accidentActionListData[i].KOR_DPTNM + ' ';
          }
          listHtml += data.accidentActionListData[i].ACDT_ACTN_CTNT + '</li>';
        }
        listHtml += '</ul>';
        rows.eq(5).find('.card-td').html(listHtml).addClass('justify-content-start');
      } else {
        rows.eq(5).find('.card-td').text('-').removeClass('justify-content-start');
      }
    })
    .fail(function (e) {
      console.info(e);
    })
    .always(function () {});

  return true;
};

// 援먰넻�ш퀬 cluster �ㅻ툕�덉씠 �댁슜 蹂�寃�
dashboardOverlayFn.showClusterOverlay = function (overlay, acdtRoutes, clusterFeature) {
  // �ㅻ툕�덉씠 �댁슜 蹂�寃�
  var features = clusterFeature.get('features');
  var accidentCount = features.length;
  var element = overlay.getElement();
  $(element)
    .find('#accident_count')
    .text(accidentCount.format() + '嫄�');

  // �몄꽑 �쒖떆
  var routeSummery = '';
  acdtRoutes.forEach(function (route) {
    if (routeSummery != '') {
      routeSummery += '<br/>';
    }
    var start = route.start;
    var end = route.end;
    if (start == end) {
      routeSummery += route.routeNm + ' : ' + start + 'km';
    } else {
      routeSummery += route.routeNm + ' : ' + start + 'km ~ ' + end + 'km';
    }
  });

  if (routeSummery == '') {
    routeSummery = '-';
  }
  $(element).find('#accident_road').html(routeSummery);

  // �ш퀬 紐⑸줉 �쒖텧
  var list = $(element).find('#accident_list');

  list.find('*').unbind();
  list.find('>.card-tbody').not(':first').remove();

  var sortedFeatures = features.sort(function (a, b) {
    return a.get('TRACD_DTTM') < b.get('TRACD_DTTM') ? 1 : -1;
  });

  sortedFeatures.forEach(function (feature) {
    var date = moment(feature.get('TRACD_DTTM'), 'YYYYMMDDhhmm').format('YYYY-MM-DD hh:mm');
    var position = feature.get('USE_ROTNM');
    var rprqseq = feature.get('RPRQ_CRCM_SEQ');
//    var drvedrctcd = feature.get('DRVE_DRCT_CD');

    var rpqrHtml;

    if (!rprqseq) {
      rpqrHtml = '';
    } else if (typeof rprqseq == 'string') {
      rpqrHtml = '<span class="btn_name" data-rprqseq="' + rprqseq + '">�닿린</span>';
    } else {
      rpqrHtml = rprqseq
        .map(function (seq) {
          return '<span class="btn_name" data-rprqseq="' + seq + '">�닿린</span>';
        })
        .join('');
    }

    var drct = dashboardCache.route.getRouteDrctName(feature.get('ACDT_DPTCD'), feature.get('ACDT_ROUTE_CD'), feature.get('DRVE_DRCT_CD'));
    position += ' ' + drct + ' ' + feature.get('ACDT_OCRN_DSTNC') + 'km';

    var listItemHtml = $(
      '<div class="card-tbody card-row">' +
        '<div class="card-td">' +
        date +
        '</div>' +
        '<div class="card-td">' +
        position +
        '</div>' +
        '<div class="card-td flex-column">' +
        rpqrHtml +
        '</div>' +
        '</div>'
    );
    list.append(listItemHtml);
  });

  list.animate({ scrollTop: 0 }, 'slow');

  // �ㅻ툕�덉씠 �꾩튂 吏���
  overlay.setOffset([0, -17 - accidentCount]);
  overlay.setPosition(clusterFeature.getGeometry().getCoordinates());
};

// ajax Promise 諛섑솚
dashboardFn.getAjax = function (options) {
  method = typeof method === 'undefined' ? 'GET' : method;
  var ajaxOption = options || {};

  ajaxOption.method = typeof ajaxOption.method !== 'undefined' ? ajaxOption.method : 'GET';
  ajaxOption.dataType = typeof ajaxOption.dataType !== 'undefined' ? ajaxOption.dataType : 'json';
  ajaxOption.cache = typeof ajaxOption.cache !== 'undefined' ? ajaxOption.cache : false;
  ajaxOption.async = typeof ajaxOption.async !== 'undefined' ? ajaxOption.async : true;

  return $.ajax(ajaxOption).then(null, function (jqXHR, textStatus, errorThrown) {
    console.error('error: ', errorThrown, this.url);
    return [null, textStatus, jqXHR]; // ***** �몄텧 �ㅻ쪟 諛쒖깮�� null 諛섑솚 *****
    // return $.when(null);
  });
};

// ajax �몄텧 �ㅽ뻾
dashboardFn.doAjax = function (options, loading) {
  var ajax = dashboardFn.getAjax(options);
  if (loading) {
    dashboardFn.ajaxBeforeDisplayProgress();
    ajax.always(dashboardFn.ajaxAlwaysHideProgress);
  }
  return ajax;
};
dashboardFn.ajaxBeforeDisplayProgress = function () {
  if (displayProgressDivArea) {
    displayProgressDivArea();
  }
};
dashboardFn.ajaxAlwaysHideProgress = function () {
  $('#progressArea').html('');
};

var accidentInfo = {};
dashboardFn.displayOckReport = function (rprqseq) {
  $.ajax({
    dataType: 'json',
    type: 'POST',
    url: '/ajaxAccidentProcSelect.do',
    data: { rprqseq: rprqseq },
    beforeSend: function () {
      // displayProgressDivArea();
    },
    success: function (data) {
      accidentInfo.routeCd = data.accidentProc.ROUTE_CD;
      accidentInfo.distance = data.accidentProc.STPNT_DSTNC;
      accidentInfo.drctCd = data.accidentProc.ROUTE_DRCT_CD;
      accidentInfo.routeNm = data.accidentProc.USE_ROTNM;
      accidentInfo.drctNm = data.accidentProc.ORDST_NM;
      accidentInfo.rprqseq = rprqseq;

      console.log('data : ' + data.accidentProc);
      $('#reportcd').html(data.accidentProc.REPORT_CD);
      $('#reporttitle').html(data.accidentProc.REPORT_TITLE.replace('援먰넻�ш퀬 蹂닿퀬', ''));

      var isUpdateSize = $('.emap_wrap').hasClass('active') || !$('.map_option_info').hasClass('active');
      $('.emap_wrap').removeClass('active');
      $('.map_option_info').addClass('active');
      $('#report').addClass('active');
      $('#graph').removeClass('active');

      // �ъ씠利� 蹂�寃쎈릺�덉쓣�뚮쭔 updateSize �ㅽ뻾
      if (isUpdateSize) {
        dashboardMap.getDtjpMap().updateSize();
      }

      // �꾨㈃蹂닿린 踰꾪듉 �쒖뼱 (遺��곕갑��, �쒖슱諛⑺뼢)

      // var planKey = data.accidentProc.ROUTE_CD + '_' +
		// Math.round(data.accidentProc.STPNT_DSTNC * 10) / 10;

      // if (dashboardCache.dwgInfo[planKey] &&
		// dashboardCache.dwgInfo[planKey].U) {
      // $('#plan_u').data('dwgId',
		// dashboardCache.dwgInfo[planKey].U.split('.')[0]);
      // $('#plan_u').show();
      // } else {
      // $('#plan_u').hide();
      // }
      // if (dashboardCache.dwgInfo[planKey] &&
		// dashboardCache.dwgInfo[planKey].D) {
      // $('#plan_d').data('dwgId',
		// dashboardCache.dwgInfo[planKey].D.split('.')[0]);
      // $('#plan_d').show();
      // } else {
      // $('#plan_d').hide();
      // }

      if (data.accidentProc.ROUTE_CD == '0010') {
        $('#plan').data('routeCd', data.accidentProc.ROUTE_CD).data('distance', data.accidentProc.STPNT_DSTNC).show();
      } else {
        $('#plan').hide();
      }

      $('#mtnofNm').text('愿�由ш린愿� : ' + data.accidentProc.KOR_DPTNM);
      $('#rprqDttm').text('�쇱떆 : ' + data.accidentProc.RPRQ_CRCM_OCRN_DTTM);
      $('#placNm').text('�μ냼 : ' + data.accidentProc.ACDT_PLAC_NM);
      $('#vhclCtnt').text('愿��⑥감�� : ' + data.accidentProc.ACDT_OCRN_VHCL_CTNT);
      $('#acdtCtnt').text('�ш퀬�댁슜 : ' + data.accidentProc.ACDT_CTNT);
      $('#acdtCausCtnt').text('�ш퀬醫낅쪟 : ' + data.accidentProc.ACDT_CAUS_CTNT);
      $('#rprqCrcmCtnt').text('�묒닔�댁슜 : ' + data.accidentProc.RPRQ_CTNT);
      $('#livsDamgCtnt').text('�몃챸�쇳빐 : ' + data.accidentProc.LIVS_DAMG_CTNT);
      $('#acdtDamgCtnt').text('�꾨줈�쇳빐 : ' + data.accidentProc.ACDT_DAMG_CTNT);

      // $('#actionList').append('<ul>');
      $('#actionList').children().remove();
      if (data.accidentActionListData.length != 0) {
        for (var i = 0; i < data.accidentActionListData.length; i++) {
          var strHtml = '';
          strHtml += '    <li>' + data.accidentActionListData[i].ACTN_TIME + '   ';
          if (data.accidentProc.RPRQ_MTNOF_CD != data.accidentActionListData[i].RSNT_DPTCD) {
            strHtml += data.accidentActionListData[i].KOR_DPTNM + ' ';
          }
          strHtml += data.accidentActionListData[i].ACDT_ACTN_CTNT + '</li>';
          $('#actionList').append(strHtml);
        }
      } else {
        var strHtml = '';

        strHtml += '    <li>議곗튂�ы빆 �놁쓬</li>';
        $('#actionList').append(strHtml);
      }
      $('#actionList').append('</ul>');
    },
    error: function (request, status, error) {
      console.log(request.status + '#' + request.message + '#' + error);
    },
    complete: function () {
      // $('#progressArea').html('');
    }
  });

  $.ajax({
    dataType: 'json',
    type: 'POST',
    url: '/ajaxReportfileUpLoadDataSelect.do',
    data: { rprqseq: rprqseq },
    beforeSend: function () {
      // displayProgressDivArea();
    },
    success: function (data) {
      $('#acdtImg').children().remove();
      for (var i = 0; i < data.accidentImg.length; i++) {
        var fileGrpNo = data.accidentImg[i].FILE_GRP_NO;
        var fileNo = data.accidentImg[i].FILE_NO;
        var url = '/ajaxAccidentImage.do?fileNo=' + fileNo + '&fileGrpNo=' + fileGrpNo;

        var strHtml = '';
        strHtml += '  <img src="' + url + '" alt=""/>';
        strHtml += '  <li>�� 濡� �� : ' + data.accidentImg[i].FSTTM_RGSR_NM + '</li>';
        strHtml += '  <li>�깅줉�쇱옄 : ' + data.accidentImg[i].FSTTM_RGST_DTTM + '</li>';
        $('#acdtImg').append(strHtml);
      }
    },
    error: function (request, status, error) {
      console.log(request.status + '#' + request.message + '#' + error);
    },
    complete: function () {
      // $('#progressArea').html('');
    }
  });
};

/**
 * �붿��� �쒕쾾吏��� �듯빀 吏���
 */
var dashboardMap = (function () {
  var getGisIconUrl = function (name) {
    return '/dtjp/lib/images/gis/' + name;
  };

  var INTERVAL = {
    LIVE: 1000 * 10, // �ㅼ떆媛� �곸긽(�쒕줎, �ㅻ쭏�명룿), 李⑤웾愿���, �ㅻ쭏�몄감�됯��� �꾩튂�뺣낫 議고쉶 媛꾧꺽
    RELATE_DATA: 1000 * 10, // �ш퀬, 怨듭궗 �곌퀎 �먮즺 議고쉶 媛꾧꺽
    RADAR: 1000 * 60 * 2 // �덉씠�� �곸긽 議고쉶 媛꾧꺽
  };

  var MAPMODE = {
    PANO: false
  };

  var Style = ol.style.Style,
    Stroke = ol.style.Stroke,
    Fill = ol.style.Fill,
    Icon = ol.style.Icon,
    CircleStyle = ol.style.Circle,
    RegularShape = ol.style.RegularShape,
    Text = ol.style.Text,
    VectorSource = ol.source.Vector,
    Cluster = ol.source.Cluster,
    VectorLayer = ol.layer.Vector,
    HeatmapLayer = ol.layer.Heatmap,
    Feature = ol.Feature,
    Point = ol.geom.Point,
    Polygon = ol.geom.Polygon,
    GeoJSON = ol.format.GeoJSON;

  // ============================================================
  // �ㅽ���
  // ============================================================
  var liveOnOffStyle = {
    on: new Style({
      image: new Icon({
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        anchor: [0.5, 40],
        offset: [0, 0],
        opacity: 1,
        scale: 1.5,
        src: getGisIconUrl('live_on.png'),
        rotateWithView: false
      }),
      zIndex: 22
    }),
    off: new Style({
      image: new Icon({
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        anchor: [0.5, 40],
        offset: [0, 0],
        opacity: 1,
        scale: 1.2,
        src: getGisIconUrl('live_off.png'),
        rotateWithView: false
      }),
      zIndex: 21
    })
  };
  // �ㅼ떆媛꾨젅�댁뼱 �ㅽ���
  var liveStyleCache = {
    drone: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        offset: [0, 0],
        opacity: 1,
        scale: 1.2,
        src: getGisIconUrl('icon_drone.png')
      })
    }),
    phone: new Style({
      image: new Icon({
        anchorXUnits: 'pixels',
        anchorYUnits: 'fraction',
        anchor: [20, 0.5],
        offset: [0, 0],
        opacity: 1,
        scale: 0.6,
        src: getGisIconUrl('icon_phone.png')
      })
    })
  };
  var liveStyleFunction = function (feature) {
    var statCd = feature.get('PCTR_GTHR_STAT_CD');
    var styles = [];
    if (statCd == 'R' || statCd == 'S') {
      switch (feature.get('PTGR_EQPM_CD')) {
        case '01':
          styleKey = 'drone';
          break;
        case '61':
        case '62':
        case '63':
        case '64':
          styleKey = 'phone';
          break;
        default:
          return null;
      }

      styles.push(liveStyleCache[styleKey]);
      // 珥ъ쁺�쒖옉 && ���곗옄 �ㅽ듃由� �낅젰以묒씪��
      if (statCd == 'S' && feature.get('isLive')) {
        styles.push(liveOnOffStyle['on']);
      } else {
        styles.push(liveOnOffStyle['off']);
      }
    }
    return styles;
  };

  // 李⑤웾 �ㅽ���
  var vehicleStyleCache = {
    getStyle: function (feature) {
      var carStyleKey = feature.get('carStyleKey');
      var style = vehicleStyleCache[carStyleKey];
      if (!style) {
        // �덈줈�� �ㅽ��� �앹꽦
        // EQPM_CLSFC_CD (�쒖같李� : 1, �ㅽ봽李� : �섎㉧吏�)
        // TYPE : W, P
        // LOCT_ANGL (0~7)
        var zIndex = feature.get('TYPE') == 'W' ? 20 : 10;
        var angleCd,
          loctAngl = feature.get('LOCT_ANGL'),
          type = feature.get('TYPE'),
          eqpmCd = feature.get('EQPM_CLSFC_CD');
        var scale = 1;

        switch (loctAngl) {
          case 0:
            angleCd = 't';
            break;
          case 1:
            angleCd = 'rt';
            break;
          case 2:
            angleCd = 'r';
            break;
          case 3:
            angleCd = 'rb';
            break;
          case 4:
            angleCd = 'b';
            break;
          case 5:
            angleCd = 'lb';
            break;
          case 6:
            angleCd = 'l';
            break;
          case 7:
            angleCd = 'lt';
            break;
          default:
            break;
        }

        var iconName = '';
        if (eqpmCd == '1') {
          // �쒖같李�
          iconName = 'work_patrol_' + angleCd + (type == 'W' ? '_start' : '') + '.png';
          scale = 0.8;
        } else {
          // 洹몄쇅 �ㅽ봽李�
          iconName = (type == 'W' ? 'work' : 'play') + '_dump_' + angleCd + '.png';
        }

        style = new Style({
          image: new Icon({
            anchor: [0.5, 0.5],
            offset: [0, 0],
            opacity: 1,
            scale: scale,
            src: getGisIconUrl(iconName),
            rotateWithView: true
          }),
          zIndex: zIndex
        });

        vehicleStyleCache[carStyleKey] = style;
      }
      return style;
    }
  };
  var vehicleStyleFunction = function (feature) {
    var styles = [];
    var style = vehicleStyleCache.getStyle(feature);
    if (style) {
      styles.push(style);
    }

    if (feature.get('hasCamera')) {
      if (feature.get('isLive')) {
        styles.push(liveOnOffStyle['on']);
      } else {
        styles.push(liveOnOffStyle['off']);
      }
    }

    return styles;
  };

  var smartVehicleStyleCache = {
    RUN_YN_Y: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        offset: [0, 0],
        opacity: 1,
        scale: 1,
        src: getGisIconUrl('icon_car_work.png')
      })
    }),
    RUN_YN_N: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        offset: [0, 0],
        opacity: 1,
        scale: 1,
        src: getGisIconUrl('icon_car_play.png')
      })
    })
  };
  var smartVehicleStyleFunction = function (feature) {
    // var styles = [];

    var key = 'RUN_YN_' + feature.get('RUN_YN');
    var style = smartVehicleStyleCache[key];
    // if (style) {
    // styles.push(style);
    // }
    // return styles;
    return style;
  };

  var situationStyleCache = {
    workplace: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        offset: [0, 0],
        opacity: 1,
        scale: 1,
        src: getGisIconUrl('01.chadan.png')
      })
    }),
    construction: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        offset: [0, 0],
        opacity: 1,
        scale: 1,
        src: getGisIconUrl('01.chadan.png')
      })
    }),
    accident: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        offset: [0, 0],
        opacity: 1,
        scale: 1,
        src: getGisIconUrl('04.sago.png')
      })
    })
  };

 /*var markerStyle = new ol.style.Style({
	image: new ol.style.Icon({

	});
 });*/

  // �좏쑕吏� �ㅽ���
  var bubunStyle = {
    default: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        opacity: 1,
        // size: [30, 30],
        // scale: 1,
        src: getGisIconUrl('marker_1.png')
      })
    })
  };
  var bubunStyleFunction = function (feature, resolution) {
    return bubunStyle.default;
  };

// �좏쑕吏� �ㅽ���
  var bubunStyle2 = {
    default: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        opacity: 1,
        // size: [30, 30],
        // scale: 1,
        src: getGisIconUrl('marker_2.png')
      })
    })
  };
  var bubunStyleFunction2 = function (feature, resolution) {
    return bubunStyle2.default;
  };

// �좏쑕吏� �ㅽ���
  var bubunStyle3 = {
    default: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        opacity: 1,
        // size: [30, 30],
        // scale: 1,
        src: getGisIconUrl('marker_3.png')
      })
    })
  };
  var bubunStyleFunction3 = function (feature, resolution) {
    return bubunStyle3.default;
  };

// �좏쑕吏� �ㅽ���
  var bubunStyle4 = {
    default: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        opacity: 1,
        // size: [30, 30],
        // scale: 1,
        src: getGisIconUrl('marker_4.png')
      })
    })
  };
  var bubunStyleFunction4 = function (feature, resolution) {
    return bubunStyle4.default;
  };


  // CCTV �ㅽ���
  var cctvStyle = {
    default: new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        opacity: 1,
        // size: [30, 30],
        // scale: 1,
        src: getGisIconUrl('icon_cctv_30.png')
      })
    })
  };
  var cctvStyleFunction = function (feature, resolution) {
    return cctvStyle.default;
  };

  // �ш퀬�꾩튂 �ㅽ���
  var trafficStyles = {
    default: new Style({
      image: new CircleStyle({
        stroke: new Stroke({ color: 'rgba(255,0, 0,1)', width: 1 }),
        fill: new Fill({ color: 'rgba(255,0,0,0.5)' }),
        radius: 3
      })
    })
  };

  // var trafficStyleFunction = function (feature) {
  // return trafficStyles['default'];
  // };

  // cluster style cache
  // var clusterStyleCache = {};
  var clusterFill = new Fill({
    color: 'rgba(255, 128, 255, 0.9)'
  });
  var textFill = new Fill({
    color: 'rgba(0, 0, 0, 1)',
    width: 3
  });
  var clusterStroke = new Stroke({
    color: 'rgba(255, 128, 255, 0.5)',
    width: 5
  });

  // Style for the clusters
  var clusterStyleCache = {};
  function clusterStyleFunction(feature, resolution) {
    var size = feature.get('features').length;
    var style = clusterStyleCache[size];
    if (!style) {
      // var color = size > 25 ? '248, 128, 0' : size > 8 ? '248, 192, 0' :
		// '128, 192, 64';
      var radius = Math.max(5, Math.min(size * 0.8, 60)) + 5;
      // var radius = size + 10;
      style = clusterStyleCache[size] = [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: radius + 2,
            stroke: new ol.style.Stroke({
              color: 'rgba(255, 128, 255, 0.5)',
              width: 6
            })
            // stroke: clusterStroke
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({ color: 'rgba(255, 128, 255, 0.9)' })
            // fill: clusterFill
          }),
          text: new ol.style.Text({
            text: size.toString(),
            font: 'bold ' + radius + 'px 留묒� 怨좊뵓',
            fill: new ol.style.Fill({ color: '#000' })
            // fill: textFill
          })
        })
      ];
    }
    return style;
  }

  // ============================================================
  // �덉씠��
  // ============================================================

  // �몃㈃遺꾩꽍寃곌낵 �쒖텧援ш컙 �덉씠�� (�꾩떆 留덉빱濡� ��泥�)
  var loadFeaturesE1 = new ol.Feature({
    geometry: new Polygon([[[ 14193529.834625314921141, 4349113.545405007898808 ], [ 14193529.431116202846169, 4349109.448508245870471 ], [ 14193528.236095497384667, 4349105.50905292853713 ], [ 14193526.29548717290163, 4349101.878430114127696 ], [ 14193523.68386771902442, 4349098.696162602864206 ], [ 14193520.50160020776093, 4349096.084543149918318 ], [ 14193516.870977394282818, 4349094.143934825435281 ], [ 14193512.931522076949477, 4349092.948914119042456 ], [ 14193508.834625314921141, 4349092.545405007898808 ], [ 14193504.737728552892804, 4349092.948914119042456 ], [ 14193502.249188549816608, 4349093.703804476186633 ], [ 14193500.151739984750748, 4349093.067550409585238 ], [ 14193496.054843222722411, 4349092.664041298441589 ], [ 14193491.957946460694075, 4349093.067550409585238 ], [ 14193489.469431675970554, 4349093.822433116845787 ], [ 14193487.37195804528892, 4349093.186171446926892 ], [ 14193483.275061283260584, 4349092.782662335783243 ], [ 14193479.178164521232247, 4349093.186171446926892 ], [ 14193476.689674966037273, 4349093.941046500578523 ], [ 14193474.592176264151931, 4349093.304777225479484 ], [ 14193470.495279502123594, 4349092.901268114335835 ], [ 14193466.398382740095258, 4349093.304777225479484 ], [ 14193463.909918416291475, 4349094.059644625522196 ], [ 14193461.812394633889198, 4349093.423367742449045 ], [ 14193457.715497871860862, 4349093.019858631305397 ], [ 14193453.618601109832525, 4349093.423367742449045 ], [ 14193451.130162009969354, 4349094.178227491676807 ], [ 14193449.032613161951303, 4349093.541943004354835 ], [ 14193444.935716399922967, 4349093.138433893211186 ], [ 14193440.83881963789463, 4349093.541943004354835 ], [ 14193438.350405773147941, 4349094.296795098111033 ], [ 14193436.252831848338246, 4349093.660503003746271 ], [ 14193432.15593508630991, 4349093.256993892602623 ], [ 14193428.059038324281573, 4349093.660503003746271 ], [ 14193425.570649679750204, 4349094.41534744668752 ], [ 14193423.473050687462091, 4349093.779047749005258 ], [ 14193419.376153925433755, 4349093.375538637861609 ], [ 14193415.279257163405418, 4349093.779047749005258 ], [ 14193412.790893740952015, 4349094.533884541131556 ], [ 14193410.693269683048129, 4349093.897577239200473 ], [ 14193406.596372921019793, 4349093.494068128056824 ], [ 14193402.499476158991456, 4349093.897577239200473 ], [ 14193400.01113797724247, 4349094.652406374923885 ], [ 14193397.913488835096359, 4349094.016091464087367 ], [ 14193393.816592073068023, 4349093.612582352943718 ], [ 14193389.719695311039686, 4349094.016091464087367 ], [ 14193387.231382355093956, 4349094.770912947133183 ], [ 14193385.133708141744137, 4349094.134590431116521 ], [ 14193381.0368113797158, 4349093.731081319972873 ], [ 14193376.939914617687464, 4349094.134590431116521 ], [ 14193373.000459300354123, 4349095.329611137509346 ], [ 14193369.369836486876011, 4349097.270219461992383 ], [ 14193366.187568975612521, 4349099.881838914938271 ], [ 14193363.575949521735311, 4349103.064106426201761 ], [ 14193361.635341197252274, 4349106.694729240611196 ], [ 14193360.440320491790771, 4349110.634184557944536 ], [ 14193360.0368113797158, 4349114.731081319972873 ], [ 14193360.440320491790771, 4349118.827978082001209 ], [ 14193361.635341197252274, 4349122.76743339933455 ], [ 14193363.575949521735311, 4349126.398056213743985 ], [ 14193366.187568975612521, 4349129.580323725007474 ], [ 14193369.369836486876011, 4349132.191943177953362 ], [ 14193373.000459300354123, 4349134.132551502436399 ], [ 14193376.939914617687464, 4349135.327572208829224 ], [ 14193381.0368113797158, 4349135.731081319972873 ], [ 14193385.133708141744137, 4349135.327572208829224 ], [ 14193387.622021097689867, 4349134.572750725783408 ], [ 14193389.719695311039686, 4349135.20907324180007 ], [ 14193393.816592073068023, 4349135.612582352943718 ], [ 14193397.913488835096359, 4349135.20907324180007 ], [ 14193400.401827016845345, 4349134.454244106076658 ], [ 14193402.499476158991456, 4349135.090559016913176 ], [ 14193406.596372921019793, 4349135.494068128056824 ], [ 14193410.693269683048129, 4349135.090559016913176 ], [ 14193413.181633105501533, 4349134.335722224786878 ], [ 14193415.279257163405418, 4349134.972029526717961 ], [ 14193419.376153925433755, 4349135.375538637861609 ], [ 14193423.473050687462091, 4349134.972029526717961 ], [ 14193425.961439331993461, 4349134.217185083776712 ], [ 14193428.059038324281573, 4349134.853484781458974 ], [ 14193432.15593508630991, 4349135.256993892602623 ], [ 14193436.252831848338246, 4349134.853484781458974 ], [ 14193438.741245713084936, 4349134.098632687702775 ], [ 14193440.83881963789463, 4349134.734924782067537 ], [ 14193444.935716399922967, 4349135.138433893211186 ], [ 14193449.032613161951303, 4349134.734924782067537 ], [ 14193451.521052261814475, 4349133.980065032839775 ], [ 14193453.618601109832525, 4349134.616349520161748 ], [ 14193457.715497871860862, 4349135.019858631305397 ], [ 14193461.812394633889198, 4349134.616349520161748 ], [ 14193464.300858957692981, 4349133.861482120119035 ], [ 14193466.398382740095258, 4349134.497759003192186 ], [ 14193470.495279502123594, 4349134.901268114335835 ], [ 14193474.592176264151931, 4349134.497759003192186 ], [ 14193477.080665819346905, 4349133.742883949540555 ], [ 14193479.178164521232247, 4349134.379153224639595 ], [ 14193483.275061283260584, 4349134.782662335783243 ], [ 14193487.37195804528892, 4349134.379153224639595 ], [ 14193489.860472830012441, 4349133.624270517379045 ], [ 14193491.957946460694075, 4349134.26053218729794 ], [ 14193496.054843222722411, 4349134.664041298441589 ], [ 14193500.151739984750748, 4349134.26053218729794 ], [ 14193502.640279987826943, 4349133.505641830153763 ], [ 14193504.737728552892804, 4349134.141895896755159 ], [ 14193508.834625314921141, 4349134.545405007898808 ], [ 14193512.931522076949477, 4349134.141895896755159 ], [ 14193516.870977394282818, 4349132.946875190362334 ], [ 14193520.50160020776093, 4349131.006266865879297 ], [ 14193523.68386771902442, 4349128.394647412933409 ], [ 14193526.29548717290163, 4349125.212379901669919 ], [ 14193528.236095497384667, 4349121.581757087260485 ], [ 14193529.431116202846169, 4349117.642301769927144 ], [ 14193529.834625314921141, 4349113.545405007898808 ]]]),
  });
  loadFeaturesE1.setId('1E');

  var loadFeaturesS1 = new ol.Feature({
    geometry: new Polygon([[[ 14193526.474472234025598, 4349074.375178828835487 ], [ 14193526.070963121950626, 4349070.278282066807151 ], [ 14193524.875942416489124, 4349066.33882674947381 ], [ 14193522.935334092006087, 4349062.708203935064375 ], [ 14193520.323714638128877, 4349059.525936423800886 ], [ 14193517.141447126865387, 4349056.914316970854998 ], [ 14193513.510824313387275, 4349054.973708646371961 ], [ 14193509.571368996053934, 4349053.778687939979136 ], [ 14193505.474472234025598, 4349053.375178828835487 ], [ 14193501.377575471997261, 4349053.778687939979136 ], [ 14193500.28036423586309, 4349054.111523330211639 ], [ 14193499.674468748271465, 4349053.927726943045855 ], [ 14193495.577571986243129, 4349053.524217831902206 ], [ 14193491.480675224214792, 4349053.927726943045855 ], [ 14193490.383479053154588, 4349054.260557763278484 ], [ 14193489.777568493038416, 4349054.076756804250181 ], [ 14193485.680671731010079, 4349053.673247693106532 ], [ 14193481.583774968981743, 4349054.076756804250181 ], [ 14193480.486593881621957, 4349054.409583048895001 ], [ 14193479.880668222904205, 4349054.225777509622276 ], [ 14193475.783771460875869, 4349053.822268398478627 ], [ 14193471.686874698847532, 4349054.225777509622276 ], [ 14193470.589708689600229, 4349054.558599180541933 ], [ 14193469.983767937868834, 4349054.37478906288743 ], [ 14193465.886871175840497, 4349053.971279951743782 ], [ 14193461.78997441381216, 4349054.37478906288743 ], [ 14193460.692823484539986, 4349054.707606158219278 ], [ 14193460.086867645382881, 4349054.523791464045644 ], [ 14193455.989970883354545, 4349054.120282352901995 ], [ 14193451.893074121326208, 4349054.523791464045644 ], [ 14193450.795938285067677, 4349054.856603981927037 ], [ 14193450.189967337995768, 4349054.672784704715014 ], [ 14193446.093070575967431, 4349054.269275593571365 ], [ 14193441.996173813939095, 4349054.672784704715014 ], [ 14193440.899053040891886, 4349055.005592652596533 ], [ 14193440.293067025020719, 4349054.821768804453313 ], [ 14193436.196170262992382, 4349054.418259693309665 ], [ 14193432.099273500964046, 4349054.821768804453313 ], [ 14193431.0021678134799, 4349055.154572176747024 ], [ 14193430.396166699007154, 4349054.970743748359382 ], [ 14193426.299269936978817, 4349054.567234637215734 ], [ 14193422.20237317495048, 4349054.970743748359382 ], [ 14193421.105282571166754, 4349055.303542545065284 ], [ 14193420.499266359955072, 4349055.11970953643322 ], [ 14193416.402369597926736, 4349054.716200425289571 ], [ 14193412.305472835898399, 4349055.11970953643322 ], [ 14193411.208397306501865, 4349055.45250376034528 ], [ 14193410.602366007864475, 4349055.268666175194085 ], [ 14193406.505469245836139, 4349054.865157064050436 ], [ 14193402.408572483807802, 4349055.268666175194085 ], [ 14193398.469117166474462, 4349056.463686881586909 ], [ 14193394.838494352996349, 4349058.404295206069946 ], [ 14193391.65622684173286, 4349061.015914659015834 ], [ 14193389.044607387855649, 4349064.198182170279324 ], [ 14193387.103999063372612, 4349067.828804984688759 ], [ 14193385.90897835791111, 4349071.768260302022099 ], [ 14193385.505469245836139, 4349075.865157064050436 ], [ 14193385.90897835791111, 4349079.962053826078773 ], [ 14193387.103999063372612, 4349083.901509143412113 ], [ 14193389.044607387855649, 4349087.532131957821548 ], [ 14193391.65622684173286, 4349090.714399469085038 ], [ 14193394.838494352996349, 4349093.326018922030926 ], [ 14193398.469117166474462, 4349095.266627246513963 ], [ 14193402.408572483807802, 4349096.461647952906787 ], [ 14193406.505469245836139, 4349096.865157064050436 ], [ 14193410.602366007864475, 4349096.461647952906787 ], [ 14193411.699441537261009, 4349096.128853728994727 ], [ 14193412.305472835898399, 4349096.312691314145923 ], [ 14193416.402369597926736, 4349096.716200425289571 ], [ 14193420.499266359955072, 4349096.312691314145923 ], [ 14193421.596356963738799, 4349095.979892517440021 ], [ 14193422.20237317495048, 4349096.163725526072085 ], [ 14193426.299269936978817, 4349096.567234637215734 ], [ 14193430.396166699007154, 4349096.163725526072085 ], [ 14193431.493272386491299, 4349095.830922153778374 ], [ 14193432.099273500964046, 4349096.014750582166016 ], [ 14193436.196170262992382, 4349096.418259693309665 ], [ 14193440.293067025020719, 4349096.014750582166016 ], [ 14193441.390187798067927, 4349095.681942634284496 ], [ 14193441.996173813939095, 4349095.865766482427716 ], [ 14193446.093070575967431, 4349096.269275593571365 ], [ 14193450.189967337995768, 4349095.865766482427716 ], [ 14193451.287103174254298, 4349095.532953964546323 ], [ 14193451.893074121326208, 4349095.716773241758347 ], [ 14193455.989970883354545, 4349096.120282352901995 ], [ 14193460.086867645382881, 4349095.716773241758347 ], [ 14193461.184018574655056, 4349095.383956146426499 ], [ 14193461.78997441381216, 4349095.567770840600133 ], [ 14193465.886871175840497, 4349095.971279951743782 ], [ 14193469.983767937868834, 4349095.567770840600133 ], [ 14193471.080933947116137, 4349095.234949169680476 ], [ 14193471.686874698847532, 4349095.418759287334979 ], [ 14193475.783771460875869, 4349095.822268398478627 ], [ 14193479.880668222904205, 4349095.418759287334979 ], [ 14193480.977849310263991, 4349095.085933042690158 ], [ 14193481.583774968981743, 4349095.269738581962883 ], [ 14193485.680671731010079, 4349095.673247693106532 ], [ 14193489.777568493038416, 4349095.269738581962883 ], [ 14193490.87476466409862, 4349094.936907761730254 ], [ 14193491.480675224214792, 4349095.120708720758557 ], [ 14193495.577571986243129, 4349095.524217831902206 ], [ 14193499.674468748271465, 4349095.120708720758557 ], [ 14193500.771679984405637, 4349094.787873330526054 ], [ 14193501.377575471997261, 4349094.971669717691839 ], [ 14193505.474472234025598, 4349095.375178828835487 ], [ 14193509.571368996053934, 4349094.971669717691839 ], [ 14193513.510824313387275, 4349093.776649011299014 ], [ 14193517.141447126865387, 4349091.836040686815977 ], [ 14193520.323714638128877, 4349089.224421233870089 ], [ 14193522.935334092006087, 4349086.042153722606599 ], [ 14193524.875942416489124, 4349082.411530908197165 ], [ 14193526.070963121950626, 4349078.472075590863824 ], [ 14193526.474472234025598, 4349074.375178828835487 ]]]),
  });
  loadFeaturesS1.setId('1S');

  var loadFeaturesE2 = new ol.Feature({
    geometry: new Polygon([[[ 14195697.864480473101139, 4348186.412899552844465 ], [ 14195697.460971361026168, 4348182.316002790816128 ], [ 14195696.265950655564666, 4348178.376547473482788 ], [ 14195694.325342331081629, 4348174.745924659073353 ], [ 14195691.713722877204418, 4348171.563657147809863 ], [ 14195688.531455365940928, 4348168.952037694863975 ], [ 14195684.900832552462816, 4348167.011429370380938 ], [ 14195680.961377235129476, 4348165.816408663988113 ], [ 14195676.864480473101139, 4348165.412899552844465 ], [ 14195672.767583711072803, 4348165.816408663988113 ], [ 14195668.828128393739462, 4348167.011429370380938 ], [ 14195665.19750558026135, 4348168.952037694863975 ], [ 14195662.01523806899786, 4348171.563657147809863 ], [ 14195659.403618615120649, 4348174.745924659073353 ], [ 14195657.463010290637612, 4348178.376547473482788 ], [ 14195656.616077804937959, 4348181.168509714305401 ], [ 14195653.946559758856893, 4348183.359326555393636 ], [ 14195651.334940304979682, 4348186.541594066657126 ], [ 14195649.394331980496645, 4348190.172216881066561 ], [ 14195648.547402899712324, 4348192.964167892932892 ], [ 14195645.877863634377718, 4348195.155002149753273 ], [ 14195643.266244180500507, 4348198.337269661016762 ], [ 14195641.32563585601747, 4348201.967892475426197 ], [ 14195640.478710178285837, 4348204.759832273237407 ], [ 14195637.809149703010917, 4348206.950683935545385 ], [ 14195635.197530249133706, 4348210.132951446808875 ], [ 14195633.256921924650669, 4348213.763574261218309 ], [ 14195632.409999653697014, 4348216.55550282727927 ], [ 14195629.740417962893844, 4348218.74637190066278 ], [ 14195627.128798509016633, 4348221.92863941192627 ], [ 14195625.188190184533596, 4348225.559262226335704 ], [ 14195624.341271320357919, 4348228.351179563440382 ], [ 14195621.671668410301208, 4348230.542066050693393 ], [ 14195619.060048956423998, 4348233.724333561956882 ], [ 14195617.119440631940961, 4348237.354956376366317 ], [ 14195616.272525172680616, 4348240.146862488240004 ], [ 14195613.602901047095656, 4348242.337766386568546 ], [ 14195610.991281593218446, 4348245.520033897832036 ], [ 14195609.050673268735409, 4348249.150656712241471 ], [ 14195608.203761214390397, 4348251.942551595158875 ], [ 14195605.534115873277187, 4348254.133472906425595 ], [ 14195602.922496419399977, 4348257.315740417689085 ], [ 14195600.98188809491694, 4348260.94636323209852 ], [ 14195600.134979443624616, 4348263.73824690002948 ], [ 14195597.465312894433737, 4348265.929185614921153 ], [ 14195594.853693440556526, 4348269.111453126184642 ], [ 14195592.913085116073489, 4348272.742075940594077 ], [ 14195592.066179873421788, 4348275.533948369324207 ], [ 14195589.396492099389434, 4348277.724904503673315 ], [ 14195586.784872645512223, 4348280.907172014936805 ], [ 14195584.844264321029186, 4348284.53779482934624 ], [ 14195583.997362481430173, 4348287.329656043089926 ], [ 14195581.327653497457504, 4348289.520629582926631 ], [ 14195578.716034043580294, 4348292.702897094190121 ], [ 14195576.775425719097257, 4348296.333519908599555 ], [ 14195576.71594575792551, 4348296.529599062167108 ], [ 14195574.752489874139428, 4348298.140965662896633 ], [ 14195572.140870420262218, 4348301.323233174160123 ], [ 14195570.200262095779181, 4348304.953855988569558 ], [ 14195570.14078463613987, 4348305.149926899001002 ], [ 14195568.177315674722195, 4348306.761304231360555 ], [ 14195565.565696220844984, 4348309.943571742624044 ], [ 14195563.625087896361947, 4348313.574194557033479 ], [ 14195563.565612938255072, 4348313.77025721501559 ], [ 14195561.602130910381675, 4348315.381645272485912 ], [ 14195558.990511456504464, 4348318.563912783749402 ], [ 14195557.049903132021427, 4348322.194535598158836 ], [ 14195556.990430675446987, 4348322.390590015798807 ], [ 14195555.026935569941998, 4348324.001988803967834 ], [ 14195552.415316116064787, 4348327.184256315231323 ], [ 14195550.47470779158175, 4348330.814879129640758 ], [ 14195550.41523783840239, 4348331.010925294831395 ], [ 14195548.451729655265808, 4348332.622334815561771 ], [ 14195545.840110201388597, 4348335.804602326825261 ], [ 14195543.89950187690556, 4348339.435225141234696 ], [ 14195543.840034423395991, 4348339.631263063289225 ], [ 14195541.876513170078397, 4348341.242683310993016 ], [ 14195539.264893716201186, 4348344.424950822256505 ], [ 14195537.324285391718149, 4348348.05557363666594 ], [ 14195537.264820443466306, 4348348.251603302545846 ], [ 14195535.301286110654473, 4348349.863034283742309 ], [ 14195532.689666656777263, 4348353.045301795005798 ], [ 14195530.749058332294226, 4348356.675924609415233 ], [ 14195530.689595881849527, 4348356.871946038678288 ], [ 14195528.726048478856683, 4348358.483387746848166 ], [ 14195526.114429024979472, 4348361.665655258111656 ], [ 14195524.173820700496435, 4348365.296278072521091 ], [ 14195524.114360755309463, 4348365.492291242815554 ], [ 14195522.15080027282238, 4348367.103743685409427 ], [ 14195519.539180818945169, 4348370.286011196672916 ], [ 14195517.598572494462132, 4348373.916634011082351 ], [ 14195517.53911504894495, 4348374.112638941034675 ], [ 14195515.575541496276855, 4348375.724102109670639 ], [ 14195512.963922042399645, 4348378.906369620934129 ], [ 14195511.023313717916608, 4348382.536992435343564 ], [ 14195511.019645217806101, 4348382.549085857346654 ], [ 14195509.429281068965793, 4348383.399153205566108 ], [ 14195506.247013557702303, 4348386.010772658511996 ], [ 14195503.635394103825092, 4348389.193040169775486 ], [ 14195501.694785779342055, 4348392.823662984184921 ], [ 14195501.691120335832238, 4348392.835746331140399 ], [ 14195500.100735310465097, 4348393.68582483753562 ], [ 14195496.918467799201608, 4348396.297444290481508 ], [ 14195494.306848345324397, 4348399.479711801744998 ], [ 14195492.36624002084136, 4348403.110334616154432 ], [ 14195492.362577635794878, 4348403.122407882474363 ], [ 14195490.772171750664711, 4348403.972497538663447 ], [ 14195487.589904239401221, 4348406.584116991609335 ], [ 14195484.978284785524011, 4348409.766384502872825 ], [ 14195483.037676461040974, 4348413.397007317282259 ], [ 14195483.034017130732536, 4348413.409070510417223 ], [ 14195481.443590374663472, 4348414.259171322919428 ], [ 14195478.261322863399982, 4348416.870790775865316 ], [ 14195475.649703409522772, 4348420.053058287128806 ], [ 14195473.709095085039735, 4348423.683681101538241 ], [ 14195473.705438813194633, 4348423.695734215900302 ], [ 14195472.114991188049316, 4348424.545846182852983 ], [ 14195468.932723676785827, 4348427.157465635798872 ], [ 14195466.321104222908616, 4348430.339733147062361 ], [ 14195464.380495898425579, 4348433.970355961471796 ], [ 14195464.376842683181167, 4348433.982398999854922 ], [ 14195462.786374190822244, 4348434.832522120326757 ], [ 14195459.604106679558754, 4348437.444141573272645 ], [ 14195456.992487225681543, 4348440.626409084536135 ], [ 14195455.051878901198506, 4348444.25703189894557 ], [ 14195455.048228742554784, 4348444.269064856693149 ], [ 14195453.457739382982254, 4348445.11919913161546 ], [ 14195450.275471871718764, 4348447.730818584561348 ], [ 14195447.663852417841554, 4348450.913086095824838 ], [ 14195445.723244093358517, 4348454.543708910234272 ], [ 14195445.719596993178129, 4348454.555731789208949 ], [ 14195444.129086758941412, 4348455.405877221375704 ], [ 14195440.946819247677922, 4348458.017496674321592 ], [ 14195438.335199793800712, 4348461.199764185585082 ], [ 14195436.394591469317675, 4348464.830387 ], [ 14195436.390947425737977, 4348464.84239980019629 ], [ 14195434.800416329875588, 4348465.692556383088231 ], [ 14195431.618148818612099, 4348468.304175836034119 ], [ 14195429.006529364734888, 4348471.486443347297609 ], [ 14195427.065921040251851, 4348475.117066161707044 ], [ 14195427.062280051410198, 4348475.129068895243108 ], [ 14195425.471728088334203, 4348475.979236631654203 ], [ 14195422.289460577070713, 4348478.590856084600091 ], [ 14195419.677841123193502, 4348481.773123595863581 ], [ 14195417.737232798710465, 4348485.403746410273015 ], [ 14195416.542212093248963, 4348489.343201727606356 ], [ 14195416.138702981173992, 4348493.440098489634693 ], [ 14195416.542212093248963, 4348497.536995251663029 ], [ 14195417.737232798710465, 4348501.47645056899637 ], [ 14195419.677841123193502, 4348505.107073383405805 ], [ 14195422.289460577070713, 4348508.289340894669294 ], [ 14195425.471728088334203, 4348510.900960347615182 ], [ 14195429.102350901812315, 4348512.841568672098219 ], [ 14195433.041806219145656, 4348514.036589378491044 ], [ 14195437.138702981173992, 4348514.440098489634693 ], [ 14195441.235599743202329, 4348514.036589378491044 ], [ 14195445.175055060535669, 4348512.841568672098219 ], [ 14195448.805677874013782, 4348510.900960347615182 ], [ 14195451.987945385277271, 4348508.289340894669294 ], [ 14195454.599564839154482, 4348505.107073383405805 ], [ 14195456.540173163637519, 4348501.47645056899637 ], [ 14195456.543814152479172, 4348501.464447835460305 ], [ 14195458.134366115555167, 4348500.614280099049211 ], [ 14195461.316633626818657, 4348498.002660646103323 ], [ 14195463.928253080695868, 4348494.820393134839833 ], [ 14195465.868861405178905, 4348491.189770320430398 ], [ 14195465.872505448758602, 4348491.177757520228624 ], [ 14195467.463036544620991, 4348490.327600937336683 ], [ 14195470.64530405588448, 4348487.715981484390795 ], [ 14195473.256923509761691, 4348484.533713973127306 ], [ 14195475.197531834244728, 4348480.903091158717871 ], [ 14195475.201178934425116, 4348480.891068279743195 ], [ 14195476.791689168661833, 4348480.040922847576439 ], [ 14195479.973956679925323, 4348477.429303394630551 ], [ 14195482.585576133802533, 4348474.247035883367062 ], [ 14195484.52618445828557, 4348470.616413068957627 ], [ 14195484.529834616929293, 4348470.604380111210048 ], [ 14195486.120323976501822, 4348469.754245836287737 ], [ 14195489.302591487765312, 4348467.142626383341849 ], [ 14195491.914210941642523, 4348463.960358872078359 ], [ 14195493.85481926612556, 4348460.329736057668924 ], [ 14195493.858472481369972, 4348460.317693019285798 ], [ 14195495.448940973728895, 4348459.467569898813963 ], [ 14195498.631208484992385, 4348456.855950445868075 ], [ 14195501.242827938869596, 4348453.673682934604585 ], [ 14195503.183436263352633, 4348450.04306012019515 ], [ 14195503.187092535197735, 4348450.031007005833089 ], [ 14195504.777540160343051, 4348449.180895038880408 ], [ 14195507.959807671606541, 4348446.56927558593452 ], [ 14195510.571427125483751, 4348443.38700807467103 ], [ 14195512.512035449966788, 4348439.756385260261595 ], [ 14195512.515694780275226, 4348439.744322067126632 ], [ 14195514.10612153634429, 4348438.894221254624426 ], [ 14195517.28838904760778, 4348436.282601801678538 ], [ 14195519.90000850148499, 4348433.100334290415049 ], [ 14195521.840616825968027, 4348429.469711476005614 ], [ 14195521.844279211014509, 4348429.457638209685683 ], [ 14195523.434685096144676, 4348428.607548553496599 ], [ 14195526.616952607408166, 4348425.995929100550711 ], [ 14195529.228572061285377, 4348422.813661589287221 ], [ 14195531.169180385768414, 4348419.183038774877787 ], [ 14195531.172845829278231, 4348419.170955427922308 ], [ 14195532.763230854645371, 4348418.320876921527088 ], [ 14195535.945498365908861, 4348415.7092574685812 ], [ 14195538.557117819786072, 4348412.52698995731771 ], [ 14195540.497726144269109, 4348408.896367142908275 ], [ 14195540.501394644379616, 4348408.884273720905185 ], [ 14195542.091758793219924, 4348408.03420637268573 ], [ 14195545.274026304483414, 4348405.422586919739842 ], [ 14195547.885645758360624, 4348402.240319408476353 ], [ 14195549.826254082843661, 4348398.609696594066918 ], [ 14195549.885711528360844, 4348398.413691664114594 ], [ 14195551.849285081028938, 4348396.80222849547863 ], [ 14195554.460904534906149, 4348393.61996098421514 ], [ 14195556.401512859389186, 4348389.989338169805706 ], [ 14195556.460972804576159, 4348389.793324999511242 ], [ 14195558.424533287063241, 4348388.181872556917369 ], [ 14195561.036152740940452, 4348384.99960504565388 ], [ 14195562.976761065423489, 4348381.368982231244445 ], [ 14195563.036223515868187, 4348381.17296080198139 ], [ 14195564.999770918861032, 4348379.561519093811512 ], [ 14195567.611390372738242, 4348376.379251582548022 ], [ 14195569.551998697221279, 4348372.748628768138587 ], [ 14195569.611463645473123, 4348372.552599102258682 ], [ 14195571.574997978284955, 4348370.941168121062219 ], [ 14195574.186617432162166, 4348367.758900609798729 ], [ 14195576.127225756645203, 4348364.128277795389295 ], [ 14195576.186693210154772, 4348363.932239873334765 ], [ 14195578.150214463472366, 4348362.320819625630975 ], [ 14195580.761833917349577, 4348359.138552114367485 ], [ 14195582.702442241832614, 4348355.50792929995805 ], [ 14195582.761912195011973, 4348355.311883134767413 ], [ 14195584.725420378148556, 4348353.700473614037037 ], [ 14195587.337039832025766, 4348350.518206102773547 ], [ 14195589.277648156508803, 4348346.887583288364112 ], [ 14195589.337120613083243, 4348346.691528870724142 ], [ 14195591.300615718588233, 4348345.080130082555115 ], [ 14195593.912235172465444, 4348341.897862571291625 ], [ 14195595.852843496948481, 4348338.267239756882191 ], [ 14195595.912318455055356, 4348338.07117709890008 ], [ 14195597.875800482928753, 4348336.459789041429758 ], [ 14195600.487419936805964, 4348333.277521530166268 ], [ 14195602.428028261289001, 4348329.646898715756834 ], [ 14195602.487505720928311, 4348329.450827805325389 ], [ 14195604.450974682345986, 4348327.839450472965837 ], [ 14195607.062594136223197, 4348324.657182961702347 ], [ 14195609.003202460706234, 4348321.026560147292912 ], [ 14195609.06268242187798, 4348320.830480993725359 ], [ 14195611.026138305664062, 4348319.219114392995834 ], [ 14195613.637757759541273, 4348316.036846881732345 ], [ 14195615.57836608402431, 4348312.40622406732291 ], [ 14195616.425267923623323, 4348309.614362853579223 ], [ 14195619.094976907595992, 4348307.423389313742518 ], [ 14195621.706596361473203, 4348304.241121802479029 ], [ 14195623.64720468595624, 4348300.610498988069594 ], [ 14195624.494109928607941, 4348297.818626559339464 ], [ 14195627.163797702640295, 4348295.627670424990356 ], [ 14195629.775417156517506, 4348292.445402913726866 ], [ 14195631.716025481000543, 4348288.814780099317431 ], [ 14195632.562934132292867, 4348286.022896431386471 ], [ 14195635.232600681483746, 4348283.831957716494799 ], [ 14195637.844220135360956, 4348280.649690205231309 ], [ 14195639.784828459843993, 4348277.019067390821874 ], [ 14195640.631740514189005, 4348274.22717250790447 ], [ 14195643.301385855302215, 4348272.03625119663775 ], [ 14195645.913005309179425, 4348268.85398368537426 ], [ 14195647.853613633662462, 4348265.223360870964825 ], [ 14195648.700529092922807, 4348262.431454759091139 ], [ 14195651.370153218507767, 4348260.240550860762596 ], [ 14195653.981772672384977, 4348257.058283349499106 ], [ 14195655.922380996868014, 4348253.427660535089672 ], [ 14195656.769299861043692, 4348250.635743197984993 ], [ 14195659.438902771100402, 4348248.444856710731983 ], [ 14195662.050522224977612, 4348245.262589199468493 ], [ 14195663.991130549460649, 4348241.631966385059059 ], [ 14195664.838052820414305, 4348238.840037818998098 ], [ 14195667.507634511217475, 4348236.649168745614588 ], [ 14195670.119253965094686, 4348233.466901234351099 ], [ 14195672.059862289577723, 4348229.836278419941664 ], [ 14195672.906787967309356, 4348227.044338622130454 ], [ 14195675.576348442584276, 4348224.853486959822476 ], [ 14195678.187967896461487, 4348221.671219448558986 ], [ 14195680.128576220944524, 4348218.040596634149551 ], [ 14195680.975505301728845, 4348215.24864562228322 ], [ 14195683.645044567063451, 4348213.05781136546284 ], [ 14195686.256664020940661, 4348209.87554385419935 ], [ 14195688.197272345423698, 4348206.244921039789915 ], [ 14195689.044204831123352, 4348203.452958798967302 ], [ 14195691.713722877204418, 4348201.262141957879066 ], [ 14195694.325342331081629, 4348198.079874446615577 ], [ 14195696.265950655564666, 4348194.449251632206142 ], [ 14195697.460971361026168, 4348190.509796314872801 ], [ 14195697.864480473101139, 4348186.412899552844465 ]]]),
  });
  loadFeaturesE2.setId('2E');

  var loadFeaturesS2 = new ol.Feature({
    geometry: new Polygon([[[ 14195650.874330751597881, 4348156.079245786182582 ], [ 14195650.47082163952291, 4348151.982349024154246 ], [ 14195649.275800934061408, 4348148.042893706820905 ], [ 14195647.335192609578371, 4348144.41227089241147 ], [ 14195644.72357315570116, 4348141.230003381147981 ], [ 14195641.541305644437671, 4348138.618383928202093 ], [ 14195637.910682830959558, 4348136.677775603719056 ], [ 14195633.971227513626218, 4348135.482754897326231 ], [ 14195629.874330751597881, 4348135.079245786182582 ], [ 14195625.777433989569545, 4348135.482754897326231 ], [ 14195621.837978672236204, 4348136.677775603719056 ], [ 14195618.207355858758092, 4348138.618383928202093 ], [ 14195615.025088347494602, 4348141.230003381147981 ], [ 14195612.413468893617392, 4348144.41227089241147 ], [ 14195610.472860569134355, 4348148.042893706820905 ], [ 14195609.84519561752677, 4348150.112027753144503 ], [ 14195607.214636981487274, 4348152.270871434360743 ], [ 14195604.603017527610064, 4348155.453138945624232 ], [ 14195602.662409203127027, 4348159.083761760033667 ], [ 14195602.034747563302517, 4348161.152884893119335 ], [ 14195599.404169496148825, 4348163.311744519509375 ], [ 14195596.792550042271614, 4348166.494012030772865 ], [ 14195594.851941717788577, 4348170.1246348451823 ], [ 14195594.224283389747143, 4348172.19374705851078 ], [ 14195591.593685887753963, 4348174.352622635662556 ], [ 14195588.982066433876753, 4348177.534890146926045 ], [ 14195587.041458109393716, 4348181.16551296133548 ], [ 14195586.413803089410067, 4348183.234614273533225 ], [ 14195583.783186160027981, 4348185.393505793064833 ], [ 14195581.17156670615077, 4348188.575773304328322 ], [ 14195579.230958381667733, 4348192.206396118737757 ], [ 14195578.603306673467159, 4348194.275486510246992 ], [ 14195575.972670311108232, 4348196.43439397867769 ], [ 14195573.361050857231021, 4348199.61666148994118 ], [ 14195571.420442532747984, 4348203.247284304350615 ], [ 14195570.79279413446784, 4348205.316363787278533 ], [ 14195568.162138344720006, 4348207.475287199020386 ], [ 14195565.550518890842795, 4348210.657554710283875 ], [ 14195563.609910566359758, 4348214.28817752469331 ], [ 14195562.98226547986269, 4348216.357246089726686 ], [ 14195560.351590255275369, 4348218.516185451298952 ], [ 14195557.739970801398158, 4348221.698452962562442 ], [ 14195555.799362476915121, 4348225.329075776971877 ], [ 14195555.171720698475838, 4348227.398133433423936 ], [ 14195552.541026044636965, 4348229.557088741101325 ], [ 14195549.929406590759754, 4348232.739356252364814 ], [ 14195547.988798266276717, 4348236.369979066774249 ], [ 14195547.361159801483154, 4348238.439025798812509 ], [ 14195544.730445710942149, 4348240.597997058182955 ], [ 14195542.118826257064939, 4348243.780264569446445 ], [ 14195540.178217932581902, 4348247.410887383855879 ], [ 14195539.550582773983479, 4348249.479923219420016 ], [ 14195536.919849263504148, 4348251.638910415582359 ], [ 14195534.308229809626937, 4348254.821177926845849 ], [ 14195532.3676214851439, 4348258.451800741255283 ], [ 14195532.361403420567513, 4348258.472298955544829 ], [ 14195531.70934352837503, 4348258.820832229219377 ], [ 14195528.52707601711154, 4348261.432451682165265 ], [ 14195525.915456563234329, 4348264.614719193428755 ], [ 14195523.974848238751292, 4348268.24534200783819 ], [ 14195523.96863248385489, 4348268.26583260577172 ], [ 14195523.316555004566908, 4348268.614375280216336 ], [ 14195520.134287493303418, 4348271.225994733162224 ], [ 14195517.522668039426208, 4348274.408262244425714 ], [ 14195515.582059714943171, 4348278.038885058835149 ], [ 14195515.575846266001463, 4348278.059368052519858 ], [ 14195514.923751195892692, 4348278.407920129597187 ], [ 14195511.741483684629202, 4348281.019539582543075 ], [ 14195509.129864230751991, 4348284.201807093806565 ], [ 14195507.189255906268954, 4348287.832429908216 ], [ 14195507.183044768869877, 4348287.852905284613371 ], [ 14195506.530932109802961, 4348288.201466762460768 ], [ 14195503.348664598539472, 4348290.813086215406656 ], [ 14195500.737045144662261, 4348293.995353726670146 ], [ 14195498.796436820179224, 4348297.625976541079581 ], [ 14195498.790227992460132, 4348297.64644430577755 ], [ 14195498.138097742572427, 4348297.99501518625766 ], [ 14195494.955830231308937, 4348300.606634639203548 ], [ 14195492.344210777431726, 4348303.788902150467038 ], [ 14195490.403602452948689, 4348307.419524964876473 ], [ 14195490.397395933046937, 4348307.439985118806362 ], [ 14195489.745248099789023, 4348307.788565398193896 ], [ 14195486.562980588525534, 4348310.400184851139784 ], [ 14195483.951361134648323, 4348313.582452362403274 ], [ 14195482.010752810165286, 4348317.213075176812708 ], [ 14195482.004548599943519, 4348317.233527718111873 ], [ 14195481.35238316655159, 4348317.582117404788733 ], [ 14195478.1701156552881, 4348320.193736857734621 ], [ 14195475.55849620141089, 4348323.37600436899811 ], [ 14195473.617887876927853, 4348327.006627183407545 ], [ 14195473.611685974523425, 4348327.027072113007307 ], [ 14195472.959502963349223, 4348327.375671195797622 ], [ 14195469.777235452085733, 4348329.98729064874351 ], [ 14195467.165615998208523, 4348333.169558160007 ], [ 14195465.225007673725486, 4348336.800180974416435 ], [ 14195465.218808082863688, 4348336.820618283934891 ], [ 14195464.566607471555471, 4348337.169226774014533 ], [ 14195461.384339960291982, 4348339.780846226960421 ], [ 14195458.772720506414771, 4348342.96311373822391 ], [ 14195456.832112181931734, 4348346.593736552633345 ], [ 14195456.825914897024632, 4348346.614166259765625 ], [ 14195456.173696704208851, 4348346.962784147821367 ], [ 14195452.991429192945361, 4348349.574403600767255 ], [ 14195450.379809739068151, 4348352.756671112030745 ], [ 14195449.710761370137334, 4348354.008372572250664 ], [ 14195448.760770313441753, 4348354.516153370961547 ], [ 14195445.578502802178264, 4348357.127772823907435 ], [ 14195442.966883348301053, 4348360.310040335170925 ], [ 14195442.297839265316725, 4348361.561733777634799 ], [ 14195441.34783355332911, 4348362.069522409699857 ], [ 14195438.16556604206562, 4348364.681141862645745 ], [ 14195435.55394658818841, 4348367.863409373909235 ], [ 14195434.884906796738505, 4348369.115094784647226 ], [ 14195433.934886423870921, 4348369.622891253791749 ], [ 14195430.752618912607431, 4348372.234510706737638 ], [ 14195428.140999458730221, 4348375.416778218001127 ], [ 14195427.47196396254003, 4348376.66845559515059 ], [ 14195426.521928925067186, 4348377.176259902305901 ], [ 14195423.339661413803697, 4348379.787879355251789 ], [ 14195420.728041959926486, 4348382.970146866515279 ], [ 14195420.059010749682784, 4348384.221816224046052 ], [ 14195419.108961058780551, 4348384.729628363624215 ], [ 14195415.926693547517061, 4348387.341247816570103 ], [ 14195413.315074093639851, 4348390.523515327833593 ], [ 14195412.646047174930573, 4348391.775176655501127 ], [ 14195411.695982821285725, 4348392.282996633090079 ], [ 14195408.513715310022235, 4348394.894616086035967 ], [ 14195405.902095856145024, 4348398.076883597299457 ], [ 14195405.233073234558105, 4348399.328536885790527 ], [ 14195404.282994212582707, 4348399.836364703252912 ], [ 14195401.100726701319218, 4348402.4479841561988 ], [ 14195398.489107247442007, 4348405.630251667462289 ], [ 14195397.820088911801577, 4348406.881896939128637 ], [ 14195396.869995234534144, 4348407.389732589945197 ], [ 14195393.687727723270655, 4348410.001352042891085 ], [ 14195391.076108269393444, 4348413.183619554154575 ], [ 14195390.407094227150083, 4348414.435256793163717 ], [ 14195389.456985892727971, 4348414.943100278265774 ], [ 14195386.274718381464481, 4348417.554719731211662 ], [ 14195383.663098927587271, 4348420.736987242475152 ], [ 14195382.994089173153043, 4348421.988616460002959 ], [ 14195382.043966175988317, 4348422.496467782184482 ], [ 14195378.861698664724827, 4348425.10808723513037 ], [ 14195376.250079210847616, 4348428.290354746393859 ], [ 14195374.309470886364579, 4348431.920977560803294 ], [ 14195373.114450180903077, 4348435.860432878136635 ], [ 14195372.710941068828106, 4348439.957329640164971 ], [ 14195373.114450180903077, 4348444.054226402193308 ], [ 14195374.309470886364579, 4348447.993681719526649 ], [ 14195376.250079210847616, 4348451.624304533936083 ], [ 14195378.861698664724827, 4348454.806572045199573 ], [ 14195382.043966175988317, 4348457.418191498145461 ], [ 14195385.674588989466429, 4348459.358799822628498 ], [ 14195389.614044306799769, 4348460.553820529021323 ], [ 14195393.710941068828106, 4348460.957329640164971 ], [ 14195397.807837830856442, 4348460.553820529021323 ], [ 14195401.747293148189783, 4348459.358799822628498 ], [ 14195405.377915961667895, 4348457.418191498145461 ], [ 14195408.560183472931385, 4348454.806572045199573 ], [ 14195411.171802926808596, 4348451.624304533936083 ], [ 14195411.840812681242824, 4348450.372675316408277 ], [ 14195412.79093567840755, 4348449.864823994226754 ], [ 14195415.97320318967104, 4348447.253204541280866 ], [ 14195418.58482264354825, 4348444.070937030017376 ], [ 14195419.253836685791612, 4348442.819299791008234 ], [ 14195420.203945020213723, 4348442.311456305906177 ], [ 14195423.386212531477213, 4348439.699836852960289 ], [ 14195425.997831985354424, 4348436.517569341696799 ], [ 14195426.666850320994854, 4348435.265924070030451 ], [ 14195427.616943998262286, 4348434.758088419213891 ], [ 14195430.799211509525776, 4348432.146468966268003 ], [ 14195433.410830963402987, 4348428.964201455004513 ], [ 14195434.079853584989905, 4348427.712548166513443 ], [ 14195435.029932606965303, 4348427.204720349051058 ], [ 14195438.212200118228793, 4348424.59310089610517 ], [ 14195440.823819572106004, 4348421.410833384841681 ], [ 14195441.492846490815282, 4348420.159172057174146 ], [ 14195442.44291084446013, 4348419.651352079585195 ], [ 14195445.625178355723619, 4348417.039732626639307 ], [ 14195448.23679780960083, 4348413.857465115375817 ], [ 14195448.905829019844532, 4348412.605795757845044 ], [ 14195449.855878710746765, 4348412.097983618266881 ], [ 14195453.038146222010255, 4348409.486364165320992 ], [ 14195455.649765675887465, 4348406.304096654057503 ], [ 14195456.318801172077656, 4348405.05241927690804 ], [ 14195457.2688362095505, 4348404.544614969752729 ], [ 14195460.45110372081399, 4348401.932995516806841 ], [ 14195463.0627231746912, 4348398.750728005543351 ], [ 14195463.731762966141105, 4348397.49904259480536 ], [ 14195464.681783339008689, 4348396.991246125660837 ], [ 14195467.864050850272179, 4348394.379626672714949 ], [ 14195470.475670304149389, 4348391.197359161451459 ], [ 14195471.144714387133718, 4348389.945665718987584 ], [ 14195472.094720099121332, 4348389.437877086922526 ], [ 14195475.276987610384822, 4348386.826257633976638 ], [ 14195477.888607064262033, 4348383.643990122713149 ], [ 14195478.557655433192849, 4348382.392288662493229 ], [ 14195479.50764648988843, 4348381.884507863782346 ], [ 14195482.689914001151919, 4348379.272888410836458 ], [ 14195485.30153345502913, 4348376.090620899572968 ], [ 14195487.242141779512167, 4348372.459998085163534 ], [ 14195487.24833906441927, 4348372.439568378031254 ], [ 14195487.90055725723505, 4348372.090950489975512 ], [ 14195491.08282476849854, 4348369.479331037029624 ], [ 14195493.694444222375751, 4348366.297063525766134 ], [ 14195495.635052546858788, 4348362.666440711356699 ], [ 14195495.641252137720585, 4348362.646003401838243 ], [ 14195496.293452749028802, 4348362.297394911758602 ], [ 14195499.475720260292292, 4348359.685775458812714 ], [ 14195502.087339714169502, 4348356.503507947549224 ], [ 14195504.027948038652539, 4348352.872885133139789 ], [ 14195504.034149941056967, 4348352.852440203540027 ], [ 14195504.686332952231169, 4348352.503841120749712 ], [ 14195507.868600463494658, 4348349.892221667803824 ], [ 14195510.480219917371869, 4348346.709954156540334 ], [ 14195512.420828241854906, 4348343.079331342130899 ], [ 14195512.427032452076674, 4348343.058878800831735 ], [ 14195513.079197885468602, 4348342.710289114154875 ], [ 14195516.261465396732092, 4348340.098669661208987 ], [ 14195518.873084850609303, 4348336.916402149945498 ], [ 14195520.81369317509234, 4348333.285779335536063 ], [ 14195520.819899694994092, 4348333.265319181606174 ], [ 14195521.472047528252006, 4348332.91673890221864 ], [ 14195524.654315039515495, 4348330.305119449272752 ], [ 14195527.265934493392706, 4348327.122851938009262 ], [ 14195529.206542817875743, 4348323.492229123599827 ], [ 14195529.212751645594835, 4348323.471761358901858 ], [ 14195529.86488189548254, 4348323.123190478421748 ], [ 14195533.04714940674603, 4348320.51157102547586 ], [ 14195535.65876886062324, 4348317.32930351421237 ], [ 14195537.599377185106277, 4348313.698680699802935 ], [ 14195537.605588322505355, 4348313.678205323405564 ], [ 14195538.25770098157227, 4348313.329643845558167 ], [ 14195541.43996849283576, 4348310.718024392612278 ], [ 14195544.051587946712971, 4348307.535756881348789 ], [ 14195545.992196271196008, 4348303.905134066939354 ], [ 14195545.998409720137715, 4348303.884651073254645 ], [ 14195546.650504790246487, 4348303.536098996177316 ], [ 14195549.832772301509976, 4348300.924479543231428 ], [ 14195552.444391755387187, 4348297.742212031967938 ], [ 14195554.385000079870224, 4348294.111589217558503 ], [ 14195554.391215834766626, 4348294.091098619624972 ], [ 14195555.043293314054608, 4348293.742555945180357 ], [ 14195558.225560825318098, 4348291.130936492234468 ], [ 14195560.837180279195309, 4348287.948668980970979 ], [ 14195562.777788603678346, 4348284.318046166561544 ], [ 14195562.784006668254733, 4348284.297547952271998 ], [ 14195563.436066560447216, 4348283.94901467859745 ], [ 14195566.618334071710706, 4348281.337395225651562 ], [ 14195569.229953525587916, 4348278.155127714388072 ], [ 14195571.170561850070953, 4348274.524504899978638 ], [ 14195571.798197008669376, 4348272.455469064414501 ], [ 14195574.428930519148707, 4348270.296481868252158 ], [ 14195577.040549973025918, 4348267.114214356988668 ], [ 14195578.981158297508955, 4348263.483591542579234 ], [ 14195579.608796762302518, 4348261.414544810540974 ], [ 14195582.239510852843523, 4348259.255573551170528 ], [ 14195584.851130306720734, 4348256.073306039907038 ], [ 14195586.791738631203771, 4348252.442683225497603 ], [ 14195587.419380409643054, 4348250.373625569045544 ], [ 14195590.050075063481927, 4348248.214670261368155 ], [ 14195592.661694517359138, 4348245.032402750104666 ], [ 14195594.602302841842175, 4348241.401779935695231 ], [ 14195595.229947928339243, 4348239.332711370661855 ], [ 14195597.860623152926564, 4348237.173772009089589 ], [ 14195600.472242606803775, 4348233.991504497826099 ], [ 14195602.412850931286812, 4348230.360881683416665 ], [ 14195603.040499329566956, 4348228.291802200488746 ], [ 14195605.67115511931479, 4348226.132878788746893 ], [ 14195608.282774573192, 4348222.950611277483404 ], [ 14195610.223382897675037, 4348219.319988463073969 ], [ 14195610.851034605875611, 4348217.250898071564734 ], [ 14195613.481670968234539, 4348215.091990603134036 ], [ 14195616.09329042211175, 4348211.909723091870546 ], [ 14195618.033898746594787, 4348208.279100277461112 ], [ 14195618.661553766578436, 4348206.209998965263367 ], [ 14195621.292170695960522, 4348204.051107445731759 ], [ 14195623.903790149837732, 4348200.868839934468269 ], [ 14195625.844398474320769, 4348197.238217120058835 ], [ 14195626.472056802362204, 4348195.169104906730354 ], [ 14195629.102654304355383, 4348193.010229329578578 ], [ 14195631.714273758232594, 4348189.827961818315089 ], [ 14195633.654882082715631, 4348186.197339003905654 ], [ 14195634.28254372254014, 4348184.128215870819986 ], [ 14195636.913121789693832, 4348181.969356244429946 ], [ 14195639.524741243571043, 4348178.787088733166456 ], [ 14195641.46534956805408, 4348175.156465918757021 ], [ 14195642.093014519661665, 4348173.087331872433424 ], [ 14195644.72357315570116, 4348170.928488191217184 ], [ 14195647.335192609578371, 4348167.746220679953694 ], [ 14195649.275800934061408, 4348164.11559786554426 ], [ 14195650.47082163952291, 4348160.176142548210919 ], [ 14195650.874330751597881, 4348156.079245786182582 ]]]),
  });
  loadFeaturesS2.setId('2S');

  var loadFeaturesE3 = new ol.Feature({
    geometry: new Polygon([[[ 14200151.698330232873559, 4344041.536123096942902 ], [ 14200151.294821120798588, 4344037.439226334914565 ], [ 14200150.099800415337086, 4344033.499771017581224 ], [ 14200148.159192090854049, 4344029.86914820317179 ], [ 14200145.547572636976838, 4344026.6868806919083 ], [ 14200142.365305125713348, 4344024.075261238962412 ], [ 14200138.734682312235236, 4344022.134652914479375 ], [ 14200134.795226994901896, 4344020.93963220808655 ], [ 14200130.698330232873559, 4344020.536123096942902 ], [ 14200126.601433470845222, 4344020.93963220808655 ], [ 14200122.661978153511882, 4344022.134652914479375 ], [ 14200119.03135534003377, 4344024.075261238962412 ], [ 14200115.84908782877028, 4344026.6868806919083 ], [ 14200114.958678215742111, 4344027.771847942844033 ], [ 14200112.108723135665059, 4344028.636372365988791 ], [ 14200108.478100322186947, 4344030.576980690471828 ], [ 14200105.295832810923457, 4344033.188600143417716 ], [ 14200104.405434850603342, 4344034.273553196340799 ], [ 14200101.555455604568124, 4344035.138084949925542 ], [ 14200097.924832791090012, 4344037.078693274408579 ], [ 14200094.742565279826522, 4344039.690312727354467 ], [ 14200093.85217897221446, 4344040.7752515822649 ], [ 14200091.002175562083721, 4344041.639790665358305 ], [ 14200087.371552748605609, 4344043.580398989841342 ], [ 14200084.189285237342119, 4344046.19201844278723 ], [ 14200083.298910584300756, 4344047.276943096891046 ], [ 14200080.448883002623916, 4344048.14148951228708 ], [ 14200076.818260189145803, 4344050.082097836770117 ], [ 14200073.635992677882314, 4344052.693717289716005 ], [ 14200072.745629671961069, 4344053.778627750463784 ], [ 14200069.895577935501933, 4344054.643181493505836 ], [ 14200066.264955122023821, 4344056.583789817988873 ], [ 14200063.082687610760331, 4344059.195409270934761 ], [ 14200062.19233625754714, 4344060.280305533669889 ], [ 14200059.342260351404548, 4344061.144866608083248 ], [ 14200055.711637537926435, 4344063.085474932566285 ], [ 14200052.529370026662946, 4344065.697094385512173 ], [ 14200051.639030329883099, 4344066.781976444646716 ], [ 14200048.788930250331759, 4344067.646544852294028 ], [ 14200045.158307436853647, 4344069.587153176777065 ], [ 14200041.976039925590158, 4344072.198772629722953 ], [ 14200041.085711877793074, 4344073.283640495501459 ], [ 14200038.235587641596794, 4344074.148216230794787 ], [ 14200034.604964828118682, 4344076.088824555277824 ], [ 14200031.422697316855192, 4344078.700444008223712 ], [ 14200030.532380925491452, 4344079.78529766947031 ], [ 14200027.682232515886426, 4344080.649880737997591 ], [ 14200024.051609702408314, 4344082.590489062480628 ], [ 14200020.869342191144824, 4344085.202108515426517 ], [ 14200019.979037450626493, 4344086.286947979591787 ], [ 14200017.12886487878859, 4344087.15153837762773 ], [ 14200013.498242065310478, 4344089.092146702110767 ], [ 14200010.315974554046988, 4344091.703766155056655 ], [ 14200009.304493205621839, 4344092.936259742826223 ], [ 14200006.735372181981802, 4344093.715594085864723 ], [ 14200003.10474936850369, 4344095.65620241034776 ], [ 14199999.9224818572402, 4344098.267821863293648 ], [ 14199998.911011720076203, 4344099.500301790423691 ], [ 14199996.341867031529546, 4344100.279643312096596 ], [ 14199992.711244218051434, 4344102.220251636579633 ], [ 14199989.528976706787944, 4344104.831871089525521 ], [ 14199988.517517779022455, 4344106.064337358810008 ], [ 14199985.948349425569177, 4344106.843686059117317 ], [ 14199982.317726612091064, 4344108.784294383600354 ], [ 14199979.135459100827575, 4344111.395913836546242 ], [ 14199978.124011376872659, 4344112.62836645450443 ], [ 14199975.554819371551275, 4344113.407722328789532 ], [ 14199971.924196558073163, 4344115.348330653272569 ], [ 14199968.741929046809673, 4344117.959950106218457 ], [ 14199967.73049253039062, 4344119.192389067262411 ], [ 14199965.161276865750551, 4344119.971752119250596 ], [ 14199961.530654052272439, 4344121.912360443733633 ], [ 14199958.348386541008949, 4344124.523979896679521 ], [ 14199957.336961228400469, 4344125.756405206397176 ], [ 14199954.767721911892295, 4344126.535775432363153 ], [ 14199951.137099098414183, 4344128.476383756846189 ], [ 14199947.954831587150693, 4344131.088003209792078 ], [ 14199946.943417485803366, 4344132.320414857938886 ], [ 14199944.374154502525926, 4344133.09979226347059 ], [ 14199940.743531689047813, 4344135.040400587953627 ], [ 14199937.561264177784324, 4344137.652020040899515 ], [ 14199936.549861282110214, 4344138.884418033994734 ], [ 14199933.980574639514089, 4344139.663802617229521 ], [ 14199930.349951826035976, 4344141.604410941712558 ], [ 14199927.167684314772487, 4344144.216030394658446 ], [ 14199926.15629263035953, 4344145.448414728045464 ], [ 14199923.586982324719429, 4344146.227806488983333 ], [ 14199919.956359511241317, 4344148.16841481346637 ], [ 14199916.774092, 4344150.780034266412258 ], [ 14199915.762711517512798, 4344152.012404950335622 ], [ 14199913.193377561867237, 4344152.791803885251284 ], [ 14199909.562754748389125, 4344154.732412209734321 ], [ 14199906.380487237125635, 4344157.344031662680209 ], [ 14199905.125781953334808, 4344158.87289447337389 ], [ 14199903.200535371899605, 4344159.45691163931042 ], [ 14199899.569912558421493, 4344161.397519963793457 ], [ 14199896.387645047158003, 4344164.009139416739345 ], [ 14199895.132949911057949, 4344165.537989862263203 ], [ 14199893.207681003957987, 4344166.122013800777495 ], [ 14199889.577058190479875, 4344168.062622125260532 ], [ 14199886.394790679216385, 4344170.67424157820642 ], [ 14199885.140105672180653, 4344172.203079681843519 ], [ 14199883.214814459905028, 4344172.787110386416316 ], [ 14199879.584191646426916, 4344174.727718710899353 ], [ 14199876.401924135163426, 4344177.339338163845241 ], [ 14199875.147249273955822, 4344178.868163905106485 ], [ 14199873.221935739740729, 4344179.452201381325722 ], [ 14199869.591312926262617, 4344181.392809705808759 ], [ 14199866.409045414999127, 4344184.004429158754647 ], [ 14199865.154380697757006, 4344185.53324253950268 ], [ 14199863.229044839739799, 4344186.117286787368357 ], [ 14199859.598422026261687, 4344188.057895111851394 ], [ 14199856.416154514998198, 4344190.669514564797282 ], [ 14199855.161499939858913, 4344192.198315588757396 ], [ 14199853.236141765490174, 4344192.782366605475545 ], [ 14199849.605518952012062, 4344194.722974929958582 ], [ 14199846.423251440748572, 4344197.33459438290447 ], [ 14199845.1686069983989, 4344198.863383059389889 ], [ 14199843.243226515129209, 4344199.447440844029188 ], [ 14199839.612603701651096, 4344201.388049168512225 ], [ 14199836.430336190387607, 4344203.999668621458113 ], [ 14199835.175701890140772, 4344205.528444939292967 ], [ 14199833.250299090519547, 4344206.112509493716061 ], [ 14199829.619676277041435, 4344208.053117818199098 ], [ 14199826.437408765777946, 4344210.664737271144986 ], [ 14199825.182784611359239, 4344212.193501225672662 ], [ 14199823.257359486073256, 4344212.777572552673519 ], [ 14199819.626736672595143, 4344214.718180877156556 ], [ 14199816.444469161331654, 4344217.329800330102444 ], [ 14199815.189855147153139, 4344218.858551928773522 ], [ 14199813.264407701790333, 4344219.442630026489496 ], [ 14199809.633784888312221, 4344221.383238350972533 ], [ 14199806.451517377048731, 4344223.994857803918421 ], [ 14199804.299329563975334, 4344226.617306240834296 ], [ 14199801.402265576645732, 4344227.496120993979275 ], [ 14199797.77164276316762, 4344229.436729318462312 ], [ 14199794.58937525190413, 4344232.0483487714082 ], [ 14199792.43720162473619, 4344234.67077992297709 ], [ 14199789.54010596871376, 4344235.549604282714427 ], [ 14199785.909483155235648, 4344237.490212607197464 ], [ 14199782.727215643972158, 4344240.101832060143352 ], [ 14199780.575056197121739, 4344242.724245933815837 ], [ 14199777.677928892895579, 4344243.603079893626273 ], [ 14199774.047306079417467, 4344245.54368821810931 ], [ 14199770.865038568153977, 4344248.155307671055198 ], [ 14199768.712893288582563, 4344250.77770428173244 ], [ 14199765.815734338015318, 4344251.656547841615975 ], [ 14199762.185111524537206, 4344253.597156166099012 ], [ 14199759.002844013273716, 4344256.2087756190449 ], [ 14199756.850712919607759, 4344258.831154942512512 ], [ 14199753.953522307798266, 4344259.710008107125759 ], [ 14199750.322899494320154, 4344261.650616431608796 ], [ 14199747.140631983056664, 4344264.262235884554684 ], [ 14199744.988515058532357, 4344266.884597943164408 ], [ 14199742.091292805969715, 4344267.763460705988109 ], [ 14199738.460669992491603, 4344269.704069030471146 ], [ 14199735.278402481228113, 4344272.315688483417034 ], [ 14199733.126299744471908, 4344274.938033255748451 ], [ 14199730.229045825079083, 4344275.816905624233186 ], [ 14199726.598423011600971, 4344277.757513948716223 ], [ 14199723.416155500337481, 4344280.369133401662111 ], [ 14199721.264066938310862, 4344282.991460900753736 ], [ 14199718.366781368851662, 4344283.870342870242894 ], [ 14199714.736158555373549, 4344285.810951194725931 ], [ 14199711.55389104411006, 4344288.422570647671819 ], [ 14199709.401816656813025, 4344291.044880875386298 ], [ 14199706.50449944101274, 4344291.923772444948554 ], [ 14199702.873876627534628, 4344293.864380769431591 ], [ 14199699.691609116271138, 4344296.476000222377479 ], [ 14199697.539548905566335, 4344299.098293174989522 ], [ 14199694.642200039699674, 4344299.9771943455562 ], [ 14199691.011577226221561, 4344301.917802670039237 ], [ 14199687.829309714958072, 4344304.529422122985125 ], [ 14199686.209721742197871, 4344306.502895776182413 ], [ 14199684.097723864018917, 4344307.14356332924217 ], [ 14199680.467101050540805, 4344309.084171653725207 ], [ 14199677.284833539277315, 4344311.695791106671095 ], [ 14199675.665256757289171, 4344313.669251124374568 ], [ 14199673.553233865648508, 4344314.309926264919341 ], [ 14199669.922611052170396, 4344316.250534589402378 ], [ 14199666.740343540906906, 4344318.862154042348266 ], [ 14199665.120777955278754, 4344320.835600417107344 ], [ 14199663.008730044588447, 4344321.476283146999776 ], [ 14199659.378107231110334, 4344323.416891471482813 ], [ 14199656.195839719846845, 4344326.028510924428701 ], [ 14199654.57628532871604, 4344328.001943659037352 ], [ 14199652.464212400838733, 4344328.642633977346122 ], [ 14199648.83358958736062, 4344330.583242301829159 ], [ 14199645.651322076097131, 4344333.194861754775047 ], [ 14199644.031778892502189, 4344335.168280832469463 ], [ 14199641.919680928811431, 4344335.80897874571383 ], [ 14199638.289058115333319, 4344337.749587070196867 ], [ 14199635.106790604069829, 4344340.361206523142755 ], [ 14199633.487258614972234, 4344342.334611960686743 ], [ 14199631.375135639682412, 4344342.975317461416125 ], [ 14199627.7445128262043, 4344344.915925785899162 ], [ 14199624.56224531494081, 4344347.52754523884505 ], [ 14199622.942724518477917, 4344349.500937038101256 ], [ 14199620.830576526001096, 4344350.141650127246976 ], [ 14199617.199953712522984, 4344352.082258451730013 ], [ 14199614.017686201259494, 4344354.693877904675901 ], [ 14199612.398176610469818, 4344356.66725604981184 ], [ 14199610.286003587767482, 4344357.307976732030511 ], [ 14199606.65538077428937, 4344359.248585056513548 ], [ 14199603.47311326302588, 4344361.860204509459436 ], [ 14199601.853614868596196, 4344363.833569012582302 ], [ 14199599.741416826844215, 4344364.474297284148633 ], [ 14199596.110794013366103, 4344366.41490560863167 ], [ 14199592.928526502102613, 4344369.026525061577559 ], [ 14199591.309039304032922, 4344370.999875920824707 ], [ 14199589.196816243231297, 4344371.640611781738698 ], [ 14199585.566193429753184, 4344373.581220106221735 ], [ 14199582.383925918489695, 4344376.192839559167624 ], [ 14199580.235224252566695, 4344378.811040113680065 ], [ 14199579.774786297231913, 4344378.950712440535426 ], [ 14199576.1441634837538, 4344380.891320765018463 ], [ 14199572.961895972490311, 4344383.502940217964351 ], [ 14199570.813202591612935, 4344386.121130676008761 ], [ 14199570.352743705734611, 4344386.260809352621436 ], [ 14199566.722120892256498, 4344388.201417677104473 ], [ 14199563.539853380993009, 4344390.813037130050361 ], [ 14199561.391168273985386, 4344393.431217506527901 ], [ 14199560.93068846128881, 4344393.570902531035244 ], [ 14199557.300065647810698, 4344395.511510855518281 ], [ 14199554.117798136547208, 4344398.12313030846417 ], [ 14199551.969121314585209, 4344400.741300590336323 ], [ 14199551.508620571345091, 4344400.880991963669658 ], [ 14199547.877997757866979, 4344402.821600288152695 ], [ 14199544.695730246603489, 4344405.433219741098583 ], [ 14199542.547061696648598, 4344408.051379944197834 ], [ 14199542.086540030315518, 4344408.191077664494514 ], [ 14199538.455917216837406, 4344410.131685988977551 ], [ 14199535.273649705573916, 4344412.74330544192344 ], [ 14199533.124989435076714, 4344415.361455556005239 ], [ 14199532.664446841925383, 4344415.501159624196589 ], [ 14199529.03382402844727, 4344417.441767948679626 ], [ 14199525.851556517183781, 4344420.053387401625514 ], [ 14199523.702904520556331, 4344422.671527434140444 ], [ 14199523.242341004312038, 4344422.811237849295139 ], [ 14199519.611718190833926, 4344424.751846173778176 ], [ 14199516.429450679570436, 4344427.363465626724064 ], [ 14199514.280806969851255, 4344429.98159556183964 ], [ 14199513.820222515612841, 4344430.121312328614295 ], [ 14199510.189599702134728, 4344432.061920653097332 ], [ 14199507.007332190871239, 4344434.67354010604322 ], [ 14199504.858696749433875, 4344437.291659965179861 ], [ 14199504.398091381415725, 4344437.431383076123893 ], [ 14199500.767468567937613, 4344439.37199140060693 ], [ 14199497.585201056674123, 4344441.983610853552818 ], [ 14199495.436573902145028, 4344444.601720616221428 ], [ 14199494.975947596132755, 4344444.741450078785419 ], [ 14199491.345324782654643, 4344446.682058403268456 ], [ 14199488.163057271391153, 4344449.293677856214345 ], [ 14199485.551437817513943, 4344452.475945367477834 ], [ 14199483.610829493030906, 4344456.106568181887269 ], [ 14199482.415808787569404, 4344460.04602349922061 ], [ 14199482.012299675494432, 4344464.142920261248946 ], [ 14199482.415808787569404, 4344468.239817023277283 ], [ 14199483.610829493030906, 4344472.179272340610623 ], [ 14199485.551437817513943, 4344475.809895155020058 ], [ 14199488.163057271391153, 4344478.992162666283548 ], [ 14199491.345324782654643, 4344481.603782119229436 ], [ 14199494.975947596132755, 4344483.544390443712473 ], [ 14199498.915402913466096, 4344484.739411150105298 ], [ 14199503.012299675494432, 4344485.142920261248946 ], [ 14199507.109196437522769, 4344484.739411150105298 ], [ 14199511.04865175485611, 4344483.544390443712473 ], [ 14199514.679274568334222, 4344481.603782119229436 ], [ 14199517.861542079597712, 4344478.992162666283548 ], [ 14199520.010169234126806, 4344476.374052903614938 ], [ 14199520.470795540139079, 4344476.234323441050947 ], [ 14199524.101418353617191, 4344474.29371511656791 ], [ 14199527.283685864880681, 4344471.682095663622022 ], [ 14199529.432321306318045, 4344469.063975804485381 ], [ 14199529.892926674336195, 4344468.924252693541348 ], [ 14199533.523549487814307, 4344466.983644369058311 ], [ 14199536.705817, 4344464.372024916112423 ], [ 14199538.854460708796978, 4344461.753894980996847 ], [ 14199539.315045163035393, 4344461.614178214222193 ], [ 14199542.945667976513505, 4344459.673569889739156 ], [ 14199546.127935487776995, 4344457.061950436793268 ], [ 14199548.276587484404445, 4344454.443810404278338 ], [ 14199548.737151, 4344454.304099989123642 ], [ 14199552.367773814126849, 4344452.363491664640605 ], [ 14199555.550041325390339, 4344449.751872211694717 ], [ 14199557.698701595887542, 4344447.133722097612917 ], [ 14199558.159244189038873, 4344446.994018029421568 ], [ 14199561.789867002516985, 4344445.053409704938531 ], [ 14199564.972134513780475, 4344442.441790251992643 ], [ 14199567.120803063735366, 4344439.823630048893392 ], [ 14199567.581324730068445, 4344439.683932328596711 ], [ 14199571.211947543546557, 4344437.743324004113674 ], [ 14199574.394215054810047, 4344435.131704551167786 ], [ 14199576.542891876772046, 4344432.513534269295633 ], [ 14199577.003392620012164, 4344432.373842895962298 ], [ 14199580.634015433490276, 4344430.433234571479261 ], [ 14199583.816282944753766, 4344427.821615118533373 ], [ 14199585.964968051761389, 4344425.203434742055833 ], [ 14199586.425447864457965, 4344425.06374971754849 ], [ 14199590.056070677936077, 4344423.123141393065453 ], [ 14199593.238338189199567, 4344420.511521940119565 ], [ 14199595.387031570076942, 4344417.893331482075155 ], [ 14199595.847490455955267, 4344417.75365280546248 ], [ 14199599.478113269433379, 4344415.813044480979443 ], [ 14199602.660380780696869, 4344413.201425028033555 ], [ 14199604.809082446619868, 4344410.583224473521113 ], [ 14199605.269520401954651, 4344410.443552146665752 ], [ 14199608.900143215432763, 4344408.502943822182715 ], [ 14199612.082410726696253, 4344405.891324369236827 ], [ 14199613.701897924765944, 4344403.917973509989679 ], [ 14199615.81412098556757, 4344403.277237649075687 ], [ 14199619.444743799045682, 4344401.33662932459265 ], [ 14199622.627011310309172, 4344398.725009871646762 ], [ 14199624.246509704738855, 4344396.751645368523896 ], [ 14199626.358707746490836, 4344396.110917096957564 ], [ 14199629.989330559968948, 4344394.170308772474527 ], [ 14199633.171598071232438, 4344391.558689319528639 ], [ 14199634.791107662022114, 4344389.5853111743927 ], [ 14199636.90328068472445, 4344388.944590492174029 ], [ 14199640.533903498202562, 4344387.003982167690992 ], [ 14199643.716171009466052, 4344384.392362714745104 ], [ 14199645.335691805928946, 4344382.418970915488899 ], [ 14199647.447839798405766, 4344381.778257826343179 ], [ 14199651.078462611883879, 4344379.837649501860142 ], [ 14199654.260730123147368, 4344377.226030048914254 ], [ 14199655.880262112244964, 4344375.252624611370265 ], [ 14199657.992385087534785, 4344374.611919110640883 ], [ 14199661.623007901012897, 4344372.671310786157846 ], [ 14199664.805275412276387, 4344370.059691333211958 ], [ 14199666.424818595871329, 4344368.086272255517542 ], [ 14199668.536916559562087, 4344367.445574342273176 ], [ 14199672.167539373040199, 4344365.504966017790139 ], [ 14199675.349806884303689, 4344362.893346564844251 ], [ 14199676.969361275434494, 4344360.9199138302356 ], [ 14199679.081434203311801, 4344360.27922351192683 ], [ 14199682.712057016789913, 4344358.338615187443793 ], [ 14199685.894324528053403, 4344355.726995734497905 ], [ 14199687.513890113681555, 4344353.753549359738827 ], [ 14199689.625938024371862, 4344353.112866629846394 ], [ 14199693.256560837849975, 4344351.172258305363357 ], [ 14199696.438828349113464, 4344348.560638852417469 ], [ 14199698.058405131101608, 4344346.587178834713995 ], [ 14199700.170428022742271, 4344345.946503694169223 ], [ 14199703.801050836220384, 4344344.005895369686186 ], [ 14199706.983318347483873, 4344341.394275916740298 ], [ 14199708.602906320244074, 4344339.42080226354301 ], [ 14199710.714904198423028, 4344338.780134710483253 ], [ 14199714.34552701190114, 4344336.839526386000216 ], [ 14199717.52779452316463, 4344334.227906933054328 ], [ 14199719.679854733869433, 4344331.605613980442286 ], [ 14199722.577203599736094, 4344330.726712809875607 ], [ 14199726.207826413214207, 4344328.78610448539257 ], [ 14199729.390093924477696, 4344326.174485032446682 ], [ 14199731.542168311774731, 4344323.552174804732203 ], [ 14199734.439485527575016, 4344322.673283235169947 ], [ 14199738.070108341053128, 4344320.73267491068691 ], [ 14199741.252375852316618, 4344318.121055457741022 ], [ 14199743.404464414343238, 4344315.498727958649397 ], [ 14199746.301749983802438, 4344314.61984598916024 ], [ 14199749.93237279728055, 4344312.679237664677203 ], [ 14199753.11464030854404, 4344310.067618211731315 ], [ 14199755.266743045300245, 4344307.445273439399898 ], [ 14199758.163996964693069, 4344306.566401070915163 ], [ 14199761.794619778171182, 4344304.625792746432126 ], [ 14199764.976887289434671, 4344302.014173293486238 ], [ 14199767.129004213958979, 4344299.391811234876513 ], [ 14199770.026226466521621, 4344298.512948472052813 ], [ 14199773.656849279999733, 4344296.572340147569776 ], [ 14199776.839116791263223, 4344293.960720694623888 ], [ 14199778.99124788492918, 4344291.338341371156275 ], [ 14199781.888438496738672, 4344290.459488206543028 ], [ 14199785.519061310216784, 4344288.518879882059991 ], [ 14199788.701328821480274, 4344285.907260429114103 ], [ 14199790.853474101051688, 4344283.284863818436861 ], [ 14199793.750633051618934, 4344282.406020258553326 ], [ 14199797.381255865097046, 4344280.465411934070289 ], [ 14199800.563523376360536, 4344277.853792481124401 ], [ 14199802.715682823210955, 4344275.231378607451916 ], [ 14199805.612810127437115, 4344274.35254464764148 ], [ 14199809.243432940915227, 4344272.411936323158443 ], [ 14199812.425700452178717, 4344269.800316870212555 ], [ 14199814.577874079346657, 4344267.177885718643665 ], [ 14199817.474969735369086, 4344266.299061358906329 ], [ 14199821.105592548847198, 4344264.358453034423292 ], [ 14199824.287860060110688, 4344261.746833581477404 ], [ 14199826.440047873184085, 4344259.124385144561529 ], [ 14199829.337111860513687, 4344258.24557039141655 ], [ 14199832.967734673991799, 4344256.304962066933513 ], [ 14199836.150002185255289, 4344253.693342613987625 ], [ 14199837.404616199433804, 4344252.164591015316546 ], [ 14199839.33006364479661, 4344251.580512917600572 ], [ 14199842.960686458274722, 4344249.639904593117535 ], [ 14199846.142953969538212, 4344247.028285140171647 ], [ 14199847.397578123956919, 4344245.499521185643971 ], [ 14199849.323003249242902, 4344244.915449858643115 ], [ 14199852.953626062721014, 4344242.974841534160078 ], [ 14199856.135893573984504, 4344240.36322208121419 ], [ 14199857.390527874231339, 4344238.834445763379335 ], [ 14199859.315930673852563, 4344238.250381208956242 ], [ 14199862.946553487330675, 4344236.309772884473205 ], [ 14199866.128820998594165, 4344233.698153431527317 ], [ 14199867.383465440943837, 4344232.169364755041897 ], [ 14199869.308845924213529, 4344231.585306970402598 ], [ 14199872.939468737691641, 4344229.644698645919561 ], [ 14199876.121736248955131, 4344227.033079192973673 ], [ 14199877.376390824094415, 4344225.50427816901356 ], [ 14199879.301748998463154, 4344224.920227152295411 ], [ 14199882.932371811941266, 4344222.979618827812374 ], [ 14199886.114639323204756, 4344220.367999374866486 ], [ 14199887.369304040446877, 4344218.839185994118452 ], [ 14199889.294639898464084, 4344218.255141746252775 ], [ 14199892.925262711942196, 4344216.314533421769738 ], [ 14199896.107530223205686, 4344213.70291396882385 ], [ 14199897.36220508441329, 4344212.174088227562606 ], [ 14199899.287518618628383, 4344211.590050751343369 ], [ 14199902.918141432106495, 4344209.649442426860332 ], [ 14199906.100408943369985, 4344207.037822973914444 ], [ 14199907.355093950405717, 4344205.508984870277345 ], [ 14199909.280385162681341, 4344204.924954165704548 ], [ 14199912.911007976159453, 4344202.984345841221511 ], [ 14199916.093275487422943, 4344200.372726388275623 ], [ 14199917.347970623522997, 4344198.843875942751765 ], [ 14199919.273239530622959, 4344198.259852004237473 ], [ 14199922.903862344101071, 4344196.319243679754436 ], [ 14199926.086129855364561, 4344193.707624226808548 ], [ 14199927.340835139155388, 4344192.178761416114867 ], [ 14199929.266081720590591, 4344191.594744250178337 ], [ 14199932.896704534068704, 4344189.6541359256953 ], [ 14199936.078972045332193, 4344187.042516472749412 ], [ 14199937.090352527797222, 4344185.810145788826048 ], [ 14199939.659686483442783, 4344185.030746853910387 ], [ 14199943.290309296920896, 4344183.09013852942735 ], [ 14199946.472576808184385, 4344180.478519076481462 ], [ 14199947.483968492597342, 4344179.246134743094444 ], [ 14199950.053278798237443, 4344178.466742982156575 ], [ 14199953.683901611715555, 4344176.526134657673538 ], [ 14199956.866169122979045, 4344173.91451520472765 ], [ 14199957.877572018653154, 4344172.682117211632431 ], [ 14199960.44685866124928, 4344171.902732628397644 ], [ 14199964.077481474727392, 4344169.962124303914607 ], [ 14199967.259748985990882, 4344167.350504850968719 ], [ 14199968.271163087338209, 4344166.11809320282191 ], [ 14199970.840426070615649, 4344165.338715797290206 ], [ 14199974.471048884093761, 4344163.398107472807169 ], [ 14199977.653316395357251, 4344160.786488019861281 ], [ 14199978.664741707965732, 4344159.554062710143626 ], [ 14199981.233981024473906, 4344158.774692484177649 ], [ 14199984.864603837952018, 4344156.834084159694612 ], [ 14199988.046871349215508, 4344154.222464706748724 ], [ 14199989.058307865634561, 4344152.99002574570477 ], [ 14199991.62752353027463, 4344152.210662693716586 ], [ 14199995.258146343752742, 4344150.270054369233549 ], [ 14199998.440413855016232, 4344147.658434916287661 ], [ 14199999.451861578971148, 4344146.425982298329473 ], [ 14200002.021053584292531, 4344145.646626424044371 ], [ 14200005.651676397770643, 4344143.706018099561334 ], [ 14200008.833943909034133, 4344141.094398646615446 ], [ 14200009.845402836799622, 4344139.861932377330959 ], [ 14200012.4145711902529, 4344139.082583677023649 ], [ 14200016.045194003731012, 4344137.141975352540612 ], [ 14200019.227461514994502, 4344134.530355899594724 ], [ 14200020.238931652158499, 4344133.297875972464681 ], [ 14200022.808076340705156, 4344132.518534450791776 ], [ 14200026.438699154183269, 4344130.577926126308739 ], [ 14200029.620966665446758, 4344127.966306673362851 ], [ 14200030.632448013871908, 4344126.733813085593283 ], [ 14200033.201569037511945, 4344125.954478742554784 ], [ 14200036.832191850990057, 4344124.013870418071747 ], [ 14200040.014459362253547, 4344121.402250965125859 ], [ 14200040.904764102771878, 4344120.317411500960588 ], [ 14200043.75493667460978, 4344119.452821102924645 ], [ 14200047.385559488087893, 4344117.512212778441608 ], [ 14200050.567827, 4344114.90059332549572 ], [ 14200051.458143390715122, 4344113.815739664249122 ], [ 14200054.308291800320148, 4344112.951156595721841 ], [ 14200057.938914613798261, 4344111.010548271238804 ], [ 14200061.12118212506175, 4344108.398928818292916 ], [ 14200062.011510172858834, 4344107.31406095251441 ], [ 14200064.861634409055114, 4344106.449485217221081 ], [ 14200068.492257222533226, 4344104.508876892738044 ], [ 14200071.674524733796716, 4344101.897257439792156 ], [ 14200072.564864430576563, 4344100.812375380657613 ], [ 14200075.414964510127902, 4344099.947806973010302 ], [ 14200079.045587323606014, 4344098.007198648527265 ], [ 14200082.227854834869504, 4344095.395579195581377 ], [ 14200083.118206188082695, 4344094.310682932846248 ], [ 14200085.968282094225287, 4344093.446121858432889 ], [ 14200089.5989049077034, 4344091.505513533949852 ], [ 14200092.781172418966889, 4344088.893894081003964 ], [ 14200093.671535424888134, 4344087.808983620256186 ], [ 14200096.52158716134727, 4344086.944429877214134 ], [ 14200100.152209974825382, 4344085.003821552731097 ], [ 14200103.334477486088872, 4344082.392202099785209 ], [ 14200104.224852139130235, 4344081.307277445681393 ], [ 14200107.074879720807076, 4344080.442731030285358 ], [ 14200110.705502534285188, 4344078.502122705802321 ], [ 14200113.887770045548677, 4344075.890503252856433 ], [ 14200114.778156353160739, 4344074.805564397946 ], [ 14200117.628159763291478, 4344073.941025314852595 ], [ 14200121.25878257676959, 4344072.000416990369558 ], [ 14200124.44105008803308, 4344069.38879753742367 ], [ 14200125.331448048353195, 4344068.303844484500587 ], [ 14200128.181427294388413, 4344067.439312730915844 ], [ 14200131.812050107866526, 4344065.498704406432807 ], [ 14200134.994317619130015, 4344062.887084953486919 ], [ 14200135.884727232158184, 4344061.802117702551186 ], [ 14200138.734682312235236, 4344060.937593279406428 ], [ 14200142.365305125713348, 4344058.996984954923391 ], [ 14200145.547572636976838, 4344056.385365501977503 ], [ 14200148.159192090854049, 4344053.203097990714014 ], [ 14200150.099800415337086, 4344049.572475176304579 ], [ 14200151.294821120798588, 4344045.633019858971238 ], [ 14200151.698330232873559, 4344041.536123096942902 ]]]),
  });
  loadFeaturesE3.setId('3E');

  var loadFeaturesS3 = new ol.Feature({
    geometry: new Polygon([[[ 14200109.165855685248971, 4343967.161825799383223 ], [ 14200108.762346573174, 4343963.064929037354887 ], [ 14200107.567325867712498, 4343959.125473720021546 ], [ 14200105.626717543229461, 4343955.494850905612111 ], [ 14200103.01509808935225, 4343952.312583394348621 ], [ 14200099.83283057808876, 4343949.700963941402733 ], [ 14200096.202207764610648, 4343947.760355616919696 ], [ 14200092.262752447277308, 4343946.565334910526872 ], [ 14200088.165855685248971, 4343946.161825799383223 ], [ 14200084.068958923220634, 4343946.565334910526872 ], [ 14200080.129503605887294, 4343947.760355616919696 ], [ 14200076.498880792409182, 4343949.700963941402733 ], [ 14200073.316613281145692, 4343952.312583394348621 ], [ 14200072.114399142563343, 4343953.777485559694469 ], [ 14200069.22141782566905, 4343954.655061848461628 ], [ 14200065.590795012190938, 4343956.595670172944665 ], [ 14200062.408527500927448, 4343959.207289625890553 ], [ 14200061.206325704231858, 4343960.672176754102111 ], [ 14200058.313318321481347, 4343961.549760949797928 ], [ 14200054.682695508003235, 4343963.490369274280965 ], [ 14200051.500427996739745, 4343966.101988727226853 ], [ 14200050.298238540068269, 4343967.566860819235444 ], [ 14200047.405205093324184, 4343968.444452920928597 ], [ 14200043.774582279846072, 4343970.385061245411634 ], [ 14200040.592314768582582, 4343972.996680698357522 ], [ 14200039.39013765193522, 4343974.461537753231823 ], [ 14200036.497078137472272, 4343975.339137762784958 ], [ 14200032.86645532399416, 4343977.279746087267995 ], [ 14200029.68418781273067, 4343979.891365540213883 ], [ 14200028.482023037970066, 4343981.356207556091249 ], [ 14200025.588937452062964, 4343982.233815474435687 ], [ 14200021.958314638584852, 4343984.174423798918724 ], [ 14200018.776047127321362, 4343986.786043251864612 ], [ 14200017.573894686996937, 4343988.250870238989592 ], [ 14200014.680783040821552, 4343989.128486062400043 ], [ 14200011.05016022734344, 4343991.06909438688308 ], [ 14200007.86789271607995, 4343993.680713839828968 ], [ 14200006.665752617642283, 4343995.145525787957013 ], [ 14200003.772614905610681, 4343996.023149518296123 ], [ 14200000.141992092132568, 4343997.96375784277916 ], [ 14199996.959724580869079, 4344000.575377295725048 ], [ 14199995.757596824318171, 4344002.040174203924835 ], [ 14199992.864433042705059, 4344002.917805843055248 ], [ 14199989.233810229226947, 4344004.858414167538285 ], [ 14199986.051542717963457, 4344007.470033620484173 ], [ 14199984.849427303299308, 4344008.934815492480993 ], [ 14199981.956237446516752, 4344009.81245504040271 ], [ 14199978.32561463303864, 4344011.753063364885747 ], [ 14199975.14334712177515, 4344014.364682817831635 ], [ 14199973.941244054585695, 4344015.829449642449617 ], [ 14199971.048028133809566, 4344016.707097097299993 ], [ 14199967.417405320331454, 4344018.64770542178303 ], [ 14199964.235137809067965, 4344021.259324874728918 ], [ 14199962.253821197897196, 4344023.673566150479019 ], [ 14199960.517706474289298, 4344024.20021079480648 ], [ 14199956.887083660811186, 4344026.140819119289517 ], [ 14199953.704816149547696, 4344028.752438572235405 ], [ 14199951.723510466516018, 4344031.166666531004012 ], [ 14199949.987370360642672, 4344031.693318874575198 ], [ 14199946.356747547164559, 4344033.633927199058235 ], [ 14199943.17448003590107, 4344036.245546652004123 ], [ 14199941.193185253068805, 4344038.659761329181492 ], [ 14199939.457019796594977, 4344039.186421362683177 ], [ 14199935.826396983116865, 4344041.127029687166214 ], [ 14199932.644129471853375, 4344043.738649140112102 ], [ 14199930.662845620885491, 4344046.152850497514009 ], [ 14199928.926654774695635, 4344046.679518233053386 ], [ 14199925.296031961217523, 4344048.620126557536423 ], [ 14199922.113764449954033, 4344051.231746010482311 ], [ 14199920.132491497322917, 4344053.645934087224305 ], [ 14199918.39627530425787, 4344054.172609511762857 ], [ 14199914.765652490779757, 4344056.113217836245894 ], [ 14199911.583384979516268, 4344058.724837289191782 ], [ 14199909.602122951298952, 4344061.139012055471539 ], [ 14199907.865881377831101, 4344061.665695179253817 ], [ 14199904.235258564352989, 4344063.606303503736854 ], [ 14199901.052991053089499, 4344066.217922956682742 ], [ 14199899.071739928796887, 4344068.632084435783327 ], [ 14199897.335472997277975, 4344069.158775251358747 ], [ 14199893.704850183799863, 4344071.099383575841784 ], [ 14199890.522582672536373, 4344073.711003028787673 ], [ 14199888.541342472657561, 4344076.125151195563376 ], [ 14199886.805050162598491, 4344076.651849710382521 ], [ 14199883.174427349120378, 4344078.592458034865558 ], [ 14199879.992159837856889, 4344081.204077487811446 ], [ 14199878.010930543765426, 4344083.618212367407978 ], [ 14199876.274612879380584, 4344084.144918573088944 ], [ 14199872.643990065902472, 4344086.085526897571981 ], [ 14199869.461722554638982, 4344088.697146350517869 ], [ 14199867.480504181236029, 4344091.111267923377454 ], [ 14199865.744161142036319, 4344091.6379818264395 ], [ 14199862.113538328558207, 4344093.578590150922537 ], [ 14199858.931270817294717, 4344096.190209603868425 ], [ 14199857.355127885937691, 4344098.110745321027935 ], [ 14199857.254297370091081, 4344098.141331924125552 ], [ 14199853.623674556612968, 4344100.081940248608589 ], [ 14199850.441407045349479, 4344102.693559701554477 ], [ 14199848.865270903334022, 4344104.614087147638202 ], [ 14199848.764423463493586, 4344104.644678884185851 ], [ 14199845.133800650015473, 4344106.585287208668888 ], [ 14199841.951533138751984, 4344109.196906661614776 ], [ 14199840.375403771176934, 4344111.117425853386521 ], [ 14199840.274539422243834, 4344111.148022718727589 ], [ 14199836.643916608765721, 4344113.088631043210626 ], [ 14199833.461649097502232, 4344115.700250496156514 ], [ 14199831.885526513680816, 4344117.620761420577765 ], [ 14199831.784645244479179, 4344117.651363419368863 ], [ 14199828.154022431001067, 4344119.5919717438519 ], [ 14199824.971754919737577, 4344122.203591196797788 ], [ 14199823.39563912153244, 4344124.124093852937222 ], [ 14199823.294740932062268, 4344124.154700984247029 ], [ 14199819.664118118584156, 4344126.095309308730066 ], [ 14199816.481850607320666, 4344128.706928761675954 ], [ 14199814.905741583555937, 4344130.627423164434731 ], [ 14199814.8048264849931, 4344130.658035424537957 ], [ 14199811.174203671514988, 4344132.598643749020994 ], [ 14199807.991936160251498, 4344135.210263201966882 ], [ 14199806.415833920240402, 4344137.130749337375164 ], [ 14199806.314901899546385, 4344137.161366730928421 ], [ 14199802.684279086068273, 4344139.101975055411458 ], [ 14199799.502011574804783, 4344141.713594508357346 ], [ 14199797.925916116684675, 4344143.634072381071746 ], [ 14199797.824967183172703, 4344143.664694905281067 ], [ 14199794.194344369694591, 4344145.605303229764104 ], [ 14199791.012076858431101, 4344148.216922682709992 ], [ 14199789.435988176614046, 4344150.137392298318446 ], [ 14199789.335022326558828, 4344150.168019954115152 ], [ 14199785.704399513080716, 4344152.108628278598189 ], [ 14199782.522132001817226, 4344154.720247731544077 ], [ 14199780.946050107479095, 4344156.640709076076746 ], [ 14199780.845067335292697, 4344156.671341865323484 ], [ 14199777.214444521814585, 4344158.611950189806521 ], [ 14199774.032177010551095, 4344161.223569642752409 ], [ 14199771.420557556673884, 4344164.405837154015899 ], [ 14199770.947326397523284, 4344165.291190381161869 ], [ 14199769.465840086340904, 4344165.740594340488315 ], [ 14199765.835217272862792, 4344167.681202664971352 ], [ 14199762.652949761599302, 4344170.29282211791724 ], [ 14199760.041330307722092, 4344173.475089629180729 ], [ 14199759.568106055259705, 4344174.360429936088622 ], [ 14199758.086593868210912, 4344174.809841744601727 ], [ 14199754.4559710547328, 4344176.750450069084764 ], [ 14199751.27370354346931, 4344179.362069522030652 ], [ 14199748.662084089592099, 4344182.544337033294141 ], [ 14199748.188866740092635, 4344183.429664425551891 ], [ 14199746.707328682765365, 4344183.879084082320333 ], [ 14199743.076705869287252, 4344185.81969240680337 ], [ 14199739.894438358023763, 4344188.431311859749258 ], [ 14199737.282818904146552, 4344191.613579371012747 ], [ 14199736.809608463197947, 4344192.498893836513162 ], [ 14199735.328044530004263, 4344192.948321342468262 ], [ 14199731.697421716526151, 4344194.888929666951299 ], [ 14199728.515154205262661, 4344197.500549119897187 ], [ 14199725.90353475138545, 4344200.682816631160676 ], [ 14199725.430331213399768, 4344201.568118183873594 ], [ 14199723.948741413652897, 4344202.017553536221385 ], [ 14199720.318118600174785, 4344203.958161860704422 ], [ 14199717.135851088911295, 4344206.56978131365031 ], [ 14199714.524231635034084, 4344209.7520488249138 ], [ 14199714.051035003736615, 4344210.637337453663349 ], [ 14199712.569419324398041, 4344211.086780657060444 ], [ 14199708.938796510919929, 4344213.027388981543481 ], [ 14199705.756529, 4344215.639008434489369 ], [ 14199703.144909545779228, 4344218.821275945752859 ], [ 14199702.671719823032618, 4344219.706551652401686 ], [ 14199701.190078275278211, 4344220.156002702191472 ], [ 14199697.559455461800098, 4344222.096611026674509 ], [ 14199694.377187950536609, 4344224.708230479620397 ], [ 14199691.765568496659398, 4344227.890497990883887 ], [ 14199691.292385678738356, 4344228.775760779157281 ], [ 14199689.810718256980181, 4344229.225219678133726 ], [ 14199686.180095443502069, 4344231.165828002616763 ], [ 14199682.997827932238579, 4344233.777447455562651 ], [ 14199680.386208478361368, 4344236.959714966826141 ], [ 14199679.913032567128539, 4344237.844964832998812 ], [ 14199678.431339273229241, 4344238.294431580230594 ], [ 14199674.800716459751129, 4344240.235039904713631 ], [ 14199671.618448948487639, 4344242.846659357659519 ], [ 14199669.006829494610429, 4344246.028926868923008 ], [ 14199668.533660486340523, 4344246.914163819514215 ], [ 14199667.051941316574812, 4344247.363638415932655 ], [ 14199663.4213185030967, 4344249.304246740415692 ], [ 14199660.23905099183321, 4344251.91586619336158 ], [ 14199658.141609175130725, 4344254.471606440842152 ], [ 14199655.36596947722137, 4344255.955216769129038 ], [ 14199652.18370196595788, 4344258.566836222074926 ], [ 14199650.086271185427904, 4344261.122563022188842 ], [ 14199647.31061059422791, 4344262.606184517964721 ], [ 14199644.12834308296442, 4344265.217803970910609 ], [ 14199642.030923329293728, 4344267.773517334833741 ], [ 14199639.255241852253675, 4344269.257149994373322 ], [ 14199636.072974340990186, 4344271.86876944731921 ], [ 14199633.975565616041422, 4344274.42446937225759 ], [ 14199631.199863255023956, 4344275.90811319462955 ], [ 14199628.017595743760467, 4344278.519732647575438 ], [ 14199625.92019803635776, 4344281.075419148430228 ], [ 14199623.144474798813462, 4344282.559074128977954 ], [ 14199619.962207287549973, 4344285.170693581923842 ], [ 14199617.864820616319776, 4344287.726366635411978 ], [ 14199615.089076491072774, 4344289.210032780654728 ], [ 14199611.906808979809284, 4344291.821652233600616 ], [ 14199609.809433329850435, 4344294.377311855554581 ], [ 14199607.033668326213956, 4344295.860989161767066 ], [ 14199603.851400814950466, 4344298.472608614712954 ], [ 14199601.754036206752062, 4344301.02825478464365 ], [ 14199598.978250304237008, 4344302.511943260207772 ], [ 14199595.795982792973518, 4344305.12356271315366 ], [ 14199593.698629194870591, 4344307.679195465520024 ], [ 14199590.922822423279285, 4344309.162895096465945 ], [ 14199587.740554912015796, 4344311.774514549411833 ], [ 14199585.643212353810668, 4344314.330133848823607 ], [ 14199582.867384690791368, 4344315.81384464725852 ], [ 14199579.685117179527879, 4344318.425464100204408 ], [ 14199577.073497725650668, 4344321.607731611467898 ], [ 14199576.3622618149966, 4344322.938360410742462 ], [ 14199574.466799097135663, 4344323.513342740014195 ], [ 14199570.836176283657551, 4344325.453951064497232 ], [ 14199567.653908772394061, 4344328.06557051744312 ], [ 14199565.04228931851685, 4344331.24783802870661 ], [ 14199564.331061102449894, 4344332.578452432528138 ], [ 14199562.435569370165467, 4344333.153443563729525 ], [ 14199558.804946556687355, 4344335.094051888212562 ], [ 14199555.622679045423865, 4344337.70567134115845 ], [ 14199553.011059591546655, 4344340.887938852421939 ], [ 14199552.299839060753584, 4344342.21853887848556 ], [ 14199550.404318323358893, 4344342.793538807891309 ], [ 14199546.773695509880781, 4344344.734147132374346 ], [ 14199543.591427998617291, 4344347.345766585320234 ], [ 14199540.979808544740081, 4344350.528034096583724 ], [ 14199540.268595699220896, 4344351.858619743026793 ], [ 14199538.373045962303877, 4344352.433628469705582 ], [ 14199534.742423148825765, 4344354.374236794188619 ], [ 14199531.560155637562275, 4344356.985856247134507 ], [ 14199528.948536183685064, 4344360.168123758397996 ], [ 14199528.23733102530241, 4344361.498695023357868 ], [ 14199526.341752275824547, 4344362.073712551034987 ], [ 14199522.711129462346435, 4344364.014320875518024 ], [ 14199519.528861951082945, 4344366.625940328463912 ], [ 14199516.917242497205734, 4344369.808207839727402 ], [ 14199516.206045025959611, 4344371.138764724135399 ], [ 14199514.310437275096774, 4344371.713791049085557 ], [ 14199510.679814461618662, 4344373.654399373568594 ], [ 14199507.497546950355172, 4344376.266018826514482 ], [ 14199504.885927496477962, 4344379.448286337777972 ], [ 14199504.174737714231014, 4344380.778828837908804 ], [ 14199502.279100954532623, 4344381.353863961994648 ], [ 14199498.648478141054511, 4344383.294472286477685 ], [ 14199495.466210629791021, 4344385.906091739423573 ], [ 14199492.854591175913811, 4344389.088359250687063 ], [ 14199492.143409082666039, 4344390.418887365609407 ], [ 14199490.247743314132094, 4344390.993931289762259 ], [ 14199486.617120500653982, 4344392.934539614245296 ], [ 14199483.434852989390492, 4344395.546159067191184 ], [ 14199480.823233535513282, 4344398.728426578454673 ], [ 14199480.112059129402041, 4344400.058940311893821 ], [ 14199478.216364350169897, 4344400.633993036113679 ], [ 14199474.585741536691785, 4344402.574601360596716 ], [ 14199471.403474025428295, 4344405.186220813542604 ], [ 14199468.791854571551085, 4344408.368488324806094 ], [ 14199468.080687848851085, 4344409.698987681418657 ], [ 14199466.184964071959257, 4344410.274049202911556 ], [ 14199462.554341258481145, 4344412.214657527394593 ], [ 14199459.372073747217655, 4344414.826276980340481 ], [ 14199456.760454293340445, 4344418.008544491603971 ], [ 14199454.819845968857408, 4344421.639167306013405 ], [ 14199453.624825263395905, 4344425.578622623346746 ], [ 14199453.221316151320934, 4344429.675519385375082 ], [ 14199453.624825263395905, 4344433.772416147403419 ], [ 14199454.819845968857408, 4344437.71187146473676 ], [ 14199456.760454293340445, 4344441.342494279146194 ], [ 14199459.372073747217655, 4344444.524761790409684 ], [ 14199462.554341258481145, 4344447.136381243355572 ], [ 14199466.184964071959257, 4344449.076989567838609 ], [ 14199470.124419389292598, 4344450.272010274231434 ], [ 14199474.221316151320934, 4344450.675519385375082 ], [ 14199478.318212913349271, 4344450.272010274231434 ], [ 14199482.257668230682611, 4344449.076989567838609 ], [ 14199485.888291044160724, 4344447.136381243355572 ], [ 14199489.070558555424213, 4344444.524761790409684 ], [ 14199491.682178009301424, 4344441.342494279146194 ], [ 14199492.393344732001424, 4344440.011994922533631 ], [ 14199494.289068508893251, 4344439.436933401040733 ], [ 14199497.919691322371364, 4344437.496325076557696 ], [ 14199501.101958833634853, 4344434.884705623611808 ], [ 14199503.713578287512064, 4344431.702438112348318 ], [ 14199504.424752693623304, 4344430.371924378909171 ], [ 14199506.320447472855449, 4344429.796871654689312 ], [ 14199509.951070286333561, 4344427.856263330206275 ], [ 14199513.133337797597051, 4344425.244643877260387 ], [ 14199515.744957251474261, 4344422.062376365996897 ], [ 14199516.456139344722033, 4344420.731848251074553 ], [ 14199518.351805113255978, 4344420.156804326921701 ], [ 14199521.98242792673409, 4344418.216196002438664 ], [ 14199525.16469543799758, 4344415.604576549492776 ], [ 14199527.77631489187479, 4344412.422309038229287 ], [ 14199528.487504674121737, 4344411.091766538098454 ], [ 14199530.383141433820128, 4344410.516731414012611 ], [ 14199534.013764247298241, 4344408.576123089529574 ], [ 14199537.19603175856173, 4344405.964503636583686 ], [ 14199539.807651212438941, 4344402.782236125320196 ], [ 14199540.518848683685064, 4344401.451679240912199 ], [ 14199542.414456434547901, 4344400.87665291596204 ], [ 14199546.045079248026013, 4344398.936044591479003 ], [ 14199549.227346759289503, 4344396.324425138533115 ], [ 14199551.838966213166714, 4344393.142157627269626 ], [ 14199552.550171371549368, 4344391.811586362309754 ], [ 14199554.445750121027231, 4344391.236568834632635 ], [ 14199558.076372934505343, 4344389.295960510149598 ], [ 14199561.258640445768833, 4344386.68434105720371 ], [ 14199563.870259899646044, 4344383.50207354594022 ], [ 14199564.581472745165229, 4344382.171487899497151 ], [ 14199566.477022482082248, 4344381.596479172818363 ], [ 14199570.10764529556036, 4344379.655870848335326 ], [ 14199573.28991280682385, 4344377.044251395389438 ], [ 14199575.90153226070106, 4344373.861983884125948 ], [ 14199576.612752791494131, 4344372.531383858062327 ], [ 14199578.508273528888822, 4344371.956383928656578 ], [ 14199582.138896342366934, 4344370.015775604173541 ], [ 14199585.321163853630424, 4344367.404156151227653 ], [ 14199587.932783307507634, 4344364.221888639964163 ], [ 14199588.644011523574591, 4344362.891274236142635 ], [ 14199590.539503255859017, 4344362.316283104941249 ], [ 14199594.17012606933713, 4344360.375674780458212 ], [ 14199597.352393580600619, 4344357.764055327512324 ], [ 14199599.96401303447783, 4344354.581787816248834 ], [ 14199600.675248945131898, 4344353.25115901697427 ], [ 14199602.570711662992835, 4344352.676176687702537 ], [ 14199606.201334476470947, 4344350.7355683632195 ], [ 14199609.383601987734437, 4344348.123948910273612 ], [ 14199611.480944545939565, 4344345.568329610861838 ], [ 14199614.256772208958864, 4344344.084618812426925 ], [ 14199617.439039720222354, 4344341.472999359481037 ], [ 14199619.536393318325281, 4344338.917366607114673 ], [ 14199622.312200089916587, 4344337.433666976168752 ], [ 14199625.494467601180077, 4344334.822047523222864 ], [ 14199627.591832209378481, 4344332.266401353292167 ], [ 14199630.367618111893535, 4344330.782712877728045 ], [ 14199633.549885623157024, 4344328.171093424782157 ], [ 14199635.647261273115873, 4344325.615433802828193 ], [ 14199638.423026276752353, 4344324.131756496615708 ], [ 14199641.605293788015842, 4344321.52013704366982 ], [ 14199643.702680459246039, 4344318.964463990181684 ], [ 14199646.478424584493041, 4344317.480797844938934 ], [ 14199649.660692095756531, 4344314.869178391993046 ], [ 14199651.758089803159237, 4344312.313491891138256 ], [ 14199654.533813040703535, 4344310.829836910590529 ], [ 14199657.716080551967025, 4344308.218217457644641 ], [ 14199659.813489276915789, 4344305.662517532706261 ], [ 14199662.589191637933254, 4344304.178873710334301 ], [ 14199665.771459149196744, 4344301.567254257388413 ], [ 14199667.868878902867436, 4344299.011540893465281 ], [ 14199670.644560379907489, 4344297.5279082339257 ], [ 14199673.826827891170979, 4344294.916288780979812 ], [ 14199675.924258671700954, 4344292.360561980865896 ], [ 14199678.699919262900949, 4344290.876940485090017 ], [ 14199681.882186774164438, 4344288.265321032144129 ], [ 14199683.979628590866923, 4344285.709580784663558 ], [ 14199686.755268288776278, 4344284.225970456376672 ], [ 14199689.937535800039768, 4344281.614351003430784 ], [ 14199692.549155253916979, 4344278.432083492167294 ], [ 14199693.022324262186885, 4344277.546846541576087 ], [ 14199694.504043431952596, 4344277.097371945157647 ], [ 14199698.134666245430708, 4344275.15676362067461 ], [ 14199701.316933756694198, 4344272.545144167728722 ], [ 14199703.928553210571408, 4344269.362876656465232 ], [ 14199704.401729121804237, 4344268.477626790292561 ], [ 14199705.883422415703535, 4344268.02816004306078 ], [ 14199709.514045229181647, 4344266.087551718577743 ], [ 14199712.696312740445137, 4344263.475932265631855 ], [ 14199715.307932194322348, 4344260.293664754368365 ], [ 14199715.78111501224339, 4344259.408401966094971 ], [ 14199717.262782434001565, 4344258.958943067118526 ], [ 14199720.893405247479677, 4344257.018334742635489 ], [ 14199724.075672758743167, 4344254.4067152896896 ], [ 14199726.687292212620378, 4344251.224447778426111 ], [ 14199727.160481935366988, 4344250.339172071777284 ], [ 14199728.642123483121395, 4344249.889721021987498 ], [ 14199732.272746296599507, 4344247.949112697504461 ], [ 14199735.455013807862997, 4344245.337493244558573 ], [ 14199738.066633261740208, 4344242.155225733295083 ], [ 14199738.539829893037677, 4344241.269937104545534 ], [ 14199740.021445572376251, 4344240.820493901148438 ], [ 14199743.652068385854363, 4344238.879885576665401 ], [ 14199746.834335897117853, 4344236.268266123719513 ], [ 14199749.445955350995064, 4344233.085998612456024 ], [ 14199749.919158888980746, 4344232.200697059743106 ], [ 14199751.400748688727617, 4344231.751261707395315 ], [ 14199755.031371502205729, 4344229.810653382912278 ], [ 14199758.213639013469219, 4344227.19903392996639 ], [ 14199760.82525846734643, 4344224.0167664187029 ], [ 14199761.298468908295035, 4344223.131451953202486 ], [ 14199762.780032841488719, 4344222.682024447247386 ], [ 14199766.410655654966831, 4344220.741416122764349 ], [ 14199769.592923166230321, 4344218.129796669818461 ], [ 14199772.204542620107532, 4344214.947529158554971 ], [ 14199772.677759969606996, 4344214.062201766297221 ], [ 14199774.159298026934266, 4344213.61278210952878 ], [ 14199777.789920840412378, 4344211.672173785045743 ], [ 14199780.972188351675868, 4344209.060554332099855 ], [ 14199783.583807805553079, 4344205.878286820836365 ], [ 14199784.057032058015466, 4344204.992946513928473 ], [ 14199785.538544245064259, 4344204.543534705415368 ], [ 14199789.169167058542371, 4344202.602926380932331 ], [ 14199792.351434569805861, 4344199.991306927986443 ], [ 14199794.963054023683071, 4344196.809039416722953 ], [ 14199795.436285182833672, 4344195.923686189576983 ], [ 14199796.917771494016051, 4344195.474282230250537 ], [ 14199800.548394307494164, 4344193.5336739057675 ], [ 14199803.730661818757653, 4344190.922054452821612 ], [ 14199805.306743713095784, 4344189.001593108288944 ], [ 14199805.407726485282183, 4344188.970960319042206 ], [ 14199809.038349298760295, 4344187.030351994559169 ], [ 14199812.220616810023785, 4344184.418732541613281 ], [ 14199813.796705491840839, 4344182.498262926004827 ], [ 14199813.897671341896057, 4344182.46763527020812 ], [ 14199817.528294155374169, 4344180.527026945725083 ], [ 14199820.710561666637659, 4344177.915407492779195 ], [ 14199822.286657124757767, 4344175.994929620064795 ], [ 14199822.387606058269739, 4344175.964307095855474 ], [ 14199826.018228871747851, 4344174.023698771372437 ], [ 14199829.200496383011341, 4344171.412079318426549 ], [ 14199830.776598623022437, 4344169.491593183018267 ], [ 14199830.877530643716455, 4344169.46097578946501 ], [ 14199834.508153457194567, 4344167.520367464981973 ], [ 14199837.690420968458056, 4344164.908748012036085 ], [ 14199839.266529992222786, 4344162.988253609277308 ], [ 14199839.367445090785623, 4344162.957641349174082 ], [ 14199842.998067904263735, 4344161.017033024691045 ], [ 14199846.180335415527225, 4344158.405413571745157 ], [ 14199847.756451213732362, 4344156.484910915605724 ], [ 14199847.857349403202534, 4344156.454303784295917 ], [ 14199851.487972216680646, 4344154.51369545981288 ], [ 14199854.670239727944136, 4344151.902076006866992 ], [ 14199856.246362311765552, 4344149.981565082445741 ], [ 14199856.347243580967188, 4344149.950963083654642 ], [ 14199859.9778663944453, 4344148.010354759171605 ], [ 14199863.16013390570879, 4344145.398735306225717 ], [ 14199864.736263273283839, 4344143.478216114453971 ], [ 14199864.83712762221694, 4344143.447619249112904 ], [ 14199868.467750435695052, 4344141.507010924629867 ], [ 14199871.650017946958542, 4344138.895391471683979 ], [ 14199873.226154088973999, 4344136.974864025600255 ], [ 14199873.327001528814435, 4344136.944272289052606 ], [ 14199876.957624342292547, 4344135.003663964569569 ], [ 14199880.139891853556037, 4344132.392044511623681 ], [ 14199881.716034784913063, 4344130.471508794464171 ], [ 14199881.816865300759673, 4344130.440922191366553 ], [ 14199885.447488114237785, 4344128.500313866883516 ], [ 14199888.629755625501275, 4344125.888694413937628 ], [ 14199890.610973998904228, 4344123.474572841078043 ], [ 14199892.347317038103938, 4344122.947858938015997 ], [ 14199895.97793985158205, 4344121.00725061353296 ], [ 14199899.16020736284554, 4344118.395631160587072 ], [ 14199901.141436656937003, 4344115.981496280990541 ], [ 14199902.877754321321845, 4344115.454790075309575 ], [ 14199906.508377134799957, 4344113.514181750826538 ], [ 14199909.690644646063447, 4344110.90256229788065 ], [ 14199911.671884845942259, 4344108.488414131104946 ], [ 14199913.408177156001329, 4344107.961715616285801 ], [ 14199917.038799969479442, 4344106.021107291802764 ], [ 14199920.221067480742931, 4344103.409487838856876 ], [ 14199922.202318605035543, 4344100.995326359756291 ], [ 14199923.938585536554456, 4344100.46863554418087 ], [ 14199927.569208350032568, 4344098.528027219697833 ], [ 14199930.751475861296058, 4344095.916407766751945 ], [ 14199932.732737889513373, 4344093.502233000472188 ], [ 14199934.468979462981224, 4344092.975549876689911 ], [ 14199938.099602276459336, 4344091.034941552206874 ], [ 14199941.281869787722826, 4344088.423322099260986 ], [ 14199943.263142740353942, 4344086.009134022518992 ], [ 14199944.999358933418989, 4344085.48245859798044 ], [ 14199948.629981746897101, 4344083.541850273497403 ], [ 14199951.812249258160591, 4344080.930230820551515 ], [ 14199953.793533109128475, 4344078.516029463149607 ], [ 14199955.529723955318332, 4344077.98936172761023 ], [ 14199959.160346768796444, 4344076.048753403127193 ], [ 14199962.342614280059934, 4344073.437133950181305 ], [ 14199964.323909062892199, 4344071.022919273003936 ], [ 14199966.060074519366026, 4344070.496259239502251 ], [ 14199969.690697332844138, 4344068.555650915019214 ], [ 14199972.872964844107628, 4344065.944031462073326 ], [ 14199974.854270527139306, 4344063.52980350330472 ], [ 14199976.590410633012652, 4344063.003151159733534 ], [ 14199980.221033446490765, 4344061.062542835250497 ], [ 14199983.403300957754254, 4344058.450923382304609 ], [ 14199985.384617568925023, 4344056.036682106554508 ], [ 14199987.120732292532921, 4344055.510037462227046 ], [ 14199990.751355106011033, 4344053.569429137744009 ], [ 14199993.933622617274523, 4344050.957809684798121 ], [ 14199995.135725684463978, 4344049.49304286018014 ], [ 14199998.028941605240107, 4344048.615395405329764 ], [ 14200001.659564418718219, 4344046.674787080846727 ], [ 14200004.841831929981709, 4344044.063167627900839 ], [ 14200006.043947344645858, 4344042.598385755904019 ], [ 14200008.937137201428413, 4344041.720746207982302 ], [ 14200012.567760014906526, 4344039.780137883499265 ], [ 14200015.750027526170015, 4344037.168518430553377 ], [ 14200016.952155282720923, 4344035.70372152235359 ], [ 14200019.845319064334035, 4344034.826089883223176 ], [ 14200023.475941877812147, 4344032.885481558740139 ], [ 14200026.658209389075637, 4344030.273862105794251 ], [ 14200027.860349487513304, 4344028.809050157666206 ], [ 14200030.753487199544907, 4344027.931426427327096 ], [ 14200034.384110013023019, 4344025.990818102844059 ], [ 14200037.566377524286509, 4344023.379198649898171 ], [ 14200038.768529964610934, 4344021.914371662773192 ], [ 14200041.661641610786319, 4344021.036755839362741 ], [ 14200045.292264424264431, 4344019.096147514879704 ], [ 14200048.474531935527921, 4344016.484528061933815 ], [ 14200049.676696710288525, 4344015.019686046056449 ], [ 14200052.569782296195626, 4344014.142078127712011 ], [ 14200056.200405109673738, 4344012.201469803228974 ], [ 14200059.382672620937228, 4344009.589850350283086 ], [ 14200060.584849737584591, 4344008.124993295408785 ], [ 14200063.477909252047539, 4344007.247393285855651 ], [ 14200067.108532065525651, 4344005.306784961372614 ], [ 14200070.290799576789141, 4344002.695165508426726 ], [ 14200071.492989033460617, 4344001.230293416418135 ], [ 14200074.386022480204701, 4344000.352701314724982 ], [ 14200078.016645293682814, 4343998.412092990241945 ], [ 14200081.198912804946303, 4343995.800473537296057 ], [ 14200082.401114601641893, 4343994.335586409084499 ], [ 14200085.294121984392405, 4343993.458002213388681 ], [ 14200088.924744797870517, 4343991.517393888905644 ], [ 14200092.107012309134007, 4343988.905774435959756 ], [ 14200093.309226447716355, 4343987.440872270613909 ], [ 14200096.202207764610648, 4343986.56329598184675 ], [ 14200099.83283057808876, 4343984.622687657363713 ], [ 14200103.01509808935225, 4343982.011068204417825 ], [ 14200105.626717543229461, 4343978.828800693154335 ], [ 14200107.567325867712498, 4343975.1981778787449 ], [ 14200108.762346573174, 4343971.25872256141156 ], [ 14200109.165855685248971, 4343967.161825799383223 ]]]),
  });
  loadFeaturesS3.setId('3S');

  var loadFeaturesE4 = new ol.Feature({
    geometry: new Polygon([[[ 14211964.991383001208305, 4339117.299971925094724 ], [ 14211962.298846770077944, 4339116.483199988491833 ], [ 14211958.201950008049607, 4339116.079690877348185 ], [ 14211954.105053246021271, 4339116.483199988491833 ], [ 14211950.16559792868793, 4339117.678220694884658 ], [ 14211946.534975115209818, 4339119.618829019367695 ], [ 14211943.352707603946328, 4339122.230448472313583 ], [ 14211940.741088150069118, 4339125.412715983577073 ], [ 14211938.800479825586081, 4339129.043338797986507 ], [ 14211937.605459120124578, 4339132.982794115319848 ], [ 14211937.201950008049607, 4339137.079690877348185 ], [ 14211937.605459120124578, 4339141.176587639376521 ], [ 14211938.800479825586081, 4339145.116042956709862 ], [ 14211940.741088150069118, 4339148.746665771119297 ], [ 14211943.352707603946328, 4339151.928933282382786 ], [ 14211946.534975115209818, 4339154.540552735328674 ], [ 14211950.16559792868793, 4339156.481161059811711 ], [ 14211954.105053246021271, 4339157.676181766204536 ], [ 14211958.201950008049607, 4339158.079690877348185 ], [ 14211962.274524247273803, 4339157.678577325306833 ], [ 14211964.967060478404164, 4339158.495349261909723 ], [ 14211969.063957240432501, 4339158.898858373053372 ], [ 14211973.13656004704535, 4339158.497742007486522 ], [ 14211975.829069631174207, 4339159.314505861140788 ], [ 14211979.925966393202543, 4339159.718014972284436 ], [ 14211983.99859775416553, 4339159.316895794123411 ], [ 14211986.691080709919333, 4339160.133651570416987 ], [ 14211990.78797747194767, 4339160.537160681560636 ], [ 14211994.860637402161956, 4339160.136038689874113 ], [ 14211997.553093714639544, 4339160.952786383219063 ], [ 14212001.649990476667881, 4339161.356295494362712 ], [ 14212005.722678964957595, 4339160.955170690082014 ], [ 14212008.415108637884259, 4339161.771910302340984 ], [ 14212012.512005399912596, 4339162.175419413484633 ], [ 14212016.584722451865673, 4339161.774291795678437 ], [ 14212019.277125488966703, 4339162.591023328714073 ], [ 14212023.37402225099504, 4339162.994532439857721 ], [ 14212027.446767868474126, 4339162.593402008526027 ], [ 14212030.139144258573651, 4339163.410125458613038 ], [ 14212034.236041020601988, 4339163.813634569756687 ], [ 14212038.308815199881792, 4339163.412501325830817 ], [ 14212041.001164956018329, 4339164.229216695763171 ], [ 14212045.098061718046665, 4339164.632725806906819 ], [ 14212049.170864451676607, 4339164.231589750386775 ], [ 14212051.8631875757128, 4339165.048297042027116 ], [ 14212055.960084337741137, 4339165.451806153170764 ], [ 14212060.032915644347668, 4339165.050667282193899 ], [ 14212062.725212113931775, 4339165.867366488091648 ], [ 14212066.822108875960112, 4339166.270875599235296 ], [ 14212070.919005637988448, 4339165.867366488091648 ], [ 14212074.858460955321789, 4339164.672345781698823 ], [ 14212078.489083768799901, 4339162.731737457215786 ], [ 14212081.671351280063391, 4339160.120118004269898 ], [ 14212084.282970733940601, 4339156.937850493006408 ], [ 14212086.223579058423638, 4339153.307227678596973 ], [ 14212087.41859976388514, 4339149.367772361263633 ], [ 14212087.822108875960112, 4339145.270875599235296 ], [ 14212087.41859976388514, 4339141.17397883720696 ], [ 14212086.223579058423638, 4339137.234523519873619 ], [ 14212084.282970733940601, 4339133.603900705464184 ], [ 14212081.671351280063391, 4339130.421633194200695 ], [ 14212078.489083768799901, 4339127.810013741254807 ], [ 14212074.858460955321789, 4339125.86940541677177 ], [ 14212070.919005637988448, 4339124.674384710378945 ], [ 14212066.822108875960112, 4339124.270875599235296 ], [ 14212062.74927756935358, 4339124.672014470212162 ], [ 14212060.056981099769473, 4339123.855315264314413 ], [ 14212055.960084337741137, 4339123.451806153170764 ], [ 14212051.887281604111195, 4339123.852942209690809 ], [ 14212049.194958480075002, 4339123.036234918050468 ], [ 14212045.098061718046665, 4339122.632725806906819 ], [ 14212041.025287538766861, 4339123.033859050832689 ], [ 14212038.332937782630324, 4339122.217143680900335 ], [ 14212034.236041020601988, 4339121.813634569756687 ], [ 14212030.163295403122902, 4339122.214765001088381 ], [ 14212027.470919013023376, 4339121.39804155100137 ], [ 14212023.37402225099504, 4339120.994532439857721 ], [ 14212019.301305199041963, 4339121.395660057663918 ], [ 14212016.608902161940932, 4339120.578928524628282 ], [ 14212012.512005399912596, 4339120.175419413484633 ], [ 14212008.439316911622882, 4339120.576544217765331 ], [ 14212005.746887238696218, 4339119.759804605506361 ], [ 14212001.649990476667881, 4339119.356295494362712 ], [ 14211997.577330546453595, 4339119.757417486049235 ], [ 14211994.884874233976007, 4339118.940669792704284 ], [ 14211990.78797747194767, 4339118.537160681560636 ], [ 14211986.715346110984683, 4339118.938279859721661 ], [ 14211984.02286315523088, 4339118.121524083428085 ], [ 14211979.925966393202543, 4339117.718014972284436 ], [ 14211975.853363586589694, 4339118.119131337851286 ], [ 14211973.160854002460837, 4339117.302367484197021 ], [ 14211969.063957240432501, 4339116.898858373053372 ], [ 14211964.991383001208305, 4339117.299971925094724 ]]]),
  });
  loadFeaturesE4.setId('4E');

  var loadFeaturesS4 = new ol.Feature({
    geometry: new Polygon([[[ 14211955.143197724595666, 4339077.6672746790573 ], [ 14211954.996608139947057, 4339077.588920913636684 ], [ 14211951.057152822613716, 4339076.39390020724386 ], [ 14211946.96025606058538, 4339075.990391096100211 ], [ 14211942.863359298557043, 4339076.39390020724386 ], [ 14211938.923903981223702, 4339077.588920913636684 ], [ 14211935.29328116774559, 4339079.529529238119721 ], [ 14211932.1110136564821, 4339082.141148691065609 ], [ 14211929.49939420260489, 4339085.323416202329099 ], [ 14211927.558785878121853, 4339088.954039016738534 ], [ 14211926.363765172660351, 4339092.893494334071875 ], [ 14211925.96025606058538, 4339096.990391096100211 ], [ 14211926.363765172660351, 4339101.087287858128548 ], [ 14211927.558785878121853, 4339105.026743175461888 ], [ 14211929.49939420260489, 4339108.657365989871323 ], [ 14211932.1110136564821, 4339111.839633501134813 ], [ 14211935.29328116774559, 4339114.451252954080701 ], [ 14211938.923903981223702, 4339116.391861278563738 ], [ 14211942.863359298557043, 4339117.586881984956563 ], [ 14211946.96025606058538, 4339117.990391096100211 ], [ 14211951.057152822613716, 4339117.586881984956563 ], [ 14211952.158477837219834, 4339117.252798694185913 ], [ 14211952.305067421868443, 4339117.331152459606528 ], [ 14211956.244522739201784, 4339118.526173165999353 ], [ 14211960.341419501230121, 4339118.929682277143002 ], [ 14211964.438316263258457, 4339118.526173165999353 ], [ 14211965.539662789553404, 4339118.192083349451423 ], [ 14211965.686233615502715, 4339118.2704270882532 ], [ 14211969.625688932836056, 4339119.465447794646025 ], [ 14211973.722585694864392, 4339119.868956905789673 ], [ 14211977.819482456892729, 4339119.465447794646025 ], [ 14211978.920850476250052, 4339119.131351458840072 ], [ 14211979.067402549088001, 4339119.209685173816979 ], [ 14211983.006857866421342, 4339120.404705880209804 ], [ 14211987.103754628449678, 4339120.808214991353452 ], [ 14211991.200651390478015, 4339120.404705880209804 ], [ 14211992.302040927112103, 4339120.070603016763926 ], [ 14211992.448574231937528, 4339120.148926699534059 ], [ 14211996.388029549270868, 4339121.343947405926883 ], [ 14212000.484926311299205, 4339121.747456517070532 ], [ 14212004.581823073327541, 4339121.343947405926883 ], [ 14212005.683234106749296, 4339121.009838021360338 ], [ 14212005.829748660326004, 4339121.088151682168245 ], [ 14212009.769203977659345, 4339122.28317238856107 ], [ 14212013.866100739687681, 4339122.686681499704719 ], [ 14212017.962997501716018, 4339122.28317238856107 ], [ 14212019.06443003192544, 4339121.949056482873857 ], [ 14212019.210925832390785, 4339122.027360119856894 ], [ 14212023.150381149724126, 4339123.222380826249719 ], [ 14212027.247277911752462, 4339123.625889937393367 ], [ 14212031.344174673780799, 4339123.222380826249719 ], [ 14212032.44562872312963, 4339122.88825839292258 ], [ 14212032.592105753719807, 4339122.966551997698843 ], [ 14212036.531561071053147, 4339124.161572704091668 ], [ 14212040.628457833081484, 4339124.565081815235317 ], [ 14212044.72535459510982, 4339124.161572704091668 ], [ 14212045.826830139383674, 4339123.827443750575185 ], [ 14212045.973288420587778, 4339123.9057273324579 ], [ 14212049.912743737921119, 4339125.100748038850725 ], [ 14212054.009640499949455, 4339125.504257149994373 ], [ 14212058.106537261977792, 4339125.100748038850725 ], [ 14212059.208034312352538, 4339124.766612561419606 ], [ 14212059.354473832994699, 4339124.844886115752161 ], [ 14212063.29392915032804, 4339126.039906822144985 ], [ 14212067.390825912356377, 4339126.443415933288634 ], [ 14212071.487722674384713, 4339126.039906822144985 ], [ 14212072.589241225272417, 4339125.705764822661877 ], [ 14212072.735661987215281, 4339125.784028350375593 ], [ 14212076.675117304548621, 4339126.979049056768417 ], [ 14212080.772014066576958, 4339127.382558167912066 ], [ 14212084.868910828605294, 4339126.979049056768417 ], [ 14212088.808366145938635, 4339125.784028350375593 ], [ 14212092.438988959416747, 4339123.843420025892556 ], [ 14212095.621256470680237, 4339121.231800572946668 ], [ 14212098.232875924557447, 4339118.049533061683178 ], [ 14212100.173484249040484, 4339114.418910247273743 ], [ 14212101.368504954501987, 4339110.479454929940403 ], [ 14212101.772014066576958, 4339106.382558167912066 ], [ 14212101.368504954501987, 4339102.285661405883729 ], [ 14212100.173484249040484, 4339098.346206088550389 ], [ 14212098.232875924557447, 4339094.715583274140954 ], [ 14212095.621256470680237, 4339091.533315762877464 ], [ 14212092.438988959416747, 4339088.921696309931576 ], [ 14212088.808366145938635, 4339086.981087985448539 ], [ 14212084.868910828605294, 4339085.786067279055715 ], [ 14212080.772014066576958, 4339085.382558167912066 ], [ 14212076.675117304548621, 4339085.786067279055715 ], [ 14212075.573598753660917, 4339086.120209278538823 ], [ 14212075.427177991718054, 4339086.041945750825107 ], [ 14212071.487722674384713, 4339084.846925044432282 ], [ 14212067.390825912356377, 4339084.443415933288634 ], [ 14212063.29392915032804, 4339084.846925044432282 ], [ 14212062.192432099953294, 4339085.181060521863401 ], [ 14212062.045992579311132, 4339085.102786967530847 ], [ 14212058.106537261977792, 4339083.907766261138022 ], [ 14212054.009640499949455, 4339083.504257149994373 ], [ 14212049.912743737921119, 4339083.907766261138022 ], [ 14212048.811268193647265, 4339084.241895214654505 ], [ 14212048.664809912443161, 4339084.16361163277179 ], [ 14212044.72535459510982, 4339082.968590926378965 ], [ 14212040.628457833081484, 4339082.565081815235317 ], [ 14212036.531561071053147, 4339082.968590926378965 ], [ 14212035.430107021704316, 4339083.302713359706104 ], [ 14212035.28362999111414, 4339083.224419754929841 ], [ 14212031.344174673780799, 4339082.029399048537016 ], [ 14212027.247277911752462, 4339081.625889937393367 ], [ 14212023.150381149724126, 4339082.029399048537016 ], [ 14212022.048948619514704, 4339082.363514954224229 ], [ 14212021.902452819049358, 4339082.285211317241192 ], [ 14212017.962997501716018, 4339081.090190610848367 ], [ 14212013.866100739687681, 4339080.686681499704719 ], [ 14212009.769203977659345, 4339081.090190610848367 ], [ 14212008.66779294423759, 4339081.424299995414913 ], [ 14212008.521278390660882, 4339081.345986334607005 ], [ 14212004.581823073327541, 4339080.15096562821418 ], [ 14212000.484926311299205, 4339079.747456517070532 ], [ 14211996.388029549270868, 4339080.15096562821418 ], [ 14211995.286640012636781, 4339080.485068491660058 ], [ 14211995.140106707811356, 4339080.406744808889925 ], [ 14211991.200651390478015, 4339079.211724102497101 ], [ 14211987.103754628449678, 4339078.808214991353452 ], [ 14211983.006857866421342, 4339079.211724102497101 ], [ 14211981.905489847064018, 4339079.545820438303053 ], [ 14211981.758937774226069, 4339079.467486723326147 ], [ 14211977.819482456892729, 4339078.272466016933322 ], [ 14211973.722585694864392, 4339077.868956905789673 ], [ 14211969.625688932836056, 4339078.272466016933322 ], [ 14211968.524342406541109, 4339078.606555833481252 ], [ 14211968.377771580591798, 4339078.528212094679475 ], [ 14211964.438316263258457, 4339077.33319138828665 ], [ 14211960.341419501230121, 4339076.929682277143002 ], [ 14211956.244522739201784, 4339077.33319138828665 ], [ 14211955.143197724595666, 4339077.6672746790573 ]]]),
  });
  loadFeaturesS4.setId('4S');

  var loadFeaturesE5 = new ol.Feature({
    geometry: new Polygon([[[ 14249018.457672012969851, 4329010.934502078220248 ], [ 14249018.05416290089488, 4329006.837605316191912 ], [ 14249016.859142195433378, 4329002.898149998858571 ], [ 14249014.918533870950341, 4328999.267527184449136 ], [ 14249012.306914417073131, 4328996.085259673185647 ], [ 14249009.124646905809641, 4328993.473640220239758 ], [ 14249005.494024092331529, 4328991.533031895756721 ], [ 14249001.554568774998188, 4328990.338011189363897 ], [ 14248997.457672012969851, 4328989.934502078220248 ], [ 14248993.360775250941515, 4328990.338011189363897 ], [ 14248989.421319933608174, 4328991.533031895756721 ], [ 14248985.790697120130062, 4328993.473640220239758 ], [ 14248982.608429608866572, 4328996.085259673185647 ], [ 14248979.996810154989362, 4328999.267527184449136 ], [ 14248978.056201830506325, 4329002.898149998858571 ], [ 14248976.861181125044823, 4329006.837605316191912 ], [ 14248976.59571398422122, 4329009.53293841984123 ], [ 14248975.83643401414156, 4329010.45812374074012 ], [ 14248973.895825689658523, 4329014.088746555149555 ], [ 14248972.700804984197021, 4329018.028201872482896 ], [ 14248972.435337958857417, 4329020.72353380639106 ], [ 14248971.676049092784524, 4329021.648729966953397 ], [ 14248969.735440768301487, 4329025.279352781362832 ], [ 14248968.540420062839985, 4329029.218808098696172 ], [ 14248968.274953152984381, 4329031.914138869382441 ], [ 14248967.515655390918255, 4329032.839345868676901 ], [ 14248965.575047066435218, 4329036.469968683086336 ], [ 14248964.380026360973716, 4329040.409424000419676 ], [ 14248964.114559564739466, 4329043.104753612540662 ], [ 14248963.355252915993333, 4329044.029971440322697 ], [ 14248961.414644591510296, 4329047.660594254732132 ], [ 14248960.219623886048794, 4329051.600049572065473 ], [ 14248959.954157205298543, 4329054.295378013513982 ], [ 14248959.194841658696532, 4329055.220606683753431 ], [ 14248957.254233334213495, 4329058.851229498162866 ], [ 14248956.059212628751993, 4329062.790684815496206 ], [ 14248955.793746063485742, 4329065.48601208627224 ], [ 14248955.034421622753143, 4329066.411251593381166 ], [ 14248953.093813298270106, 4329070.041874407790601 ], [ 14248951.898792592808604, 4329073.981329725123942 ], [ 14248951.633326141163707, 4329076.67665583640337 ], [ 14248950.873992810025811, 4329077.601906177587807 ], [ 14248948.933384485542774, 4329081.232528991997242 ], [ 14248947.738363780081272, 4329085.171984309330583 ], [ 14248947.472897443920374, 4329087.867309250868857 ], [ 14248946.713555213063955, 4329088.79257043544203 ], [ 14248944.772946888580918, 4329092.423193249851465 ], [ 14248943.577926183119416, 4329096.362648567184806 ], [ 14248943.312459960579872, 4329099.057972349226475 ], [ 14248942.553108844906092, 4329099.983244361355901 ], [ 14248940.612500520423055, 4329103.613867175765336 ], [ 14248939.417479814961553, 4329107.553322493098676 ], [ 14248939.152013707906008, 4329110.248645112849772 ], [ 14248938.392653694376349, 4329111.173927965573967 ], [ 14248936.452045369893312, 4329114.804550779983401 ], [ 14248935.25702466443181, 4329118.744006097316742 ], [ 14248935.173253355547786, 4329119.594550477340817 ], [ 14248934.545498372986913, 4329120.109735677018762 ], [ 14248931.933878919109702, 4329123.292003188282251 ], [ 14248929.993270594626665, 4329126.922626002691686 ], [ 14248928.798249889165163, 4329130.862081320025027 ], [ 14248928.714478872716427, 4329131.712622720748186 ], [ 14248928.086708975955844, 4329132.227820160798728 ], [ 14248925.475089522078633, 4329135.410087672062218 ], [ 14248923.534481197595596, 4329139.040710486471653 ], [ 14248922.339460492134094, 4329142.980165803804994 ], [ 14248922.255689768120646, 4329143.830704236403108 ], [ 14248921.627904960885644, 4329144.345913913100958 ], [ 14248919.016285507008433, 4329147.528181424364448 ], [ 14248917.075677182525396, 4329151.158804238773882 ], [ 14248915.880656477063894, 4329155.098259556107223 ], [ 14248915.79688604734838, 4329155.948795006610453 ], [ 14248915.169086318463087, 4329156.464016928337514 ], [ 14248912.557466864585876, 4329159.646284439601004 ], [ 14248910.616858540102839, 4329163.276907254010439 ], [ 14248909.421837834641337, 4329167.21636257134378 ], [ 14248909.338067697361112, 4329168.066895043477416 ], [ 14248908.710253056138754, 4329168.582129204645753 ], [ 14248906.098633602261543, 4329171.764396715909243 ], [ 14248904.158025277778506, 4329175.395019530318677 ], [ 14248902.963004572317004, 4329179.334474847652018 ], [ 14248902.879234729334712, 4329180.185004340484738 ], [ 14248902.251405168324709, 4329180.700250744819641 ], [ 14248899.639785714447498, 4329183.882518256083131 ], [ 14248897.699177389964461, 4329187.513141070492566 ], [ 14248896.504156684502959, 4329191.452596387825906 ], [ 14248896.420387133955956, 4329192.303122904151678 ], [ 14248895.792542656883597, 4329192.818381550721824 ], [ 14248893.180923203006387, 4329196.000649061985314 ], [ 14248891.24031487852335, 4329199.631271876394749 ], [ 14248890.045294173061848, 4329203.570727193728089 ], [ 14248889.961524916812778, 4329204.42125073261559 ], [ 14248889.333665525540709, 4329204.936521617695689 ], [ 14248886.722046071663499, 4329208.118789128959179 ], [ 14248884.781437747180462, 4329211.749411943368614 ], [ 14248883.58641704171896, 4329215.688867260701954 ], [ 14248883.502648077905178, 4329216.539387821219862 ], [ 14248882.87477376870811, 4329217.054670950397849 ], [ 14248880.263154314830899, 4329220.236938461661339 ], [ 14248878.322545990347862, 4329223.867561276070774 ], [ 14248877.12752528488636, 4329227.807016593404114 ], [ 14248877.043756615370512, 4329228.657534169964492 ], [ 14248876.415867388248444, 4329229.172829541377723 ], [ 14248873.804247934371233, 4329232.355097052641213 ], [ 14248871.863639609888196, 4329235.985719867050648 ], [ 14248871.583582913503051, 4329236.908943069167435 ], [ 14248869.521862177178264, 4329238.600953550077975 ], [ 14248866.910242723301053, 4329241.783221061341465 ], [ 14248864.969634398818016, 4329245.413843875750899 ], [ 14248864.689580300822854, 4329246.337058512493968 ], [ 14248862.627844905480742, 4329248.029081023298204 ], [ 14248860.016225451603532, 4329251.211348534561694 ], [ 14248858.075617127120495, 4329254.841971348971128 ], [ 14248857.795565623790026, 4329255.765177432447672 ], [ 14248855.73381557315588, 4329257.457211970351636 ], [ 14248853.122196119278669, 4329260.639479481615126 ], [ 14248851.181587794795632, 4329264.270102296024561 ], [ 14248850.901538889855146, 4329265.19329981226474 ], [ 14248848.839774174615741, 4329266.885346385650337 ], [ 14248846.22815472073853, 4329270.067613896913826 ], [ 14248844.287546396255493, 4329273.698236711323261 ], [ 14248844.0075000859797, 4329274.621425676159561 ], [ 14248841.94572071544826, 4329276.313484276644886 ], [ 14248839.33410126157105, 4329279.495751787908375 ], [ 14248837.393492937088013, 4329283.12637460231781 ], [ 14248837.113449221476912, 4329284.049555009230971 ], [ 14248835.051655195653439, 4329285.741625637747347 ], [ 14248832.440035741776228, 4329288.923893149010837 ], [ 14248830.499427417293191, 4329292.554515963420272 ], [ 14248830.219386296346784, 4329293.47768781799823 ], [ 14248828.157577615231276, 4329295.169770473614335 ], [ 14248825.545958161354065, 4329298.352037984877825 ], [ 14248823.605349836871028, 4329301.98266079928726 ], [ 14248823.325311316177249, 4329302.905824085697532 ], [ 14248821.263487970456481, 4329304.597918774932623 ], [ 14248818.65186851657927, 4329307.780186286196113 ], [ 14248816.711260192096233, 4329311.410809100605547 ], [ 14248816.431224264204502, 4329312.333963835611939 ], [ 14248814.3693862631917, 4329314.026070553809404 ], [ 14248811.757766809314489, 4329317.208338065072894 ], [ 14248809.817158484831452, 4329320.838960879482329 ], [ 14248809.537125155329704, 4329321.762107052840292 ], [ 14248807.475272489711642, 4329323.454225804656744 ], [ 14248804.863653035834432, 4329326.636493315920234 ], [ 14248803.333000469952822, 4329329.50014285184443 ], [ 14248801.09107381477952, 4329330.698477614670992 ], [ 14248797.90880630351603, 4329333.31009706761688 ], [ 14248795.29718684963882, 4329336.49236457888037 ], [ 14248793.766541223973036, 4329339.356001130305231 ], [ 14248791.524590231478214, 4329340.554348901845515 ], [ 14248788.342322720214725, 4329343.165968354791403 ], [ 14248785.730703266337514, 4329346.348235866054893 ], [ 14248784.200064577162266, 4329349.211859438568354 ], [ 14248781.958089239895344, 4329350.410220223478973 ], [ 14248778.775821728631854, 4329353.021839676424861 ], [ 14248776.164202274754643, 4329356.204107187688351 ], [ 14248774.633570520207286, 4329359.067717785947025 ], [ 14248772.391570851206779, 4329360.266091576777399 ], [ 14248769.20930333994329, 4329362.877711029723287 ], [ 14248766.597683886066079, 4329366.059978540986776 ], [ 14248765.067059075459838, 4329368.923576148226857 ], [ 14248762.825035063549876, 4329370.121962950564921 ], [ 14248759.642767552286386, 4329372.733582403510809 ], [ 14248757.031148098409176, 4329375.915849914774299 ], [ 14248755.500530226156116, 4329378.779434541240335 ], [ 14248753.258481871336699, 4329379.977834355086088 ], [ 14248750.076214360073209, 4329382.589453808031976 ], [ 14248747.464594906195998, 4329385.771721319295466 ], [ 14248745.933983979746699, 4329388.635292951948941 ], [ 14248743.691911278292537, 4329389.83370577916503 ], [ 14248740.509643767029047, 4329392.445325232110918 ], [ 14248737.898024313151836, 4329395.627592743374407 ], [ 14248736.367420317605138, 4329398.491151410154998 ], [ 14248734.125323284417391, 4329399.689577242359519 ], [ 14248730.943055773153901, 4329402.301196695305407 ], [ 14248728.33143631927669, 4329405.483464206568897 ], [ 14248726.800839263945818, 4329408.347009888850152 ], [ 14248724.558717891573906, 4329409.545448730699718 ], [ 14248721.376450380310416, 4329412.157068183645606 ], [ 14248718.764830926433206, 4329415.339335694909096 ], [ 14248717.234240815043449, 4329418.202868387103081 ], [ 14248714.992095096036792, 4329419.401320242322981 ], [ 14248711.809827584773302, 4329422.012939695268869 ], [ 14248709.396875869482756, 4329424.953129867091775 ], [ 14248708.121607504785061, 4329425.33997829630971 ], [ 14248704.490984691306949, 4329427.280586620792747 ], [ 14248701.308717180043459, 4329429.892206073738635 ], [ 14248698.895775830373168, 4329432.832383614033461 ], [ 14248697.620481926947832, 4329433.219239790923893 ], [ 14248693.98985911346972, 4329435.15984811540693 ], [ 14248690.80759160220623, 4329437.771467568352818 ], [ 14248688.39466061629355, 4329440.711632481776178 ], [ 14248687.119341170415282, 4329441.098496406339109 ], [ 14248683.48871835693717, 4329443.039104730822146 ], [ 14248680.30645084567368, 4329445.650724183768034 ], [ 14248677.89353022351861, 4329448.590876466594636 ], [ 14248676.618185242637992, 4329448.977748137898743 ], [ 14248672.98756242915988, 4329450.91835646238178 ], [ 14248669.80529491789639, 4329453.529975915327668 ], [ 14248667.392384652048349, 4329456.470115581527352 ], [ 14248666.11701413616538, 4329456.85699499770999 ], [ 14248662.486391322687268, 4329458.797603322193027 ], [ 14248659.304123811423779, 4329461.409222775138915 ], [ 14248656.891223922371864, 4329464.349349795840681 ], [ 14248655.615827852860093, 4329464.736236964352429 ], [ 14248651.985205039381981, 4329466.676845288835466 ], [ 14248648.802937528118491, 4329469.288464741781354 ], [ 14248646.390047997236252, 4329472.228579140268266 ], [ 14248645.11462639644742, 4329472.615474053658545 ], [ 14248641.484003582969308, 4329474.556082378141582 ], [ 14248638.301736071705818, 4329477.16770183108747 ], [ 14248635.888856904581189, 4329480.107803601771593 ], [ 14248634.613409761339426, 4329480.49470626283437 ], [ 14248630.982786947861314, 4329482.435314587317407 ], [ 14248627.800519436597824, 4329485.046934040263295 ], [ 14248625.387650633230805, 4329487.987023183144629 ], [ 14248624.112177954986691, 4329488.373933590017259 ], [ 14248620.481555141508579, 4329490.314541914500296 ], [ 14248617.29928763024509, 4329492.926161367446184 ], [ 14248614.886429186910391, 4329495.866237888112664 ], [ 14248613.610930969938636, 4329496.25315604172647 ], [ 14248609.980308156460524, 4329498.193764366209507 ], [ 14248606.798040645197034, 4329500.805383819155395 ], [ 14248606.555052, 4329501.101466340012848 ], [ 14248603.019736295565963, 4329502.173892634920776 ], [ 14248599.389113482087851, 4329504.114500959403813 ], [ 14248596.206845970824361, 4329506.726120412349701 ], [ 14248595.963869251310825, 4329507.022188401781023 ], [ 14248592.428530186414719, 4329508.09462178312242 ], [ 14248588.797907372936606, 4329510.035230107605457 ], [ 14248585.615639861673117, 4329512.646849560551345 ], [ 14248585.372675085440278, 4329512.942902998067439 ], [ 14248581.837312651798129, 4329514.015343467704952 ], [ 14248578.206689838320017, 4329515.955951792187989 ], [ 14248575.024422327056527, 4329518.567571245133877 ], [ 14248574.781469490379095, 4329518.863610133528709 ], [ 14248571.246083682402968, 4329519.936057694256306 ], [ 14248567.615460868924856, 4329521.876666018739343 ], [ 14248564.433193357661366, 4329524.488285471685231 ], [ 14248564.19025245308876, 4329524.784309820272028 ], [ 14248560.654843289405107, 4329525.85676446557045 ], [ 14248557.024220475926995, 4329527.797372790053487 ], [ 14248553.841952964663506, 4329530.408992242999375 ], [ 14248553.599024, 4329530.705002042464912 ], [ 14248550.063591470941901, 4329531.777463776059449 ], [ 14248546.432968657463789, 4329533.718072100542486 ], [ 14248543.250701146200299, 4329536.329691553488374 ], [ 14248543.007784115150571, 4329536.625686812214553 ], [ 14248539.472328219562769, 4329537.698155634105206 ], [ 14248535.841705406084657, 4329539.638763958588243 ], [ 14248532.659437894821167, 4329542.250383411534131 ], [ 14248532.41653280518949, 4329542.546364120207727 ], [ 14248528.881053538993001, 4329543.618840031325817 ], [ 14248525.250430725514889, 4329545.559448355808854 ], [ 14248522.068163214251399, 4329548.171067808754742 ], [ 14248521.825270062312484, 4329548.467033970169723 ], [ 14248518.289767432957888, 4329549.539516968652606 ], [ 14248514.659144619479775, 4329551.480125293135643 ], [ 14248511.476877108216286, 4329554.091744746081531 ], [ 14248511.233995893970132, 4329554.387696362100542 ], [ 14248507.698469895869493, 4329555.46018644887954 ], [ 14248504.067847082391381, 4329557.400794773362577 ], [ 14248502.651129754260182, 4329558.563464637845755 ], [ 14248500.114903781563044, 4329558.81326109264046 ], [ 14248496.175448464229703, 4329560.008281799033284 ], [ 14248492.544825650751591, 4329561.948890123516321 ], [ 14248491.128124374896288, 4329563.111546812579036 ], [ 14248488.59187288582325, 4329563.36134578101337 ], [ 14248484.652417568489909, 4329564.556366487406194 ], [ 14248481.021794755011797, 4329566.496974811889231 ], [ 14248479.605109510943294, 4329567.659618345089257 ], [ 14248477.068832522258162, 4329567.909419824369252 ], [ 14248473.129377204924822, 4329569.104440530762076 ], [ 14248469.49875439144671, 4329571.045048855245113 ], [ 14248468.082085186615586, 4329572.207679225131869 ], [ 14248465.545782692730427, 4329572.457483217120171 ], [ 14248461.606327375397086, 4329573.652503923512995 ], [ 14248457.975704561918974, 4329575.593112247996032 ], [ 14248456.559051398187876, 4329576.755729453638196 ], [ 14248454.022723395377398, 4329577.005535957403481 ], [ 14248450.083268078044057, 4329578.200556663796306 ], [ 14248446.452645264565945, 4329580.141164988279343 ], [ 14248445.036008140072227, 4329581.303769029676914 ], [ 14248442.499654633924365, 4329581.553578046150506 ], [ 14248438.560199316591024, 4329582.74859875254333 ], [ 14248434.929576503112912, 4329584.689207077026367 ], [ 14248433.512955425307155, 4329585.851797949522734 ], [ 14248430.976576406508684, 4329586.101609478704631 ], [ 14248427.037121089175344, 4329587.296630185097456 ], [ 14248423.406498275697231, 4329589.237238509580493 ], [ 14248421.989893231540918, 4329590.399816224351525 ], [ 14248419.453488713130355, 4329590.649630264379084 ], [ 14248415.514033395797014, 4329591.844650970771909 ], [ 14248411.883410582318902, 4329593.785259295254946 ], [ 14248410.46682158485055, 4329594.947823841124773 ], [ 14248407.930391553789377, 4329595.197640393860638 ], [ 14248403.990936236456037, 4329596.392661100253463 ], [ 14248400.360313422977924, 4329598.3332694247365 ], [ 14248398.943740459159017, 4329599.495820811018348 ], [ 14248396.407284930348396, 4329599.745639875531197 ], [ 14248392.467829613015056, 4329600.940660581924021 ], [ 14248389.281119387596846, 4329602.643992684781551 ], [ 14248387.509681183844805, 4329602.469521250575781 ], [ 14248383.412784421816468, 4329602.873030361719429 ], [ 14248379.473329104483128, 4329604.068051068112254 ], [ 14248376.286641387268901, 4329605.771371139213443 ], [ 14248374.515173463150859, 4329605.59689677786082 ], [ 14248370.418276701122522, 4329606.000405889004469 ], [ 14248366.478821383789182, 4329607.195426595397294 ], [ 14248363.29215619340539, 4329608.898734626360238 ], [ 14248361.52065853215754, 4329608.724257335998118 ], [ 14248357.423761770129204, 4329609.127766447141767 ], [ 14248353.484306452795863, 4329610.322787153534591 ], [ 14248350.297663768753409, 4329612.026083154603839 ], [ 14248348.526136394590139, 4329611.851602937094867 ], [ 14248344.429239632561803, 4329612.255112048238516 ], [ 14248340.489784315228462, 4329613.450132754631341 ], [ 14248337.303164158016443, 4329615.153416715562344 ], [ 14248335.531607042998075, 4329614.978933569043875 ], [ 14248331.434710280969739, 4329615.382442680187523 ], [ 14248327.495254963636398, 4329616.577463386580348 ], [ 14248324.308657322078943, 4329618.280735312029719 ], [ 14248322.537070479243994, 4329618.106249238364398 ], [ 14248318.440173717215657, 4329618.509758349508047 ], [ 14248314.500718399882317, 4329619.704779055900872 ], [ 14248311.314143275842071, 4329621.408038945868611 ], [ 14248309.542526707053185, 4329621.233549944125116 ], [ 14248305.445629945024848, 4329621.637059055268764 ], [ 14248301.506174627691507, 4329622.832079761661589 ], [ 14248298.31962201371789, 4329624.535327619872987 ], [ 14248296.547975726425648, 4329624.36083569098264 ], [ 14248292.451078964397311, 4329624.764344802126288 ], [ 14248288.511623647063971, 4329625.959365508519113 ], [ 14248285.325093563646078, 4329627.662601323798299 ], [ 14248283.553417531773448, 4329627.488106464967132 ], [ 14248279.456520769745111, 4329627.89161557611078 ], [ 14248275.517065452411771, 4329629.086636282503605 ], [ 14248272.330557877197862, 4329630.789860066026449 ], [ 14248270.558852132409811, 4329630.615362280979753 ], [ 14248266.461955370381474, 4329631.018871392123401 ], [ 14248262.522500053048134, 4329632.213892098516226 ], [ 14248258.891877239570022, 4329634.154500422999263 ], [ 14248255.709609728306532, 4329636.766119875945151 ], [ 14248253.097990274429321, 4329639.948387387208641 ], [ 14248251.157381949946284, 4329643.579010201618075 ], [ 14248249.962361244484782, 4329647.518465518951416 ], [ 14248249.558852132409811, 4329651.615362280979753 ], [ 14248249.962361244484782, 4329655.712259043008089 ], [ 14248251.157381949946284, 4329659.65171436034143 ], [ 14248253.097990274429321, 4329663.282337174750865 ], [ 14248255.709609728306532, 4329666.464604686014354 ], [ 14248258.891877239570022, 4329669.076224138960242 ], [ 14248262.522500053048134, 4329671.016832463443279 ], [ 14248266.461955370381474, 4329672.211853169836104 ], [ 14248270.558852132409811, 4329672.615362280979753 ], [ 14248274.655748894438148, 4329672.211853169836104 ], [ 14248278.595204211771488, 4329671.016832463443279 ], [ 14248281.781711786985397, 4329669.313608679920435 ], [ 14248283.553417531773448, 4329669.488106464967132 ], [ 14248287.650314293801785, 4329669.084597353823483 ], [ 14248291.589769611135125, 4329667.889576647430658 ], [ 14248294.776299694553018, 4329666.186340832151473 ], [ 14248296.547975726425648, 4329666.36083569098264 ], [ 14248300.644872488453984, 4329665.957326579838991 ], [ 14248304.584327805787325, 4329664.762305873446167 ], [ 14248307.770880419760942, 4329663.059058015234768 ], [ 14248309.542526707053185, 4329663.233549944125116 ], [ 14248313.639423469081521, 4329662.830040832981467 ], [ 14248317.578878786414862, 4329661.635020126588643 ], [ 14248320.765453910455108, 4329659.931760236620903 ], [ 14248322.537070479243994, 4329660.106249238364398 ], [ 14248326.63396724127233, 4329659.70274012722075 ], [ 14248330.573422558605671, 4329658.507719420827925 ], [ 14248333.760020200163126, 4329656.804447495378554 ], [ 14248335.531607042998075, 4329656.978933569043875 ], [ 14248339.628503805026412, 4329656.575424457900226 ], [ 14248343.567959122359753, 4329655.380403751507401 ], [ 14248346.754579279571772, 4329653.677119790576398 ], [ 14248348.526136394590139, 4329653.851602937094867 ], [ 14248352.623033156618476, 4329653.448093825951219 ], [ 14248356.562488473951817, 4329652.253073119558394 ], [ 14248359.74913115799427, 4329650.549777118489146 ], [ 14248361.52065853215754, 4329650.724257335998118 ], [ 14248365.617555294185877, 4329650.320748224854469 ], [ 14248369.557010611519217, 4329649.125727518461645 ], [ 14248372.743675801903009, 4329647.422419487498701 ], [ 14248374.515173463150859, 4329647.59689677786082 ], [ 14248378.612070225179195, 4329647.193387666717172 ], [ 14248382.551525542512536, 4329645.998366960324347 ], [ 14248385.738213259726763, 4329644.295046889223158 ], [ 14248387.509681183844805, 4329644.469521250575781 ], [ 14248391.606577945873141, 4329644.066012139432132 ], [ 14248395.546033263206482, 4329642.870991433039308 ], [ 14248398.732743488624692, 4329641.167659330181777 ], [ 14248400.504181692376733, 4329641.342130764387548 ], [ 14248404.601078454405069, 4329640.938621653243899 ], [ 14248408.54053377173841, 4329639.743600946851075 ], [ 14248412.171156585216522, 4329637.802992622368038 ], [ 14248413.58772954903543, 4329636.64044123608619 ], [ 14248416.12418507784605, 4329636.390622171573341 ], [ 14248420.063640395179391, 4329635.195601465180516 ], [ 14248423.694263208657503, 4329633.254993140697479 ], [ 14248425.110852206125855, 4329632.092428594827652 ], [ 14248427.647282237187028, 4329631.842612042091787 ], [ 14248431.586737554520369, 4329630.647591335698962 ], [ 14248435.217360367998481, 4329628.706983011215925 ], [ 14248436.633965412154794, 4329627.544405296444893 ], [ 14248439.170369930565357, 4329627.294591256417334 ], [ 14248443.109825247898698, 4329626.099570550024509 ], [ 14248446.74044806137681, 4329624.158962225541472 ], [ 14248448.157069139182568, 4329622.996371353045106 ], [ 14248450.693448157981038, 4329622.746559823863208 ], [ 14248454.632903475314379, 4329621.551539117470384 ], [ 14248458.263526288792491, 4329619.610930792987347 ], [ 14248459.680163413286209, 4329618.448326751589775 ], [ 14248462.216516919434071, 4329618.198517735116184 ], [ 14248466.155972236767411, 4329617.003497028723359 ], [ 14248469.786595050245523, 4329615.062888704240322 ], [ 14248471.203248213976622, 4329613.900271498598158 ], [ 14248473.7395762167871, 4329613.650464994832873 ], [ 14248477.67903153412044, 4329612.455444288440049 ], [ 14248481.309654347598553, 4329610.514835963957012 ], [ 14248482.726323552429676, 4329609.352205594070256 ], [ 14248485.262626046314836, 4329609.102401602081954 ], [ 14248489.202081363648176, 4329607.90738089568913 ], [ 14248492.832704177126288, 4329605.966772571206093 ], [ 14248494.249389421194792, 4329604.804129038006067 ], [ 14248496.785666409879923, 4329604.554327558726072 ], [ 14248500.725121727213264, 4329603.359306852333248 ], [ 14248504.355744540691376, 4329601.418698527850211 ], [ 14248505.772445816546679, 4329600.256041838787496 ], [ 14248508.308697305619717, 4329600.006242870353162 ], [ 14248512.248152622953057, 4329598.811222163960338 ], [ 14248515.87877543643117, 4329596.870613839477301 ], [ 14248517.295492764562368, 4329595.707943974994123 ], [ 14248519.831718737259507, 4329595.458147520199418 ], [ 14248523.771174054592848, 4329594.263126813806593 ], [ 14248527.40179686807096, 4329592.322518489323556 ], [ 14248530.58406437933445, 4329589.710899036377668 ], [ 14248530.826945593580604, 4329589.414947420358658 ], [ 14248534.362471591681242, 4329588.342457333579659 ], [ 14248537.993094405159354, 4329586.401849009096622 ], [ 14248541.175361916422844, 4329583.790229556150734 ], [ 14248541.418255068361759, 4329583.494263394735754 ], [ 14248544.953757697716355, 4329582.421780396252871 ], [ 14248548.584380511194468, 4329580.481172071769834 ], [ 14248551.766648022457957, 4329577.869552618823946 ], [ 14248552.009553112089634, 4329577.573571910150349 ], [ 14248555.545032378286123, 4329576.501095999032259 ], [ 14248559.175655191764235, 4329574.560487674549222 ], [ 14248562.357922703027725, 4329571.948868221603334 ], [ 14248562.600839734077454, 4329571.652872962877154 ], [ 14248566.136295629665256, 4329570.580404140986502 ], [ 14248569.766918443143368, 4329568.639795816503465 ], [ 14248572.949185954406857, 4329566.028176363557577 ], [ 14248573.192114919424057, 4329565.73216656409204 ], [ 14248576.727547448128462, 4329564.659704830497503 ], [ 14248580.358170261606574, 4329562.719096506014466 ], [ 14248583.540437772870064, 4329560.107477053068578 ], [ 14248583.78337867744267, 4329559.811452704481781 ], [ 14248587.318787841126323, 4329558.738998059183359 ], [ 14248590.949410654604435, 4329556.798389734700322 ], [ 14248594.131678165867925, 4329554.186770281754434 ], [ 14248594.374631002545357, 4329553.890731393359601 ], [ 14248597.910016810521483, 4329552.818283832632005 ], [ 14248601.540639623999596, 4329550.877675508148968 ], [ 14248604.722907135263085, 4329548.26605605520308 ], [ 14248604.965871911495924, 4329547.970002617686987 ], [ 14248608.501234345138073, 4329546.897562148049474 ], [ 14248612.131857158616185, 4329544.956953823566437 ], [ 14248615.314124669879675, 4329542.345334370620549 ], [ 14248615.55710138939321, 4329542.049266381189227 ], [ 14248619.092440454289317, 4329540.976832999847829 ], [ 14248622.723063267767429, 4329539.036224675364792 ], [ 14248625.905330779030919, 4329536.424605222418904 ], [ 14248626.148319425061345, 4329536.128522701561451 ], [ 14248629.68363512866199, 4329535.056096406653523 ], [ 14248633.314257942140102, 4329533.115488082170486 ], [ 14248636.496525453403592, 4329530.503868629224598 ], [ 14248638.909383896738291, 4329527.563792108558118 ], [ 14248640.184882113710046, 4329527.176873954944313 ], [ 14248643.815504927188158, 4329525.236265630461276 ], [ 14248646.997772438451648, 4329522.624646177515388 ], [ 14248649.410641241818666, 4329519.684557034634054 ], [ 14248650.68611392006278, 4329519.297646627761424 ], [ 14248654.316736733540893, 4329517.357038303278387 ], [ 14248657.499004244804382, 4329514.745418850332499 ], [ 14248659.911883411929011, 4329511.805317079648376 ], [ 14248661.187330555170774, 4329511.418414418585598 ], [ 14248664.817953368648887, 4329509.477806094102561 ], [ 14248668.000220879912376, 4329506.866186641156673 ], [ 14248670.413110410794616, 4329503.926072242669761 ], [ 14248671.688532011583447, 4329503.539177329279482 ], [ 14248675.31915482506156, 4329501.598569004796445 ], [ 14248678.501422336325049, 4329498.986949551850557 ], [ 14248680.914322225376964, 4329496.046822531148791 ], [ 14248682.189718294888735, 4329495.659935362637043 ], [ 14248685.820341108366847, 4329493.719327038154006 ], [ 14248689.002608619630337, 4329491.107707585208118 ], [ 14248691.415518885478377, 4329488.167567919008434 ], [ 14248692.690889401361346, 4329487.780688502825797 ], [ 14248696.321512214839458, 4329485.84008017834276 ], [ 14248699.503779726102948, 4329483.228460725396872 ], [ 14248701.916700348258018, 4329480.288308442570269 ], [ 14248703.192045329138637, 4329479.901436771266162 ], [ 14248706.822668142616749, 4329477.960828446783125 ], [ 14248710.004935653880239, 4329475.349208993837237 ], [ 14248712.417866639792919, 4329472.409044080413878 ], [ 14248713.693186085671186, 4329472.022180155850947 ], [ 14248717.323808899149299, 4329470.08157183136791 ], [ 14248720.506076410412788, 4329467.469952378422022 ], [ 14248722.919017760083079, 4329464.529774838127196 ], [ 14248724.194311663508415, 4329464.142918661236763 ], [ 14248727.824934476986527, 4329462.202310336753726 ], [ 14248731.007201988250017, 4329459.590690883807838 ], [ 14248733.420153703540564, 4329456.650500711984932 ], [ 14248734.695422068238258, 4329456.263652282766998 ], [ 14248738.326044881716371, 4329454.323043958283961 ], [ 14248741.50831239297986, 4329451.711424505338073 ], [ 14248744.119931846857071, 4329448.529156994074583 ], [ 14248745.650521958246827, 4329445.665624301880598 ], [ 14248747.892667677253485, 4329444.467172446660697 ], [ 14248751.074935188516974, 4329441.855552993714809 ], [ 14248753.686554642394185, 4329438.67328548245132 ], [ 14248755.217151697725058, 4329435.809739800170064 ], [ 14248757.45927307009697, 4329434.611300958320498 ], [ 14248760.641540581360459, 4329431.99968150537461 ], [ 14248763.25316003523767, 4329428.817413994111121 ], [ 14248764.783764030784369, 4329425.95385532733053 ], [ 14248767.025861063972116, 4329424.755429495126009 ], [ 14248770.208128575235605, 4329422.143810042180121 ], [ 14248772.819748029112816, 4329418.961542530916631 ], [ 14248774.350358955562115, 4329416.097970898263156 ], [ 14248776.592431657016277, 4329414.899558071047068 ], [ 14248779.774699168279767, 4329412.28793861810118 ], [ 14248782.386318622156978, 4329409.10567110683769 ], [ 14248783.916936494410038, 4329406.242086480371654 ], [ 14248786.158984849229455, 4329405.0436866665259 ], [ 14248789.341252360492945, 4329402.432067213580012 ], [ 14248791.952871814370155, 4329399.249799702316523 ], [ 14248793.483496624976397, 4329396.386202095076442 ], [ 14248795.725520636886358, 4329395.187815292738378 ], [ 14248798.907788148149848, 4329392.57619583979249 ], [ 14248801.519407602027059, 4329389.393928328529 ], [ 14248803.050039356574416, 4329386.530317730270326 ], [ 14248805.292039025574923, 4329385.331943939439952 ], [ 14248808.474306536838412, 4329382.720324486494064 ], [ 14248811.085925990715623, 4329379.538056975230575 ], [ 14248812.616564679890871, 4329376.674433402717113 ], [ 14248814.858540017157793, 4329375.476072617806494 ], [ 14248818.040807528421283, 4329372.864453164860606 ], [ 14248820.652426982298493, 4329369.682185653597116 ], [ 14248822.183072607964277, 4329366.818549102172256 ], [ 14248824.425023600459099, 4329365.620201330631971 ], [ 14248827.607291111722589, 4329363.008581877686083 ], [ 14248830.218910565599799, 4329359.826314366422594 ], [ 14248831.749563131481409, 4329356.962664830498397 ], [ 14248833.991489786654711, 4329355.764330067671835 ], [ 14248837.1737572979182, 4329353.152710614725947 ], [ 14248839.785376751795411, 4329349.970443103462458 ], [ 14248841.725985076278448, 4329346.339820289053023 ], [ 14248842.006018405780196, 4329345.416674115695059 ], [ 14248844.067871071398258, 4329343.724555363878608 ], [ 14248846.679490525275469, 4329340.542287852615118 ], [ 14248848.620098849758506, 4329336.911665038205683 ], [ 14248848.900134777650237, 4329335.988510303199291 ], [ 14248850.961972778663039, 4329334.296403585001826 ], [ 14248853.57359223254025, 4329331.114136073738337 ], [ 14248855.514200557023287, 4329327.483513259328902 ], [ 14248855.794239077717066, 4329326.56034997291863 ], [ 14248857.856062423437834, 4329324.868255283683538 ], [ 14248860.467681877315044, 4329321.685987772420049 ], [ 14248862.408290201798081, 4329318.055364958010614 ], [ 14248862.688331322744489, 4329317.132193103432655 ], [ 14248864.750140003859997, 4329315.440110447816551 ], [ 14248867.361759457737207, 4329312.257842936553061 ], [ 14248869.302367782220244, 4329308.627220122143626 ], [ 14248869.582411497831345, 4329307.704039715230465 ], [ 14248871.644205523654819, 4329306.011969086714089 ], [ 14248874.255824977532029, 4329302.829701575450599 ], [ 14248876.196433302015066, 4329299.199078761041164 ], [ 14248876.476479612290859, 4329298.275889796204865 ], [ 14248878.538258982822299, 4329296.58383119571954 ], [ 14248881.14987843669951, 4329293.40156368445605 ], [ 14248883.090486761182547, 4329289.770940870046616 ], [ 14248883.370535666123033, 4329288.847743353806436 ], [ 14248885.432300381362438, 4329287.15569678042084 ], [ 14248888.043919835239649, 4329283.97342926915735 ], [ 14248889.984528159722686, 4329280.342806454747915 ], [ 14248890.264579663053155, 4329279.419600371271372 ], [ 14248892.326329713687301, 4329277.727565833367407 ], [ 14248894.937949167564511, 4329274.545298322103918 ], [ 14248896.878557492047548, 4329270.914675507694483 ], [ 14248897.15861159004271, 4329269.991460870951414 ], [ 14248899.220346985384822, 4329268.299438360147178 ], [ 14248901.831966439262033, 4329265.117170848883688 ], [ 14248903.77257476374507, 4329261.486548034474254 ], [ 14248904.052631460130215, 4329260.563324832357466 ], [ 14248906.114352196455002, 4329258.871314351446927 ], [ 14248908.725971650332212, 4329255.689046840183437 ], [ 14248910.666579974815249, 4329252.058424025774002 ], [ 14248911.861600680276752, 4329248.118968708440661 ], [ 14248911.9453693497926, 4329247.268451131880283 ], [ 14248912.573258576914668, 4329246.753155760467052 ], [ 14248915.184878030791879, 4329243.570888249203563 ], [ 14248917.125486355274916, 4329239.940265434794128 ], [ 14248918.320507060736418, 4329236.000810117460787 ], [ 14248918.4042760245502, 4329235.15028955694288 ], [ 14248919.032150333747268, 4329234.635006427764893 ], [ 14248921.643769787624478, 4329231.452738916501403 ], [ 14248923.584378112107515, 4329227.822116102091968 ], [ 14248924.779398817569017, 4329223.882660784758627 ], [ 14248924.863168073818088, 4329223.032137245871127 ], [ 14248925.491027465090156, 4329222.516866360791028 ], [ 14248928.102646918967366, 4329219.334598849527538 ], [ 14248930.043255243450403, 4329215.703976035118103 ], [ 14248931.238275948911905, 4329211.764520717784762 ], [ 14248931.322045499458909, 4329210.913994201458991 ], [ 14248931.949889976531267, 4329210.398735554888844 ], [ 14248934.561509430408478, 4329207.216468043625355 ], [ 14248936.502117754891515, 4329203.58584522921592 ], [ 14248937.697138460353017, 4329199.646389911882579 ], [ 14248937.780908303335309, 4329198.795860419049859 ], [ 14248938.408737864345312, 4329198.280614014714956 ], [ 14248941.020357318222523, 4329195.098346503451467 ], [ 14248942.96096564270556, 4329191.467723689042032 ], [ 14248944.155986348167062, 4329187.528268371708691 ], [ 14248944.239756485447288, 4329186.677735899575055 ], [ 14248944.867571126669645, 4329186.162501738406718 ], [ 14248947.479190580546856, 4329182.980234227143228 ], [ 14248949.419798905029893, 4329179.349611412733793 ], [ 14248950.614819610491395, 4329175.410156095400453 ], [ 14248950.698590040206909, 4329174.559620644897223 ], [ 14248951.326389769092202, 4329174.044398723170161 ], [ 14248953.938009222969413, 4329170.862131211906672 ], [ 14248955.87861754745245, 4329167.231508397497237 ], [ 14248957.073638252913952, 4329163.292053080163896 ], [ 14248957.1574089769274, 4329162.441514647565782 ], [ 14248957.785193784162402, 4329161.926304970867932 ], [ 14248960.396813238039613, 4329158.744037459604442 ], [ 14248962.33742156252265, 4329155.113414645195007 ], [ 14248963.532442267984152, 4329151.173959327861667 ], [ 14248963.616213284432888, 4329150.323417927138507 ], [ 14248964.243983181193471, 4329149.808220487087965 ], [ 14248966.855602635070682, 4329146.625952975824475 ], [ 14248968.796210959553719, 4329142.99533016141504 ], [ 14248969.991231665015221, 4329139.0558748440817 ], [ 14248970.075002973899245, 4329138.205330464057624 ], [ 14248970.702757956460118, 4329137.69014526437968 ], [ 14248973.314377410337329, 4329134.50787775311619 ], [ 14248975.254985734820366, 4329130.877254938706756 ], [ 14248976.450006440281868, 4329126.937799621373415 ], [ 14248976.715472547337413, 4329124.242477001622319 ], [ 14248977.474832560867071, 4329123.317194148898125 ], [ 14248979.415440885350108, 4329119.68657133448869 ], [ 14248980.61046159081161, 4329115.747116017155349 ], [ 14248980.875927813351154, 4329113.05179223511368 ], [ 14248981.635278929024935, 4329112.126520222984254 ], [ 14248983.575887253507972, 4329108.49589740857482 ], [ 14248984.770907958969474, 4329104.556442091241479 ], [ 14248985.036374295130372, 4329101.861117149703205 ], [ 14248985.795716525986791, 4329100.935855965130031 ], [ 14248987.736324850469828, 4329097.305233150720596 ], [ 14248988.93134555593133, 4329093.365777833387256 ], [ 14248989.196812007576227, 4329090.670451722107828 ], [ 14248989.956145338714123, 4329089.74520138092339 ], [ 14248991.89675366319716, 4329086.114578566513956 ], [ 14248993.091774368658662, 4329082.175123249180615 ], [ 14248993.357240933924913, 4329079.479795978404582 ], [ 14248994.116565374657512, 4329078.554556471295655 ], [ 14248996.057173699140549, 4329074.92393365688622 ], [ 14248997.252194404602051, 4329070.984478339552879 ], [ 14248997.517661085352302, 4329068.28914989810437 ], [ 14248998.276976631954312, 4329067.363921227864921 ], [ 14249000.217584956437349, 4329063.733298413455486 ], [ 14249001.412605661898851, 4329059.793843096122146 ], [ 14249001.678072458133101, 4329057.09851348400116 ], [ 14249002.437379106879234, 4329056.173295656219125 ], [ 14249004.377987431362271, 4329052.54267284180969 ], [ 14249005.573008136823773, 4329048.603217524476349 ], [ 14249005.838475046679378, 4329045.907886753790081 ], [ 14249006.597772808745503, 4329044.982679754495621 ], [ 14249008.53838113322854, 4329041.352056940086186 ], [ 14249009.733401838690042, 4329037.412601622752845 ], [ 14249009.998868864029646, 4329034.717269688844681 ], [ 14249010.758157730102539, 4329033.792073528282344 ], [ 14249012.698766054585576, 4329030.16145071387291 ], [ 14249013.893786760047078, 4329026.221995396539569 ], [ 14249014.159253900870681, 4329023.526662292890251 ], [ 14249014.918533870950341, 4329022.60147697199136 ], [ 14249016.859142195433378, 4329018.970854157581925 ], [ 14249018.05416290089488, 4329015.031398840248585 ], [ 14249018.457672012969851, 4329010.934502078220248 ]]]),
  });
  loadFeaturesE5.setId('5E');

  var loadFeaturesS5 = new ol.Feature({
    geometry: new Polygon([[[ 14248977.986783623695374, 4328996.067216198891401 ], [ 14248977.583274511620402, 4328991.970319436863065 ], [ 14248976.3882538061589, 4328988.030864119529724 ], [ 14248974.447645481675863, 4328984.400241305120289 ], [ 14248971.836026027798653, 4328981.2179737938568 ], [ 14248968.653758516535163, 4328978.606354340910912 ], [ 14248965.023135703057051, 4328976.665746016427875 ], [ 14248961.08368038572371, 4328975.47072531003505 ], [ 14248956.986783623695374, 4328975.067216198891401 ], [ 14248952.889886861667037, 4328975.47072531003505 ], [ 14248948.950431544333696, 4328976.665746016427875 ], [ 14248945.319808730855584, 4328978.606354340910912 ], [ 14248942.137541219592094, 4328981.2179737938568 ], [ 14248939.525921765714884, 4328984.400241305120289 ], [ 14248937.585313441231847, 4328988.030864119529724 ], [ 14248936.390292735770345, 4328991.970319436863065 ], [ 14248936.087553529068828, 4328995.044082185253501 ], [ 14248934.945263758301735, 4328996.435966297052801 ], [ 14248933.004655433818698, 4329000.066589111462235 ], [ 14248931.809634728357196, 4329004.006044428795576 ], [ 14248931.506895696744323, 4329007.079805394634604 ], [ 14248930.364595364779234, 4329008.471702376380563 ], [ 14248928.423987040296197, 4329012.102325190789998 ], [ 14248927.228966334834695, 4329016.041780508123338 ], [ 14248926.926227478310466, 4329019.115539698861539 ], [ 14248925.783916585147381, 4329020.507449548691511 ], [ 14248923.843308260664344, 4329024.138072363100946 ], [ 14248922.648287555202842, 4329028.077527680434287 ], [ 14248922.345548873767257, 4329031.151285090483725 ], [ 14248921.203227411955595, 4329032.543207818642259 ], [ 14248919.262619087472558, 4329036.173830633051693 ], [ 14248918.067598382011056, 4329040.113285950385034 ], [ 14248917.764859875664115, 4329043.187041584402323 ], [ 14248916.622527852654457, 4329044.578977181576192 ], [ 14248914.68191952817142, 4329048.209599995985627 ], [ 14248913.486898822709918, 4329052.149055313318968 ], [ 14248913.184160491451621, 4329055.222809160128236 ], [ 14248912.041817901656032, 4329056.614757633768022 ], [ 14248910.101209577172995, 4329060.245380448177457 ], [ 14248908.906188871711493, 4329064.184835765510798 ], [ 14248908.60345071554184, 4329067.258587843738496 ], [ 14248907.461097566410899, 4329068.650549182668328 ], [ 14248905.520489241927862, 4329072.281171997077763 ], [ 14248904.32546853646636, 4329076.220627314411104 ], [ 14248904.022730555385351, 4329079.294377612881362 ], [ 14248902.880366841331124, 4329080.686351825483143 ], [ 14248900.939758516848087, 4329084.316974639892578 ], [ 14248899.744737811386585, 4329088.256429957225919 ], [ 14248899.442000007256866, 4329091.330178469419479 ], [ 14248898.299625724554062, 4329092.722165559418499 ], [ 14248896.359017400071025, 4329096.352788373827934 ], [ 14248895.163996694609523, 4329100.292243691161275 ], [ 14248894.861259065568447, 4329103.365990426391363 ], [ 14248893.718874223530293, 4329104.757990382611752 ], [ 14248891.778265899047256, 4329108.388613197021186 ], [ 14248890.731490802019835, 4329111.83936823438853 ], [ 14248888.152473079040647, 4329114.981910422444344 ], [ 14248886.21186475455761, 4329118.612533236853778 ], [ 14248885.165092781186104, 4329122.063277977518737 ], [ 14248882.586061304435134, 4329125.205836924724281 ], [ 14248880.645452979952097, 4329128.836459739133716 ], [ 14248879.598684119060636, 4329132.287194220349193 ], [ 14248877.019638910889626, 4329135.429769898764789 ], [ 14248875.079030586406589, 4329139.060392713174224 ], [ 14248874.032264847308397, 4329142.511116906069219 ], [ 14248871.45320588350296, 4329145.653709344565868 ], [ 14248869.512597559019923, 4329149.284332158975303 ], [ 14248868.465834936127067, 4329152.735046074725688 ], [ 14248865.886762229725718, 4329155.877655260264874 ], [ 14248863.946153905242682, 4329159.508278074674308 ], [ 14248862.89939440228045, 4329162.958981709554791 ], [ 14248860.320307951420546, 4329166.101607641205192 ], [ 14248858.379699626937509, 4329169.732230455614626 ], [ 14248857.332943245768547, 4329173.182923797518015 ], [ 14248854.753843039274216, 4329176.325566491112113 ], [ 14248852.813234714791179, 4329179.956189305521548 ], [ 14248851.766481447964907, 4329183.406872382387519 ], [ 14248849.187367502599955, 4329186.549531816504896 ], [ 14248847.246759178116918, 4329190.18015463091433 ], [ 14248846.200009029358625, 4329193.630827425979078 ], [ 14248843.620881341397762, 4329196.773503606207669 ], [ 14248841.680273016914725, 4329200.404126420617104 ], [ 14248840.633525988087058, 4329203.854788929224014 ], [ 14248838.054384548217058, 4329206.99748186673969 ], [ 14248836.113776223734021, 4329210.628104681149125 ], [ 14248835.874567797407508, 4329211.416669185273349 ], [ 14248833.899140931665897, 4329213.037860115990043 ], [ 14248831.287521477788687, 4329216.220127627253532 ], [ 14248829.34691315330565, 4329219.850750441662967 ], [ 14248829.107707230374217, 4329220.639306689612567 ], [ 14248827.132266283035278, 4329222.260509178042412 ], [ 14248824.520646829158068, 4329225.442776689305902 ], [ 14248822.580038504675031, 4329229.073399503715336 ], [ 14248822.340835094451904, 4329229.861947472207248 ], [ 14248820.365380054339767, 4329231.483161524869502 ], [ 14248817.753760600462556, 4329234.665429036132991 ], [ 14248815.813152275979519, 4329238.296051850542426 ], [ 14248815.573951371014118, 4329239.084591560065746 ], [ 14248813.598482245579362, 4329240.705817172303796 ], [ 14248810.986862791702151, 4329243.888084683567286 ], [ 14248809.046254467219114, 4329247.51870749797672 ], [ 14248808.80705607496202, 4329248.307238924317062 ], [ 14248806.831572853028774, 4329249.928476105444133 ], [ 14248804.219953399151564, 4329253.110743616707623 ], [ 14248802.279345074668527, 4329256.741366431117058 ], [ 14248802.040149189531803, 4329257.529889591038227 ], [ 14248800.064651882275939, 4329259.151138331741095 ], [ 14248797.453032428398728, 4329262.333405843004584 ], [ 14248795.512424103915691, 4329265.964028657414019 ], [ 14248795.273230727761984, 4329266.752543546259403 ], [ 14248793.297719329595566, 4329268.37380385119468 ], [ 14248790.686099875718355, 4329271.556071362458169 ], [ 14248788.745491551235318, 4329275.186694176867604 ], [ 14248788.506300685927272, 4329275.975200784392655 ], [ 14248786.530775194987655, 4329277.596472656354308 ], [ 14248783.919155741110444, 4329280.778740167617798 ], [ 14248781.978547416627407, 4329284.409362982027233 ], [ 14248781.739359058439732, 4329285.197861330583692 ], [ 14248779.763819480314851, 4329286.819144762121141 ], [ 14248777.15220002643764, 4329290.001412273384631 ], [ 14248775.211591701954603, 4329293.632035087794065 ], [ 14248774.972405854612589, 4329294.420525158755481 ], [ 14248772.996852181851864, 4329296.041820157319307 ], [ 14248770.385232727974653, 4329299.224087668582797 ], [ 14248769.097136426717043, 4329301.633946350775659 ], [ 14248767.216172531247139, 4329302.639342498965561 ], [ 14248764.033905019983649, 4329305.250961951911449 ], [ 14248761.422285566106439, 4329308.433229463174939 ], [ 14248760.134195368736982, 4329310.843076725490391 ], [ 14248758.253210136666894, 4329311.848484278656542 ], [ 14248755.070942625403404, 4329314.46010373160243 ], [ 14248752.459323171526194, 4329317.64237124286592 ], [ 14248751.171239085495472, 4329320.052207069471478 ], [ 14248749.290232505649328, 4329321.057626034133136 ], [ 14248746.107964994385839, 4329323.669245487079024 ], [ 14248743.496345540508628, 4329326.851512998342514 ], [ 14248742.208267549052835, 4329329.261337425559759 ], [ 14248740.327239647507668, 4329330.26676778588444 ], [ 14248737.144972136244178, 4329332.878387238830328 ], [ 14248734.533352682366967, 4329336.060654750093818 ], [ 14248733.245280805975199, 4329338.470467736013234 ], [ 14248731.364231556653976, 4329339.475909506902099 ], [ 14248728.181964045390487, 4329342.087528959847987 ], [ 14248725.570344591513276, 4329345.269796471111476 ], [ 14248724.282278817147017, 4329347.679598041810095 ], [ 14248722.401208227500319, 4329348.685051219537854 ], [ 14248719.21894071623683, 4329351.296670672483742 ], [ 14248716.607321262359619, 4329354.478938183747232 ], [ 14248715.319261597469449, 4329356.88872832339257 ], [ 14248713.438169673085213, 4329357.894192905165255 ], [ 14248710.255902161821723, 4329360.505812358111143 ], [ 14248707.644282707944512, 4329363.688079869374633 ], [ 14248706.356229141354561, 4329366.097858598455787 ], [ 14248704.47511588409543, 4329367.103334583342075 ], [ 14248701.292848372831941, 4329369.714954036287963 ], [ 14248698.68122891895473, 4329372.897221547551453 ], [ 14248697.393181458115578, 4329375.306988854892552 ], [ 14248695.512046860530972, 4329376.312476245686412 ], [ 14248692.329779349267483, 4329378.9240956986323 ], [ 14248689.718159895390272, 4329382.10636320989579 ], [ 14248688.430118545889854, 4329384.516119086183608 ], [ 14248686.548962602391839, 4329385.521617885679007 ], [ 14248683.366695091128349, 4329388.133237338624895 ], [ 14248681.205176563933492, 4329390.767055284231901 ], [ 14248680.553624115884304, 4329390.964701558463275 ], [ 14248676.923001302406192, 4329392.905309882946312 ], [ 14248673.740733791142702, 4329395.5169293358922 ], [ 14248671.579223848879337, 4329398.150736821815372 ], [ 14248670.927649773657322, 4329398.348389656282961 ], [ 14248667.29702696017921, 4329400.288997980765998 ], [ 14248664.11475944891572, 4329402.900617433711886 ], [ 14248661.953258076682687, 4329405.534414475783706 ], [ 14248661.301662392914295, 4329405.732073865830898 ], [ 14248657.671039579436183, 4329407.672682190313935 ], [ 14248654.488772068172693, 4329410.284301643259823 ], [ 14248652.327279264107347, 4329412.918088245205581 ], [ 14248651.675661966204643, 4329413.115754191763699 ], [ 14248648.045039152726531, 4329415.056362516246736 ], [ 14248644.862771641463041, 4329417.667981969192624 ], [ 14248642.701287420466542, 4329420.301758112385869 ], [ 14248642.049648499116302, 4329420.49943061824888 ], [ 14248638.419025685638189, 4329422.440038942731917 ], [ 14248635.2367581743747, 4329425.051658395677805 ], [ 14248633.075282527133822, 4329427.68542409222573 ], [ 14248632.423621993511915, 4329427.883103153668344 ], [ 14248628.792999180033803, 4329429.823711478151381 ], [ 14248625.610731668770313, 4329432.435330931097269 ], [ 14248623.449264599010348, 4329435.069086176343262 ], [ 14248622.797582441940904, 4329435.266771797090769 ], [ 14248619.166959628462791, 4329437.207380121573806 ], [ 14248615.984692117199302, 4329439.818999574519694 ], [ 14248613.823233626782894, 4329442.452744365669787 ], [ 14248613.171529849991202, 4329442.650436544790864 ], [ 14248609.54090703651309, 4329444.591044869273901 ], [ 14248606.3586395252496, 4329447.202664322219789 ], [ 14248604.197189604863524, 4329449.836398670449853 ], [ 14248603.545464217662811, 4329450.034097405150533 ], [ 14248599.914841404184699, 4329451.97470572963357 ], [ 14248596.732573892921209, 4329454.586325182579458 ], [ 14248594.571132557466626, 4329457.220049070194364 ], [ 14248593.91938554123044, 4329457.417754366062582 ], [ 14248590.288762727752328, 4329459.358362690545619 ], [ 14248587.106495216488838, 4329461.969982143491507 ], [ 14248586.765853786841035, 4329462.385054927319288 ], [ 14248583.472115574404597, 4329463.384199490770698 ], [ 14248579.841492760926485, 4329465.324807815253735 ], [ 14248576.659225249662995, 4329467.936427268199623 ], [ 14248576.318595370277762, 4329468.351485977880657 ], [ 14248573.024834243580699, 4329469.350637492723763 ], [ 14248569.394211430102587, 4329471.2912458172068 ], [ 14248566.211943918839097, 4329473.902865270152688 ], [ 14248565.871325597167015, 4329474.317909896373749 ], [ 14248562.577541545033455, 4329475.31706836540252 ], [ 14248558.946918731555343, 4329477.257676689885557 ], [ 14248555.764651220291853, 4329479.869296142831445 ], [ 14248555.424044443294406, 4329480.284326702356339 ], [ 14248552.13023748062551, 4329481.283492120914161 ], [ 14248548.499614667147398, 4329483.224100445397198 ], [ 14248545.317347155883908, 4329485.835719898343086 ], [ 14248544.976751936599612, 4329486.250736374408007 ], [ 14248541.682922050356865, 4329487.249908747151494 ], [ 14248538.052299236878753, 4329489.190517071634531 ], [ 14248534.870031725615263, 4329491.802136524580419 ], [ 14248534.529448060318828, 4329492.217138921841979 ], [ 14248531.235595256090164, 4329493.216318246908486 ], [ 14248527.604972442612052, 4329495.156926571391523 ], [ 14248524.422704931348562, 4329497.768546024337411 ], [ 14248524.082132816314697, 4329498.183534348383546 ], [ 14248520.788257094100118, 4329499.18272062484175 ], [ 14248517.157634280622005, 4329501.123328949324787 ], [ 14248513.975366769358516, 4329503.734948402270675 ], [ 14248513.634806210175157, 4329504.149922644719481 ], [ 14248510.340907568112016, 4329505.149115874432027 ], [ 14248506.710284754633904, 4329507.089724198915064 ], [ 14248503.528017243370414, 4329509.701343651860952 ], [ 14248503.187468234449625, 4329510.116303820163012 ], [ 14248499.893546674400568, 4329511.115504002198577 ], [ 14248496.262923860922456, 4329513.056112326681614 ], [ 14248493.080656349658966, 4329515.667731779627502 ], [ 14248492.740118891000748, 4329516.082677873782814 ], [ 14248489.44617441482842, 4329517.081885007210076 ], [ 14248485.815551601350307, 4329519.022493331693113 ], [ 14248484.36626604013145, 4329520.211891253478825 ], [ 14248481.380087092518806, 4329520.506004208698869 ], [ 14248477.440631775185466, 4329521.701024915091693 ], [ 14248473.810008961707354, 4329523.64163323957473 ], [ 14248472.360740907490253, 4329524.831016792915761 ], [ 14248469.374534444883466, 4329525.125132458284497 ], [ 14248465.435079127550125, 4329526.320153164677322 ], [ 14248461.804456314072013, 4329528.260761489160359 ], [ 14248460.355205770581961, 4329529.450130673125386 ], [ 14248457.368971787393093, 4329529.744249048642814 ], [ 14248453.429516470059752, 4329530.939269755035639 ], [ 14248449.79889365658164, 4329532.879878079518676 ], [ 14248448.3496606182307, 4329534.069232896901667 ], [ 14248445.363399125635624, 4329534.363353981636465 ], [ 14248441.423943808302283, 4329535.558374688029289 ], [ 14248437.793320994824171, 4329537.498983012512326 ], [ 14248436.344105467200279, 4329538.688323458656669 ], [ 14248433.357816452160478, 4329538.982447254471481 ], [ 14248429.418361134827137, 4329540.177467960864305 ], [ 14248425.787738321349025, 4329542.118076285347342 ], [ 14248424.338540306314826, 4329543.307402360253036 ], [ 14248421.352223770692945, 4329543.60152886621654 ], [ 14248417.412768453359604, 4329544.796549572609365 ], [ 14248413.782145639881492, 4329546.737157897092402 ], [ 14248412.332965133711696, 4329547.926469603553414 ], [ 14248409.346621079370379, 4329548.220598819665611 ], [ 14248405.407165762037039, 4329549.415619526058435 ], [ 14248401.776542948558927, 4329551.356227850541472 ], [ 14248400.327379956841469, 4329552.545525182038546 ], [ 14248397.341008374467492, 4329552.839657110162079 ], [ 14248393.401553057134151, 4329554.034677816554904 ], [ 14248389.770930243656039, 4329555.975286141037941 ], [ 14248388.321784753352404, 4329557.164569109678268 ], [ 14248385.335385669022799, 4329557.458703746087849 ], [ 14248381.395930351689458, 4329558.653724452480674 ], [ 14248377.765307538211346, 4329560.594332776963711 ], [ 14248376.316179562360048, 4329561.783601371571422 ], [ 14248373.329752948135138, 4329562.07773871999234 ], [ 14248369.390297630801797, 4329563.272759426385164 ], [ 14248367.120881363749504, 4329564.485787693411112 ], [ 14248366.084569619968534, 4329564.383719895035028 ], [ 14248361.987672857940197, 4329564.787229006178677 ], [ 14248358.048217540606856, 4329565.982249712571502 ], [ 14248355.778818456456065, 4329567.195268795825541 ], [ 14248354.742484074085951, 4329567.093198767863214 ], [ 14248350.645587312057614, 4329567.496707879006863 ], [ 14248346.706131994724274, 4329568.691728585399687 ], [ 14248344.436750082299113, 4329569.904738489538431 ], [ 14248343.400393081828952, 4329569.802666234783828 ], [ 14248339.303496319800615, 4329570.206175345927477 ], [ 14248335.364041002467275, 4329571.401196052320302 ], [ 14248333.094676261767745, 4329572.614196778275073 ], [ 14248332.058296633884311, 4329572.512122293934226 ], [ 14248327.961399871855974, 4329572.915631405077875 ], [ 14248324.021944554522634, 4329574.110652111470699 ], [ 14248321.75259699113667, 4329575.323643655516207 ], [ 14248320.716194739565253, 4329575.221566943451762 ], [ 14248316.619297977536917, 4329575.625076054595411 ], [ 14248312.679842660203576, 4329576.820096760988235 ], [ 14248310.410512274131179, 4329578.03307912312448 ], [ 14248309.374087391421199, 4329577.931000182405114 ], [ 14248305.277190629392862, 4329578.334509293548763 ], [ 14248301.337735312059522, 4329579.52953 ], [ 14248299.068422105163336, 4329580.742503180168569 ], [ 14248298.031974595040083, 4329580.640422010794282 ], [ 14248293.935077833011746, 4329581.043931121937931 ], [ 14248289.995622515678406, 4329582.238951828330755 ], [ 14248287.726326478645205, 4329583.451915831305087 ], [ 14248286.689856342971325, 4329583.349832433275878 ], [ 14248282.592959580942988, 4329583.753341544419527 ], [ 14248278.653504263609648, 4329584.948362250812352 ], [ 14248276.384225405752659, 4329586.161317070946097 ], [ 14248275.347732650116086, 4329586.059231445193291 ], [ 14248271.250835888087749, 4329586.462740556336939 ], [ 14248267.311380570754409, 4329587.657761262729764 ], [ 14248265.042118890210986, 4329588.870706901885569 ], [ 14248264.005603497847915, 4329588.768619046546519 ], [ 14248259.908706735819578, 4329589.172128157690167 ], [ 14248255.969251418486238, 4329590.367148864082992 ], [ 14248252.338628605008125, 4329592.307757188566029 ], [ 14248249.156361093744636, 4329594.919376641511917 ], [ 14248246.544741639867425, 4329598.101644152775407 ], [ 14248244.604133315384388, 4329601.732266967184842 ], [ 14248243.409112609922886, 4329605.671722284518182 ], [ 14248243.005603497847915, 4329609.768619046546519 ], [ 14248243.409112609922886, 4329613.865515808574855 ], [ 14248244.604133315384388, 4329617.804971125908196 ], [ 14248246.544741639867425, 4329621.435593940317631 ], [ 14248249.156361093744636, 4329624.61786145158112 ], [ 14248252.338628605008125, 4329627.229480904527009 ], [ 14248255.969251418486238, 4329629.170089229010046 ], [ 14248259.908706735819578, 4329630.36510993540287 ], [ 14248264.005603497847915, 4329630.768619046546519 ], [ 14248268.102500259876251, 4329630.36510993540287 ], [ 14248272.041955577209592, 4329629.170089229010046 ], [ 14248274.311217257753015, 4329627.95714358985424 ], [ 14248275.347732650116086, 4329628.059231445193291 ], [ 14248279.444629412144423, 4329627.655722334049642 ], [ 14248283.384084729477763, 4329626.460701627656817 ], [ 14248285.653363587334752, 4329625.247746807523072 ], [ 14248286.689856342971325, 4329625.349832433275878 ], [ 14248290.786753104999661, 4329624.94632332213223 ], [ 14248294.726208422333002, 4329623.751302615739405 ], [ 14248296.995504459366202, 4329622.538338612765074 ], [ 14248298.031974595040083, 4329622.640422010794282 ], [ 14248302.128871357068419, 4329622.236912899650633 ], [ 14248306.06832667440176, 4329621.041892193257809 ], [ 14248308.337639881297946, 4329619.828919013030827 ], [ 14248309.374087391421199, 4329619.931000182405114 ], [ 14248313.470984153449535, 4329619.527491071261466 ], [ 14248317.410439470782876, 4329618.332470364868641 ], [ 14248319.679769856855273, 4329617.119488002732396 ], [ 14248320.716194739565253, 4329617.221566943451762 ], [ 14248324.81309150159359, 4329616.818057832308114 ], [ 14248328.75254681892693, 4329615.623037125915289 ], [ 14248331.021894382312894, 4329614.410045581869781 ], [ 14248332.058296633884311, 4329614.512122293934226 ], [ 14248336.155193395912647, 4329614.108613182790577 ], [ 14248340.094648713245988, 4329612.913592476397753 ], [ 14248342.364013453945518, 4329611.700591750442982 ], [ 14248343.400393081828952, 4329611.802666234783828 ], [ 14248347.497289843857288, 4329611.39915712364018 ], [ 14248351.436745161190629, 4329610.204136417247355 ], [ 14248353.706127073615789, 4329608.991126513108611 ], [ 14248354.742484074085951, 4329609.093198767863214 ], [ 14248358.839380836114287, 4329608.689689656719565 ], [ 14248362.778836153447628, 4329607.494668950326741 ], [ 14248365.048235237598419, 4329606.281649867072701 ], [ 14248366.084569619968534, 4329606.383719895035028 ], [ 14248370.18146638199687, 4329605.98021078389138 ], [ 14248374.120921699330211, 4329604.785190077498555 ], [ 14248376.390337966382504, 4329603.572161810472608 ], [ 14248377.426649710163474, 4329603.674229608848691 ], [ 14248381.523546472191811, 4329603.270720497705042 ], [ 14248385.463001789525151, 4329602.075699791312218 ], [ 14248389.093624603003263, 4329600.135091466829181 ], [ 14248390.542752578854561, 4329598.94582287222147 ], [ 14248393.529179193079472, 4329598.651685523800552 ], [ 14248397.468634510412812, 4329597.456664817407727 ], [ 14248401.099257323890924, 4329595.51605649292469 ], [ 14248402.54840281419456, 4329594.326773524284363 ], [ 14248405.534801898524165, 4329594.032638887874782 ], [ 14248409.474257215857506, 4329592.837618181481957 ], [ 14248413.104880029335618, 4329590.89700985699892 ], [ 14248414.554043021053076, 4329589.707712525501847 ], [ 14248417.540414603427052, 4329589.413580597378314 ], [ 14248421.479869920760393, 4329588.218559890985489 ], [ 14248425.110492734238505, 4329586.277951566502452 ], [ 14248426.559673240408301, 4329585.08863986004144 ], [ 14248429.546017294749618, 4329584.794510643929243 ], [ 14248433.485472612082958, 4329583.599489937536418 ], [ 14248437.11609542556107, 4329581.658881613053381 ], [ 14248438.565293440595269, 4329580.469555538147688 ], [ 14248441.551609976217151, 4329580.175429032184184 ], [ 14248445.491065293550491, 4329578.980408325791359 ], [ 14248449.121688107028604, 4329577.039800001308322 ], [ 14248450.570903634652495, 4329575.85045955516398 ], [ 14248453.557192649692297, 4329575.556335759349167 ], [ 14248457.496647967025638, 4329574.361315052956343 ], [ 14248461.12727078050375, 4329572.420706728473306 ], [ 14248462.57650381885469, 4329571.231351911090314 ], [ 14248465.562765311449766, 4329570.937230826355517 ], [ 14248469.502220628783107, 4329569.742210119962692 ], [ 14248473.132843442261219, 4329567.801601795479655 ], [ 14248474.582093985751271, 4329566.612232611514628 ], [ 14248477.568327968940139, 4329566.3181142359972 ], [ 14248481.507783286273479, 4329565.123093529604375 ], [ 14248485.138406099751592, 4329563.182485205121338 ], [ 14248486.587674153968692, 4329561.993101651780307 ], [ 14248489.57388061657548, 4329561.698985986411572 ], [ 14248493.51333593390882, 4329560.503965280018747 ], [ 14248497.143958747386932, 4329558.56335695553571 ], [ 14248498.59324430860579, 4329557.373959033749998 ], [ 14248501.579423256218433, 4329557.079846078529954 ], [ 14248505.518878573551774, 4329555.884825372137129 ], [ 14248509.149501387029886, 4329553.944217047654092 ], [ 14248512.331768898293376, 4329551.332597594708204 ], [ 14248512.672306356951594, 4329550.917651500552893 ], [ 14248515.966250833123922, 4329549.91844436712563 ], [ 14248519.596873646602035, 4329547.977836042642593 ], [ 14248522.779141157865524, 4329545.366216589696705 ], [ 14248523.119690166786313, 4329544.951256421394646 ], [ 14248526.41361172683537, 4329543.952056239359081 ], [ 14248530.044234540313482, 4329542.011447914876044 ], [ 14248533.226502051576972, 4329539.399828461930156 ], [ 14248533.567062610760331, 4329538.984854219481349 ], [ 14248536.860961252823472, 4329537.985660989768803 ], [ 14248540.491584066301584, 4329536.045052665285766 ], [ 14248543.673851577565074, 4329533.433433212339878 ], [ 14248544.014423692598939, 4329533.018444888293743 ], [ 14248547.308299414813519, 4329532.019258611835539 ], [ 14248550.938922228291631, 4329530.078650287352502 ], [ 14248554.12118973955512, 4329527.467030834406614 ], [ 14248554.461773404851556, 4329527.052028437145054 ], [ 14248557.755626209080219, 4329526.052849112078547 ], [ 14248561.386249022558331, 4329524.11224078759551 ], [ 14248564.568516533821821, 4329521.500621334649622 ], [ 14248564.909111753106117, 4329521.085604858584702 ], [ 14248568.202941639348865, 4329520.086432485841215 ], [ 14248571.833564452826977, 4329518.145824161358178 ], [ 14248575.015831964090466, 4329515.53420470841229 ], [ 14248575.356438741087914, 4329515.119174148887396 ], [ 14248578.650245703756809, 4329514.120008730329573 ], [ 14248582.280868517234921, 4329512.179400405846536 ], [ 14248585.463136028498411, 4329509.567780952900648 ], [ 14248585.803754350170493, 4329509.152736326679587 ], [ 14248589.097538402304053, 4329508.153577857650816 ], [ 14248592.728161215782166, 4329506.212969533167779 ], [ 14248595.910428727045655, 4329503.601350080221891 ], [ 14248596.251058606430888, 4329503.186291370540857 ], [ 14248599.544819733127952, 4329502.187139855697751 ], [ 14248603.175442546606064, 4329500.246531531214714 ], [ 14248606.357710057869554, 4329497.634912078268826 ], [ 14248606.698351487517357, 4329497.219839294441044 ], [ 14248609.992089699953794, 4329496.220694730989635 ], [ 14248613.622712513431907, 4329494.280086406506598 ], [ 14248616.804980024695396, 4329491.66846695356071 ], [ 14248618.96642136014998, 4329489.034743065945804 ], [ 14248619.618168376386166, 4329488.837037770077586 ], [ 14248623.248791189864278, 4329486.896429445594549 ], [ 14248626.431058701127768, 4329484.284809992648661 ], [ 14248628.592508621513844, 4329481.651075644418597 ], [ 14248629.244234008714557, 4329481.453376909717917 ], [ 14248632.874856822192669, 4329479.51276858523488 ], [ 14248636.057124333456159, 4329476.901149132288992 ], [ 14248638.218582823872566, 4329474.267404341138899 ], [ 14248638.870286600664258, 4329474.069712162017822 ], [ 14248642.50090941414237, 4329472.129103837534785 ], [ 14248645.68317692540586, 4329469.517484384588897 ], [ 14248647.844643995165825, 4329466.883729139342904 ], [ 14248648.49632615223527, 4329466.686043518595397 ], [ 14248652.126948965713382, 4329464.74543519411236 ], [ 14248655.309216476976871, 4329462.133815741166472 ], [ 14248657.470692124217749, 4329459.500050044618547 ], [ 14248658.122352657839656, 4329459.302370983175933 ], [ 14248661.752975471317768, 4329457.361762658692896 ], [ 14248664.935242982581258, 4329454.750143205747008 ], [ 14248667.096727203577757, 4329452.116367062553763 ], [ 14248667.748366124927998, 4329451.918694556690753 ], [ 14248671.37898893840611, 4329449.978086232207716 ], [ 14248674.5612564496696, 4329447.366466779261827 ], [ 14248676.722749253734946, 4329444.73268017731607 ], [ 14248677.37436655163765, 4329444.535014230757952 ], [ 14248681.004989365115762, 4329442.594405906274915 ], [ 14248684.187256876379251, 4329439.982786453329027 ], [ 14248686.348758248612285, 4329437.348989411257207 ], [ 14248687.000353932380676, 4329437.151330021210015 ], [ 14248690.630976745858788, 4329435.210721696726978 ], [ 14248693.813244257122278, 4329432.59910224378109 ], [ 14248695.974754199385643, 4329429.965294757857919 ], [ 14248696.626328274607658, 4329429.767641923390329 ], [ 14248700.256951088085771, 4329427.827033598907292 ], [ 14248703.43921859934926, 4329425.215414145961404 ], [ 14248705.600737126544118, 4329422.581596200354397 ], [ 14248706.252289574593306, 4329422.383949926123023 ], [ 14248709.882912388071418, 4329420.443341601639986 ], [ 14248713.065179899334908, 4329417.831722148694098 ], [ 14248715.676799353212118, 4329414.649454637430608 ], [ 14248716.964840702712536, 4329412.23969876114279 ], [ 14248718.845996646210551, 4329411.234199961647391 ], [ 14248722.028264157474041, 4329408.622580508701503 ], [ 14248724.639883611351252, 4329405.440312997438014 ], [ 14248725.927931072190404, 4329403.030545690096915 ], [ 14248727.809065669775009, 4329402.025058299303055 ], [ 14248730.991333181038499, 4329399.413438846357167 ], [ 14248733.602952634915709, 4329396.231171335093677 ], [ 14248734.891006201505661, 4329393.821392606012523 ], [ 14248736.772119458764791, 4329392.815916621126235 ], [ 14248739.954386970028281, 4329390.204297168180346 ], [ 14248742.566006423905492, 4329387.022029656916857 ], [ 14248743.854066088795662, 4329384.612239517271519 ], [ 14248745.735158013179898, 4329383.606774935498834 ], [ 14248748.917425524443388, 4329380.995155482552946 ], [ 14248751.529044978320599, 4329377.812887971289456 ], [ 14248752.817110752686858, 4329375.403086400590837 ], [ 14248754.698181342333555, 4329374.397633222863078 ], [ 14248757.880448853597045, 4329371.78601376991719 ], [ 14248760.492068307474256, 4329368.6037462586537 ], [ 14248761.780140183866024, 4329366.193933272734284 ], [ 14248763.661189433187246, 4329365.188491501845419 ], [ 14248766.843456944450736, 4329362.576872048899531 ], [ 14248769.455076398327947, 4329359.394604537636042 ], [ 14248770.74315438978374, 4329356.984780110418797 ], [ 14248772.624182291328907, 4329355.979349750094116 ], [ 14248775.806449802592397, 4329353.367730297148228 ], [ 14248778.418069256469607, 4329350.185462785884738 ], [ 14248779.706153342500329, 4329347.77562695927918 ], [ 14248781.587159922346473, 4329346.770207994617522 ], [ 14248784.769427433609962, 4329344.158588541671634 ], [ 14248787.381046887487173, 4329340.976321030408144 ], [ 14248788.669137084856629, 4329338.566473768092692 ], [ 14248790.550122316926718, 4329337.561066214926541 ], [ 14248793.732389828190207, 4329334.949446761980653 ], [ 14248796.344009282067418, 4329331.767179250717163 ], [ 14248797.632105583325028, 4329329.357320568524301 ], [ 14248799.513069478794932, 4329328.351924420334399 ], [ 14248802.695336990058422, 4329325.740304967388511 ], [ 14248805.306956443935633, 4329322.558037456125021 ], [ 14248807.24756476841867, 4329318.927414641715586 ], [ 14248807.486750615760684, 4329318.13892457075417 ], [ 14248809.462304288521409, 4329316.517629572190344 ], [ 14248812.07392374239862, 4329313.335362060926855 ], [ 14248814.014532066881657, 4329309.70473924651742 ], [ 14248814.253720425069332, 4329308.916240897960961 ], [ 14248816.229260003194213, 4329307.294957466423512 ], [ 14248818.840879457071424, 4329304.112689955160022 ], [ 14248820.781487781554461, 4329300.482067140750587 ], [ 14248821.020678646862507, 4329299.693560533225536 ], [ 14248822.996204137802124, 4329298.072288661263883 ], [ 14248825.607823591679335, 4329294.890021150000393 ], [ 14248827.548431916162372, 4329291.259398335590959 ], [ 14248827.787625292316079, 4329290.470883446745574 ], [ 14248829.763136690482497, 4329288.849623141810298 ], [ 14248832.374756144359708, 4329285.667355630546808 ], [ 14248834.315364468842745, 4329282.036732816137373 ], [ 14248834.554560353979468, 4329281.248209656216204 ], [ 14248836.530057661235332, 4329279.626960915513337 ], [ 14248839.141677115112543, 4329276.444693404249847 ], [ 14248841.08228543959558, 4329272.814070589840412 ], [ 14248841.321483831852674, 4329272.025539163500071 ], [ 14248843.29696705378592, 4329270.404301982372999 ], [ 14248845.908586507663131, 4329267.222034471109509 ], [ 14248847.849194832146168, 4329263.591411656700075 ], [ 14248848.088395737111568, 4329262.802871947176754 ], [ 14248850.063864862546325, 4329261.181646334938705 ], [ 14248852.675484316423535, 4329257.999378823675215 ], [ 14248854.616092640906572, 4329254.36875600926578 ], [ 14248854.855296051129699, 4329253.580208040773869 ], [ 14248856.830751091241837, 4329251.958993988111615 ], [ 14248859.442370545119047, 4329248.776726476848125 ], [ 14248861.382978869602084, 4329245.146103662438691 ], [ 14248861.622184792533517, 4329244.35754741448909 ], [ 14248863.597625739872456, 4329242.736344926059246 ], [ 14248866.209245193749666, 4329239.554077414795756 ], [ 14248868.149853518232703, 4329235.923454600386322 ], [ 14248868.389061944559216, 4329235.134890096262097 ], [ 14248870.364488810300827, 4329233.513699165545404 ], [ 14248872.976108264178038, 4329230.331431654281914 ], [ 14248874.916716588661075, 4329226.700808839872479 ], [ 14248875.963463617488742, 4329223.250146331265569 ], [ 14248878.542605057358742, 4329220.107453393749893 ], [ 14248880.483213381841779, 4329216.476830579340458 ], [ 14248881.529963530600071, 4329213.026157784275711 ], [ 14248884.109091218560934, 4329209.88348160404712 ], [ 14248886.049699543043971, 4329206.252858789637685 ], [ 14248887.096452809870243, 4329202.802175712771714 ], [ 14248889.675566755235195, 4329199.659516278654337 ], [ 14248891.616175079718232, 4329196.028893464244902 ], [ 14248892.662931460887194, 4329192.578200122341514 ], [ 14248895.242031667381525, 4329189.435557428747416 ], [ 14248897.182639991864562, 4329185.804934614337981 ], [ 14248898.229399494826794, 4329182.354230979457498 ], [ 14248900.808485945686698, 4329179.211605047807097 ], [ 14248902.749094270169735, 4329175.580982233397663 ], [ 14248903.795856893062592, 4329172.130268317647278 ], [ 14248906.37492959946394, 4329168.987659132108092 ], [ 14248908.315537923946977, 4329165.357036317698658 ], [ 14248909.362303663045168, 4329161.906312124803662 ], [ 14248911.941362626850605, 4329158.763719686307013 ], [ 14248913.881970951333642, 4329155.133096871897578 ], [ 14248914.928739812225103, 4329151.682362390682101 ], [ 14248917.507785020396113, 4329148.539786712266505 ], [ 14248919.44839334487915, 4329144.90916389785707 ], [ 14248920.495165318250656, 4329141.458419157192111 ], [ 14248923.074196795001626, 4329138.315860209986567 ], [ 14248925.014805119484663, 4329134.685237395577133 ], [ 14248926.061580216512084, 4329131.234482358209789 ], [ 14248928.640597939491272, 4329128.091940170153975 ], [ 14248930.581206263974309, 4329124.461317355744541 ], [ 14248931.776226969435811, 4329120.5218620384112 ], [ 14248932.078964598476887, 4329117.448115303181112 ], [ 14248933.221349440515041, 4329116.056115346960723 ], [ 14248935.161957764998078, 4329112.425492532551289 ], [ 14248936.35697847045958, 4329108.486037215217948 ], [ 14248936.6597162745893, 4329105.412288703024387 ], [ 14248937.802090557292104, 4329104.020301613025367 ], [ 14248939.742698881775141, 4329100.389678798615932 ], [ 14248940.937719587236643, 4329096.450223481282592 ], [ 14248941.240457568317652, 4329093.376473182812333 ], [ 14248942.382821282371879, 4329091.984498970210552 ], [ 14248944.323429606854916, 4329088.353876155801117 ], [ 14248945.518450312316418, 4329084.414420838467777 ], [ 14248945.821188468486071, 4329081.340668760240078 ], [ 14248946.963541617617011, 4329079.948707421310246 ], [ 14248948.904149942100048, 4329076.318084606900811 ], [ 14248950.09917064756155, 4329072.378629289567471 ], [ 14248950.401908978819847, 4329069.304875442758203 ], [ 14248951.544251568615437, 4329067.912926969118416 ], [ 14248953.484859893098474, 4329064.282304154708982 ], [ 14248954.679880598559976, 4329060.342848837375641 ], [ 14248954.982619104906917, 4329057.269093203358352 ], [ 14248956.124951127916574, 4329055.877157606184483 ], [ 14248958.065559452399611, 4329052.246534791775048 ], [ 14248959.260580157861114, 4329048.307079474441707 ], [ 14248959.563318839296699, 4329045.233322064392269 ], [ 14248960.70564030110836, 4329043.841399336233735 ], [ 14248962.646248625591397, 4329040.2107765218243 ], [ 14248963.841269331052899, 4329036.27132120449096 ], [ 14248964.144008187577128, 4329033.197562013752759 ], [ 14248965.286319080740213, 4329031.805652163922787 ], [ 14248967.22692740522325, 4329028.175029349513352 ], [ 14248968.421948110684752, 4329024.235574032180011 ], [ 14248968.724687142297626, 4329021.161813066340983 ], [ 14248969.866987474262714, 4329019.769916084595025 ], [ 14248971.807595798745751, 4329016.13929327018559 ], [ 14248973.002616504207253, 4329012.199837952852249 ], [ 14248973.305355710908771, 4329009.126075204461813 ], [ 14248974.447645481675863, 4329007.734191092662513 ], [ 14248976.3882538061589, 4329004.103568278253078 ], [ 14248977.583274511620402, 4329000.164112960919738 ], [ 14248977.986783623695374, 4328996.067216198891401 ]]]),
  });
  loadFeaturesS5.setId('5S');

  // �몃㈃遺꾩꽍 �덉씠��
  var loadLayer = new ol.layer.Vector({
	name: 'loadLayer',
	source: new ol.source.Vector({
		// features: [loadFeatures],
	}),
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: [255, 51, 255, 0.6],
			width: 2,
		}),
		fill: new ol.style.Fill({
			color: [255, 51, 255, 0.6]
		})
	}),
	zIndex: 11,
	visible: false
  });

  var loadFeatures = [];
  loadFeatures.push(loadFeaturesE1);
  loadFeatures.push(loadFeaturesS1);
  loadFeatures.push(loadFeaturesE2);
  loadFeatures.push(loadFeaturesS2);
  loadFeatures.push(loadFeaturesE3);
  loadFeatures.push(loadFeaturesS3);
  loadFeatures.push(loadFeaturesE4);
  loadFeatures.push(loadFeaturesS4);
  loadFeatures.push(loadFeaturesE5);
  loadFeatures.push(loadFeaturesS5);
  loadLayer.getSource().addFeatures(loadFeatures);

  // 吏��ш꼍怨� �덉씠��
  var boundaryLayer = new VectorLayer({
    name: 'boundaryLayer',
    source: new VectorSource(),
    zIndex: 11, // �뺣��꾨줈吏��� index 10 諛붾줈 �꾩뿉
    visible: false
  });

  dashboardFn.doAjax({ url: '/geojson/boundary_n02025.geojson' }).done(function(data) {
    var features = new GeoJSON().readFeatures(data);
    var boundaryMaskFilter = new ol.filter.Mask({
      feature: features[0],
      inner: false,
      fill: new ol.style.Fill({ color: [0, 0, 0, 0.1] })
    });
    boundaryLayer.addFilter(boundaryMaskFilter);
    boundaryMaskFilter.set('active', true);
  });


// var boundaryFeature = new ol.Feature(
// new Polygon([
// [
// [14173994.8408045694231987, 4341506.47562998533248901],
// [14173987.72164694033563137, 4341659.87582709360867739],
// [14173987.72164694033563137, 4341659.87582709360867739],
// [14174042.22987689450383186, 4343107.28305445984005928],
// [14177751.69961907528340816, 4342610.83791857305914164],
// [14179399.73676657862961292, 4342259.415534901432693],
// [14181390.46907025389373302, 4341710.79922624677419662],
// [14183060.33023496903479099, 4341163.20699801668524742],
// [14184756.13327412120997906, 4341351.43091790936887264],
// [14186006.05697888322174549, 4341702.45685447100549936],
// [14187015.90987999737262726, 4342134.98320137336850166],
// [14187086.57768449373543262, 4342560.30374461598694324],
// [14187442.75944205932319164, 4344042.79382823593914509],
// [14188246.9393228180706501, 4345753.51337091904133558],
// [14189194.99740609340369701, 4347544.31351440586149693],
// [14190806.40196331404149532, 4347434.76426153350621462],
// [14192099.34714406915009022, 4350835.54791324865072966],
// [14194116.90480280853807926, 4350855.78783487062901258],
// [14196307.09523932449519634, 4350299.0718271229416132],
// [14197551.27052359655499458, 4348672.90178660862147808],
// [14201201.74073196761310101, 4345805.27595211379230022],
// [14205531.50614975020289421, 4343193.65927873738110065],
// [14209135.48386363685131073, 4343131.86701789312064648],
// [14212957.95648667402565479, 4341556.50007712375372648],
// [14217575.7720530703663826, 4341354.3466604221612215],
// [14222374.57043703645467758, 4340888.06079136859625578],
// [14225697.87071989476680756, 4342095.91292842198163271],
// [14229773.12062876857817173, 4340949.71795021742582321],
// [14233745.73617059178650379, 4338660.65013000834733248],
// [14235957.09033335745334625, 4334633.67990819457918406],
// [14237804.91090570203959942, 4333949.87497269455343485],
// [14240803.34637525118887424, 4333944.46493231318891048],
// [14244524.16043509170413017, 4332919.56086196284741163],
// [14246907.40522057190537453, 4333217.39494280237704515],
// [14250009.51752877235412598, 4332196.94424199219793081],
// [14251002.37045355699956417, 4329756.04726981837302446],
// [14247744.85850166156888008, 4328166.08496923465281725],
// [14247008.43871202878654003, 4327356.02851948421448469],
// [14245268.04737371765077114, 4327166.82158629223704338],
// [14241838.47456148266792297, 4327338.4752425467595458],
// [14239100.57325452379882336, 4328099.92239878419786692],
// [14235886.7619525883346796, 4328143.19362407550215721],
// [14233456.93400857038795948, 4328887.0379255386069417],
// [14230686.86647757329046726, 4331347.44498657807707787],
// [14229783.3100942000746727, 4332734.37915154080837965],
// [14229618.19232135079801083, 4334850.81909895502030849],
// [14228457.18500378355383873, 4335619.45812695287168026],
// [14226515.57262281328439713, 4336141.58075318299233913],
// [14224055.0527634471654892, 4334782.10064501129090786],
// [14220140.70922427624464035, 4334789.91652552131563425],
// [14217034.57705299556255341, 4335756.04900479409843683],
// [14213583.33536111563444138, 4336562.85125972144305706],
// [14209306.70571558736264706, 4337282.16525947861373425],
// [14207318.42081256397068501, 4338749.92857033479958773],
// [14205642.23203395865857601, 4338944.69333312287926674],
// [14203390.94032526388764381, 4339666.0279631782323122],
// [14199732.90317937359213829, 4341752.48307209182530642],
// [14196150.92572415247559547, 4344395.7115648165345192],
// [14194538.71133951656520367, 4346067.1554682869464159],
// [14194100.36818970739841461, 4346598.85006756149232388],
// [14193436.01301055215299129, 4346642.61274291109293699],
// [14192873.80371468514204025, 4346495.91915284190326929],
// [14192427.71260607056319714, 4345520.04864954669028521],
// [14191984.99963742308318615, 4344060.97741493489593267],
// [14190705.71575368568301201, 4342491.21769424062222242],
// [14190665.14619133807718754, 4341226.04140589572489262],
// [14189656.06357410363852978, 4339775.98400218319147825],
// [14188356.94205544516444206, 4339899.14069652184844017],
// [14186832.64909914135932922, 4338779.16831162013113499],
// [14186318.9232022762298584, 4337422.65731299482285976],
// [14182717.50956391915678978, 4337225.68023079261183739],
// [14181584.1345214769244194, 4337230.38629427086561918],
// [14180457.00533422827720642, 4337367.18246684968471527],
// [14179130.57810716144740582, 4337786.3618826000019908],
// [14176476.42085615545511246, 4338348.28456062451004982],
// [14173901.55598548054695129, 4338736.80810059979557991],
// [14173994.8408045694231987, 4341506.47562998533248901]
// ]
// ])
// );
// var boundaryMaskFilter = new ol.filter.Mask({
// feature: boundaryFeature,
// inner: false,
// fill: new ol.style.Fill({ color: [0, 0, 0, 0.5] })
// });
// boundaryLayer.addFilter(boundaryMaskFilter);
// boundaryMaskFilter.set('active', true);

  // IC/JCT �덉씠��
  var icjctLayer = new ol.layer.Image({
    createLayerName: 'icjctLayer',
    visible: true,
    source: new ol.source.ImageWMS({
      url: himap.precision.utils.immutable.MAP2D_SERVER_BASE_PATH.replace('EX_HDMAP', 'EX_GGTM') + 'wms',
      params: {
        FORMAT: 'image/png',
        VERSION: '1.1.1',
        LAYERS: 'EX_GGTM:F_ICJCT',
        //exceptions: 'application/vnd.ogc.se_inimage'
      },
      crossOrigin: 'anonymous',
      ratio: 1
    }),
    maxResolution: 9.554628535647032, // maxResolution(exclusive) - zoom 8蹂대떎 �대븣
    zIndex: 9
  });

  // 李⑤웾 �덉씠��
  var vehicleLayer = new VectorLayer({
    name: 'VehicleLayer',
    renderMode: 'vector',
    source: new VectorSource({}),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: vehicleStyleFunction,
    zIndex: 19,
    visible: false
  });
  // �ㅻ쭏�� 李⑤웾 �덉씠��
  var smartVehicleLayer = new VectorLayer({
    name: 'SmartVehicleLayer',
    renderMode: 'vector',
    source: new VectorSource({}),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: smartVehicleStyleFunction,
    zIndex: 19,
    visible: false
  });

  // �ш퀬 �덉씠��
  var accidentLayer = new VectorLayer({
    name: 'AccidentLayer',
    renderMode: 'vector',
    source: new VectorSource({}),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: situationStyleCache.accident,
    zIndex: 19,
    visible: false
  });
  // 怨듭궗 �덉씠��
  var constructionLayer = new VectorLayer({
    name: 'ConstructionLayer',
    renderMode: 'vector',
    source: new VectorSource({}),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: situationStyleCache.construction,
    zIndex: 19,
    visible: false
  });
  // �ㅼ떆媛� �덉씠��
  var liveLayer = new VectorLayer({
    name: 'LiveLayer',
    renderMode: 'vector',
    source: new VectorSource({}),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: liveStyleFunction,
    zIndex: 19,
    visible: false
  });
  // �덉씠�붿쁺�� �덉씠��
  var radarLayer = new himap.layer.Radar({
    extent: [13400000, 3500000, 14732000, 5374000],
    imageSize: [2305, 2881],
    sysKey: 'XXX_01',
    name: 'RadarLayer',
    zIndex: 30,
    visible: false,
    opacity: 0.8,
    url: '/getNowRadarImage.do'
  });

  // 커스텀 ImageWMS 레이어 생성
  var customImageLayer = new ol.layer.Image({
    name: 'customImageLayer',
    visible: true,
    source: new ol.source.ImageWMS({
      url: himap.precision.utils.immutable.MAP2D_SERVER_BASE_PATH.replace('EX_HDMAP', 'EX_GGTM') + 'wms',
      params: {
        FORMAT: 'image/png',
        VERSION: '1.1.1',
        LAYERS: 'EX_GGTM:T_EXMM_CTRD_AREA01M1',
        TILED: false
        //exceptions: 'application/vnd.ogc.se_inimage'
      },
      crossOrigin: 'anonymous',
      ratio: 1
    }),
    maxResolution: 9.554628535647032, // maxResolution(exclusive) - zoom 8보다 높음
    zIndex: 16
  });
  radarLayer.setZIndex(30);
  // CCTV �덉씠��
  var cctvLayer = new VectorLayer({
    name: 'CCTVLayer',
    renderMode: 'vector',
    source: new VectorSource({}),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: cctvStyleFunction,
    zIndex: 14,
    visible: false
  });
  // VDS�덉씠��
  var vdsLayer = new himap.layer.Tile.Layer({
    sysKey: 'XXX_01',
    name: 'Speed_Vdszone',
    // zIndex: 15,
    // minResolution: 19.109257071294063,
    visible: false
  });
  vdsLayer.setMinResolution(19.109257071294063);
  vdsLayer.setZIndex(15);
  // �명꽣�룸쭩 �묒냽�쇰븣 二쇱냼 蹂�寃�

  var _IS_INTERNAL = typeof globalInOut !== 'undefined' ? globalInOut == 'in' : true;
  if (!_IS_INTERNAL) {
    var urls = vdsLayer.getSource().getUrls();

    if (urls.length > 0) {
      var newUrls = urls.map(function (url) {
        return url.replace('geoapi.ex.co.kr', 'dxlive.ex.co.kr:8091');
      });
      vdsLayer.getSource().setUrls(newUrls);
    }
  }




  // 濡쒕뱶酉� �덉씠��
  var roadViewWmsPath = himap.url.SERVER_IP + '/geoserver/EX_GGTM/wms';
  var roadViewLine = new ol.layer.Tile({
    name: 'roadViewLine',
    source: new ol.source.TileWMS({
      url: roadViewWmsPath,
      params: {
        LAYERS: 'EX_GGTM:V_HDBUFFERLINE'
      }
    }),
    // extent: [14172362.240483992, 4325880.752373681, 14251950.762375217,
	// 4322891.8733414365],
    zIndex: 100,
    visible: false
  });

  // 援먰넻�ш퀬 �뺣낫 �쒖텧 �덉씠��
  var trafficSource = new VectorSource({});
  // var trafficLayer = new VectorLayer({
  // name: 'traffic',
  // renderMode: 'image',
  // source: new VectorSource({}),
  // updateWhileAnimating: false,
  // updateWhileInteracting: false,
  // style: trafficStyleFunction,
  // zIndex: 30,
  // visible: true
  // });

  // 援먰넻�ш퀬 Cluster �덉씠�� (Heatmap, clustermap �먯꽌 �ъ슜)
  var clusterSource = new Cluster({
    distance: 40,
    minDistance: 20,
    source: trafficSource
  });

  var clusterLayer = new ol.layer.AnimatedCluster({
    name: 'cluster',
    renderMode: 'vector',
    source: clusterSource,
    updateWhileAnimating: false,
    updateWhileInteracting: false,
    style: clusterStyleFunction,
    animationDuration: 500,
    animationMethod: ol.easing.easeIn,
    zIndex: 15,
    visible: true
  });

  // 援먰넻�ш퀬 Heatmap �덉씠��
  var heatmapLayer = new HeatmapLayer({
    name: 'heatmap',
    source: trafficSource,
    blur: 20,
    radius: 10,
    weight: function (feature) {
      // 0 to 1
      return 1;
    },
    selectable: false,
    zIndex: 15,
    visible: false
  });

  // �ш퀬 �꾪뿕吏��� Heatmap �덉씠��
  var riskLayer = new HeatmapLayer({
    name: 'risk',
    source: new VectorSource({}),
    blur: 20,
    radius: 10,
    weight: function (feature) {
      // 0 to 1
      return 1 - feature.get('percent') / 20;
    },
    selectable: false,
    zIndex: 14,
    visible: true
  });


  //��났�덉씠�� �곸뿭 �쒖옉
  /*
    (UA)珥덇꼍�됰퉬�됱옣移섍났�� - lt_c_aisuac
       寃쎄퀎援ъ뿭 - lt_c_aisaltc
       寃쎈웾��났湲곗씠李⑸쪠�� - lt_c_aisfldc
       愿��쒓텒 - lt_c_aisctrc
       鍮꾪뻾湲덉�援ъ뿭 - lt_c_aisprhc
       鍮꾪뻾�κ탳�듦뎄�� - lt_c_aisztzc
       鍮꾪뻾�쒗븳援ъ뿭 - lt_c_aisresc
       �꾪뿕援ъ뿭 - lt_c_aisdngc
  */
  //(UA)珥덇꼍�됰퉬�됱옣移섍났�� - lt_c_aisuac
  var proxyUrl = 'https://geoapi.ex.co.kr/proxy/?http://api.vworld.kr/req/wms?';
  if(globalInOut == 'out'){
		proxyUrl = 'https://dxlive.ex.co.kr:8091/proxy/?http://api.vworld.kr/req/wms?';
  }

  var aisuacLayer = new ol.layer.Tile({
	 name:"aisuacLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisuac",
			STYLES:"lt_c_aisuac",
			CRS:"EPSG:900913",
			title:"(UA)珥덇꼍�됰퉬�됱옣移섍났��",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
			//domain:"http://localhost"
		}
     }),
     zIndex: 15,
	 visible: false
  });

  //寃쎄퀎援ъ뿭 - lt_c_aisaltc
  var aisaltcLayer = new ol.layer.Tile({
	 name:"aisaltcLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisaltc",
			STYLES:"lt_c_aisaltc",
			CRS:"EPSG:900913",
			title:"寃쎄퀎援ъ뿭",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
		}
     }),
     zIndex: 15,
	 visible: false
  });

  //寃쎈웾��났湲곗씠李⑸쪠�� - lt_c_aisfldc
  var aisfldcLayer = new ol.layer.Tile({
	 name:"aisfldcLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisfldc",
			STYLES:"lt_c_aisfldc",
			CRS:"EPSG:900913",
			title:"寃쎈웾��났湲곗씠李⑸쪠��",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
		}
     }),
     zIndex: 15,
	 visible: false
  });

  //愿��쒓텒 - lt_c_aisctrc
  var aisctrcLayer = new ol.layer.Tile({
	 name:"aisctrcLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisctrc",
			STYLES:"lt_c_aisctrc",
			CRS:"EPSG:900913",
			title:"愿��쒓텒",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
		}
     }),
     zIndex: 15,
	 visible: false
  });

  //鍮꾪뻾湲덉�援ъ뿭 - lt_c_aisprhc
  var aisprhcLayer = new ol.layer.Tile({
	 name:"aisprhcLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisprhc",
			STYLES:"lt_c_aisprhc",
			CRS:"EPSG:900913",
			title:"鍮꾪뻾湲덉�援ъ뿭",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
		}
     }),
     zIndex: 15,
	 visible: false
  });

  //鍮꾪뻾�κ탳�듦뎄�� - lt_c_aisztzc
  var aisatzcLayer = new ol.layer.Tile({
	 name:"aisatzcLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisatzc",
			STYLES:"lt_c_aisatzc",
			CRS:"EPSG:900913",
			title:"鍮꾪뻾�κ탳�듦뎄��",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
		}
     }),
     zIndex: 15,
	 visible: false
  });

  //鍮꾪뻾�쒗븳援ъ뿭 - lt_c_aisresc
  var aisrescLayer = new ol.layer.Tile({
	 name:"aisrescLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisresc",
			STYLES:"lt_c_aisresc",
			CRS:"EPSG:900913",
			title:"鍮꾪뻾�쒗븳援ъ뿭",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
		}
     }),
     zIndex: 15,
	 visible: false
  });
  //�꾪뿕援ъ뿭 - lt_c_aisdngc
  var aisdngcLayer = new ol.layer.Tile({
	 name:"aisdngcLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lt_c_aisdngc",
			STYLES:"lt_c_aisdngc",
			CRS:"EPSG:900913",
			title:"�꾪뿕援ъ뿭",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
		}
     }),
     zIndex: 15,
	 visible: false
  });

  //��났�덉씠�� �곸뿭 醫낅즺
  //�곗냽吏��곷룄 �덉씠�� �곸뿭 �쒖옉
  //�곗냽吏��곷룄 - lp_pa_cbnd_bubun
  var bubunLayer = new ol.layer.Tile({
	 name:"bubunLayer",
     source: new ol.source.TileWMS({
		url:proxyUrl,
		params:{
			LAYERS:"lp_pa_cbnd_bubun",
			STYLES:"lp_pa_cbnd_bubun",
			CRS:"EPSG:900913",
			title:"�곗냽吏��곷룄",
			FORMAT:"image/png",
			//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
			apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",
			domain:"https://digital.ex.co.kr"
			//domain:"http://localhost"
		}
     }),
     zIndex: 15,
	 visible: false
  });
  //�곗냽吏��곷룄 �덉씠�� �곸뿭 醫낅즺



  var markerSource = new ol.source.Vector();
  var markerSource2 = new ol.source.Vector();
  var markerSource3 = new ol.source.Vector();
  var markerSource4 = new ol.source.Vector();

  var landSource1 = new ol.source.Vector();
  var landSource2 = new ol.source.Vector();
  var landSource3 = new ol.source.Vector();
  var landSource4 = new ol.source.Vector();

  //誘몄엫���덉씠��
  var unusedLandLayer = new VectorLayer({
    name: 'unusedLandLayer',
    renderMode: 'vector',
    source: markerSource,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style:bubunStyleFunction,
    zIndex: 18,
    visible: false
  });

  //불법사용
  var illegalUse = new VectorLayer({
    name: 'illegalUse',
    renderMode: 'vector',
    source: markerSource,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style:bubunStyleFunction,
    zIndex: 18,
    visible: false
  });
  //�꾨� �덉씠��
  var rentalLandLayer = new VectorLayer({
    name: 'rentalLandLayer',
    renderMode: 'vector',
    source: markerSource2,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style:bubunStyleFunction2,
    zIndex: 18,
    visible: false
  });
  //臾대떒�먯쑀 �덉씠��
  var squatLandLayer = new VectorLayer({
    name: 'squatLandLayer',
    renderMode: 'vector',
    source: markerSource3,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style:bubunStyleFunction3,
    zIndex: 18,
    visible: false
  });

  //�쒖슜遺�吏� �덉씠��
  var projectLandLayer = new VectorLayer({
    name: 'projectLandLayer',
    renderMode: 'vector',
    source: markerSource4,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style:bubunStyleFunction4,
    zIndex: 18,
    visible: false
  });


  //誘몄엫���덉씠��
  var unusedLand = new VectorLayer({
    name: 'unusedLand',
    renderMode: 'vector',
    source: landSource1,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: new Style({
			stroke: new Stroke({
				width:2,
				color:[146,52,234,0.5]
			}),
			fill: new Fill({
				width:2,
				color:[146,52,234,0.3]
			})
           }),
    zIndex: 17,
    visible: false
  });

  //불법사용
  var illegalUseLand = new VectorLayer({
    name: 'illegalUseLand',
    renderMode: 'vector',
    source: landSource1,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: new Style({
			stroke: new Stroke({
				width:2,
				color:[146,52,234,0.5]
			}),
			fill: new Fill({
				width:2,
				color:[146,52,234,0.3]
			})
           }),
    zIndex: 17,
    visible: false
  });
  //�꾨� �덉씠��
  var rentalLand = new VectorLayer({
    name: 'rentalLand',
    renderMode: 'vector',
    source: landSource2,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: new Style({
			stroke: new Stroke({
				width:2,
				color:[234,52,73,0.5]
			}),
			fill: new Fill({
				width:2,
				color:[234,52,73,0.3]
			})
           }),
    zIndex: 17,

    visible: false
  });
  //臾대떒�먯쑀 �덉씠��
  var squatLand = new VectorLayer({
    name: 'squatLand',
    renderMode: 'vector',
    source: landSource3,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: new Style({
			stroke: new Stroke({
				width:2,
				color:[52,215,234,0.5]
			}),
			fill: new Fill({
				width:2,
				color:[52,215,234,0.3]
			})
           }),
    zIndex: 17,
    visible: false
  });

  //�쒖슜遺�吏� �덉씠��
  var projectLand = new VectorLayer({
    name: 'projectLand',
    renderMode: 'vector',
    source: landSource4,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: new Style({
			stroke: new Stroke({
				width:2,
				color:[234,52,215,0.5]
			}),
			fill: new Fill({
				width:2,
				color:[234,52,215,0.3]
			})
           }),
    zIndex: 17,
    visible: false
  });

  //도로버퍼구역 (WMS 이미지 레이어)
  var roadBufferZone = new ol.layer.Tile({
    name: 'roadBufferZone',
    source: new ol.source.TileWMS({
      url: 'http://172.16.165.25:8080/geoserver/ex_toji/wms',
      params: {
        'LAYERS': 'ex_toji:LSMD_CONT_UI201',
        'TILED': true,
        'TRANSPARENT': true,
        'CRS': 'EPSG:5179'  // API에서 지원하는 좌표계
      },
      projection: 'EPSG:900913'  // OpenLayers에서 사용할 좌표계
    }),
    zIndex: 17,
    visible: true  // 임시로 true로 변경해서 테스트
  });

  // ============================================================
  // �ㅻ툕�덉씠
  // ============================================================
  // �뺣��꾨줈 �뺣낫 �쒖텧�� �ㅻ툕�덉씠
  var unUsedLandOverlayId = 'unUsedLandOverlay';
  var unUsedLandOverlay = new DtjpCommonMap.DtjpOverlay({
	id: unUsedLandOverlay,
    element: document.querySelector('#unUsedLandOverlay'),
    // positioning: 'bottom-center',
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  // html�� 吏��뺣맂 style display none �댁젣
  unUsedLandOverlay.getElement().style.display = '';

  var rentalLandOverlayId = 'rentalLandOverlay';
  var rentalLandOverlay = new DtjpCommonMap.DtjpOverlay({
	id: unUsedLandOverlay,
    element: document.querySelector('#rentalLandOverlay'),
    // positioning: 'bottom-center',
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  // html�� 吏��뺣맂 style display none �댁젣
  rentalLandOverlay.getElement().style.display = '';


  var squatLandOverlayId = 'squatLandOverlay';
  var squatLandOverlay = new DtjpCommonMap.DtjpOverlay({
	id: unUsedLandOverlay,
    element: document.querySelector('#squatLandOverlay'),
    // positioning: 'bottom-center',
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  // html�� 吏��뺣맂 style display none �댁젣
  squatLandOverlay.getElement().style.display = '';

  var projectLandOverlayId = 'projectLandOverlay';
  var projectLandOverlay = new DtjpCommonMap.DtjpOverlay({
	id: unUsedLandOverlay,
    element: document.querySelector('#projectLandOverlay'),
    // positioning: 'bottom-center',
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  // html�� 吏��뺣맂 style display none �댁젣
  projectLandOverlay.getElement().style.display = '';


  var precisionOverlayId = 'precisionInfo';
  var precisionInfoOverlay = new DtjpCommonMap.DtjpOverlay({
    id: precisionOverlayId,
    element: document.querySelector('#precisionInfo'),
    // positioning: 'bottom-center',
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  // html�� 吏��뺣맂 style display none �댁젣
  precisionInfoOverlay.getElement().style.display = '';

  // 湲고� �뺣낫 �쒖텧�� �ㅻ툕�덉씠 (怨듭궗 �뺣낫)
  // var markerOverlay = new ol.Overlay({
  // id: 'markerOverlay',
  // element: document.querySelector('#markerOverlay'),
  // // positioning: 'bottom-center',
  // offset: [0, -25],
  // autoPan: true,
  // autoPanAnimation: {
  // duration: 250
  // }
  // });
  // markerOverlay.getElement().style.display = '';

  // 李⑤웾 �뺣낫 �쒖텧�� �ㅻ툕�덉씠
  var carInfoOverlay = new DtjpCommonMap.DtjpOverlay({
    id: 'carInfoOverlay',
    element: document.querySelector('#carInfoOverlay'),
    // positioning: 'bottom-center',
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  carInfoOverlay.getElement().style.display = '';
  // �ㅻ쭏�� 李⑤웾愿�由� �뺣낫 �쒖텧�� �ㅻ툕�덉씠
  var smartCarInfoOverlay = new DtjpCommonMap.DtjpOverlay({
    id: 'smartCarInfoOverlay',
    element: document.querySelector('#smartCarInfoOverlay'),
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  smartCarInfoOverlay.getElement().style.display = '';

  // 怨듭궗 �뺣낫 �쒖텧�� �ㅻ툕�덉씠
  var constructionOverlay = new DtjpCommonMap.DtjpOverlay({
    id: 'constructionOverlay',
    element: document.querySelector('#constructionOverlay'),
    offset: [0, -25],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  constructionOverlay.getElement().style.display = '';

  // cctv �쇰꺼 �쒖텧�� �ㅻ툕�덉씠
  var labelOverlay = new DtjpCommonMap.DtjpOverlay({
    id: 'labelOverlay',
    element: document.querySelector('#labelOverlay'),
    offset: [0, -20],
    autoPan: false,
    addClose: false
    // autoPanAnimation: {
    // duration: 250
    // }
  });
  labelOverlay.getElement().style.display = '';

  // 援먰넻�ш퀬 cluster �ㅻ툕�덉씠
  var popoverCluster = new DtjpCommonMap.DtjpOverlay({
    element: document.querySelector('#popoverCluster'),
    // positioning: 'bottom-center',
    // offset: [0, -35],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  popoverCluster.getElement().style.display = '';

  // ==================== �뺣��꾨줈吏��� �덉씠�� �쒖뼱 諛� �쒖텧�щ� 紐⑸줉 ====================
  // types �� 肄ㅻ쭏援щ텇�쇰줈 �щ윭type �곸슜媛���
  var layerList = [

    { layer: 'CPOKMPOST', layerName: '�댁젙', checked: true },
    { layer: 'CPOKMPOST_10', layerName: '10M�댁젙', checked: true },
    // {
    // layer: 'CPOCCTV',
    // layerName: '移대찓��',
    // checked: true,
    // childs: [
    // { typeName: 'CCTV', types: "'1'", checked: true },
    // { typeName: '湲고�移대찓��', types: "'2'" }
    // ]
    // },
    { layer: 'CPGTUNNEL', layerName: '�곕꼸', checked: true },
    { layer: 'CPGBRIDGE', layerName: '援먮웾', checked: true },
    {
      layer: 'CPGINCLINE',
      layerName: '鍮꾪깉硫�/諛⑹쓬踰�',
      checked: true,
      childs: [
        { typeName: '鍮꾪깉硫�', types: "'1'", checked: true },
        { typeName: '湲곗큹��(�밸꼍)', types: "'2'", checked: true },
        { typeName: '�숈꽍諛⑹�梨�', types: "'3'" },
        { typeName: '�좊룄�명�由�', types: "'4'" },
        { typeName: '諛⑹쓬踰�', types: "'5'" }
      ]
    },
    {
      layer: 'APGROAD',
      layerName: '李⑤줈硫�',
      checked: false,
      childs: [
        { typeName: '�쇰컲�꾨줈援ш컙', types: "'1'", checked: true },
        { typeName: '�곕꼸援ш컙', types: "'2'", checked: true },
        { typeName: '援먮웾援ш컙', types: "'3'", checked: true },
        { typeName: '湲고�(吏���,怨좉�)', types: "'4','5'", checked: false }
      ]
    },
    {
      layer: 'CPGFACILFACE',
      layerName: '硫댄삎�쒖꽕',
      checked: false,
      childs: [{ typeName: '�몃㈃�붿쿋�ъ옣', types: "'1'", checked: false }]
    },
    // { layer: 'APLLINK', layerName: '二쇳뻾寃쎈줈留곹겕', childs: [{ typeName: '以묒떖��',
	// types: '0', checked: true }] },
    {
      layer: 'APGSUBSEC',
      layerName: '遺��띻뎄媛�',
      childs: [
        { typeName: 'IC(�섎뱾紐�)', types: "'01'", checked: true },
        { typeName: 'JC(遺꾧린��)', types: "'02'", checked: true },
        { typeName: '�닿쾶��', types: "'03'", checked: true },
        { typeName: '�닿쾶�뚯쭊�낅줈(媛먯냽濡�)', types: "'04'", checked: true },
        { typeName: '�닿쾶�뚰빀瑜섎줈(媛��띾줈)', types: "'05'", checked: true },
        { typeName: '議몄쓬�쇳꽣', types: "'06'", checked: true },
        { typeName: '議몄쓬�쇳꽣吏꾩엯濡�(媛먯냽濡�)', types: "'07'", checked: true },
        { typeName: '議몄쓬�쇳꽣�⑸쪟濡�(媛��띾줈)', types: "'08'", checked: true },
        { typeName: '踰꾩뒪�뺣쪟��', types: "'09'", checked: true },
        { typeName: '鍮꾩긽�뺤감��', types: "'10'", checked: true }
      ]
    },
    { layer: 'APGPARKLOT', layerName: '二쇱감硫�' },
    {
      layer: 'BPLLANEMARK',
      layerName: '李⑥꽑�쒖떆',
      checked: true,
      childs: [
        { typeName: '以묒븰��', types: "'1'", checked: true },
        { typeName: '李⑥꽑', types: "'2'", checked: true },
        { typeName: '踰꾩뒪�꾩슜李⑥꽑', types: "'3'", checked: false },
        { typeName: '吏꾨줈蹂�寃쎌젣�쒖꽑', types: "'4'", checked: false },
        { typeName: '媛�蹂�李⑥꽑', types: "'5'", checked: false },
        { typeName: '湲멸��μ옄由ш뎄��꽑', types: "'6'", checked: false },
        { typeName: '湲고���', types: "'7'", checked: false }
      ]
    },
    {
      layer: 'BPOTRAFFICSIGN',
      layerName: '援먰넻�덉쟾�쒖���',
      checked: false,
      childs: [
        { typeName: '二쇱쓽�쒖�', types: "'1'", checked: true },
        { typeName: '洹쒖젣�쒖�', types: "'2'", checked: true },
        { typeName: '吏��쒗몴吏�', types: "'3'", checked: true },
        { typeName: '蹂댁“�쒖�', types: "'4'", checked: true },
        { typeName: '湲고��쒖�', types: "'5'", checked: false }
      ]
    },
    {
      layer: 'BPGROADSIGN',
      layerName: '�꾨줈�쒖���',
      checked: false,
      childs: [
        { typeName: '寃쎄퀎�쒖�', types: "'1'", checked: true },
        { typeName: '�댁젙�쒖�', types: "'2'", checked: true },
        { typeName: '諛⑺뼢�쒖�', types: "'3'", checked: true },
        { typeName: '�몄꽑�쒖�', types: "'4'", checked: true },
        { typeName: '湲고��쒖�', types: "'5'", checked: false }
      ]
    },
    { layer: 'BPGVMS', layerName: '�꾧킅�쒖떆' },
    { layer: 'CPOLCS', layerName: '李⑤줈�좏샇�쒖뼱湲�' },
    {
      layer: 'CPOFACILDOT',
      layerName: '�먰삎�쒖꽕',
      checked: false,
      childs: [
        { typeName: '諛곗닔援�', types: "'1'", checked: true },
        { typeName: '�쒖꽕�쒖꽕', types: "'2'", checked: true },
        { typeName: '�쇱닔遺꾩궗�μ튂', types: "'3'", checked: true },
        { typeName: 'POP', types: "'4'", checked: true },
        { typeName: '�숈꽍諛⑹�梨낆텧�낃뎄', types: "'5'", checked: true }
      ]
    },
    {
      layer: 'CPOLIGHT',
      layerName: '議곕챸�쒖꽕',
      checked: false,
      childs: [
        { typeName: '媛�濡쒕벑', types: "'1'", checked: true },
        { typeName: '議곕챸��', types: "'2'", checked: true }
      ]
    },
    { layer: 'CPODSTBX', layerName: '遺꾩쟾��' },
    { layer: 'CPORSU', layerName: '�몃�湲곗�援�' },
    { layer: 'CPGTOLLGATE', layerName: '�붽툑��' },
    {
      layer: 'CPOVDS',
      layerName: '李⑤웾寃�吏�湲�',
      checked: false,
      childs: [
        { typeName: 'VDS猷⑦봽��', types: "'1'", checked: true },
        { typeName: 'VDS�곸긽��', types: "'2'", checked: true }
      ]
    },
    { layer: 'CPGCULVERT', layerName: '�붽굅' },
    // { layer: 'APLCANT', layerName: '�멸꼍��' },
    // { layer: 'APONODE', layerName: '二쇳뻾寃쎈줈�몃뱶' },
    {
      layer: 'CPLSAFETY',
      layerName: '李⑤웾諛⑺샇�덉쟾�쒖꽕',
      checked: false,
      childs: [
        { typeName: '媛��쒕젅��', types: "'1'", checked: true },
        { typeName: '肄섑겕由ы듃諛⑺샇踰�', types: "'2'", checked: true },
        { typeName: '諛곗닔��', types: "'3'", checked: true },
        { typeName: '以묒븰遺꾨━��媛쒓뎄遺�', types: "'4'", checked: true },
        { typeName: '�곕꼸媛쒓뎄遺�', types: "'5'", checked: true },
        { typeName: '踰�', types: "'6'", checked: true },
        { typeName: '�꾩떆援ъ“臾�', types: "'7'", checked: true },
        { typeName: '異⑷꺽�≪닔�쒖꽕', types: "'8'", checked: true },
        { typeName: '�쒖꽑�좊룄遊�', types: "'9'", checked: true },
        { typeName: '吏꾩엯李⑤떒�쒖꽕(�곕꼸��)', types: "'10'", checked: true },
        { typeName: '鍮꾩긽�곌껐濡쒓뎄議곕Ъ', types: "'11'", checked: true },
        { typeName: '湲고��쒖꽕臾�', types: "'12'", checked: true }
      ]
    }
  ];

  var createLayerChildItem = function (checkboxId, checkboxValue, label, checked, hasChild, typeFilter, dataCheckGroup) {
    if (checked) {
      checked = ' checked';
    } else {
      checked = '';
    }

    var titleClass, activeFn, dataCheckParent;

    if (hasChild) {
      titleClass = 'form-check-title depth-in';
      activeFn = ' onclick="addActive(this);"';
      dataCheckParent = ' data-check-parent="' + checkboxValue + '"';
    } else {
      titleClass = 'form-check-cont';
      activeFn = '';
      dataCheckParent = '';
    }

    if (dataCheckGroup) {
      dataCheckGroup = ' data-check-group="' + dataCheckGroup + '"';
    } else {
      dataCheckGroup = '';
    }

    // �뺣��꾨줈吏��� type filter 泥댄겕諛뺤뒪 �⑸룄
    if (typeFilter) {
      typeFilter = ' data-type-filter="' + typeFilter + '"';
    } else {
      typeFilter = '';
    }

    var newLiHtml =
      '<li><div class="' +
      titleClass +
      '"' +
      activeFn +
      '>' +
      '<span class="form-check">' +
      '<input class="form-check-input layer-toggle-check" type="checkbox"' +
      dataCheckParent +
      dataCheckGroup +
      typeFilter +
      ' value="' +
      checkboxValue +
      '" id="' +
      checkboxId +
      '"' +
      checked +
      '>' +
      '<label class="form-check-label" for="' +
      checkboxId +
      '">' +
      label +
      '</label>' +
      '</span>' +
      '</div></li>';

    return $(newLiHtml);
  };

  // �뺣��꾨줈吏��� �쒖텧 �덉씠��
  var precisionLayers = [
    {
      createLayerName: 'DTJPBASE',
      serviceLayers: [
        // 'CPOKMPOST', 'CPGINCLINE', 'CPOCCTV', 'CPGTUNNEL', 'CPGBRIDGE',
		// 'APGROAD', 'BPLLANEMARK'
      ],
      checkedTypes: {
        // CPOKMPOST: ['01', '02']
      }
    }
  ];

  var precisionChild = $('#precision_child');

  var serviceLayers = precisionLayers[0].serviceLayers;
  var checkedTypes = precisionLayers[0].checkedTypes;
  layerList.forEach(function (item) {
    // �뺣��꾨줈吏��� �쒖텧 �덉씠�� 紐⑸줉�� 異붽�
    if (item.checked) {
      serviceLayers.push(item.layer);
    }
    // �대떦 �덉씠�댁쓽 type紐⑸줉 以�鍮�
    checkedTypes[item.layer] = [];

    // 泥댄겕諛뺤뒪id, value
    var checkboxId = 'chk_DTJPBASE_' + item.layer;
    var checkboxValue = 'DTJPBASE:' + item.layer;
    var hasChild = item.childs && item.childs.length > 0;
    var newLi = createLayerChildItem(checkboxId, checkboxValue, item.layerName, item.checked, hasChild, null, 'DTJPBASE');

    // childs
    if (item.childs) {
      var newChildUl = $('<ul class="form-group form_group_depth3">');
      var childAllChecked = true;
      item.childs.forEach(function (child, childIdx) {
        if (child.checked) {
          // �덉씠�댁쓽 type紐⑸줉�� 異붽�
          checkedTypes[item.layer].push(child.types);
        } else {
          childAllChecked = false;
        }

        // child 泥댄겕諛뺤뒪id, value
        var childCheckboxId = checkboxId + '_' + childIdx;
        var childCheckboxValue = checkboxValue + ':typeFilter';
        var newChildLi = createLayerChildItem(
          childCheckboxId,
          childCheckboxValue,
          child.typeName,
          child.checked,
          false,
          child.types,
          checkboxValue
        );

        newChildUl.append(newChildLi);
      });

      if (!childAllChecked) {
        newLi.find('span').addClass('part-check');
      }
      newLi.append(newChildUl);
      newLi.addClass('depth2-in');
    }

    newLi.append(newLi);
    precisionChild.append(newLi);
  });
  // ==================== end of �뺣��꾨줈吏��� �덉씠�� �쒖뼱 紐⑸줉 ====================

  // cql�꾪꽣�뺣낫 吏���
  precisionLayers.forEach(function (item) {
    item.cqlFilter = {};
    for (var key in item.checkedTypes) {
      if (item.checkedTypes[key].length > 0) {
        item.cqlFilter[key] = 'type IN (' + item.checkedTypes[key].join(',') + ')';
      }
    }
  });

  // 媛앹껜 �좏깮�섏뿀�꾨븣 �대깽��
  // �좏깮�� feature媛� �놁쓣�뚮뒗 layer, feature null濡� 諛섑솚��
  var onSelectFeature = function (layerName, feature, arg3, arg4) {
    //console.info('onSelectFeature : ');
    //console.info('  - layerName: ', layerName);
    //console.info('  - feature: ', feature);
    //console.info('  - arg3: ', arg3);
    //console.info('  - arg4: ', arg4);

    if (layerName == 'LiveLayer') {
      if (feature.get('isLive')) {
        var width = Math.floor(screen.width / 2);
        var height = Math.floor(screen.height / 2) + 50;

        var stream;
        if (feature.getId() == '01') {
          stream = 'drone';
        } else if (feature.getId() == '61') {
          stream = 'phone1';
        } else if (feature.getId() == '62') {
          stream = 'phone2';
        } else if (feature.getId() == '63') {
          stream = 'phone3';
        } else if (feature.getId() == '64') {
          stream = 'phone4';
        } else {
          return;
        }

        window.open(
          '/liveViewer.do?stream=' + stream,
          'live_' + stream,
          'width=' + width + 'px,height=' + height + 'px,scrollbars=no,resizable=yes,scrollbars=yes'
        );
      }
    }else if(layerName == 'unusedLandLayer'){

        if (feature) {
          dtjpMap.hideOverlay();
          moveAndShowOverlay(unUsedLandOverlay, dashboardOverlayFn.beforunUsedLandOverlay, feature);
        }
    }else if(layerName == 'illegalUse'){

        if (feature) {
          dtjpMap.hideOverlay();
          moveAndShowOverlay(unUsedLandOverlay, dashboardOverlayFn.beforunUsedLandOverlay, feature);
        }
    }else if(layerName == 'rentalLandLayer'){

        if (feature) {
          dtjpMap.hideOverlay();
          moveAndShowOverlay(rentalLandOverlay, dashboardOverlayFn.beforunRentalLandOverlay, feature);
        }
    }else if(layerName == 'squatLandLayer'){

        if (feature) {
          dtjpMap.hideOverlay();
          moveAndShowOverlay(squatLandOverlay, dashboardOverlayFn.beforunSquatLandOverlay, feature);
        }
    }else if(layerName == 'projectLandLayer'){

        if (feature) {
          dtjpMap.hideOverlay();
          moveAndShowOverlay(projectLandOverlay, dashboardOverlayFn.beforunProjectLandOverlay, feature);
        }
    }else if (layerName == 'VehicleLayer') {
      if (feature.get('hasCamera') && feature.get('isLive')) {
        var streamId = feature.get('STREAM_ID');
        var patrolId = feature.get('EX_EQPM_IDNT_ID');

        if (streamId) {
          var width = Math.floor(screen.width / 2);
          var height = Math.floor(screen.height / 2);

          // �쒖같李� �ㅼ떆媛� �곸긽 �앹뾽 �닿린
          window.open(
            '/patrolViewer.do?' + encodeURI('streamId=' + streamId + '&patrolId=' + patrolId),
            'patrol_' + streamId,
            'width=' + width + 'px,height=' + height + 'px,scrollbars=no,resizable=yes,scrollbars=yes'
          );
        }
      }
    } else if (layerName == 'CCTVLayer') {

      var cctvId = feature.get('SPIN_INTG_ID');
      if (cctvId) {
        var width = Math.floor(screen.width / 3);
        var height = Math.floor(screen.height / 3);

        var routeNm = dashboardCache.route.getRouteName(feature.get('ROUTE_CD'));
        var drctNm = dashboardCache.route.getRouteDrctName(feature.get('MTNOF_CD'), feature.get('ROUTE_CD'), feature.get('ROUTE_DRCT_CD'));
        var dstnc = feature.get('INSL_DSTNC');
        var name = feature.get('SPIN_INTG_NM');

        var query = 'cctvId=' + cctvId + '&routeNm=' + routeNm + '&drctNm=' + drctNm + '&dstnc=' + dstnc + '&name=' + name;
        query = encodeURI(query);

        // cctv �앹뾽 �닿린
        window.open(
          '/Cctv.do?' + query,
          'CCTV',
          'width=' + width + 'px,height=' + height + 'px,scrollbars=no,resizable=yes,scrollbars=yes'
        );
      }
    } else if (layerName == 'cluster' && feature) {
      var acdtRoute = {};
      var features = feature.get('features');
      var distance;

      // �섎떒 �뺣낫李� 蹂댁씠湲�
      $('.inner.row').removeClass('full');
      map2d.updateSize();

      // loop for clustered features
      features.forEach(function (feature) {
        // ACDT_ROUTE_CD, ACDT_OCRN_DSTNC
        var routeCd = feature.get('ACDT_ROUTE_CD');
        distance = feature.get('ACDT_OCRN_DSTNC');

        // �ш퀬 �뺣낫�� �몄꽑蹂� �댁젙援ш컙 怨꾩궛 (�ㅻ툕�덉씠 �댁슜)
        if (acdtRoute[routeCd]) {
          acdtRoute[routeCd].start = Math.min(acdtRoute[routeCd].start, distance);
          acdtRoute[routeCd].end = Math.max(acdtRoute[routeCd].end, distance);
        } else {
          acdtRoute[routeCd] = {
            routeNm: feature.get('USE_ROTNM'),
            start: distance,
            end: distance
          };
        }
      });

      // acdtRoute object to array
      var acdtRoutes = [];
      for (var key in acdtRoute) {
        if (acdtRoute.hasOwnProperty(key)) {
          var routeInfo = {
            routeCd: key,
            routeNm: acdtRoute[key].routeNm,
            start: acdtRoute[key].start,
            end: acdtRoute[key].end
          };
          acdtRoutes.push(routeInfo);
        }
      }

      accidentdata(acdtRoutes);
      $('#graph').addClass('active');
      $('#report').removeClass('active');
      $('.emap_wrap').removeClass('active');
      dashboardMap.getDtjpMap().updateSize();

      if(266.4 <= distance && distance <= 266.5){
    	  $('#roadresult').show();
	  	}else if(264.4 <= distance && distance <= 264.7){
	  		 $('#roadresult').show();
	  	}else if(259.4 <= distance && distance <= 260.0){
	  		 $('#roadresult').show();
	  	}else if(248.7 <= distance && distance <= 248.8){
	  		 $('#roadresult').show();
	  	}else if(213.2 <= distance && distance <= 214.0){
	  		 $('#roadresult').show();
	  	}else{
	  		$('#roadresult').hide();
	  	}

      // �ㅻ툕�덉씠 �쒖텧
      dashboardOverlayFn.showClusterOverlay(popoverCluster, acdtRoutes, feature);
    } else if (layerName == 'AccidentLayer') {
		console.log('feature:{}',feature.getId());
      // 援먰넻�ш퀬 蹂닿퀬�� 議고쉶
      dashboardFn.displayOckReport(feature.get('RPRQ_CRCM_SEQ'));
    } else if (layerName == 'loadLayer') {
    	  var focusPopup;
    	let Id= feature.getId();
	 console.log('feature:{}',feature.getId());

    	// �몃㈃遺꾩꽍�앹뾽
    	focusPopup = window.open('/popupRoad.do?Id='+Id, '�몃㈃遺꾩꽍寃곌낵', 'width=760px,height=1000px,scrollbars=no, resizable=no');
		focusPopup.focus();
    }
  };

  // 吏��� 珥덇린��
  var dtjpMap = new DtjpCommonMap('mapTarget', {
    center: [14213121.711211301, 4338175.153863268], // 珥덇린 �꾩튂
    zoom: 6, // 珥덇린 以�
    addSlider: false,
    addRotate: false,
    addDefaultRotate: true,
    addDefaultZoom: false,
    addSatellite: true,
    // addGeolocation: true,
    // moveToGpsPositionOnInit: true,
    enableSelect: true, // �대┃�� �좏깮湲곕뒫 �ъ슜�щ�
    showCenterPin: false,
    isPrecisionQuery: true, // �대┃�� �뺣��꾨줈 �덉씠�� 議고쉶 �щ� (vector �덉씠�댁뿉�� 癒쇱� �좏깮�섎㈃ 議고쉶�덊븿)
    precisionQueryLayers: null, // 吏��꾩뿉 �쒖텧�섎뒗 �덉씠�대줈 議고쉶
    precisionQueryCount: 1,
    precisionLayers: precisionLayers, // �뺣��꾨줈 �쒖텧 �덉씠��
    precisionOverlayId: precisionOverlayId, // �뺣��꾨줈 �좏깮�� �쒖텧�섎뒗 �ㅻ툕�덉씠ID
    layers: [
      boundaryLayer,
      vdsLayer,
      vehicleLayer,
      smartVehicleLayer,
      accidentLayer,
      constructionLayer,
      liveLayer,
      cctvLayer,
      roadViewLine,
      radarLayer,
      heatmapLayer,
      clusterLayer,
      riskLayer,
      loadLayer,
      icjctLayer,
      customImageLayer,
	  aisuacLayer,
      aisaltcLayer,
      aisfldcLayer,
      aisctrcLayer,
      aisprhcLayer,
      aisatzcLayer,
      aisrescLayer,
      aisdngcLayer,
      bubunLayer,
      unusedLandLayer,
      illegalUse,
      rentalLandLayer,
      projectLandLayer,
      squatLandLayer,
	  unusedLand,
      illegalUseLand,
      rentalLand,
      projectLand,
      squatLand,
      roadBufferZone
    ],
    onSelectFeature: onSelectFeature
  });

  var map2d = dtjpMap.getMap2D();
  window.map2d = map2d;
  
  map2d.addControl(new himap.control.Measure({
    sysKey: 'XXX_01',
    className: 'dtjp-measure',
    start: function(mode) {
      $('.map .dtjp-measure a').removeClass('active');
      $('.map .dtjp-measure a.' + mode).addClass('active');
    },
    finish: function() {
      $('.map .dtjp-measure a').removeClass('active');
    },
    clear: function() {
      $('.map .dtjp-measure a').removeClass('active');
    }
  }));

  $('.map .dtjp-measure a.distance').attr('title', '嫄곕━�ш린');
  $('.map .dtjp-measure a.area').attr('title', '硫댁쟻�ш린');
  $('.map .dtjp-measure a.clear').attr('title', '嫄곕━(硫댁쟻)�ш린 吏��곌린');

  // �몃㈃遺꾩꽍援ш컙 �덉씠�� �섏씠�쇱씠��
  loadLayer.set('selectable', true);
  var select = new ol.interaction.Select({
	  layers: function(layer) {
		return layer.get('selectable') == true;
	  },
	  condition: ol.events.condition.pointerMove,
	  style: new ol.style.Style({
		  stroke: new ol.style.Stroke({
			  color: 'white',
			  width: 3,
		  }),
		  fill: new ol.style.Fill({
			  color: [255, 51, 255, 0.6]
		  })
	  }),
  });
  map2d.addInteraction(select);


  dtjpMap.addOverlay(unUsedLandOverlay, dashboardOverlayFn.beforunUsedLandOverlay);
  dtjpMap.addOverlay(rentalLandOverlay, dashboardOverlayFn.beforunUsedLandOverlay);
  dtjpMap.addOverlay(projectLandOverlay, dashboardOverlayFn.beforunUsedLandOverlay);
  dtjpMap.addOverlay(squatLandOverlay, dashboardOverlayFn.beforunUsedLandOverlay);

  dtjpMap.addOverlay(precisionInfoOverlay, dashboardOverlayFn.beforePrecisionInfoOverlay);
  // dtjpMap.addOverlay(markerOverlay,
	// dashboardOverlayFn.beforeMarkerOverlay);
  dtjpMap.addOverlay(carInfoOverlay, dashboardOverlayFn.beforeCarInfoOverlay);
  dtjpMap.addOverlay(smartCarInfoOverlay, dashboardOverlayFn.beforeSmartCarInfoOverlay);
  dtjpMap.addOverlay(constructionOverlay, dashboardOverlayFn.beforeConstructionOverlay);

  map2d.addOverlay(labelOverlay);
  map2d.addOverlay(popoverCluster);

  // dtjpMap.addCenterPin({visible: true, onSelectFeature: function() {
  // console.info(arguments);
  // }});

  var updateHeatmapRadius = function () {
    // zoom 13�쇰븣
    // blur: 20,
    // radius: 10,
    var zoom = map2d.getView().getZoom();
    if (zoom < 2) {
      zoom = 2;
    }
    var radius = (zoom / 13) * 10;
    var blur = (zoom / 13) * 20;
    heatmapLayer.setRadius(radius);
    heatmapLayer.setBlur(blur);
  };
  updateHeatmapRadius();

  // ==================== map2d �대깽�� ====================
  // �쇰꺼 �쒖텧 諛� 留덉슦�� 而ㅼ꽌 蹂�寃�
  var pointmoveHandler = function (evt) {
    if (MAPMODE.PANO) {
      labelOverlay.setPosition(undefined);
      return;
    }

    var layer;
    var feature = map2d.forEachFeatureAtPixel(
      evt.pixel,
      function (feature, layer2) {
        layer = layer2;
        return feature;
      }
      // {
      // layerFilter: function (layer) {
      // return layer.get('name') == 'CCTVLayer';
      // }
      // }
    );

    if (layer && layer.get('name') == 'CCTVLayer' && feature) {
      $(labelOverlay.getElement()).find('div').text(feature.get('SPIN_INTG_NM'));
      labelOverlay.setPosition(feature.getGeometry().getCoordinates());
    } else {
      // 留덉슦�� �대룞�� �쇰꺼 �놁뼱吏�寃�...
      labelOverlay.setPosition(undefined);
    }
  };
  map2d.on('pointermove', pointmoveHandler);

  map2d.getView().on('change:resolution', function () {
    // zoom 蹂�寃쎌떆 �ㅻ툕�덉씠 �④린湲�
    // �ㅻ툕�덉씠 �④린湲�
    popoverCluster.setPosition();
    // heatmap radius, blur 蹂�寃�
    updateHeatmapRadius();
  });
  // ==================== end of map2d �대깽�� ====================

  // �ш퀬, 怨듭궗 �곗씠�� 議고쉶
  var querySituationData = function () {
	//20230910 �꾩떆 二쇱꽍
    //dashboardFn.doAjax({ url: '/ajaxMapDataSelect.do?type=situation' }).done(callbackSituationData);
  };
  var queryVehicleData = function () {
    var ajax1, ajax2;
    if ($('#chk_toggle_vehicle').is(':checked')) {
      ajax1 = dashboardFn.getAjax({
        url: '/ajaxMapDataSelect.do?type=vehicle'
      });
    }
    if ($('#chk_toggle_smartvehicle').is(':checked')) {
      ajax2 = dashboardFn.getAjax({
        url: '/smartvehicle/management/selectBoardVacationList.do'
      });
    }
    $.when(ajax1, ajax2).done(callbackVehicleData);
  };
  // ==================== �ш퀬, 怨듭궗, 李⑤웾 �곌퀎 �곗씠�� 議고쉶 ====================

  // �ш퀬, 怨듭궗 �곗씠�� 議고쉶 肄쒕갚
  var callbackSituationData = function (data) {
    FLASH_COORDINATES.splice(0, FLASH_COORDINATES.length);
    if (data && data.situationList) {
      // �ш퀬�뺣낫, 怨듭궗�뺣낫 source ��젣
      accidentLayer.getSource().clear();
      constructionLayer.getSource().clear();

      data.situationList.forEach(function (item) {
        // 怨듭궗 : 李⑤떒(02)
        // �ш퀬: 05, 12, 13
        if (
          item['RPRQ_CRCM_TYPE_CD'] == '02' ||
          item['RPRQ_CRCM_TYPE_CD'] == '05' ||
          item['RPRQ_CRCM_TYPE_CD'] == '12' ||
          item['RPRQ_CRCM_TYPE_CD'] == '13'
        ) {

          if (!item.GRS80_XCORD || !item.GRS80_YCORD) {
            return;
          }
          // 醫뚰몴蹂��� (EPSG:5186 -> EPSG:900913)
          var position;

          try {
            position = ol.proj.transform([item.GRS80_XCORD, item.GRS80_YCORD], 'EPSG:5186', 'EPSG:900913');
          } catch (e) {
            console.log('醫뚰몴蹂��� �ㅻ쪟');
            return;
          }

          // feature �앹꽦
          var feature = new Feature({
            geometry: new Point(position)
          });

          // id 吏���
          feature.setId(item.RPRQ_CRCM_SEQ);
          // item�댁슜�� feature�� 異붽�
          feature.setProperties(item);

          var source;
          if (item['RPRQ_CRCM_TYPE_CD'] == '02') {
            // �ㅻ툕�덉씠ID 吏���
            feature.set(dtjpMap.OVERLAY_ID_PROP, 'constructionOverlay');
            // 怨듭궗�덉씠�� �뚯뒪�� 異붽�
            source = constructionLayer.getSource();
          } else {
            // �ш퀬�덉씠�� �뚯뒪�� 異붽�
            source = accidentLayer.getSource();
            if (accidentLayer.getVisible()) {
              // �ш퀬�꾩튂 flash 醫뚰몴 異붽�
              FLASH_COORDINATES.push(position);
            }
          }
          source.addFeature(feature);
        }
      });

      // flash
      startFlash();

      // 吏곸꽑�� 援먰넻�곹솴 異붽�
      dashboardStraight.setStraightData('situation', data.situationList);
    }
  };

  // 李⑤웾 �곗씠�� 議고쉶 肄쒕갚
  var callbackVehicleData = function (resVehicle, resSmartVehicle) {
    // 李⑤웾�덉씠�� source 鍮꾩슦湲�
    vehicleLayer.getSource().clear();
    // 李⑤웾 �곗씠�� 媛깆떊
    if (resVehicle) {
      addVehicleData(resVehicle[0]);
    }
    smartVehicleLayer.getSource().clear();
    // �ㅻ쭏�몄감�됯�由� �곗씠�� 媛깆떊
    if (resSmartVehicle) {
      addSmartVehicleData(resSmartVehicle[0]);
    }
  };

  var addVehicleData = function (data) {
    if (data && data.vehicles) {
      $('.move-to-live[data-live-code="n02025_112"]').text('�쒖같李� [�곷룞112(��)]');
      $('.move-to-live[data-live-code="n02025_116"]').text('�쒖같李� [�곷룞116(��)]');

      var layerChecked = $('#chk_toggle_vehicle').is(':checked');
      var workChecked = $('#chk_toggle_vehicle_work').is(':checked');
      var playChecked = $('#chk_toggle_vehicle_play').is(':checked');

      var features = [];
      data.vehicles.forEach(function (item) {
        if (item.MTNOF_NM != '�곷룞') {
          return;
        }

        // �ㅼ떆媛� �곸긽 �덉씠�댁뿉 異붽��섍린 �꾪븳 援щ텇 (�λ퉬�앸퀎ID濡� 援щ텇)
        var hasCamera = false;
        var featureId, streamId;
        if (item.EX_EQPM_IDNT_ID == '112(��)' || item.EX_EQPM_IDNT_ID == '116(��)') {
          hasCamera = true;

          var status = '';

          if (item.TYPE == 'W') {
            status = ' (�댄뻾)';
          } else {
            status = ' (誘몄슫��)';
          }

          if (item.EX_EQPM_IDNT_ID == '112(��)') {
            streamId = 'n02025_112.stream';
            featureId = 'n02025_112';
            $('.move-to-live[data-live-code="n02025_112"]').text('�쒖같李� [�곷룞112(��)]' + status);
          } else if (item.EX_EQPM_IDNT_ID == '116(��)') {
            streamId = 'n02025_116.stream';
            featureId = 'n02025_116';
            $('.move-to-live[data-live-code="n02025_116"]').text('�쒖같李� [�곷룞116(��)]' + status);
          }
        }

        // 李⑤웾 �덉씠�� off�대㈃ 異붽��덊븿
        if (!layerChecked) {
          return;
        }

        if ((item.TYPE == 'W' && !workChecked) || (item.TYPE == 'P' && !playChecked)) {
          return;
        }

        // 醫뚰몴蹂��� (EPSG:5186 -> EPSG:900913)
        var position = ol.proj.transform([item.GRS80_XCORD, item.GRS80_YCORD], 'EPSG:5186', 'EPSG:900913');

        // feature �앹꽦
        var feature = new Feature({
          geometry: new Point(position)
        });

        // item�댁슜�� feature�� 異붽�
        feature.setProperties(item);

        // �ㅽ��� (李⑤웾 醫낅쪟, 諛⑺뼢) 援щ텇�꾪븳 key 議고빀
        var type = feature.get('TYPE');
        var eqpmCd = feature.get('EQPM_CLSFC_CD');
        var angleCd = feature.get('LOCT_ANGL');

        feature.set('carStyleKey', type + '_' + eqpmCd + '_' + angleCd);
        // �ㅻ툕�덉씠ID 吏���
        feature.set(dtjpMap.OVERLAY_ID_PROP, 'carInfoOverlay');

        if (hasCamera) {
          feature.set('hasCamera', hasCamera);
          // ���곗옄 �쒕쾭 incomming �곹깭�먯꽌 �곸슜
          feature.set('isLive', wowzaIncomming[streamId]);
          // feature.set('isLive', feature.get('TYPE') == 'W');
          // work �곹깭�대㈃ live on
          // play �곹깭�대㈃ live off
          feature.set('STREAM_ID', streamId);
          feature.setId(featureId);
        }

        features.push(feature);
      });

      vehicleLayer.getSource().addFeatures(features);
    }
  };

  var addSmartVehicleData = function (data) {
    var layerChecked = $('#chk_toggle_smartvehicle').is(':checked');
    if (!layerChecked) {
      return;
    }

    if (data) {
      var workChecked = $('#chk_toggle_smartvehicle_work').is(':checked');
      var playChecked = $('#chk_toggle_smartvehicle_play').is(':checked');

      var features = [];

      // // �뚯뒪�몄슜
      // var tmpGps = [
      // [127.354107, 36.289886],
      // [127.467075, 36.312802],
      // [127.548623, 36.323105],
      // [127.557409, 36.317223],
      // [127.794913, 36.281887],
      // [127.853340, 36.252841],
      // [127.924631, 36.220579]
      // ];

      // function fisherYatesShuffle(arr) {
      // for (var i = arr.length - 1; i > 0; i--) {
      // var j = Math.floor(Math.random() * (i + 1)); //random index
      // [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
      // }
      // }
      // fisherYatesShuffle(tmpGps);

      // var tmpIdx = 0;
      data.forEach(function (item) {
        // �뚯뒪�몄슜�쇰줈 �꾩튂 蹂�寃�
        // item.LOCT_XCORD = tmpGps[tmpIdx][0];
        // item.LOCT_YCORD = tmpGps[tmpIdx][1];
        // tmpIdx++;

        // //if (tmpIdx < 3) {
        // item.RUN_YN = 'Y';
        // //}

        // �ㅻ쭏�� 李⑤웾愿�由� �ㅼ떆媛� �뺣낫
        // ALCR_END_TIME: "1400"
        // ALCR_STRT_DATES: "20220124"
        // ALCR_STRT_TIME: "0900"
        // DRVE_DRCT: 0
        // DRVR_EMNO_NM: "�좎쁺踰�"
        // DRVR_TELNO: "01023007079"
        // DTJ_VHCL_CLSS_CD: "01"
        // EQPM_CD: "31020817"
        // EQPM_NM: "�덉쟾�쒖같李�"
        // EQPM_RGST_CTNT: "334��4215"
        // ETC_RMRK: "�좎�蹂댁닔 �뚯뒪��"
        // EX_EQPM_IDNT_ID: "112"
        // JOB_PLAC_NM: "�덉쁺IC"
        // LOCT_XCORD: 127.130104
        // LOCT_YCORD: 37.41307
        // LSTTM_ALTR_DTTM: "20220124131138"
        // RUM: 1
        // RUN_YN: "N" // �댄뻾�щ�
        // STNDS_NM: null
        // console.info(item);
        if ((item.RUN_YN == 'Y' && !workChecked) || (item.RUN_YN == 'N' && !playChecked)) {
          return;
        }

        // 醫뚰몴蹂���
        var coordiate = ol.proj.transform([item.LOCT_XCORD, item.LOCT_YCORD], 'EPSG:4326', 'EPSG:3857');

        // feature �앹꽦
        var feature = new Feature({
          geometry: new Point(coordiate)
        });

        // id 吏���
        if (item.EQPM_CD) {
          feature.setId(item.EQPM_CD);
        }

        // �ㅻ툕�덉씠 吏���
        feature.set(dtjpMap.OVERLAY_ID_PROP, 'smartCarInfoOverlay');

        // item�댁슜�� feature�� 異붽�
        feature.setProperties(item);
        features.push(feature);
      });
      smartVehicleLayer.getSource().addFeatures(features);
    }

    // 吏곸꽑�꾩뿉 異붽�
    dashboardStraight.setStraightData('smartvehicle', data);
  };

  // �ш퀬, 怨듭궗 �곗씠�� 議고쉶 ���대㉧
  var tmSituationDataQuery;
  // �ш퀬, 怨듭궗 �곗씠�� 議고쉶 �쒖옉
  var startSituationDataQuery = function () {
    stopSituationDataQuery();
    querySituationData();
    tmSituationDataQuery = setInterval(function () {
      querySituationData();
    }, INTERVAL.RELATE_DATA);
  };
  // �ш퀬, 怨듭궗 �곗씠�� 議고쉶 醫낅즺
  var stopSituationDataQuery = function () {
    clearInterval(tmSituationDataQuery);
  };
  // �ш퀬, 怨듭궗 泥댄겕諛뺤뒪 �곹깭 �뺤씤�섏뿬 ���대㉧ �쒖옉, 以묒�
  var updateMapRelateDataQuery = function () {
    var accidentChecked = $('#chk_toggle_accident').is(':checked');
    var constructionChecked = $('#chk_toggle_construction').is(':checked');

    // 吏곸꽑�� 援먰넻�곹솴 �ш퀬�뺣낫 ��젣
    if (!accidentChecked) {
      dashboardStraight.removeStraightItem('icon_situation_sago');
      stopFlash();
    }
    // 吏곸꽑�� 援먰넻�곹솴 �묒뾽�뺣낫 ��젣
    if (!constructionChecked) {
      dashboardStraight.removeStraightItem('icon_situation_chadan');
    }

    var someChecked = accidentChecked || constructionChecked;
    if (someChecked) {
      startSituationDataQuery();
    } else {
      stopSituationDataQuery();
    }
  };

  // 泥댄겕諛뺤뒪 �대┃�� 李⑤웾 �뺣낫 媛깆떊
  var updateVehiceData = function () {
    if ($('#chk_toggle_vehicle').is(':checked') || $('#chk_toggle_smartvehicle').is(':checked')) {
      queryVehicleData();
    } else {
      vehicleLayer.getSource().clear();
      smartVehicleLayer.getSource().clear();
    }

    if (!$('#chk_toggle_smartvehicle').is(':checked') || !$('#chk_toggle_smartvehicle_work').is(':checked')) {
      // 吏곸꽑�� �ㅻ쭏�몄감�� ��젣
      dashboardStraight.removeStraightItem('icon_smartvehicle_run');
    }
  };
  // ==================== end of �ш퀬, 怨듭궗, 李⑤웾 �곗씠�� 議고쉶 ====================

  // ==================== �ㅼ떆媛� �곸긽 (�쒕줎, �ㅻ쭏�명룿) �꾩튂 諛� �ㅽ듃由� �곹깭 議고쉶
	// ====================
  // ���곗옄 �낅젰 �ㅽ듃由� �곹깭 ���� 蹂���
  var wowzaIncomming = {};

  var callbackGetWowzaInstance = function (data) {
    for (var property in wowzaIncomming) {
      wowzaIncomming[property] = false;
    }
    // drone, phone, n02025_112, n02025_116
    // => drone, phone1, phone2, ...
    data.forEach(function (item) {
      if (item && item.name) {
        wowzaIncomming[item.name] = item.isConnected;
      }
    });

    // 李⑤웾 live �곹깭 媛깆떊
    if (vehicleLayer.getSource().getFeatureById('n02025_112')) {
      vehicleLayer.getSource().getFeatureById('n02025_112').set('isLive', wowzaIncomming['n02025_112.stream']);
    }
    if (vehicleLayer.getSource().getFeatureById('n02025_116')) {
      vehicleLayer.getSource().getFeatureById('n02025_116').set('isLive', wowzaIncomming['n02025_116.stream']);
    }
    // �쒕줎 live �곹깭 媛깆떊
    if (liveLayer.getSource().getFeatureById('01')) {
      liveLayer.getSource().getFeatureById('01').set('isLive', wowzaIncomming['drone']);
    }
    // �ㅻ쭏�명룿 live �곹깭 媛깆떊
    if (liveLayer.getSource().getFeatureById('61')) {
      liveLayer.getSource().getFeatureById('61').set('isLive', wowzaIncomming['phone1']);
    }
    if (liveLayer.getSource().getFeatureById('62')) {
      liveLayer.getSource().getFeatureById('62').set('isLive', wowzaIncomming['phone2']);
    }
    if (liveLayer.getSource().getFeatureById('63')) {
      liveLayer.getSource().getFeatureById('63').set('isLive', wowzaIncomming['phone3']);
    }
    if (liveLayer.getSource().getFeatureById('64')) {
      liveLayer.getSource().getFeatureById('64').set('isLive', wowzaIncomming['phone4']);
    }
  };

  // �ㅼ떆媛� �곸긽 �꾩튂 諛� �곹깭 議고쉶
  var queryLiveData = function () {
    // �쒕줎, �ㅻ쭏�명룿 �곸긽 李곗쁺 �곹깭 諛� �꾩튂 議고쉶
    //dashboardFn.doAjax({ url: '/selectDroneRecMonitor.do' }).done(callbackQueryLiveData);
    // ���곗옄 �ㅽ듃由� 紐⑸줉 媛��몄삤湲�
    //20230910 �꾩떆 二쇱꽍
    //dashboardFn.doAjax({ url: '/getWowzaInstance.do' }).done(callbackGetWowzaInstance);
    // 李⑤웾愿���, �ㅻ쭏�몄감�됯��� 議고쉶
   // queryVehicleData();
  };
  var callbackQueryLiveData = function (recData) {
    liveLayer.getSource().clear();

    // PTGR_EQPM_CD : 01 (�쒕줎), 61~64(�ㅻ쭏�명룿)
    $('.move-to-live[data-live-code="01"]').text('�쒕줎');
    $('.move-to-live[data-live-code="61"]').text('�ㅻ쭏�명룿 1梨꾨꼸');
    $('.move-to-live[data-live-code="62"]').text('�ㅻ쭏�명룿 2梨꾨꼸');
    $('.move-to-live[data-live-code="63"]').text('�ㅻ쭏�명룿 3梨꾨꼸');
    $('.move-to-live[data-live-code="64"]').text('�ㅻ쭏�명룿 4梨꾨꼸');

    if (!recData) {
      return;
    }

    recData.forEach(function (item) {
      if (item.PCTR_GTHR_STAT_CD) {
        if (item.PTGR_EQPM_CD == '01') {
          $('.move-to-live[data-live-code="01"]').text('�쒕줎 (' + item.PCTR_GTHR_STAT_CD_NM + ')');
        } else if (item.PTGR_EQPM_CD == '61') {
          $('.move-to-live[data-live-code="61"]').text('�ㅻ쭏�명룿 1梨꾨꼸 (' + item.PCTR_GTHR_STAT_CD_NM + ')');
        } else if (item.PTGR_EQPM_CD == '62') {
          $('.move-to-live[data-live-code="62"]').text('�ㅻ쭏�명룿 2梨꾨꼸 (' + item.PCTR_GTHR_STAT_CD_NM + ')');
        } else if (item.PTGR_EQPM_CD == '63') {
          $('.move-to-live[data-live-code="63"]').text('�ㅻ쭏�명룿 3梨꾨꼸 (' + item.PCTR_GTHR_STAT_CD_NM + ')');
        } else if (item.PTGR_EQPM_CD == '64') {
          $('.move-to-live[data-live-code="64"]').text('�ㅻ쭏�명룿 4梨꾨꼸 (' + item.PCTR_GTHR_STAT_CD_NM + ')');
        }

        // PTGR_EQPM_CD
        if (item.PCTR_GTHR_STAT_CD == 'R' || item.PCTR_GTHR_STAT_CD == 'S') {
          // �꾧꼍�� 醫뚰몴 蹂���
          // var position = ol.proj.transform([item.GRS_XCORD,
			// item.GRS_YCORD], 'EPSG:4326', 'EPSG:900913');
          // 醫뚰몴蹂��� �덊븿
          var position = [item.GRS_XCORD, item.GRS_YCORD];
          // �덈줈�� drone �꾩튂 feature 異붽�
          var feature = new Feature({
            geometry: new Point(position)
          });

          // �쒕줎, �ㅻ쭏�명룿 feature id 吏���
          var id = item.PTGR_EQPM_CD;
          feature.setId(id);
          // �쒕줎, �ㅻ쭏�명룿 援щ텇
          feature.set('PTGR_EQPM_CD', item.PTGR_EQPM_CD);
          // �곹깭 吏��� (R �먮뒗 S)
          feature.set('PCTR_GTHR_STAT_CD', item.PCTR_GTHR_STAT_CD);

          liveLayer.getSource().addFeature(feature);
        }
      }
    });
  };

  var tmQueryLive;
  var startLiveQuery = function () {
    stopLiveQuery();
    queryLiveData();
    tmQueryLive = setInterval(queryLiveData, INTERVAL.LIVE);
  };
  // 誘몄궗��
  var stopLiveQuery = function () {
    clearInterval(tmQueryLive);
  };
  $(document).ready(function () {
    startLiveQuery();
  });
  // ==================== end of �ㅼ떆媛� �곸긽 議고쉶 ====================

  // ==================== �덉씠�� �곸긽 議고쉶 ====================
  var tmRefreshRadarLayer;
  var startRefreshRadarLayer = function () {
    stopRefreshRadarLayer();
    refreshRadarLayer();
    tmRefreshRadarLayer = setInterval(refreshRadarLayer, INTERVAL.RADAR);
    radarLayer.setVisible(true);
  };
  var stopRefreshRadarLayer = function () {
    clearInterval(tmRefreshRadarLayer);
    radarLayer.setVisible(false);
  };
  var refreshRadarLayer = function () {
    radarLayer.getSource().dispose();
    // var url = 'http://localhost:8088/radar/RDR_CMP_HSR_PUB_202112281130.png?'
	// + '_=' + Date.now();
    var url = '/getNowRadarImage.do?' + '_=' + Date.now();
    var source = new ol.source.ImageStatic({
      url: url,
      imageSize: [2305, 2881],
      projection: 'EPSG:3857',
      imageExtent: [13400000, 3500000, 14732000, 5374000]
    });
    radarLayer.setSource(source);
  };
  // ==================== end of �덉씠�� �곸긽 議고쉶 ====================



  // ==================== �좏쑕吏� 紐⑸줉 議고쉶 ====================
  var callbackUnUsedLandInfo = function (resData) {

    var source = map2d.getLayer('unusedLandLayer').getSource();
    var features = [];

    if (resData && resData.Sheet1) {
      resData.Sheet1.forEach(function (item) {
        var feature = new Feature({
          geometry: new Point([item.X, item.Y])
        });
        feature.setProperties(item);
        features.push(feature);
		getGeoLandLayer(item.PNU,'unusedLand');
      });

      // cctv �덉씠�� �뚯뒪�� 異붽�
      source.addFeatures(features);

	  //map2d.getView().setCenter([features[0].values_.X, features[0].values_.Y]);

	 /*var center = features[0].getGeometry().getCoordinates();
	  map2d.getView().animate({ center: center, zoom: 12, duration: 500 });*/

      // 吏곸꽑�꾩뿉 cctv 異붽�
      //dashboardStraight.setStraightData('cctv', resData);
    }
  };

  // ==================== 불법사용 정보 조회 ====================
  var callbackIllegalUseInfo = function (resData) {

    var source = map2d.getLayer('illegalUse').getSource();
    var features = [];

    if (resData && resData.Sheet1) {
      resData.Sheet1.forEach(function (item) {
        var feature = new Feature({
          geometry: new Point([item.X, item.Y])
        });
        feature.setProperties(item);
        features.push(feature);
		getGeoLandLayer(item.PNU,'illegalUseLand');
      });

      // cctv 레이어 마커 추가
      source.addFeatures(features);

	  //map2d.getView().setCenter([features[0].values_.X, features[0].values_.Y]);

	 /*var center = features[0].getGeometry().getCoordinates();
	  map2d.getView().animate({ center: center, zoom: 12, duration: 500 });*/

      // 지도에 cctv 추가
      //dashboardStraight.setStraightData('cctv', resData);
    }
  };

  //dashboardFn.doAjax({ url: '/dtjp/data.json' }, true).done(callbackUnUsedLandInfo);


  var callbackRantalLandInfo = function (resData) {

    var source = map2d.getLayer('rentalLandLayer').getSource();
    var features = [];

    if (resData && resData.Sheet1) {
      resData.Sheet1.forEach(function (item) {
        var feature = new Feature({
          geometry: new Point([item.X, item.Y])
        });
        feature.setProperties(item);
        features.push(feature);
		getGeoLandLayer(item.PNU,'rentalLand');
      });

      // cctv �덉씠�� �뚯뒪�� 異붽�
      source.addFeatures(features);
	   /*var center = features[0].getGeometry().getCoordinates();
	  map2d.getView().animate({ center: center, zoom: 12, duration: 500 });*/
      // 吏곸꽑�꾩뿉 cctv 異붽�
      //dashboardStraight.setStraightData('cctv', resData);
    }
  };
  //dashboardFn.doAjax({ url: '/dtjp/data1.json' }, true).done(callbackRantalLandInfo);

  var callbackSquatLandInfo = function (resData) {

    var source = map2d.getLayer('squatLandLayer').getSource();
    var features = [];

    if (resData && resData.Sheet1) {
      resData.Sheet1.forEach(function (item) {
        var feature = new Feature({
          geometry: new Point([item.X, item.Y])
        });
        feature.setProperties(item);
        features.push(feature);
		getGeoLandLayer(item.PNU,'squatLand');
      });

      // cctv �덉씠�� �뚯뒪�� 異붽�
      source.addFeatures(features);
	 /* var center = features[0].getGeometry().getCoordinates();
	  map2d.getView().animate({ center: center, zoom: 12, duration: 500 });*/
      // 吏곸꽑�꾩뿉 cctv 異붽�
      //dashboardStraight.setStraightData('cctv', resData);
    }
  };
  //dashboardFn.doAjax({ url: '/dtjp/data2.json' }, true).done(callbackSquatLandInfo);

 var callbackProjectLandInfo = function (resData) {

    var source = map2d.getLayer('projectLandLayer').getSource();
    var features = [];

    if (resData && resData.Sheet1) {
      resData.Sheet1.forEach(function (item) {
        var feature = new Feature({
          geometry: new Point([item.X, item.Y])
        });
        feature.setProperties(item);
        features.push(feature);
		getGeoLandLayer(item.PNU2,'projectLand');
      });

      // cctv �덉씠�� �뚯뒪�� 異붽�
      source.addFeatures(features);
	 /*var center = features[0].getGeometry().getCoordinates();
	  map2d.getView().animate({ center: center, zoom: 12, duration: 500 });*/
      // 吏곸꽑�꾩뿉 cctv 異붽�
      //dashboardStraight.setStraightData('cctv', resData);
    }
  };
  //dashboardFn.doAjax({ url: '/dtjp/data4.json' }, true).done(callbackProjectLandInfo);

  //도로버퍼구역은 WMS 이미지 레이어로 처리하므로 콜백 함수 불필요


  // ==================== end of �좏쑕吏� 紐⑸줉 議고쉶 ====================

  // ==================== CCTV 紐⑸줉 議고쉶 ====================
  var callbackCctvInfo = function (resData) {
    var source = cctvLayer.getSource();
    var features = [];

    if (resData && resData.cctvInfo) {
      resData.cctvInfo.forEach(function (item) {
        var feature = new Feature({
          geometry: new Point([item.GGTM_XCORD, item.GGTM_YCORD])
        });
        feature.setProperties(item);
        features.push(feature);
      });

      // cctv �덉씠�� �뚯뒪�� 異붽�
      source.addFeatures(features);
      // 吏곸꽑�꾩뿉 cctv 異붽�
      dashboardStraight.setStraightData('cctv', resData);
    }
  };
  dashboardFn.doAjax({ url: '/ajaxCctvInfo.do' }, true).done(callbackCctvInfo);
  // ==================== end of CCTV 紐⑸줉 議고쉶 ====================


  // ==================== 醫뚰몴 �꾩튂 flash ====================
  var FLASH_DURATION = 1000;
  var FLASH_KEY;
  var FLASH_COORDINATES = [];

  var startFlash = function () {
    stopFlash();

    if (!FLASH_COORDINATES || FLASH_COORDINATES.length == 0) {
      return;
    }

    var start = Date.now();
    var flashGeom = new ol.geom.MultiPoint(FLASH_COORDINATES);

    function animate(event) {
      var vectorContext = event.vectorContext;

      var frameState = event.frameState;
      var elapsed = frameState.time - start;
      var elapsedRatio = (elapsed % FLASH_DURATION) / FLASH_DURATION;

      if (elapsedRatio > 1) {
        elapsedRatio = 1;
      }

      // 諛섏�由� : 5�먯꽌 30源뚯�
      var radius = ol.easing.easeOut(elapsedRatio) * 40 + 20;
      var opacity = ol.easing.easeOut(1 - elapsedRatio) * 0.3;

      var flashStyle = new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, ' + opacity + ')'
          })
        })
      });

      vectorContext.setStyle(flashStyle);
      vectorContext.drawGeometry(flashGeom);

      map2d.render();
    }
    // postcompose�대깽�� 諛붿씤��
    FLASH_KEY = map2d.on('postcompose', animate);
    // flashKey = layers['iot'].on('postrender', animate);
    // map2d.render();
    // return FLASH_KEY;INTERVAL
  };

  var stopFlash = function () {
    ol.Observable.unByKey(FLASH_KEY);
    map2d.render();
  };
  // ==================== end of 醫뚰몴 �꾩튂 flash ====================

  // ==================== �덉씠�� 泥댄겕諛뺤뒪 �대깽�� ====================
  var updateGroupCheckbox = function (checkGroup) {
    // �숈씪�� 洹몃９�� 媛쒖닔
    var groupItemCount = $('.map_layer input.layer-toggle-check[data-check-group="' + checkGroup + '"]').length;
    if (groupItemCount > 0) {
      // �숈씪�� 洹몃９�� 泥댄겕�� 媛쒖닔
      var checkedGroupItemCount = $('.map_layer input.layer-toggle-check[data-check-group="' + checkGroup + '"]:checked').length;
      // 洹몃９ 遺�紐� 泥댄겕諛뺤뒪
      var groupParent = $('.map_layer input.layer-toggle-check[data-check-parent="' + checkGroup + '"]');
      var groupParentChecked = groupParent.is(':checked');
      if (checkedGroupItemCount == 0 && groupParentChecked) {
        groupParent.prop('checked', false).change();
        // 遺�遺� 泥댄겕 吏���
        groupParent.parent('span').addClass('part-check');
      } else if (checkedGroupItemCount > 0) {
        // 遺�遺� 泥댄겕 �쒓굅
        if (checkedGroupItemCount == groupItemCount) {
          groupParent.parent('span').removeClass('part-check');
        } else {
          // 遺�遺� 泥댄겕 吏���
          groupParent.parent('span').addClass('part-check');
        }
        if (!groupParentChecked) {
          groupParent.prop('checked', true).change();
        }
      }
    }
  };

  $('.layer-toggle-check').on('change', function () {
    // console.info('[digital-map] check change - id : ' + this.id + ', value :
	// ' + this.value + ', checked : ' + this.checked);
    if (this.value == 'LiveFeatureMove') {
      // �쒕줎(�ㅻ쭏�명룿)�꾩튂濡� �대룞
      var feature = liveLayer.getSource().getFeatureById(this.dataset.featureId);
      if (feature) {
        var center = feature.getGeometry().getCoordinates();
        map2d.getView().animate({ center: center, zoom: 10, duration: 500 });
      }
      return;
    }

    var arr = this.value.split(':');

    if (arr.length == 1 && this.value) {
      if (this.value == 'DTJPBASE') {
        if (map2d.getLayer('DTJPBASE').serviceLayers.length > 0) {
          dtjpMap.setLayerVisible(this.value, this.checked);
        }
      } else {
        var checkedCount = $('.layer-toggle-check[value="' + this.value + '"]:checked').length;
        dtjpMap.setLayerVisible(this.value, checkedCount > 0);
      }
    } else if (arr.length == 2) {
      // �뺣��꾨줈吏��� �몃� �덉씠�댁씪 寃쎌슦 �뺣��꾨줈吏��� 洹몃９ 泥댄겕 吏���
      // (ImageWMSGroup �덉씠�대뒗 耳쒖쭊 �쒕퉬�� �덉씠�닿� �놁쑝硫� �덉씠�댁쓽 visible�� false 泥섎━��)
      dtjpMap.setLayerVisible(this.value, this.checked);
    } else if (arr.length == 3) {
      // �뺣��꾨줈吏��� �덉씠�� �꾪꽣

      // value 媛숈� 洹몃９�먯꽌 �좏깮�� type 異붿텧
      var checkedGroupItems = $('.map_layer input.layer-toggle-check[data-check-group="' + this.dataset.checkGroup + '"]:checked');

      var wmsLayer = map2d.getLayer(arr[0]);
      var filter;
      if (checkedGroupItems.length < 1) {
        // EXCLUDE 濡� 吏���
        filter = 'EXCLUDE';
      } else {
        // 泥댄겕�� type 紐⑥븘�� �꾪꽣 �곸슜
        var typeFilters = checkedGroupItems
          .map(function (idx, checkbox) {
            return checkbox.dataset.typeFilter;
          })
          .get();

        filter = 'type IN (' + typeFilters.join(',') + ')';
      }

      if (wmsLayer.setCqlFilter) {
        wmsLayer.setCqlFilter(arr[1], filter);
      } else {
        console.info('[digital-map] check change - (' + arr[1] + ') wms�덉씠�닿� �꾨떂');
      }
    }

    // 遺�紐� 泥댄겕諛뺤뒪 泥댄겕�곹깭 吏���
    if (this.dataset && this.dataset.checkGroup) {
      updateGroupCheckbox(this.dataset.checkGroup);
    }

    // �ш퀬�뺣낫, 怨듭궗�뺣낫 �덉씠�� �좉���
    if (this.value == 'AccidentLayer' || this.value == 'ConstructionLayer') {
      updateMapRelateDataQuery();
    } else if (
      this.id == 'chk_toggle_vehicle' ||
      this.id == 'chk_toggle_vehicle_work' ||
      this.id == 'chk_toggle_vehicle_play' ||
      this.id == 'chk_toggle_smartvehicle' ||
      this.id == 'chk_toggle_smartvehicle_work' ||
      this.id == 'chk_toggle_smartvehicle_play'
    ) {
      updateVehiceData();
    } else if (this.value == 'CCTVLayer') {

      labelOverlay.setPosition();
      // 吏곸꽑�� cctv �좉�
      dashboardStraight.toggleType('cctv', this.checked);
    } else if (this.value == 'LiveLayer') {
      if (this.checked) {
        startLiveQuery();
      }
    } else if (this.id == 'chk_toggle_custom_layer') {
      // 커스텀 레이어 토글
      var check = this.checked;
      
      // OpenLayers 표준 방식으로 레이어 찾기
      var layer = null;
      var layers = map2d.getLayers().getArray();
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].get('name') === 'customImageLayer') {
          layer = layers[i];
          break;
        }
      }
      
      console.log('커스텀 레이어 찾기:', layer);
      if(layer) {
        layer.setVisible(check);
        console.log('커스텀 레이어 토글:', check);
        console.log('레이어 visible 상태:', layer.getVisible());
        
        // 네트워크 요청 확인을 위한 이벤트 리스너 추가
        if(check) {
          layer.getSource().on('imageloadstart', function() {
            console.log('WMS 이미지 로드 시작');
          });
          layer.getSource().on('imageloadend', function() {
            console.log('WMS 이미지 로드 완료');
          });
          layer.getSource().on('imageloaderror', function() {
            console.log('WMS 이미지 로드 에러');
          });
        }
      } else {
        console.error('customImageLayer 레이어를 찾을 수 없습니다');
        console.log('사용 가능한 레이어들:', layers.map(function(l) { return l.get('name'); }));
      }
    } else if (this.id == 'chk_toggle_exbase') {
      // 怨듭궗諛곌꼍, 釉뚯씠�붾뱶 諛곌꼍 �좉�
      var exBaseVisible = this.checked;
      var vworldSatelliteActive = $('.dtjpmap_satelliteview').hasClass('active');
      map2d.getLayer('exBaseLayer').setVisible(exBaseVisible);
      map2d.getLayer('exLineLayer').setVisible(exBaseVisible);
      map2d.getLayer('baseTileLayer').setVisible(!exBaseVisible && !vworldSatelliteActive);
      map2d.getLayer('satelliteTileLayer').setVisible(!exBaseVisible && vworldSatelliteActive);
      map2d.getLayer('hybridTileLayer').setVisible(!exBaseVisible && vworldSatelliteActive);
    } else if (this.id == 'chk_toggle_load_analysis') {
    	// �몃㈃遺꾩꽍寃곌낵 �좉�
    	var check = this.checked;
    	console.log(check);

    	if(check){
    		// map2d.getLayer('loadLayer').setVisible(true);
    		loadLayer.setVisible(true);
    	}else{
    		// map2d.getLayer('loadLayer').setVisible(false);
    		loadLayer.setVisible(false);
    	}

    } else if(this.value == 'unusedLandLayer'){
		var check = this.checked;
		if(check){
			stopFlash2();
			dashboardFn.doAjax({ url: '/dtjp/data.json' }, true).done(callbackUnUsedLandInfo);
		}else{
			stopFlash2();
			map2d.getLayer('unusedLandLayer').values_.visible = false;
			map2d.getLayer('unusedLand').values_.visible = false;
			map2d.getLayer('illegalUse').values_.visible = false;
			map2d.getLayer('illegalUseLand').values_.visible = false;
		}

		/*selectGeocoder(map2d.getLayer('unusedLandLayer'),cctvLayer);*/
    } else if(this.value == 'illegalUse'){
		var check = this.checked;
		if(check){
			stopFlash2();
			dashboardFn.doAjax({ url: '/dtjp/data.json' }, true).done(callbackIllegalUseInfo);
		}else{
			stopFlash2();
			map2d.getLayer('illegalUse').values_.visible = false;
			map2d.getLayer('illegalUseLand').values_.visible = false;
		}

		/*selectGeocoder(map2d.getLayer('illegalUse'),cctvLayer);*/
    }else if(this.value == 'rentalLandLayer'){
		var check = this.checked;
		if(check){
			stopFlash2();
			dashboardFn.doAjax({ url: '/dtjp/data1.json' }, true).done(callbackRantalLandInfo);
		}else{
			stopFlash2();
			map2d.getLayer('rentalLandLayer').values_.visible = false;
			map2d.getLayer('rentalLand').values_.visible = false;
		}


		/*selectGeocoder(map2d.getLayer('unusedLandLayer'),cctvLayer);*/
    }else if(this.value == 'squatLandLayer'){
		var check = this.checked;
		if(check){
			stopFlash2();
			dashboardFn.doAjax({ url: '/dtjp/data2.json' }, true).done(callbackSquatLandInfo);
		}else{
			stopFlash2();
			map2d.getLayer('squatLandLayer').values_.visible = false;
			map2d.getLayer('squatLand').values_.visible = false;
		}

		/*selectGeocoder(map2d.getLayer('unusedLandLayer'),cctvLayer);*/
    }else if(this.value == 'projectLandLayer'){
		var check = this.checked;
		if(check){
			stopFlash2();
			dashboardFn.doAjax({ url: '/dtjp/data4.json' }, true).done(callbackProjectLandInfo);
		}else{
			stopFlash2();
			map2d.getLayer('projectLandLayer').values_.visible = false;
			map2d.getLayer('projectLand').values_.visible = false;
		}

		/*selectGeocoder(map2d.getLayer('unusedLandLayer'),cctvLayer);*/
    }else if(this.value == 'roadBufferZone'){
		var check = this.checked;
		if(check){
			stopFlash2();
			// WMS 레이어 표시
			map2d.getLayer('roadBufferZone').setVisible(true);
		}else{
			stopFlash2();
			// WMS 레이어 숨김
			map2d.getLayer('roadBufferZone').setVisible(false);
		}
	}else if(this.value == 'landLayer'){

		var check = this.checked;
		if(check){
			stopFlash2();
			if(!document.getElementById('chk_toggle_unusedLand').checked){
				$('#chk_toggle_unusedLand').trigger('click');
			}
			if(!document.getElementById('chk_toggle_illegalUse').checked){
				$('#chk_toggle_illegalUse').trigger('click');
			}
			if(!document.getElementById('chk_toggle_rental').checked){
				$('#chk_toggle_rental').trigger('click');
			}
			if(!document.getElementById('chk_toggle_squat').checked){
				$('#chk_toggle_squat').trigger('click');
			}
			if(!document.getElementById('chk_toggle_project').checked){
				$('#chk_toggle_project').trigger('click');
			}

		}else{
			stopFlash2();
			if(document.getElementById('chk_toggle_unusedLand').checked){
				$('#chk_toggle_unusedLand').trigger('click');
			}
			if(document.getElementById('chk_toggle_illegalUse').checked){
				$('#chk_toggle_illegalUse').trigger('click');
			}
			if(document.getElementById('chk_toggle_rental').checked){
				$('#chk_toggle_rental').trigger('click');
			}
			if(document.getElementById('chk_toggle_squat').checked){
				$('#chk_toggle_squat').trigger('click');
			}
			if(document.getElementById('chk_toggle_project').checked){
				$('#chk_toggle_project').trigger('click');
			}
			map2d.getLayer('unusedLandLayer').values_.visible = false;
			map2d.getLayer('unusedLand').values_.visible = false;
			map2d.getLayer('illegalUse').values_.visible = false;
			map2d.getLayer('illegalUseLand').values_.visible = false;
			map2d.getLayer('rentalLandLayer').values_.visible = false;
			map2d.getLayer('rentalLand').values_.visible = false;
			map2d.getLayer('squatLandLayer').values_.visible = false;
			map2d.getLayer('squatLand').values_.visible = false;
			map2d.getLayer('projectLandLayer').values_.visible = false;
			map2d.getLayer('projectLand').values_.visible = false;
		}
	}
  });

  // 諛곌꼍 醫낅쪟 �좏깮 - active �대㈃ �꾩꽦�ъ쭊
  // $('.map_btn_area .btn_map_type').on('click', function () {
  // if ($('.map_btn_area .btn_map_type').hasClass('active')) {
  // dtjpMap.setBaseLayer('satellite', true);
  // } else {
  // dtjpMap.setBaseLayer('base', false);
  // }
  // });

  // �덉씠�� �곸긽 active �대㈃ �쒖옉, �꾨땲硫� 以묒�
  $('.map_btn_area .btn_map_radar').on('click', function () {
    if ($('.map_btn_area .btn_map_radar').hasClass('active')) {
      startRefreshRadarLayer();
    } else {
      stopRefreshRadarLayer();
    }
  });

  var roadPano2021;
  var callbackRoadViewFeature = function (coordinate, response) {
    if (response && response.features && response.features.length > 0) {
      if (!roadPano2021) {
        roadPano2021 = new RoadPano2021('roadview');
        roadPano2021.onPanoFail = function () {
          alert('濡쒕뱶酉곕� �뺤씤�� �� �녿뒗 吏���엯�덈떎!');
          dashboardFn.ajaxAlwaysHideProgress();
        };
        roadPano2021.onPanoLoad = function () {
          dashboardFn.ajaxAlwaysHideProgress();
          $('#roadview').css({ display: 'block' });
        };
        roadPano2021.onPanoUnload = function () {
          $('#roadview').css({ display: 'none' });
          // 濡쒕뱶酉곗뿉�� 濡쒕뵫�� css �쒓굅
          $("link[href^='https://dxlive.ex.co.kr:8091/roadview'").remove();
          $("link[href^='https://geoapi.ex.co.kr/roadview'").remove();
          // $('#tree-style').remove();
          // $('#overlay-style').remove();
          $('#indexmap-style').remove();
        };
      }
      dashboardFn.ajaxBeforeDisplayProgress();
      roadPano2021.loadPano(coordinate);
    }
  };

  // 釉뚯씠�붾뱶 諛곌꼍 visible change
  // - 怨듭궗諛곌꼍 泥댄겕諛뺤뒪 �좏깮 �댁젣
  var handleVworldVisibleChange = function (e) {
    if (this.getVisible()) {
      $('#chk_toggle_exbase').prop('checked', false).change();
    }
  };
  map2d.getLayer('baseTileLayer').on('change:visible', handleVworldVisibleChange);
  map2d.getLayer('satelliteTileLayer').on('change:visible', handleVworldVisibleChange);

  var mapClickOnPano = function (evt) {
    var view = map2d.getView();
    var queryurl = roadViewLine.getSource().getGetFeatureInfoUrl(evt.coordinate, view.getResolution(), view.getProjection(), {
      INFO_FORMAT: 'application/json'
      // CQL_FILTER: 'type=2'
    });

    if (queryurl) {
      dashboardFn.doAjax({ url: queryurl }).done(callbackRoadViewFeature.bind(null, evt.coordinate));
    }
  };

  // �덉씠�� �곸긽 active �대㈃ �쒖옉, �꾨땲硫� 以묒�
  $('.map_btn_area .btn_map_roadview').on('click', function () {
    MAPMODE.PANO = $('.map_btn_area .btn_map_roadview').hasClass('active');
    roadViewLine.setVisible(MAPMODE.PANO);
    // 湲곕낯 留덉슦�� �대┃ 寃��� �덊븯�꾨줉
    dtjpMap.setMapSearchEnable(!MAPMODE.PANO);

    if (MAPMODE.PANO) {
      map2d.on('click', mapClickOnPano);
    } else {
      map2d.un('click', mapClickOnPano);
    }
  });

  // �ㅼ떆媛� �곸긽 �덉씠�� �꾩튂濡� �대룞
  $('.move-to-live').on('click', function () {
    // live, vehicle
    var type = this.dataset.liveType;
    // liveCode : 01, 61, 62, 63, 64, n02025_112, n02025_116
    // feature id
    var fid = this.dataset.liveCode;
    // 援щ텇 異붿텧
    // var type = fid.split('_')[0];
    var feature;
    switch (type) {
      case 'live':
        feature = liveLayer.getSource().getFeatureById(fid);
        break;
      case 'vehicle':
        feature = vehicleLayer.getSource().getFeatureById(fid);
        break;
      default:
        break;
    }

    if (feature) {
      var center = feature.getGeometry().getCoordinates();
      map2d.getView().animate({ center: center, zoom: 10, duration: 500 });
    }
  });

  // 吏곸꽑�� �좉�
  $('.map_btn_area .btn_map_straight').on('click', function () {
    if ($('.map_btn_area .btn_map_straight').hasClass('active')) {
      $('.map_area.emap_area').removeClass('full');
    } else {
      $('.map_area.emap_area').addClass('full');
    }
    map2d.updateSize();

    setTimeout(function() {
      if ($('.map_btn_area .btn_map_straight').hasClass('active')) {
        $('.map_area.emap_area').removeClass('full-ani');
      } else {
        $('.map_area.emap_area').addClass('full-ani');
      }
    }, 0)

  });

  // ==================== end of �덉씠�� 泥댄겕諛뺤뒪 �대깽�� ====================

  // ==================================================
  // DOM �대깽�� 諛붿씤��
  // ==================================================

  // 援먰넻�ш퀬 �ㅻ툕�덉씠 由ъ뒪�� �대┃ �대깽��
  $('#accident_list').on('click', function (event) {
    var rprqseq = event.target.dataset.rprqseq;
    if (rprqseq != null && rprqseq !== 'null') {
      // 援먰넻�ш퀬 蹂닿퀬�� 議고쉶
      dashboardFn.displayOckReport(rprqseq);
    }
  });
  // 援곗쭛遺꾩꽍, 諛��꾨텇�� �덉씠�� 泥댄겕諛뺤뒪
  $('.map_info input.form-check-input.layer-option').on('click', function () {
    dtjpMap.setLayerVisible(this.value, this.checked);
  });
  // �ш퀬�꾪뿕吏��� �곸슜�꾨룄 泥댄겕諛뺤뒪
  $('.map_info input.form-check-input[data-group=optionRistYear]').on('click', function () {
    var checked = $(this).is(':checked');
    $('.map_info input.form-check-input[data-group=optionRistYear]:checked').prop('checked', false);
    $(this).prop('checked', checked);

    var stnddYear = '';
    if (checked) {
      stnddYear = $(this).val();
    }
    queryRiskYear(stnddYear);
  });
  // �ш퀬�꾪뿕吏��� �됯��듭뀡 泥댄겕諛뺤뒪
  $('.map_info input.form-check-input[data-group=optionRistType]').on('click', function () {
    var checked = $(this).is(':checked');
    $('.map_info input.form-check-input[data-group=optionRistType]:checked').prop('checked', false);
    $(this).prop('checked', checked);

    var riskType = '';
    if (checked) {
      riskType = $(this).val();
    }
    setRiskType(riskType);
  });
  // �뺣��꾨줈吏��� �ㅻ툕�덉씠 �쒖꽕臾퍲D �대┃
  $('#precisionInfo .btn_system').on('click', function () {
    // 援먮웾 CPGBRIDGE
    // 鍮꾪깉硫� CPGINCLINE
    // �곕꼸 CPGTUNNEL
    // �붽굅 CPGCULVERT

    var layer = $(this).data('layer');
    var type = $(this).data('type');
    var systemId = $(this).data('systemId');

    var url = '/arFcltsDetailViewMobile.do?fcltsIntgId=' + systemId + '&layer=' + layer;

    var width = Math.floor(screen.width / 2);
    var height = Math.floor((screen.height / 3) * 2);
    var option = 'width=' + width + 'px, height=' + height + 'px,resizable=yes,scrollbars=yes';
    var pop_status = window.open(url, 'fcltsIntgId_popup', option);
    pop_status.focus();
  });
  // ���댄� 遺�遺� �덈줈怨좎묠 踰꾪듉
  $('.icon_refresh').click(function () {
    location.reload();
  });

  // ==================================================
  // DOM �곹깭�� �곕Ⅸ �묒뾽 吏���
  // ==================================================
  // �덉씠�� �곸긽 active �곹깭�대㈃ 媛깆떊 ���대㉧ �쒖옉
  if ($('.map_btn_area .btn_map_radar').hasClass('active')) {
    startRefreshRadarLayer();
  }
  // 諛곌꼍 醫낅쪟 active �곹깭�대㈃ �꾩꽦�ъ쭊 耳쒓린
  // if ($('.map_btn_area .btn_map_type').hasClass('active')) {
  // dtjpMap.setBaseLayer('satellite', true);
  // } else {
  // dtjpMap.setBaseLayer('base', false);
  // }
  // �묒뾽, �ш퀬 �곗씠�� 議고쉶 ���대㉧ �낅뜲�댄듃
  updateMapRelateDataQuery();

  // �덉씠�� on/off 泥댄겕諛뺤뒪 �곹깭濡� �덉씠�� visible 吏���
  // �ㅼ떆媛�, CCTV, �ш퀬�뺣낫, �묒뾽�뺣낫, 李⑤웾愿���, �뺣��꾨줈吏���, Speed_Vdszone
  $('.layer-toggle-check').each(function (i, element) {
    var arr = element.value.split(':');

    if (element.value && arr.length == 1) {
      var checkedCount = $('.layer-toggle-check[value="' + element.value + '"]:checked').length;
      dtjpMap.setLayerVisible(element.value, checkedCount > 0);
    }
  });

  var updateVds = function () {
    vdsLayer.getSource().updateParams({ time: Date.now() });
  };
  var tmUpdateVds = setInterval(updateVds, 1000 * 60 * 3); // 3遺�

  // end of DOM �곹깭 諛섏쁺
  // ==================================================

  // 援먰넻�ш퀬 �곗씠�� �명똿
  var setTrafficData = function (data) {
    // �ㅻ툕�덉씠 �④린湲�
    popoverCluster.setPosition();
    // �덉씠�� �뚯뒪�� �쇱퀜 鍮꾩슦湲�
    trafficSource.clear();

    // 援먰넻�ш퀬 �� (援먰넻�ш퀬諛쒖깮�꾩썡, �ш퀬遺��쒖퐫��, �ш퀬�쇰젴踰덊샇) 以묐났�뺤씤 (援먰넻�곹솴愿�由� 蹂닿퀬�� �щ윭媛쒖씤 寃쎌슦)
    var keyInfo = {};

    data.forEach(function (item) {
      var key = item.TRACD_OCRN_YYMM + item.ACDT_DPTCD + item.ACDT_SEQ;
      var info = keyInfo[key];
      if (info) {
        if (item.RPRQ_CRCM_SEQ) {
          // �묐낫踰덊샇 2媛� �댁긽�대㈃ 諛곗뿴濡� 紐⑥쑝湲�
          var seqFeature = keyInfo[key];
          var currSeq = seqFeature.get('RPRQ_CRCM_SEQ');
          if (!currSeq) {
            seqFeature.set('RPRQ_CRCM_SEQ', item.RPRQ_CRCM_SEQ);
          } else if (typeof currSeq == 'string') {
            seqFeature.set('RPRQ_CRCM_SEQ', [currSeq, item.RPRQ_CRCM_SEQ]);
          } else if (typeof currSeq == 'object') {
            currSeq.push(item.RPRQ_CRCM_SEQ);
          }
        }
      } else {
        var feature = new ol.Feature({
          geometry: new Point([item.GGTM_XCORD, item.GGTM_YCORD])
        });
        feature.setProperties(item);
        keyInfo[key] = feature;
      }
    });

    // �덉씠�� �뚯뒪�� �쇱퀜 紐⑸줉 異붽�
    var values = Object.keys(keyInfo).map(function (i) {
      return keyInfo[i];
    });
    trafficSource.addFeatures(values);
  };
  // 援먰넻�ш퀬 �꾪뿕吏��� �곗씠�� �명똿
  var riskData = {};
  var riskYear,
    riskProp = 'ACDT_CNT_RNKG_RATE';

  var setRiskData = function (data) {
    var stnddYear = data.stndd_year;
    riskData[stnddYear] = data;
    setRiskYear(stnddYear);
    applyRiskType();
  };

  var setRiskYear = function (stnddYear) {
    riskYear = stnddYear;
    applyRiskType();
  };

  var hasRiskYear = function (stnddYear) {
    return riskData[stnddYear] ? true : false;
  };

  var setRiskType = function (type) {
    switch (type) {
      case '1':
        riskProp = 'ACDT_CNT_RNKG_RATE';
        break;
      case '2':
        riskProp = 'ACDT_RT_RNKG_RATE';
        break;
      case '3':
        riskProp = 'BCR_RNKG_RATE';
        break;
      case '4':
        riskProp = 'EPDO_CNT_RNKG_RATE';
        break;
      case '5':
        riskProp = 'OVRL_EVAL_INDX_RNKG_RATE';
        break;
      default:
        riskProp = '';
        break;
    }

    applyRiskType();
  };
  var applyRiskType = function () {
    // �덉씠�� �뚯뒪�� �쇱퀜 鍮꾩슦湲�
    riskLayer.getSource().clear();

    if (riskData && riskData[riskYear] && riskData[riskYear].mainroadrisk) {
      if (!riskProp) {
        return;
      }

      var features = [];
      riskData[riskYear].mainroadrisk.forEach(function (item) {
        if (item[riskProp] > 0 && item[riskProp] <= 20) {
          var feature = new ol.Feature({
            geometry: new Point([item.GGTM_XCORD, item.GGTM_YCORD])
          });
          feature.set('percent', item[riskProp]);
          // console.info(item[riskProp]);
          features.push(feature);
        }
      });
      // �덉씠�� �뚯뒪�� �쇱퀜 紐⑸줉 異붽�
      riskLayer.getSource().addFeatures(features);
    }
  };

  // ==================================================
  // 吏곸꽑�� �대깽�� listener
  // ==================================================
  var setPositionTimeout = function (overlay, position) {
    setTimeout(function () {
      overlay.setPosition(position);
    }, 0);
  };
  var moveAndShowOverlay = function (overlay, overlayFn, feature) {
    var element = overlay.getElement();
    var position = feature.getGeometry().getCoordinates();
    var center = map2d.getView().getCenter();
    if (center[0] == position[0] && center[1] == position[1]) {
      if (overlayFn(element, null, feature, null)) {
        overlay.setPosition(position);
      }
    } else {
      map2d.getView().animate(
        {
          center: position,
          zoom: 15,
          duration: 500
        },
        function () {
          if (overlayFn(element, null, feature, null)) {
            setPositionTimeout(overlay, position);
          }
        }
      );
    }
  };

  $('.road_area_wrap').on('straight:itemSelect', function (e, data) {
    if (!data) {
      return;
    }
    if (data.itemType == 'IC') {
      // IC �꾩튂濡� 吏��� �대룞
      var position = ol.proj.transform(data.lonlat, 'EPSG:4326', 'EPSG:3857');
      map2d.getView().animate({ center: position, zoom: 10, duration: 500 });
    } else if (data.itemType == 'situation') {
      // �꾩튂 �대룞�섍퀬
      // accidentLayer.getSource().clear();
      // constructionLayer.getSource().clear();
      var feature, position;
      if (data.RPRQ_CRCM_TYPE_CD == '02') {
        // 怨듭궗(李⑤떒) �뺣낫 : �꾩튂�대룞 & �ㅻ툕�덉씠 �쒖텧
        feature = constructionLayer.getSource().getFeatureById(data.RPRQ_CRCM_SEQ);
        if (feature) {
          dtjpMap.hideOverlay();
          moveAndShowOverlay(constructionOverlay, dashboardOverlayFn.beforeConstructionOverlay, feature);
        }
      } else {
        // �ш퀬 �뺣낫 : �꾩튂�대룞 & �ш퀬�뺣낫 �쒖텧
        feature = accidentLayer.getSource().getFeatureById(data.RPRQ_CRCM_SEQ);
        if (feature) {
          dtjpMap.hideOverlay();
          position = feature.getGeometry().getCoordinates();
          map2d.getView().animate({ center: position, zoom: 10, duration: 500 });
          dashboardFn.displayOckReport(feature.get('RPRQ_CRCM_SEQ'));
        }
      }
    } else if (data.itemType == 'cctv') {
      var width = Math.floor(screen.width / 3);
      var height = Math.floor(screen.height / 3);

      var cctvId = data.SPIN_INTG_ID;
      var routeNm = dashboardCache.route.getRouteName(data.ROUTE_CD);
      var drctNm = dashboardCache.route.getRouteDrctName(data.MTNOF_CD, data.ROUTE_CD, data.ROUTE_DRCT_CD);
      var dstnc = data.INSL_DSTNC;
      var name = data.SPIN_INTG_NM;

      var query = 'cctvId=' + cctvId + '&routeNm=' + routeNm + '&drctNm=' + drctNm + '&dstnc=' + dstnc + '&name=' + name;
      query = encodeURI(query);

      // cctv �앹뾽 �닿린
      window.open('/Cctv.do?' + query, 'CCTV', 'width=' + width + 'px,height=' + height + 'px,scrollbars=no,resizable=yes,scrollbars=yes');
    } else if (data.itemType == 'smartvehicle') {
      // �ㅻ쭏�� 李⑤웾愿���
      // smartVehicleLayer
      var feature;
      if (data.EQPM_CD) {
        feature = smartVehicleLayer.getSource().getFeatureById(data.EQPM_CD);
        if (feature) {
          dtjpMap.hideOverlay();
          moveAndShowOverlay(smartCarInfoOverlay, dashboardOverlayFn.beforeSmartCarInfoOverlay, feature);
        }
      }
    }
  });

  // ==================================================
  // export
  // ==================================================
  var _module = {
    getDtjpMap: function () {
      return dtjpMap;
    },
    getMap2D: function () {
      return map2d;
    },
    setTrafficData: setTrafficData,
    setRiskData: setRiskData,
    setRiskYear: setRiskYear,
    hasRiskYear: hasRiskYear
  };
  return _module;
})();
/** End of dashboardMap */

// ========== 吏��ш��� �몄꽑, 諛⑺뼢議고쉶 ==========
dashboardCache.route = {
  route: {},
  mtnof: {},
  getRouteName: function (route_cd) {
    if (this.route[route_cd]) {
      var routeNm = this.route[route_cd].ROUTE_NM;
      return routeNm;
    } else {
      return route_cd;
    }
  },
  getRouteDrctName: function (mtnof_cd, route_cd, drct_cd) {
    if (this.mtnof[mtnof_cd] && this.mtnof[mtnof_cd][route_cd] && this.mtnof[mtnof_cd][route_cd][drct_cd]) {
      var ordstNm = this.mtnof[mtnof_cd][route_cd][drct_cd].ORDST_NM;
      // if (ordstNm.indexOf('諛⑺뼢') < 0) {
      // ordstNm = ordstNm + '諛⑺뼢';
      // }
      return ordstNm;
    } else {
      return drct_cd;
    }
  }
};

var selectRouteDrct = function (mtnof_cd, route_cd) {
  dashboardFn
    .doAjax({
      url: '/selectRouteDrct.do',
      method: 'POST',
      data: { mtnof_cd: mtnof_cd, route_cd: route_cd }
    })
    .done(function (resultMap) {
      list = resultMap.list;
      list.forEach(function (drct) {
        // 吏��ъ젙蹂� �앹꽦
        if (!dashboardCache.route.mtnof[drct.MTNOF_CD]) {
          dashboardCache.route.mtnof[drct.MTNOF_CD] = {};
        }
        // 吏��щ퀎 �몄꽑�뺣낫 �앹꽦
        if (!dashboardCache.route.mtnof[drct.MTNOF_CD][drct.ROUTE_CD]) {
          dashboardCache.route.mtnof[drct.MTNOF_CD][drct.ROUTE_CD] = {};
        }
        // 吏��щ퀎 �몄꽑諛⑺뼢�뺣낫 罹먯떆�� ����
        dashboardCache.route.mtnof[drct.MTNOF_CD][drct.ROUTE_CD][drct.ROUTE_DRCT_CD] = drct;
      });
    });
};

dashboardFn
  .doAjax({
    url: '/selectRoute.do',
    method: 'POST',
    data: { mtnof_cd: 'N02025' }
  })
  .done(function (resultMap) {
    list = resultMap.list;
    list.forEach(function (route) {
      // �몄꽑�뺣낫 罹먯떆�� ����
      if (!dashboardCache.route.route[route.ROUTE_CD]) {
        dashboardCache.route.route[route.ROUTE_CD] = route;
      }
      // �몄꽑諛⑺뼢議고쉶 �몄텧
      selectRouteDrct(route.MTNOF_CD, route.ROUTE_CD);
    });
  });
// ========== end of 吏��ш��� �몄꽑, 諛⑺뼢議고쉶 ==========

// ========== �꾨㈃ 紐⑸줉 議고쉶 ==========
dashboardCache.dwgInfo = {};

dashboardFn.doAjax({ url: '/plan/verticalplan.json' }).done(function (dwgList) {
  // dashboardCache.dwgInfo �� �몄꽑, �댁젙 �ㅻ줈 諛⑺뼢紐⑸줉 留ㅽ븨
  var dwgInfo = dashboardCache.dwgInfo;
  dwgList.forEach(function (dwgName) {
    // 0010-212-5D.dwg
    var arr = dwgName.split('-');
    var route = arr[0];
    var distance = arr[1];
    var tempDir = arr[2].split('.')[0];
    var distance2 = +tempDir.substring(0, tempDir.length - 1);
    var dir = tempDir.substring(tempDir.length - 1);

    distance = +(distance + '.' + distance2);
    var key = route + '_' + distance;
    if (!dwgInfo[key]) {
      dwgInfo[key] = {};
    }
    dwgInfo[key][dir] = dwgName;
  });
});

// ========== end of �꾨㈃ 紐⑸줉 議고쉶 ==========

var params, accidentList;
var route_cd;
var routeList = new Array();
var gradeA = null;
var gradeB = null;
var gradeC = null;
var gradeD = null;
var dashboardMap;
var popupInfo;

$(document).ready(function () {
  // $("#mapDiv").load("/digitalMap.do");

  // 蹂몃�議고쉶
  selectHdqrCd('hdqr_cd', '');

  // 蹂몃�議고쉶
  selectHdqrCd('hdqr_cd2', '');

  // 蹂몃�議고쉶
  selectHdqrCd('hdqr_cd3', '');

  // 蹂몃�議고쉶
  selectHdqrCd('hdqr_cd4', '');
  // 蹂몃�議고쉶
  selectHdqrCd('hdqr_cd5', '');

  // 蹂몃�蹂�寃�
  $('#hdqr_cd').change(function () {
    changeHdqrCd('hdqr_cd', 'mtnof_cd', 'route_cd', 'route_drct_cd', '');
  });

  // 蹂몃�蹂�寃�
  $('#hdqr_cd2').change(function () {
    changeHdqrCd('hdqr_cd2', 'mtnof_cd2', 'route_cd', 'route_drct_cd', '');
  });

  // 蹂몃�蹂�寃�
  $('#hdqr_cd3').change(function () {
    changeHdqrCd('hdqr_cd3', 'mtnof_cd3', 'route_cd', 'route_drct_cd', '');
  });

  // 蹂몃�蹂�寃�
  $('#hdqr_cd4').change(function () {
    changeHdqrCd('hdqr_cd4', 'mtnof_cd4', 'route_cd', 'route_drct_cd', '');
  });

  // 蹂몃�蹂�寃�
  $('#hdqr_cd5').change(function () {
    changeHdqrCd('hdqr_cd5', 'mtnof_cd5', 'route_cd', 'route_drct_cd', '');
  });

  // 吏��щ�寃�
  $('#mtnof_cd').change(function () {
    changeMtnofCd('mtnof_cd', 'route_cd', 'route_drct_cd', '');
  });

  $('#regStartDate').datepicker({
    language: 'ko',
    todayHighlight: !0,
    orientation: 'bottom left',
    format: 'yyyy-mm-dd',
    changeYear: true,
    changeMonth: true,
    showButtonPanel: true,
    locale: { format: 'YYYY-MM-DD' },
    buttonClasses: 'm-btn btn',
    applyClass: 'btn-primary',
    cancelClass: 'btn-secondary',
    autoclose: true
  });

  $('#regEndDate').datepicker({
    language: 'ko',
    todayHighlight: !0,
    orientation: 'bottom left',
    format: 'yyyy-mm-dd',
    changeYear: true,
    changeMonth: true,
    showButtonPanel: true,
    locale: { format: 'YYYY-MM-DD' },
    buttonClasses: 'm-btn btn',
    applyClass: 'btn-primary',
    cancelClass: 'btn-secondary',
    autoclose: true
  });

  // $("#regStartDate").datepicker('setDate', '-7D'); // 1二쇱쟾
  $('#regStartDate').datepicker('setDate', '2019-01-01'); // 1二쇱쟾
  $('#regEndDate').datepicker('setDate', 'today');

  // 議고쉶 踰꾪듉 �대┃
  $('#formSrh').on('click', function (e) {
    e.preventDefault();
    if ($('#regStartDate').val() > $('#regEndDate').val()) {
      alert('醫낅즺�쇱옄媛� �쒖옉�쇱옄 �댁쟾�� �� �놁뒿�덈떎.');
    } else {
      accidentdata();
    }
  });

  // �꾨㈃�뺣낫 �щ씪�대뱶 �대깽��
  $('#carouselControls02').on('slide.bs.carousel', function (evt) {
    setPlanTitle(evt.to);
  });

  $('#carouselControls03').on('slide.bs.carousel', function (evt) {
    setOckTitle(evt.to);
  });

  $('#geo, #plan, #reportnewtap, #roadresult').on('click', function (e) {
    e.preventDefault();
    var type = $(this).attr('id');

    if (type == 'geo') {
      var width = Math.floor((screen.width * 2) / 3);
      var height = Math.floor(screen.height / 2);
    }else if(type == 'roadresult'){
//    	var width = Math.floor(screen.width / 2);
//        var height = Math.floor(screen.height);
    	var width = '760';
        var height = '1000';

    }
    else {
      var width = Math.floor(screen.width / 2);
      var height = Math.floor(screen.height / 2);
    }

    var routeCd = accidentInfo.routeCd;
    var end = accidentInfo.distance;
    var start = accidentInfo.distance;

    var rprqseq = accidentInfo.rprqseq;
    var drveDrctCd = accidentInfo.drctCd;
    var routeDstnc = accidentInfo.distance;
    var routeNm = accidentInfo.routeNm;
    var drctNm = accidentInfo.drctNm;

    var url, popup_target;

    if (type == 'plan') {
      url = 'dwgViewer.do?routeCd=' + $(this).data('routeCd') + '&distance=' + $(this).data('distance');
      popup_target = 'popup_dwg';
    } else if (type == 'geo') {
      url =
        'digitalGeometry.do?type=' +
        type +
        '&routeNm=' +
        encodeURI(encodeURIComponent(routeNm)) +
        '&drctNm=' +
        encodeURI(encodeURIComponent(drctNm)) +
        '&routeCd=' +
        routeCd +
        '&drveDrctCd=' +
        drveDrctCd +
        '&routeDstnc=' +
        routeDstnc;
      popup_target = 'popup_pic';
    }else if (type == 'roadresult') {
		//媛쒕컻
    	/*
		const IJ = $('#accident_road').html();
    	console.log(IJ);
    	let Id ='';
    	const startIJ = parseFloat(IJ.substr(6,5)).toFixed(1) ;
    	console.log(startIJ);
    	if(266.4 <= startIJ && startIJ <= 266.5){
    		Id='1S';
    	}else if(264.4 <= startIJ && startIJ <= 264.7){
    		Id='2S';
    	}else if(259.4 <= startIJ && startIJ <= 260.0){
    		Id='3S';
    	}else if(248.7 <= startIJ && startIJ <= 248.8){
    		Id='4S';
    	}else if(213.2 <= startIJ && startIJ <= 214.0){
    		Id='5S';
    	}
        url = 'popupRoad.do?Id='+Id;
		*/
		//�댁쁺
		let reporttitle = $('#reporttitle').html();
		var start = reporttitle.indexOf('(');
		var end = reporttitle.indexOf(')');
		var area = reporttitle.substr(start+1, end-start-1);
		console.log("start : "+start + " end : "+end + " area : "+area);
		let regex = /[^-\.0-9]/g; // 123.5
		let regex2 = /[^0-9]/g; 		//1235
		let startIJ = reporttitle.replace(regex, "");
		let startIJ2 = reporttitle.replace(regex2, "");
    	let Id ='';
    	if(266.4 <= startIJ && startIJ <= 266.5 && area =="遺���"){
    		Id='1S';
    	}else if(266.4 <= startIJ && startIJ <= 266.5 && area =="�쒖슱"){
    		Id='1E';
    	}else if(264.4 <= startIJ && startIJ <= 264.7 && area =="遺���"){
    		Id='2S';
    	}else if(264.4 <= startIJ && startIJ <= 264.7 && area =="�쒖슱"){
    		Id='2E';
    	}else if(259.4 <= startIJ && startIJ <= 260.0 && area =="遺���"){
    		Id='3S';
    	}else if(259.4 <= startIJ && startIJ <= 260.0 && area =="�쒖슱"){
    		Id='3E';
    	}else if(248.7 <= startIJ && startIJ <= 248.8 && area =="遺���"){
    		Id='4S';
    	}else if(248.7 <= startIJ && startIJ <= 248.8 && area =="�쒖슱"){
    		Id='4E';
    	}else if(213.2 <= startIJ && startIJ <= 214.0 && area =="遺���"){
    		Id='5S';
    	}else if(213.2 <= startIJ && startIJ <= 214.0 && area =="�쒖슱"){
    		Id='5E';
    	}else{
			Id='0S';
		}
        url = 'popupRoad.do?Id='+Id+'&startIJ='+startIJ2;
    }else {
      url = 'accidentReportView.do?seq=' + rprqseq;
      popup_target = 'popup_report' + rprqseq;
    }
    // var index = $(this).children('.carousel-item.active').index();
    // console.log(index);
    // if(type == "geo_images"){

    var option = 'width=' + width + 'px, height=' + height + 'px,resizable=no,scrollbars=no';
    var pop_status = window.open(url, popup_target, option);

    pop_status.focus();
    // }else{
    // var pop_status;
    //
    // var url = "imageView.do?type=" + type + "&index=" + index;
    // var name = "�대�吏� �ш쾶蹂닿린";
    // var option = "width=" + width +"px, height=" + height +
	// "px,scrollbars=no,resizable=yes,scrollbars=yes";
    // pop_status = window.open(url, name, option);
    //
    // pop_status.focus();
    // }
  });
});

var setPlanTitle = function (idx) {
  var title = $('#plan_title');
  title.text('�꾨㈃�뺣낫');
  if (typeof idx !== 'undefined' && idx > -1) {
    var len = $('#plan_images > *').length;
    title.text('�꾨㈃�뺣낫 (' + (idx + 1) + '/' + len + ')');
  }
};

var setOckTitle = function (idx) {
  var title = $('#ock_title');
  title.text('�먰겢由� �곹솴愿�由� �ъ쭊');
  if (typeof idx !== 'undefined' && idx > -1) {
    var len = $('#ock_images > *').length;
    title.text('�먰겢由� �곹솴愿�由� �ъ쭊 (' + (idx + 1) + '/' + len + ')');
  }
};

// �ш퀬�깃툒
function checkSelectAll() {
  // �꾩껜 泥댄겕諛뺤뒪
  const checkboxes = document.querySelectorAll('input[name="grade"]');
  // �좏깮�� 泥댄겕諛뺤뒪
  const checked = document.querySelectorAll('input[name="grade"]:checked');
  // select all 泥댄겕諛뺤뒪
  const selectAll = document.querySelector('input[name="selectall"]');

  if (checkboxes.length === checked.length) {
    selectAll.checked = true;
    $('#gradebutton').text('�꾩껜');
  } else {
    selectAll.checked = false;

    if (checked.length == 0) {
      $('#gradebutton').text('�ш퀬湲됱닔 �좏깮');
    } else {
      for (var i = 0; i < checked.length; i++) {
        var laberstr;
        var forlabel = checked[i].id;
        var label = $("label[for='" + forlabel + "']").text();
        if (i == 0) {
          $('#gradebutton').text(label);
        } else {
          laberstr = $('#gradebutton').text();
          $('#gradebutton').text(laberstr + ',' + label);
        }
      }
    }
  }
}

function selectAll(selectAll) {
  const checkboxes = document.getElementsByName('grade');

  Array.prototype.slice.call(checkboxes).forEach(function (checkbox) {
    checkbox.checked = selectAll.checked;
  });

  if ($(".form-check-input[id='defaultCheck6']").is(':checked')) {
    $('#gradebutton').text('�꾩껜');
  } else {
    $('#gradebutton').text('�ш퀬湲됱닔 �좏깮');
  }
}

// �붾퀎
function checkSelectMonthAll() {
  // �꾩껜 泥댄겕諛뺤뒪
  const checkboxes = document.querySelectorAll('input[name="month"]');
  // �좏깮�� 泥댄겕諛뺤뒪
  const checked = document.querySelectorAll('input[name="month"]:checked');
  // select all 泥댄겕諛뺤뒪
  const selectAll = document.querySelector('input[name="monthselectall"]');

  if (checkboxes.length === checked.length) {
    selectAll.checked = true;
    $('#monthbutton').text('�꾩껜');
  } else {
    selectAll.checked = false;

    if (checked.length == 1) {
      var forlabel = checked[0].id;
      var label = $("label[for='" + forlabel + "']").text();
      $('#monthbutton').text(label);
    } else if (checked.length == 0) {
      $('#monthbutton').text('�� �좏깮');
    } else {
      $('#monthbutton').text('��(' + checked.length + '媛�)');
    }
  }
}

function selectMonthAll(selectAll) {
  const checkboxes = document.getElementsByName('month');

  // checkboxes.forEach(function (checkbox) {
  Array.prototype.slice.call(checkboxes).forEach(function (checkbox) {
    checkbox.checked = selectAll.checked;
  });

  if ($(".form-check-input[id='allmonth']").is(':checked')) {
    $('#monthbutton').text('�� �꾩껜');
  } else {
    $('#monthbutton').text('�� �좏깮');
  }
}

// �쇰퀎
function checkSelectDayAll() {
  // �꾩껜 泥댄겕諛뺤뒪
  const checkboxes = document.querySelectorAll('input[name="day"]');
  // �좏깮�� 泥댄겕諛뺤뒪
  const checked = document.querySelectorAll('input[name="day"]:checked');
  // select all 泥댄겕諛뺤뒪
  const selectAll = document.querySelector('input[name="dayselectall"]');

  if (checkboxes.length === checked.length) {
    selectAll.checked = true;
    $('#daybutton').text('�꾩껜');
  } else {
    selectAll.checked = false;

    if (checked.length == 1) {
      var forlabel = checked[0].id;
      var label = $("label[for='" + forlabel + "']").text();
      $('#daybutton').text(label);
    } else if (checked.length == 0) {
      $('#daybutton').text('�붿씪 �좏깮');
    } else {
      $('#daybutton').text('�붿씪(' + checked.length + '媛�)');
    }
  }
}

function selectDayAll(selectAll) {
  const checkboxes = document.getElementsByName('day');

  Array.prototype.slice.call(checkboxes).forEach(function (checkbox) {
    checkbox.checked = selectAll.checked;
  });

  if ($(".form-check-input[id='allday']").is(':checked')) {
    $('#daybutton').text('�붿씪 �꾩껜');
  } else {
    $('#daybutton').text('�붿씪 �좏깮');
  }
}

// �쒓컙
function checkSelectTimeAll() {
  // �꾩껜 泥댄겕諛뺤뒪
  const checkboxes = document.querySelectorAll('input[name="time"]');
  // �좏깮�� 泥댄겕諛뺤뒪
  const checked = document.querySelectorAll('input[name="time"]:checked');
  // select all 泥댄겕諛뺤뒪
  const selectAll = document.querySelector('input[name="timeselectall"]');

  if (checkboxes.length === checked.length) {
    selectAll.checked = true;
    $('#timebutton').text('�꾩껜');
  } else {
    selectAll.checked = false;

    if (checked.length == 1) {
      var forlabel = checked[0].id;
      var label = $("label[for='" + forlabel + "']").text();
      $('#timebutton').text(label);
    } else if (checked.length == 0) {
      $('#timebutton').text('�쒓컙 �좏깮');
    } else {
      $('#timebutton').text('�쒓컙(' + checked.length + '媛�)');
    }
  }
}

function selectTimeAll(selectAll) {
  const checkboxes = document.getElementsByName('time');

  Array.prototype.slice.call(checkboxes).forEach(function (checkbox) {
    checkbox.checked = selectAll.checked;
  });

  if ($(".form-check-input[id='alltime']").is(':checked')) {
    $('#timebutton').text('�쒓컙 �꾩껜');
  } else {
    $('#timebutton').text('�쒓컙 �좏깮');
  }
}

// 二�/��
function checkSelectDaynightAll() {
  // �꾩껜 泥댄겕諛뺤뒪
  const checkboxes = document.querySelectorAll('input[name="daynight"]');
  // �좏깮�� 泥댄겕諛뺤뒪
  const checked = document.querySelectorAll('input[name="daynight"]:checked');
  // select all 泥댄겕諛뺤뒪
  const selectAll = document.querySelector('input[name="daynightselectall"]');

  if (checkboxes.length === checked.length) {
    selectAll.checked = true;
    $('#daynightbutton').text('�꾩껜');
  } else {
    selectAll.checked = false;

    if (checked.length == 1) {
      var forlabel = checked[0].id;
      var label = $("label[for='" + forlabel + "']").text();
      $('#daynightbutton').text(label);
    } else if (checked.length == 0) {
      $('#daynightbutton').text('二�/�� �좏깮');
    } else {
      // $('#daynightbutton').text('二�/��(' + checked.length + '媛�)');
      $('#daynightbutton').text(checked.text());
    }
  }
}

function selectDaynightAll(selectAll) {
  const checkboxes = document.getElementsByName('daynight');

  Array.prototype.slice.call(checkboxes).forEach(function (checkbox) {
    checkbox.checked = selectAll.checked;
  });

  if ($(".form-check-input[id='alldaynight']").is(':checked')) {
    $('#daynightbutton').text('二�/��');
  } else {
    $('#daynightbutton').text('二�/�� �좏깮');
  }
}

// 湲곗긽
function checkSelectWeatherAll() {
  // �꾩껜 泥댄겕諛뺤뒪
  const checkboxes = document.querySelectorAll('input[name="weather"]');
  // �좏깮�� 泥댄겕諛뺤뒪
  const checked = document.querySelectorAll('input[name="weather"]:checked');
  // select all 泥댄겕諛뺤뒪
  const selectAll = document.querySelector('input[name="weatherselectall"]');

  if (checkboxes.length === checked.length) {
    selectAll.checked = true;
    $('#weatherbutton').text('�꾩껜');
  } else {
    selectAll.checked = false;

    if (checked.length == 1) {
      var forlabel = checked[0].id;
      var label = $("label[for='" + forlabel + "']").text();
      $('#weatherbutton').text(label);
    } else if (checked.length == 0) {
      $('#weatherbutton').text('湲곗긽 �좏깮');
    } else {
      $('#weatherbutton').text('湲곗긽(' + checked.length + '媛�)');
    }
  }
}

function selectWeatherAll(selectAll) {
  const checkboxes = document.getElementsByName('weather');

  Array.prototype.slice.call(checkboxes).forEach(function (checkbox) {
    checkbox.checked = selectAll.checked;
  });

  if ($(".form-check-input[id='allweather']").is(':checked')) {
    $('#weatherbutton').text('湲곗긽 �꾩껜');
  } else {
    $('#weatherbutton').text('湲곗긽 �좏깮');
  }
}

function callbackAccidentdata(data) {
  // 援먰넻�ш퀬 梨좏듃 洹몃━湲�
  // console.log(data.accidentData);
  var Spring = 0;
  var Summer = 0;
  var Fall = 0;
  var Winter = 0;
  var SpringDead = 0;
  var SummerDead = 0;
  var FallDead = 0;
  var WinterDead = 0;
  var quarter1 = 0;
  var quarter2 = 0;
  var quarter3 = 0;
  var quarter4 = 0;
  var quarterDead1 = 0;
  var quarterDead2 = 0;
  var quarterDead3 = 0;
  var quarterDead4 = 0;
  var accidentDatalength = Object.keys(data.accidentData).length;
  for (i = 0; i < accidentDatalength; i++) {
    var dttm = data.accidentData[i].TRACD_DTTM;
    var month = dttm.substring(4, 6);
    var hour = dttm.substring(8, 10);
    // console.log('month : ' + month);
    // console.log('hour : ' + hour);
    if (month == '03' || month == '04' || month == '05') {
      Spring = Spring + 1;
      SpringDead = SpringDead + data.accidentData[i].DTHR_CNT;
    } else if (month == '06' || month == '07' || month == '08') {
      Summer = Summer + 1;
      SummerDead = SummerDead + data.accidentData[i].DTHR_CNT;
    } else if (month == '09' || month == '10' || month == '11') {
      Fall = Fall + 1;
      FallDead = FallDead + data.accidentData[i].DTHR_CNT;
    } else if (month == '12' || month == '01' || month == '02') {
      Winter = Winter + 1;
      WinterDead = WinterDead + data.accidentData[i].DTHR_CNT;
    }

    if (hour == '00' || hour == '01' || hour == '02' || hour == '03' || hour == '04' || hour == '05') {
      quarter1 = quarter1 + 1;
      quarterDead1 = quarterDead1 + data.accidentData[i].DTHR_CNT;
    } else if (hour == '06' || hour == '07' || hour == '08' || hour == '09' || hour == '10' || hour == '11') {
      quarter2 = quarter2 + 1;
      quarterDead2 = quarterDead2 + data.accidentData[i].DTHR_CNT;
    } else if (hour == '12' || hour == '13' || hour == '14' || hour == '15' || hour == '16' || hour == '17') {
      quarter3 = quarter3 + 1;
      quarterDead3 = quarterDead3 + data.accidentData[i].DTHR_CNT;
    } else if (hour == '18' || hour == '19' || hour == '20' || hour == '21' || hour == '22' || hour == '23') {
      quarter4 = quarter4 + 1;
      quarterDead4 = quarterDead4 + data.accidentData[i].DTHR_CNT;
    }
  }
  seasonChart.data.datasets[0].data = [SpringDead, SummerDead, FallDead, WinterDead];
  seasonChart.data.datasets[1].data = [Spring, Summer, Fall, Winter];
  seasonChart.update();

  timeChart.data.datasets[0].data = [quarterDead1, quarterDead2, quarterDead3, quarterDead4];
  timeChart.data.datasets[1].data = [quarter1, quarter2, quarter3, quarter4];
  timeChart.update();
}

// 援먰넻�ш퀬 寃��됱“嫄� �뚮씪誘명꽣 諛섑솚
function getAccidentSearchParam() {
  var gradeAll = null;
  var monthAll = null;
  var dayAll = null;
  var timeAll = null;
  var daynightAll = null;
  var weatherAll = null;
  var routeInfo = [];
  var route = [];
  var grade = $('input[name=grade]:checked')
    .map(function (idx, item) {
      return item.value;
    })
    .get()
    .join('|');
  var month = $('input[name=month]:checked')
    .map(function (idx, item) {
      return item.value;
    })
    .get()
    .join('|');
  var day = $('input[name=day]:checked')
    .map(function (idx, item) {
      return item.value;
    })
    .get()
    .join('|');
  var weather = $('input[name=weather]:checked')
    .map(function (idx, item) {
      return item.value;
    })
    .get()
    .join('|');
  var time = $('input[name=time]:checked')
    .map(function (idx, item) {
      return item.value;
    })
    .get()
    .join('|');
  var daynight = $('input[name=daynight]:checked')
    .map(function (idx, item) {
      return item.value;
    })
    .get()
    .join('|');

  if ($(".form-check-input[id='defaultCheck6']").is(':checked')) {
    gradeAll = $('#defaultCheck6').val();
  }
  if ($(".form-check-input[id='allmonth']").is(':checked')) {
    monthAll = $('#allmonth').val();
  }
  if ($(".form-check-input[id='allday']").is(':checked')) {
    dayAll = $('#allday').val();
  }
  if ($(".form-check-input[id='alltime']").is(':checked')) {
    timeAll = $('#alltime').val();
  }
  if ($(".form-check-input[id='alldaynight']").is(':checked')) {
    daynightAll = $('#alldaynight').val();
  }
  if ($(".form-check-input[id='allweather']").is(':checked')) {
    weatherAll = $('#allweather').val();
  }

  var params = {
    startDate: $('#regStartDate').val(),
    endDate: $('#regEndDate').val(),
    hdqr_cd: $('#hdqr_cd option:selected').val(),
    mtnof_cd: $('#mtnof_cd option:selected').val(),
    grade: grade,
    month: month,
    day: day,
    time: time,
    weather: weather,
    daynight: daynight,
    gradeAll: gradeAll,
    monthAll: monthAll,
    dayAll: dayAll,
    timeAll: timeAll,
    daynightAll: daynightAll,
    weatherAll: weatherAll
  };
  return params;
}

function accidentdata(acdtRoutes) {
  // 援먰넻�ш퀬 寃��� 議곌굔 媛��몄삤湲�
  var params = getAccidentSearchParam();

  // �몄꽑 �щ윭媛� 媛��ν넗濡�
  // console.info(params);
  if (acdtRoutes && acdtRoutes.length > 0) {
    params.routeInfo = acdtRoutes;
    // console.log('routeInfo : ' + params.routeInfo);
    popupInfo = params.routeInfo;
    var routeCd = params.routeInfo[0].routeCd;
    var start = params.routeInfo[0].start;
    var end = params.routeInfo[0].end;
    // console.log('popupInfo : ' + popupInfo);

    dashboardFn
      .doAjax({
        url: '/ajaxDetailAccidentData.do',
        method: 'POST',
        data: JSON.stringify(params),
        contentType: 'application/json'
      })
      .done(callbackAccidentdata);
  } else {
    // 援먰넻�ш퀬 紐⑸줉 議고쉶�댁꽌 援먰넻�ш퀬 �덉씠�� �곗씠�� �낅젰
    dashboardFn.doAjax({ url: '/ajaxAccidentList.do', method: 'POST', data: params }, true).done(function (data) {
      dashboardMap.setTrafficData(data.accidentlist);
    });
  }
}

function selectLandDetail(keyData){

	var pnu;
	pnu = $('#landPnu').val();
	if(keyData == 'rental'){
		$("#rentalLandViewDetailModal").empty();
		$("#rentalLandViewDetailModal").load("RentalLandView.do",{'PNU':pnu});
		layerOpen("#rentalLandViewDetailModal");
	}else if(keyData == 'squat'){
		$("#squatLandViewDetailModal").empty();
		$("#squatLandViewDetailModal").load("SquatLandView.do",{'PNU':pnu});
		layerOpen("#squatLandViewDetailModal");
	}else if(keyData == 'project'){
		$("#projectLandViewDetailModal").empty();
		$("#projectLandViewDetailModal").load("ProjectLandView.do",{'PNU':pnu});
		layerOpen("#projectLandViewDetailModal");
	}



}



// �ш퀬�꾪뿕吏��� 議고쉶
function queryRiskYear(stnddYear) {
  if (!stnddYear) {
    dashboardMap.setRiskYear();
    return;
  }

  if (dashboardMap.hasRiskYear(stnddYear)) {
    dashboardMap.setRiskYear(stnddYear);
    return;
  }

  dashboardFn
    .doAjax(
      {
        url: '/ajaxMainRoadRiskSelect.do',
        data: { stndd_year: stnddYear }
      },
      true
    )
    .done(dashboardMap.setRiskData);
}

// 援먰넻�ш퀬 遺꾩꽍吏��� 洹몃옒�� 怨꾩젅蹂�
var seasonChartContext = document.getElementById('seasonChart').getContext('2d');
var seasonChart = new Chart(seasonChartContext, {
  data: {
    datasets: [
      {
        type: 'line',
        label: '�щ쭩��',
        borderColor: '#fd353e',
        borderWidth: '3',
        data: [10, 8, 7, 3],
        datalabels: {
          align: 'center',
          labels: {
            value: {
              borderWidth: 0,
              borderRadius: 0,
              font: { size: 10 },
              formatter: function (value, ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? value : null;
              },
              color: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? '#fff' : null;
              },
              backgroundColor: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? 'transparent' : null;
              },
              padding: 20
            }
          }
        }
      },
      {
        type: 'bar',
        label: '�ш퀬嫄댁닔',
        backgroundColor: '#3b5de7',
        borderColor: '#3b5de7',
        borderWidth: '0',
        barThickness: 30,
        data: [35, 22, 20, 14],
        datalabels: {
          align: 'end',
          labels: {
            value: {
              borderWidth: 0,
              borderRadius: 0,
              font: { size: 10 },
              formatter: function (value, ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? value : null;
              },
              color: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? '#000' : null;
              },
              backgroundColor: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? 'transparent' : null;
              },
              padding: 20
            }
          }
        }
      }
    ],
    labels: ['遊�', '�щ쫫', '媛���', '寃⑥슱']
  },
  options: {
    responsive: true,
    scales: {
      xAxes: [
        {
          ticks: {
            fontColor: '#aeb0be',
            fontSize: 12
          },
          gridLines: {
            color: '#adafbd',
            lineWidth: 0
          },
          offset: true
        }
      ],
      yAxes: [
        {
          ticks: {
            fontSize: 0
          },
          gridLines: {
            lineWidth: 0
          }
        }
      ],
      scaleFontColor: '#FFFFFF'
    },
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        fontSize: 10,
        fontColor: '#adafbd',
        boxWidth: 12
      }
    },
    title: {
      display: true,
      text: '怨꾩젅蹂�',
      fontColor: '#adafbd',
      fontSize: 12,
      position: 'left'
    }
  }
});

// 援먰넻�ш퀬 遺꾩꽍吏��� 洹몃옒�� �쒓컙��蹂�
var timeChartContext = document.getElementById('timeChart').getContext('2d');
var timeChart = new Chart(timeChartContext, {
  data: {
    datasets: [
      {
        type: 'line',
        label: '�щ쭩��',
        borderColor: '#fd353e',
        borderWidth: '3',
        data: [0, 0, 2, 3],
        datalabels: {
          align: 'center',
          labels: {
            value: {
              borderWidth: 0,
              borderRadius: 0,
              font: { size: 10 },
              formatter: function (value, ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? value : null;
              },
              color: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? '#fff' : null;
              },
              backgroundColor: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? 'transparent' : null;
              },
              padding: 20
            }
          }
        }
      },
      {
        type: 'bar',
        label: '�ш퀬嫄댁닔',
        backgroundColor: '#3b5de7',
        borderColor: '#3b5de7',
        borderWidth: '0',
        barThickness: 30,
        data: [8, 14, 18, 9],
        datalabels: {
          align: 'end',
          labels: {
            value: {
              borderWidth: 0,
              borderRadius: 0,
              font: { size: 10 },
              formatter: function (value, ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? value : null;
              },
              color: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? '#000' : null;
              },
              backgroundColor: function (ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                return value > 0 ? 'transparent' : null;
              },
              padding: 20
            }
          }
        }
      }
    ],
    labels: ['00~06��', '06~12��', '12~18��', '18��~00��']
  },
  options: {
    responsive: true,
    scales: {
      xAxes: [
        {
          ticks: {
            fontColor: '#aeb0be',
            fontSize: 12
          },
          gridLines: {
            color: '#adafbd',
            lineWidth: 0
          },
          offset: true
        }
      ],
      yAxes: [
        {
          ticks: {
            fontSize: 0
          },
          gridLines: {
            lineWidth: 0
          }
        }
      ],
      scaleFontColor: '#FFFFFF'
    },
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        fontSize: 10,
        fontColor: '#adafbd',
        boxWidth: 12
      }
    },
    title: {
      display: true,
      text: '�쒓컙��蹂�',
      fontColor: '#adafbd',
      fontSize: 12,
      position: 'left'
    }
  }
});

// mapapi.js �� 吏��뺣맂 Array.prototype.find 媛� bootstrap �먯꽌 �몄텧�� �ㅻ쪟 諛쒖깮�섏뿬 �ъ���
Array.prototype.find = function (callback) {
  if (this === null) {
    throw new TypeError('Array.prototype.find called on null or undefined');
  } else if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }
  var list = Object(this);
  // Makes sures is always has an positive integer as length.
  var length = list.length >>> 0;
  var thisArg = arguments[1];
  for (var i = 0; i < length; i++) {
    var element = list[i];
    if (callback.call(thisArg, element, i, list)) {
      return element;
    }
  }
};

function sigunguInfo(){

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/regeub.json',

	    success: function (returnData) {

			var sido = returnData.filter(function(el){
				 return el.SIGUNGU_NM == null;
			});

			sido.sort(function(a,b){return a.SIDO_CODE - b.SIDO_CODE});
			var strHtml='';
			if (sido.length > 0) {
				for(var i=0; i<sido.length; i++){
					if(sido[i].SIDO_CODE == '43') {
						strHtml += '<option value="'+sido[i].SIDO_CODE+'" selected >'+sido[i].SIDO_NM+'</option>';

					} else {
						strHtml += '<option value="'+sido[i].SIDO_CODE+'">'+sido[i].SIDO_NM+'</option>';
					}
				}
			}
			$('#sido_cd').append(strHtml);
			changeSido($('#sido_cd option:selected').val());
	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

}

function changeSido(sidoCode){

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/regeub.json',

	    success: function (returnData) {

			var sido = returnData.filter(function(el){
				 return el.SIDO_CODE == sidoCode && el.SIGUNGU_NM != null && el.EUBMYEONDONG_NM == null ;
			});

			sido.sort(function(a,b){return a.SIGUNGU_CODE - b.SIGUNGU_CODE});
			var strHtml='';
			$('select#reg_cd option').remove();
			if (sido.length > 0) {
				for(var i=0; i<sido.length; i++){
					if(sido[i].SIGUNGU_CODE == '43740') {
						strHtml += '<option value="'+sido[i].SIGUNGU_CODE+'" selected >'+sido[i].SIGUNGU_NM+'</option>';

					} else {
						strHtml += '<option value="'+sido[i].SIGUNGU_CODE+'">'+sido[i].SIGUNGU_NM+'</option>';
					}
				}
			}

			$('#reg_cd').append(strHtml);
			changeSigungu($('#reg_cd option:selected').val());

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

}

function changeSigungu(sigunguCode){

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/regeub.json',

	    success: function (returnData) {

			var sido = returnData.filter(function(el){
				 return el.SIGUNGU_CODE == sigunguCode && el.EUBMYEONDONG_NM != null;
			});

			sido.sort(function(a,b){return a.REGEUB - b.REGEUB});
			var strHtml='';
			$('select#eub_cd option').remove();

			if (sido.length > 0) {
				for(var i=0; i<sido.length; i++){

					if(sido[i].REGEUB == '4374031037') {
						if(sido[i].RI_NM == undefined){
							strHtml += '<option value="'+sido[i].REGEUB+'" selected >'+sido[i].EUBMYEONDONG_NM+'</option>';
						}else{
							strHtml += '<option value="'+sido[i].REGEUB+'" selected >'+sido[i].EUBMYEONDONG_NM+' '+sido[i].RI_NM+'</option>';
						}


					} else {
						if(sido[i].RI_NM == undefined){
							strHtml += '<option value="'+sido[i].REGEUB+'">'+sido[i].EUBMYEONDONG_NM+'</option>';
						}else{
							strHtml += '<option value="'+sido[i].REGEUB+'">'+sido[i].EUBMYEONDONG_NM+' '+sido[i].RI_NM+'</option>';
						}
					}
				}
			}
			$('#eub_cd').append(strHtml);

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

}

function searchUnUsedLand(){
	stopFlash2();
	var eubText = $('#eub_cd option:selected').val();
	var sanText = $('#san_cd option:selected').val();
	if(sanText == '-'){
		sanText = '';
	}

	var bunjiText = $('#bunji').val();
	var bubunText = $('#bubun').val();

	if(eubText.substr('8','2') == '00'){
		eubText = eubText.substr('0','8');
	}


	var sBunjiText = '';

	if(sanText != ''){
		sBunjiText = sBunjiText + sanText;
	}

	if(bunjiText != ''){
		sBunjiText = sBunjiText + bunjiText;
	}

	if(bubunText != ''){
		sBunjiText = sBunjiText +'-'+bubunText;
	}

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				if(sanText+bunjiText+bubunText != ''){

					return el.�됱젙吏���퐫��.includes(eubText) && el.�몄엯吏�踰�.includes(sBunjiText);
				}else{
					var tempStr = el.�됱젙吏���퐫��+'';

					console.log(tempStr.includes(eubText));
					return tempStr.includes(eubText);
				}

			});


			var source = map2d.getLayer('unusedLandLayer').getSource();

			source.clear(true);

			var source2 = map2d.getLayer('unusedLand').getSource();
			source2.clear(true);
		    var features = [];
			var unUsedLandTbody = $('#unUsedLandList tbody');
			removeTable(unUsedLandTbody);
			var rentalLandTbody = $('#rentalLandList tbody');
			removeTable(rentalLandTbody);
			var squatLandTbody = $('#squatLandList tbody');
			removeTable(squatLandTbody);
			var projectLandTbody = $('#projectLandList tbody');
			removeTable(projectLandTbody);
			var noUseLandTbody = $('#noUseLandList tbody');
			removeTable(noUseLandTbody);
		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });


				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}
				html +='<td style="font-size:12px; padding:1;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);

		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'unusedLand');
		      });

		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);

		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }else{
				source.clear(true);
		      source.addFeatures(features);
			}


			map2d.getLayer('unusedLandLayer').values_.visible = true;

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data1.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				if(sanText+bunjiText+bubunText != ''){

					return el.PNU.includes(eubText) && el.吏�踰�.includes(sBunjiText);
				}else{

					return el.PNU.includes(eubText) ;
				}

			});

			var source = map2d.getLayer('rentalLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('rentalLand').getSource();
			source2.clear(true);
		    var features = [];
			var unUsedLandTbody = $('#unUsedLandList tbody');
		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				//returnData.Sheet1[0].�뚯옱吏�.split(' ').length;

				var addr = item.�뚯옱吏�.split(' ');
				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+addr[0]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[1]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[2]+'</td>';
				if(addr.length > 3){
					html +='<td style="font-size:12px; padding:1;">'+addr[3]+'</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}

				html +='<td style="font-size:12px; padding:1;">'+item.吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);

		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'rentalLand');
		      });



		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('rentalLandLayer').values_.visible = true;

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data2.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 if(sanText+bunjiText+bubunText != ''){

					return el.�됱젙吏���퐫��.includes(eubText) && el.�몄엯吏�踰�.includes(sBunjiText);
				}else{
					var tempStr = el.�됱젙吏���퐫��+'';

					console.log(tempStr.includes(eubText));
					return tempStr.includes(eubText);
				}
			});

			var source = map2d.getLayer('squatLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('squatLand').getSource();
			source2.clear(true);
		    var features = [];
			var unUsedLandTbody = $('#unUsedLandList tbody');

		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}


				html +='<td style="font-size:12px;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'squatLand');
		      });



		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('squatLandLayer').values_.visible = true;



	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });
	var sido_cd = $('#sido_cd option:selected').text()
	var reg_cd = $('#reg_cd option:selected').text();
	var eub_cd = $('#eub_cd option:selected').text();
	var eub = eub_cd.split(' ');
	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data4.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				/*var addr = item.�뚯옱吏�.split(' ');

				 return addr[0] == sido_cd && addr[1] == reg_cd && addr[2];*/
				if(sanText+bunjiText+bubunText != ''){
					if(eub.length > 1){
						return el.�뚯옱吏�.includes(sido_cd+' '+reg_cd+' '+eub[0]+' '+eub[1]+' '+sBunjiText);
					}else{
						return el.�뚯옱吏�.includes(sido_cd+' '+reg_cd+' '+eub[0]+' '+sBunjiText);
					}
				}else{
					if(eub.length > 1){
						return el.�뚯옱吏�.includes(sido_cd+' '+reg_cd+' '+eub[0]+' '+eub[1]);
					}else{
						return el.�뚯옱吏�.includes(sido_cd+' '+reg_cd+' '+eub[0]);
					}
				}

			});

			 var source = map2d.getLayer('projectLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('projectLand').getSource();
			source2.clear(true);
    		 var features = [];
			var unUsedLandTbody = $('#unUsedLandList tbody');

		    if (unUsedLandData.length > 0) {

		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });


				var addr = item.�뚯옱吏�.split(' ');
				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+addr[0]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[1]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[2]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[3]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[4]+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU2,'projectLand');
		      });



		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('projectLandLayer').values_.visible = true;

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });
}

function searchUnUsedLandPNU(){
	var pnuText = $('#searchPNU').val();
	stopFlash2();
	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 return el.PNU.includes(pnuText);
			});

			var source = map2d.getLayer('unusedLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('unusedLand').getSource();
			source2.clear(true);
		    var features = [];
			var unUsedLandTbody = $('#unUsedLandList tbody');
			removeTable(unUsedLandTbody);
			var rentalLandTbody = $('#rentalLandList tbody');
			removeTable(rentalLandTbody);
			var squatLandTbody = $('#squatLandList tbody');
			removeTable(squatLandTbody);
			var projectLandTbody = $('#projectLandList tbody');
			removeTable(projectLandTbody);
			var noUseLandTbody = $('#noUseLandList tbody');
			removeTable(noUseLandTbody);
		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}
				html +='<td style="font-size:12px; padding:1;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'unusedLand');
		      });

		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('unusedLandLayer').values_.visible = true;
	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data1.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 return el.PNU.includes(pnuText);
			});

			var source = map2d.getLayer('unusedLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('unusedLand').getSource();
			source2.clear(true);
		    var features = [];
			var unusedLandTbody = $('#unusedLandList tbody');
		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}
				html +='<td style="font-size:12px; padding:1;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'unusedLand');
		      });

		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('unusedLandLayer').values_.visible = true;
	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data2.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 return el.PNU.includes(pnuText);
			});

			var source = map2d.getLayer('unusedLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('unusedLand').getSource();
			source2.clear(true);
		    var features = [];
			var unusedLandTbody = $('#unusedLandList tbody');
		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}
				html +='<td style="font-size:12px; padding:1;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'unusedLand');
		      });

		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('unusedLandLayer').values_.visible = true;
	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data4.json',
		async:false,
	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 return el.PNU.includes(pnuText);
			});

			var source = map2d.getLayer('unusedLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('unusedLand').getSource();
			source2.clear(true);
		    var features = [];

			var unusedLandTbody = $('#unusedLandList tbody');

		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}
				html +='<td style="font-size:12px; padding:1;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'unusedLand');
		      });

		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('unusedLandLayer').values_.visible = true;
	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });
}

function searchNouseLand(){
	stopFlash2();
	var hdqrText = $('#hdqr_cd5 option:selected').text();
	var mtnofText = $('#mtnof_cd5 option:selected').text();


	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data.json',

	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){

				return el.愿��좊��� == hdqrText && el.愿��좎��� == mtnofText;

			});


			var source = map2d.getLayer('unusedLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('unusedLand').getSource();
			source2.clear(true);
		    var features = [];
			var unUsedLandTbody = $('#noUseLandList tbody');
			removeTable(unUsedLandTbody);

		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });


				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}
				html +='<td style="font-size:12px; padding:1;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				unUsedLandTbody.append(html);

		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'unusedLand');
		      });

		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);

		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }else{
				source.clear(true);
		      source.addFeatures(features);
			}


			map2d.getLayer('unusedLandLayer').values_.visible = true;

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });


}

function searchRentalLand(){

	var hdqrText = $('#hdqr_cd2 option:selected').text().replace('蹂몃�','');
	var mtnofText = $('#mtnof_cd2 option:selected').text().replace('吏���','');
	stopFlash2();
	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data1.json',

	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 return el.愿��좊낯遺� == hdqrText && el.愿��좎��� == mtnofText;
			});

			var source = map2d.getLayer('rentalLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('rentalLand').getSource();
			source2.clear(true);
		    var features = [];
			var rentalLandTbody = $('#rentalLandList tbody');
			removeTable(rentalLandTbody);

		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				//returnData.Sheet1[0].�뚯옱吏�.split(' ').length;

				var addr = item.�뚯옱吏�.split(' ');
				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+addr[0]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[1]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[2]+'</td>';
				if(addr.length > 3){
					html +='<td style="font-size:12px; padding:1;">'+addr[3]+'</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}

				html +='<td style="font-size:12px; padding:1;">'+item.吏�踰�+'</td>';
				html +='</tr>';

				rentalLandTbody.append(html);

		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'rentalLand');
		      });



		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('rentalLandLayer').values_.visible = true;

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });

}

function searchSquatLand(){
	var hdqrText = $('#hdqr_cd3 option:selected').text();
	var mtnofText = $('#mtnof_cd3 option:selected').text();
	stopFlash2();
	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data2.json',

	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 return el.愿��좊��� == hdqrText && el.愿��좎��� == mtnofText;
			});

			var source = map2d.getLayer('squatLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('squatLand').getSource();
			source2.clear(true);
		    var features = [];
			var squatLandTbody = $('#squatLandList tbody');
			removeTable(squatLandTbody);

		    if (unUsedLandData.length > 0) {
		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });

				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+item.�쒕룄紐�+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�쒓뎔援щ챸+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+item.�띾㈃�숇챸+'</td>';
				if(item.由щ챸 === undefined){
					html +='<td style="font-size:12px; padding:1;">-</td>';
				}else{
					html +='<td style="font-size:12px; padding:1;">'+item.由щ챸+'</td>';
				}


				html +='<td style="font-size:12px;">'+item.�몄엯吏�踰�+'</td>';
				html +='</tr>';

				squatLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU,'squatLand');
		      });



		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('squatLandLayer').values_.visible = true;



	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });
}

function searchProjectLand(){
	var hdqrText = $('#hdqr_cd4 option:selected').text().replace('蹂몃�','');
	var mtnofText = $('#mtnof_cd4 option:selected').text().replace('吏���','');
	stopFlash2();
	$.ajax({
	    dataType: 'json',
	    type: 'POST',
	    url: '/dtjp/data4.json',

	    success: function (returnData) {

			var unUsedLandData = returnData.Sheet1.filter(function(el){
				 return el.湲곌� == hdqrText;
			});

			 var source = map2d.getLayer('projectLandLayer').getSource();
			source.clear(true);
			var source2 = map2d.getLayer('projectLand').getSource();
			source2.clear(true);
    		 var features = [];
			var projectLandTbody = $('#projectLandList tbody');
			removeTable(projectLandTbody);
		    if (unUsedLandData.length > 0) {

		      unUsedLandData.forEach(function (item) {
		        var feature = new ol.Feature({
		          geometry: new ol.geom.Point([item.X, item.Y])
		        });


				var addr = item.�뚯옱吏�.split(' ');
				var html = "<tr style='cursor:pointer;' onClick='moveLand("+item.X+","+item.Y+",this);'>";
				html +='<td style="font-size:12px; padding:1;">'+addr[0]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[1]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[2]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[3]+'</td>';
				html +='<td style="font-size:12px; padding:1;">'+addr[4]+'</td>';
				html +='</tr>';

				projectLandTbody.append(html);
		        feature.setProperties(item);
		        features.push(feature);

				getGeoLandLayer(item.PNU2,'projectLand');
		      });



		      // cctv �덉씠�� �뚯뒪�� 異붽�
			  source.clear(true);
		      source.addFeatures(features);
		      // 吏곸꽑�꾩뿉 cctv 異붽�
		      //dashboardStraight.setStraightData('cctv', resData);
		    }


			map2d.getLayer('projectLandLayer').values_.visible = true;

	    },
	    error: function (request, status, error) {
	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });
}

var FLASH_DURATION = 1000;
var FLASH_KEY;
var FLASH_COORDINATES = [];

function moveLand(X,Y,obj){

	var parentObj =  obj.parentElement;
	removeCss();
	/*for(var i = 0; i < parentObj.childElementCount ; i++){

		parentObj.childNodes[i].style.background = 'rgb(255 255 255)';
	}*/
	FLASH_COORDINATES = [];
	obj.style.background= 'rgb(158 206 255)';
	FLASH_COORDINATES.push([X,Y]);
	map2d.getView().setCenter([X, Y]);
	map2d.getView().setZoom(15);

	startFlash2();
}

function removeCss(){

	var unUsedLandTbody = $('#unUsedLandList tbody');
	var rentalLandTbody = $('#rentalLandList tbody');
	var squatLandTbody = $('#squatLandList tbody');
	var projectLandTbody = $('#projectLandList tbody');
	var noUseLandTbody = $('#noUseLandList tbody');


	for(var i = 0; i < unUsedLandTbody.children().length; i++){
		unUsedLandTbody.children()[i].style.background = 'rgb(255 255 255)';
	}

	for(var i = 0; i < rentalLandTbody.children().length; i++){
		rentalLandTbody.children()[i].style.background = 'rgb(255 255 255)';
	}

	for(var i = 0; i < squatLandTbody.children().length; i++){
		squatLandTbody.children()[i].style.background = 'rgb(255 255 255)';
	}

	for(var i = 0; i < projectLandTbody.children().length; i++){
		projectLandTbody.children()[i].style.background = 'rgb(255 255 255)';
	}

	for(var i = 0; i < noUseLandTbody.children().length; i++){
		noUseLandTbody.children()[i].style.background = 'rgb(255 255 255)';
	}
}


function removeTable(tableName){

	tableName.empty();

}


function startFlash2(feature) {
    stopFlash2();

    if (!FLASH_COORDINATES || FLASH_COORDINATES.length == 0) {
      return;
    }

    var start = Date.now();
    var flashGeom = new ol.geom.MultiPoint(FLASH_COORDINATES);

    function animate(event) {
      var vectorContext = event.vectorContext;

      var frameState = event.frameState;
      var elapsed = frameState.time - start;
      var elapsedRatio = (elapsed % FLASH_DURATION) / FLASH_DURATION;

      if (elapsedRatio > 1) {
        elapsedRatio = 1;
      }

      // 諛섏�由� : 5�먯꽌 30源뚯�
      var radius = ol.easing.easeOut(elapsedRatio) * 40 + 20;
      var opacity = ol.easing.easeOut(1 - elapsedRatio) * 0.3;

      var flashStyle = new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({
            color: 'rgba(0, 103, 207, ' + opacity + ')'
          })
        })
      });

      vectorContext.setStyle(flashStyle);
      vectorContext.drawGeometry(flashGeom);

      map2d.render();
    }
    // postcompose�대깽�� 諛붿씤��
    FLASH_KEY = map2d.on('postcompose', animate);
    // flashKey = layers['iot'].on('postrender', animate);
    // map2d.render();
    // return FLASH_KEY;
  };

  function stopFlash2() {
    ol.Observable.unByKey(FLASH_KEY);
    map2d.render();
  };

  function getGeoLandLayer(pnuCode,layerNm){

	var proxyUrl = 'https://geoapi.ex.co.kr/proxy/?http://api.vworld.kr/req/data?';
	if(globalInOut == 'out'){
		proxyUrl = 'https://dxlive.ex.co.kr:8091/proxy/?http://api.vworld.kr/req/data?';
	}
	//媛쒕컻��
	//apikey:"CEB52025-E065-364C-9DBA-44880E3B02B8",
	//�댁쁺��
	//apikey:"720AE582-3B29-3A85-9357-C41C5E5E8607",

	$.ajax({
	    dataType: 'json',
	    type: 'GET',
	    url: proxyUrl,
		data: {
			service:'data',
			version:2.0,
			request:'GetFeature',
			//key:'CEB52025-E065-364C-9DBA-44880E3B02B8',
			key:'720AE582-3B29-3A85-9357-C41C5E5E8607',
			fotmat:'json',
			errorformat:'json',
			data:'LP_PA_CBND_BUBUN',
			attrfilter:'pnu:like:'+pnuCode,
			geometry:true,
			crs:'EPSG:900913',
			//domain:'http://localhost'
			domain:'https://digital.ex.co.kr'

		},

	    success: function (returnData) {

			var source ;

			switch(layerNm){
				case 'unusedLand':
					source = map2d.getLayer('unusedLand').getSource();
					break;
				case 'illegalUseLand':
					source = map2d.getLayer('illegalUseLand').getSource();
					break;
				case 'rentalLand':
					source = map2d.getLayer('rentalLand').getSource();
					break;
				case 'squatLand':
					source = map2d.getLayer('squatLand').getSource();
					break;
				case 'projectLand':
					source = map2d.getLayer('projectLand').getSource();
					break;
			}

			var geoData = returnData.response.result.featureCollection.features;
			var _features = [];
			for(var idx = 0; idx < geoData.length; idx++){

				var geojson_Feature = geoData[idx];
				var geojsonObject = geojson_Feature.geometry;
				var features = (new ol.format.GeoJSON()).readFeatures(geojsonObject);

				for(var i = 0 ; i < features.length; i++){

					var feature = features[i];
					feature["id_"] = geojson_Feature.id;
					feature["properties"] = {};
					for(var key in geojson_Feature.properties){
						var value = geojson_Feature.properties[key];
						feature.values_[key] = value;
						feature.properties[key] = value;
					}
					_features.push(feature);
				}
			}


		    source.addFeatures(_features);

			switch(layerNm){
				case 'unusedLand':
					map2d.getLayer('unusedLand').values_.visible = true;
					break;
				case 'illegalUseLand':
					map2d.getLayer('illegalUseLand').values_.visible = true;
					break;
				case 'rentalLand':
					map2d.getLayer('rentalLand').values_.visible = true;
					break;
				case 'squatLand':
					map2d.getLayer('squatLand').values_.visible = true;
					break;
				case 'projectLand':
					map2d.getLayer('projectLand').values_.visible = true;
					break;
			}

	    },
	    error: function (request, status, error) {

	      console.log(request.status + '#' + request.message + '#' + error);
	    }
   });


}

// 원 모양 마커 스타일 함수
function createCircleStyleFunction() {
    return function(feature, resolution) {
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: '#ff0000'  // 빨간색 원
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffffff',  // 흰색 테두리
                    width: 2
                })
            })
        });
    };
}

// 테스트용 마커 생성 함수
function createTestMarker() {
    // 제공받은 테스트 좌표 (부산 지역)
    var lon = 126.47353089972863;
    var lat = 35.02544645701894;
    
    // 좌표 변환 (WGS84 → Web Mercator)
    var coordinate = ol.proj.fromLonLat([lon, lat]);
    
    // Feature 객체 생성
    var feature = new ol.Feature({
        geometry: new ol.geom.Point(coordinate),
        properties: {
            type: "3",
            vr_id: "24305900001", 
            poi: "0",
            name: "테스트 마커"
        }
    });
    
    // 마커 소스에 추가 (unusedLandLayer의 소스 사용)
    var source = map2d.getLayer('unusedLandLayer').getSource();
    source.addFeature(feature);
    
    // 원 모양 스타일 적용
    var layer = map2d.getLayer('unusedLandLayer');
    layer.setStyle(createCircleStyleFunction());
    
    // 레이어를 보이게 설정
    layer.setVisible(true);
    
    console.log("테스트 마커가 생성되었습니다!");
}

// 페이지 로드 시 자동으로 테스트 마커 생성
$(document).ready(function() {
    // 2초 후에 테스트 마커 생성 (지도가 완전히 로드된 후)
    setTimeout(function() {
        createTestMarker();
    }, 2000);
});