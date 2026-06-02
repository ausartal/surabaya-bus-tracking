// setting up the map
var map = L.map("map", {
  attributionControl: false,
  zoomControl: false,
}).setView([-7.3026644, 112.7243344], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  className: "map-tiles",
}).addTo(map);

L.control
  .attribution({
    position: "bottomleft",
  })
  .addTo(map);

// add zoom control if desktop
if (!L.Browser.mobile) {
  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map);
}

// useful functions
function getData(url) {
  var result = null;
  $.ajax({
    async: false,
    url: url,
    success: function (data) {
      result = data;
    },
  });
  return result;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// getting URL params
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const routeParams = urlParams.get("route");

// markers settings and variables
const markerZoom = 15;
var halteMarkersGroup = new L.FeatureGroup();
var routeLinesGroup = new L.FeatureGroup();
const markers = {};
markers.halte = {};

const dataHalte = getData("./halte.json").halte;
const dataRute = getData("./routedata.json");
const dataTracking = getData("https://busmapapi.fly.dev/all");

var route;

// setting route information and themes
if (routeParams != "all") {
  route = dataRute[routeParams];
  let routeTitle = `${route.name} | ${route.title}`;
  document.title = routeTitle;
  $("#route-name").text(routeTitle);
  $("#op-hour").text(route.hours);

  $(":root")
    .get(0)
    .style.setProperty(
      "--accent-color",
      `${hexToRgb(route.color).r}, ${hexToRgb(route.color).g}, ${
        hexToRgb(route.color).b
      }`
    );
  if (routeParams == "sbr1") {
    setRoute(dataRute.sbrt);
    setVehicleMarker(dataRute.sbrt, dataTracking[dataRute.sbrt.code]);
  }
  setRoute(route);
  setStopList(route, "a");
  setVehicleMarker(route, dataTracking[route.code]);
} else {
  document.title = "Peta jaringan bus Surabaya";
  $("#nav-title").text("Semua Rute");
  $("#route-panel, #map, #location-button").addClass("full-map");
  setTimeout(map.invalidateSize(), 100);
  Object.keys(dataRute)
    .slice()
    .reverse()
    .forEach((key) => {
      let route = dataRute[key];
      setRoute(route);
      setVehicleMarker(route, dataTracking[route.code]);
    });
}

function setRoute(route) {
  // adding route polyline to map
  let routePoly = new L.Polyline(route.datarute, {
    color: route.color,
    weight: 5,
    smoothFactor: 1,
  });
  routePoly.addTo(map);
  routeLinesGroup.addLayer(routePoly);
  map.fitBounds(routeLinesGroup.getBounds());

  // putting every halte on the route to the map
  Object.keys(route.datahalte).forEach((key) => {
    route.datahalte[key].forEach((halteID) => {
      let currentHalte = dataHalte.filter((halte) => {
        return halte.uniqid == halteID;
      })[0];

      var currentTransit;
      if (routeParams != "all") {
        currentTransit = currentHalte.transit.filter((route) => {
          return route != routeParams;
        });
      } else {
        currentTransit = currentHalte.transit;
      }

      let transitDivs = "";
      if (currentTransit.length > 0) {
        currentTransit.forEach((routename) => {
          let pill;
          if (dataRute[routename].feeder) {
            pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill feeder-pill'>${dataRute[routename].name}</div></a>`;
          } else {
            pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill trunk-pill'>${dataRute[routename].name}</div></a>`;
          }
          transitDivs += pill;
        });
      }

      // adding halte markers to map
      if (!markers.halte[halteID]) {
        const isTerminal = currentHalte.transit && currentHalte.transit.length >= 4;
        const terminalBadge = isTerminal ? "<div class='terminal-badge'>Terminal</div>" : "";
        markers.halte[halteID] = new L.circleMarker(
          { lat: currentHalte.lat, lng: currentHalte.lon },
          {
            radius: isTerminal ? 10 : 8,
            fillColor: isTerminal ? route.color : "white",
            fillOpacity: 1,
            color: "black",
          }
        ).bindPopup(
          `
            <p class='stop-name'>${currentHalte.nama}</p>
            ${terminalBadge}
            <div class='transit-list'>
              ${transitDivs}
            </div>
            <a href='https://maps.google.com?saddr=Current+Location&daddr=${currentHalte.lat},${currentHalte.lon}'>
              <div class='navigate'>
                <span class="material-icons">
                place
                </span>
                <p>Navigasi</p>
              </div>
            </a>
            `,
          {
            minWidth: 250,
            maxWidth: 280,
            className: "halte-popup",
          }
        );
        halteMarkersGroup.addLayer(markers.halte[halteID]);
      }

      // adding halte divs to UI
      // if (routeParams != "all") {
      //   let halteElement = `<div id="halte-${currentHalte.uniqid}" class="route-stop">
      //   <div class="halte-circle"></div>
      //   <p class="stop-name button" onclick="popupHandler('${halteID}')">${currentHalte.nama}</p>
      //   ${transitDivs}
      // </div>`;
      //   $("#stops-container").append(halteElement);
      //   $(".halte-line").height($(".halte-line").height() + 50);
      // }
    });
  });
  // if (routeParams != "all" && route.code != 3) addStopList(route);
}

function setStopList(route, direction) {
  route.datahalte[direction].forEach((halteID) => {
    let currentHalte = dataHalte.filter((halte) => {
      return halte.uniqid == halteID;
    })[0];

    var currentTransit = currentHalte.transit.filter((route) => {
      return route != routeParams;
    });

    let transitDivs = "";
    if (currentTransit.length > 0) {
      currentTransit.forEach((routename) => {
        let pill;
        if (dataRute[routename].feeder) {
          pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill feeder-pill'>${dataRute[routename].name}</div></a>`;
        } else {
          pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill trunk-pill'>${dataRute[routename].name}</div></a>`;
        }
        transitDivs += pill;
      });
    }

    let halteElement = `<div id="halte-${currentHalte.uniqid}" class="route-stop">
      <div class="halte-circle"></div>
      <p class="stop-name button" onclick="popupHandler('${halteID}')">${currentHalte.nama}</p>
      ${transitDivs}
    </div>`;
    $("#stops-container").append(halteElement);
    $(".halte-line").height($(".halte-line").height() + 50);
  });
  $(".halte-line").height($(".halte-line").height() - 35);
}

async function setVehicleMarker(route, URL) {
  let id_koridor = route.code;
  let reqAddr;
  if (id_koridor < 10 || id_koridor == 51 || id_koridor == 12) {
    reqAddr = "sbybus";
  } else if (id_koridor < 100) {
    reqAddr = "temanbus";
  } else {
    reqAddr = "feeder";
  }

  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${URL.split("/")[1]}` },
  };

  const response = await fetch(
    `${dataTracking.apiUrl}/track/${reqAddr}/${id_koridor}`,
    options
  );
  const data = await response.json();

  let pill;
  if (route.feeder) {
    pill = `<a href='./map.html?route=${route.link}'><div style='color: ${route.text}; background-color: ${route.color}; border: 2px solid ${route.color}' class='route-pill feeder-pill'>${route.name}</div></a>`;
  } else {
    pill = `<a href='./map.html?route=${route.link}'><div style='color: ${route.text}; background-color: ${route.color}; border: 2px solid ${route.color}' class='route-pill trunk-pill'>${route.name}</div></a>`;
  }

  // create bus icon using inline SVG for better visuals; accepts color
  const busIcon = (color) =>
    L.divIcon({
      iconAnchor: [12, 12],
      html: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" role="img" aria-label="Bus icon">
        <rect x="2" y="5" width="20" height="12" rx="2" fill="${route.color}" stroke="#ffffff" stroke-width="1.5"/>
        <rect x="4" y="8" width="6" height="4" fill="#ffffff" opacity="0.9"/>
        <rect x="11" y="8" width="6" height="4" fill="#ffffff" opacity="0.9"/>
        <circle cx="7" cy="18" r="1.6" fill="#333333"/>
        <circle cx="17" cy="18" r="1.6" fill="#333333"/>
      </svg>`,
      className: "divMarker bus-icon",
    });

  if (routeParams != "all" && route.code != 3) {
    $("#op-detail").text(
      `${data.length} Bus | ${
        route.datahalte.a.length + route.datahalte.b.length
      } Halte`
    );
  }

  if (!markers[route.code]) {
    var vecMarkers = {};
    data.forEach((vehicle) => {
      vecMarkers[vehicle.info] = L.marker([vehicle.lat, vehicle.lng], {
        icon: busIcon(route.color),
        rotationAngle: vehicle.direction,
      })
        .addTo(map)
        .bindPopup(
          `${pill}<b>${vehicle.info}</b><br><b>Kecepatan :</b> ${vehicle.speed}`
        );
    });
    markers[route.code] = vecMarkers;
  } else {
    data.forEach((vehicle) => {
      markers[route.code][vehicle.info]
        .setRotationAngle(vehicle.direction)
        .setLatLng([vehicle.lat, vehicle.lng])
        .bindPopup(
          `${pill}<b>${vehicle.info}</b><br><b>Kecepatan :</b> ${vehicle.speed}`
        );
    });
  }
  setTimeout(() => {
    setVehicleMarker(route, URL);
  }, 5000);
}

