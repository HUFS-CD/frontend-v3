/*global Tmapv2*/

import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import $ from "jquery";

const markRender = (arr, m) => {
  if (arr.length !== 0) {
    for (var i = 0; i < arr.length; i++) {
      //for문을 통하여 배열 안에 있는 값을 마커 생성
      var lonlat = arr[i].lonlat;
      var title = arr[i].title;
      console.log(lonlat);
      //Marker 객체 생성.
      var marker = new Tmapv2.Marker({
        position: lonlat, //Marker의 중심좌표 설정.
        icon: "https://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_1.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: m, //Marker가 표시될 Map 설정.
        title: title, //Marker 타이틀.
      });
      marker.create(() => {
        console.log("hi");
      });
      console.log(1);
      console.log(marker.isLoaded());
    }
  }
};

function App() {
  const [coords, setCoords] = useState([]);

  // const getCoords = (a) => {
  //   setCoords([...coords, ...a]);
  // };

  var positions = [];
  var markers = [];

  const [nameList, setNameList] = useState([]);
  var markerArr = [];
  var counter = 0;

  useEffect(() => {
    var map = new Tmapv2.Map("TMapApp", {
      center: new Tmapv2.LatLng(37.59644996896789, 127.06004762649577),
      width: "100%",
      height: "100%",
      zoom: 18,
    });

    //------ 클릭시 마커 생성 ------//
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var lat_s = position.coords.latitude;
        var lon_s = position.coords.longitude;
        var marker_s = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(lat_s, lon_s),
          icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png",
          iconSize: new Tmapv2.Size(24, 38),
          map: map,
        });
        map.setCenter(new Tmapv2.LatLng(lat_s, lon_s));
        map.setZoom(18);
      });
    }

    map.addListener("click", function onClick(e) {
      removeMarkers();

      var marker_e = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(e.latLng.lat(), e.latLng.lng()), //Marker의 중심좌표 설정.
        icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: map,
      });
      markers.push(marker_e);
    });
    //------ --------- ------//

    //------ 명칭 검색 후 마커 생성 ------//
    $("#btn_select").on("click", function () {
      var searchKeyword = $("#searchKeyword").val();

      $.ajax({
        method: "GET",
        url: "https://apis.openapi.sk.com/tmap/pois?version=1&format=json&callback=result",
        async: false,
        data: {
          appKey: "l7xx2eff6322cd2944cab62446d299f7f6e3",
          searchKeyword: searchKeyword,
          resCoordType: "EPSG3857",
          reqCoordType: "WGS84GEO",
          count: 10,
        },
        success: function (response) {
          var resultpoisData = response.searchPoiInfo.pois.poi;
          counter++;

          if (markerArr.length > 0 && counter % 2 === 1) {
            // 이 counter 변수가 없으면 마커를 표시하는 즉시 삭제해버리는 오류 발생, 임시방편으로 counter 변수를 만들었으나 추후 개선 필요
            for (var i in markerArr) {
              markerArr[i].setMap(null);
            }
            markerArr = [];
          }

          var positionBounds = new Tmapv2.LatLngBounds();

          for (var k in resultpoisData) {
            var noorLat = Number(resultpoisData[k].noorLat);
            var noorLon = Number(resultpoisData[k].noorLon);
            var name = resultpoisData[k].name;

            var pointCng = new Tmapv2.Point(noorLon, noorLat);
            var projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
              pointCng
            );

            var lat = projectionCng._lat;
            var lon = projectionCng._lng;

            var markerPosition = new Tmapv2.LatLng(lat, lon);

            var marker2 = new Tmapv2.Marker({
              position: markerPosition,
              //icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
              icon:
                "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_" +
                k +
                ".png",
              iconSize: new Tmapv2.Size(24, 38),
              title: name,
              map: map,
            });

            markerArr.push(marker2);
            positionBounds.extend(markerPosition); // LatLngBounds의 객체 확장
          }

          map.panToBounds(positionBounds); // 확장된 bounds의 중심으로 이동시키기
          map.zoomOut();
        },
        error: function (request, status, error) {
          console.log(
            "code:" +
              request.status +
              "\n" +
              "message:" +
              request.responseText +
              "\n" +
              "error:" +
              error
          );
        },
      });
    });
  }, []);

  function removeMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }

  return (
    <div className="App">
      <div>
        메인페이지
        <div
          id="TMapApp"
          style={{
            height: "100%",
            width: "100%",
            position: "fixed",
            zIndex: 0,
          }}
        />
        <input type="text" id="searchKeyword" name="searchKeyword"></input>
        <button id="btn_select">검색</button>
      </div>
    </div>
  );
}

export default App;