// hide and show markers on zoom changes
if (map.getZoom() > markerZoom) {
  map.addLayer(halteMarkersGroup);
}

map.on("zoomend", function () {
  if (map.getZoom() < markerZoom) {
    map.removeLayer(halteMarkersGroup);
  } else {
    map.addLayer(halteMarkersGroup);
  }
});

// handle halte divs popup trigger
function popupHandler(halteID) {
  map.addLayer(halteMarkersGroup);
  map.closePopup();
  map.setView(markers.halte[halteID]._latlng, 17, { pan: { duration: 0.25 } });
  setTimeout(() => {
    markers.halte[halteID].openPopup();
  }, 250);
}

// handle locations and stuff
function getLocation() {
  if (!markers.gps) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      Toastify({
        text: "Geolocation is not supported by this browser.",
        style: {
          backgroud: "#FF0000",
        },
      }).showToast();
    }
  } else {
    map.setView(markers.gps._latlng, 17);
  }
}

function updatePosition() {
  navigator.geolocation.getCurrentPosition(showPosition, showError);
}

function showPosition(position) {
  const markerOption = {
    radius: 7,
    color: "#FFFFFF",
    weight: 3,
    fillColor: "#4285f4",
    fillOpacity: 1,
  };

  if (!markers.gps) {
    markers.gps = L.circleMarker(
      [position.coords.latitude, position.coords.longitude],
      markerOption
    ).addTo(map);
    map.setView(markers.gps._latlng, 17);
  } else {
    markers.gps.setLatLng([
      position.coords.latitude,
      position.coords.longitude,
    ]);
  }

  setTimeout(() => {
    updatePosition();
  }, 5000);
}

function showError(error) {
  const color = "#FF0000";
  switch (error.code) {
    case error.PERMISSION_DENIED:
      Toastify({
        text: "User denied the request for Geolocation.",
        style: {
          background: color,
        },
      }).showToast();
      break;
    case error.POSITION_UNAVAILABLE:
      Toastify({
        text: "Location information is unavailable.",
        style: {
          backgroud: color,
        },
      }).showToast();
      break;
    case error.TIMEOUT:
      Toastify({
        text: "The request to get user location timed out.",
        style: {
          backgroud: color,
        },
      }).showToast();
      break;
    case error.UNKNOWN_ERROR:
      Toastify({
        text: "An unknown error occurred.",
        style: {
          backgroud: color,
        },
      }).showToast();
      break;
  }
}

function routeSelect(direction) {
  $("div[id^='halte-']").remove();
  $(".halte-line").height(0);
  let opposite;
  if (direction == "a") {
    opposite = "b";
  } else {
    opposite = "a";
  }
  $("#route-" + opposite).removeClass("route-active");
  $("#route-" + direction).addClass("route-active");
  setStopList(route, direction);
}
