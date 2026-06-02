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
markers.clusters = {}; // vehicle cluster groups per route

// layer overlays control (populated later)
var overlaysControl = L.control.layers(null, null, { collapsed: true, position: 'topright' }).addTo(map);
// add primary overlays
overlaysControl.addOverlay(routeLinesGroup, 'Rute');
overlaysControl.addOverlay(halteMarkersGroup, 'Halte');

const dataHalte = getData("./halte.json").halte;
const dataRute = getData("./routedata.json");
const dataTracking = getData("https://busmapapi.fly.dev/all");

var route;
const trackerState = {
  routeFilter: "all",
  query: "",
  mapFocus: false,
};
let lastHighlight = null;
const userTrack = {
  watchId: null,
  path: null,
  accuracy: null,
  hasCentered: false,
};

function updateLiveStatus(ts) {
  const el = document.getElementById("live-status");
  if (!el) return;
  const timeStr = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  el.textContent = `Live: ${timeStr}`;
}

function updateFollowBadge() {
  const badge = document.getElementById("follow-badge");
  if (!badge) return;
  if (window.following) {
    badge.textContent = `Following: ${window.following}`;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function updateUserTrackBadge(active) {
  const badge = document.getElementById("user-track-badge");
  const btn = document.getElementById("location-button");
  if (!badge || !btn) return;
  if (active) {
    badge.textContent = "Tracking: On";
    badge.classList.remove("hidden");
    btn.classList.add("active");
  } else {
    badge.classList.add("hidden");
    btn.classList.remove("active");
  }
}

function updateEmptyState(count) {
  const empty = document.getElementById("empty-state");
  if (!empty) return;
  if (routeParams !== "all" && count === 0) empty.classList.remove("hidden");
  else empty.classList.add("hidden");
}

function getSpeedOpacity(speed) {
  const s = Number(speed) || 0;
  if (s <= 5) return 0.55;
  if (s <= 15) return 0.7;
  if (s <= 30) return 0.85;
  return 1;
}

function applyRouteFilter() {
  const filter = trackerState.routeFilter;
  Object.keys(markers.clusters).forEach((code) => {
    const group = markers.clusters[code];
    if (!group) return;
    if (filter === "all" || String(code) === String(filter)) {
      if (!map.hasLayer(group)) map.addLayer(group);
    } else if (map.hasLayer(group)) {
      map.removeLayer(group);
    }
  });
}

function focusOnBus(busId) {
  if (!busId) return;
  for (const r in markers) {
    if (!markers[r]) continue;
    const m = markers[r][busId];
    if (m) {
      if (lastHighlight && lastHighlight._icon) {
        lastHighlight._icon.classList.remove("bus-highlight");
      }
      if (m._icon) m._icon.classList.add("bus-highlight");
      lastHighlight = m;
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 16));
      try { m.openPopup(); } catch (e) {}
      openSidePanel(busId, m.getLatLng().lat, m.getLatLng().lng, m.vehicleData);
      return;
    }
  }
  Toastify({ text: `Bus ${busId} tidak ditemukan`, duration: 2500 }).showToast();
}

function buildPopupHtml(vehicle, pill) {
  const lastSeen = vehicle.timestamp ? new Date(vehicle.timestamp) : new Date();
  const timeStr = lastSeen.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `
    <div class="popup-brief">
      <img src="/images/bus-front.svg" alt="bus" width="28" height="28" />
      <div class="popup-info">
        ${pill}<div><strong>${vehicle.info}</strong></div>
        <div class="muted">Kecepatan: ${vehicle.speed || "-"} | ${timeStr}</div>
      </div>
    </div>
    <div class='popup-actions'>
      <button class='action-btn' onclick="openSidePanel('${vehicle.info}', ${vehicle.lat}, ${vehicle.lng}, ${JSON.stringify(vehicle).replace(/'/g,"\\'")})">Details</button>
      <a class='action-btn' href="https://maps.google.com?saddr=Current+Location&daddr=${vehicle.lat},${vehicle.lng}" target="_blank">Navigate</a>
    </div>`;
}

// setting route information and themes
if (routeParams != "all") {
  route = dataRute[routeParams];
  let routeTitle = `${route.name} | ${route.title}`;
  document.title = routeTitle;
  $("#route-name").text(routeTitle);
  $("#op-hour").text(route.hours);

  const _rgb = hexToRgb(route.color);
  const _lum = (_rgb.r * 0.2126 + _rgb.g * 0.7152 + _rgb.b * 0.0722) / 255;
  const _text = _lum > 0.6 ? '#000000' : '#ffffff';
  $(":root").get(0).style.setProperty("--accent-color", `${_rgb.r}, ${_rgb.g}, ${_rgb.b}`);
  $(":root").get(0).style.setProperty("--accent-text", _text);
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

function initTrackerUI() {
  if (window._trackerInit) return;
  window._trackerInit = true;

  const routeFilter = document.getElementById("route-filter");
  const searchInput = document.getElementById("bus-search");
  const focusBtn = document.getElementById("focus-toggle");

  if (routeFilter) {
    Object.keys(dataRute).forEach((key) => {
      const opt = document.createElement("option");
      opt.value = dataRute[key].code;
      opt.textContent = `${dataRute[key].name} - ${dataRute[key].title}`;
      routeFilter.appendChild(opt);
    });
    if (routeParams && routeParams !== "all" && dataRute[routeParams]) {
      trackerState.routeFilter = String(dataRute[routeParams].code);
      routeFilter.value = trackerState.routeFilter;
    }
    routeFilter.addEventListener("change", function () {
      trackerState.routeFilter = routeFilter.value;
      applyRouteFilter();
    });
  }

  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener("input", function () {
      const val = searchInput.value.trim();
      trackerState.query = val;
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        if (val.length > 0) focusOnBus(val);
      }, 300);
    });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        focusOnBus(searchInput.value.trim());
      }
    });
  }

  if (focusBtn) {
    focusBtn.addEventListener("click", function () {
      trackerState.mapFocus = !trackerState.mapFocus;
      focusBtn.classList.toggle("active", trackerState.mapFocus);
      if (trackerState.mapFocus) {
        if (map.hasLayer(halteMarkersGroup)) map.removeLayer(halteMarkersGroup);
        if (map.hasLayer(routeLinesGroup)) map.removeLayer(routeLinesGroup);
      } else {
        if (!map.hasLayer(halteMarkersGroup)) map.addLayer(halteMarkersGroup);
        if (!map.hasLayer(routeLinesGroup)) map.addLayer(routeLinesGroup);
      }
    });
  }
  updateFollowBadge();
  applyRouteFilter();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTrackerUI);
} else {
  initTrackerUI();
}

function setRoute(route) {
  // adding route polyline to map
  let routePoly = new L.Polyline(route.datarute, {
    color: route.color,
    weight: 5,
    smoothFactor: 1,
    className: 'route-line',
    dashArray: '8'
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
  updateLiveStatus(new Date());
  updateEmptyState(data.length);

  let pill;
  if (route.feeder) {
    pill = `<a href='./map.html?route=${route.link}'><div style='color: ${route.text}; background-color: ${route.color}; border: 2px solid ${route.color}' class='route-pill feeder-pill'>${route.name}</div></a>`;
  } else {
    pill = `<a href='./map.html?route=${route.link}'><div style='color: ${route.text}; background-color: ${route.color}; border: 2px solid ${route.color}' class='route-pill trunk-pill'>${route.name}</div></a>`;
  }

  // create bus icon using inline SVG for better visuals; accepts color
// get bus icon: prefer uploaded SVG at /assets/bus-logo.svg, fallback to inline SVG colored by route
async function getBusIcon(color) {
  // cache per color
  if (getBusIcon.cache && getBusIcon.cacheColor === color) return getBusIcon.cache;
  try {
    const res = await fetch('/images/bus-front.svg');
    if (res.ok) {
      let svg = await res.text();
      // strip xml/doctypes
      svg = svg.replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/g, '');
      // ensure size
      if (/width=/.test(svg)) svg = svg.replace(/width="[^"]*"/i, 'width="36"');
      else svg = svg.replace(/<svg/, '<svg width="36"');
      if (/height=/.test(svg)) svg = svg.replace(/height="[^"]*"/i, 'height="36"');
      else svg = svg.replace(/<svg/, '<svg height="36"');
      // replace common fills/strokes with route color
      svg = svg.replace(/fill="#[^\"]*"/gi, `fill="${color}"`);
      svg = svg.replace(/stroke="#[^\"]*"/gi, `stroke="${color}"`);
      // if no explicit fills, set root fill style
      if (!/fill=/.test(svg)) svg = svg.replace(/<svg([^>]*)>/, `<svg$1 style="fill:${color}">`);
      const html = `<div class='bus-icon'>${svg}</div>`;
      const icon = L.divIcon({ iconAnchor: [18, 18], html: html, className: 'divMarker' });
      getBusIcon.cache = icon;
      getBusIcon.cacheColor = color;
      return icon;
    }
  } catch (e) {
    // ignore, fallback to inline SVG below
  }
  // fallback inline SVG
  const inline = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" role="img" aria-label="Bus icon"><rect x="2" y="5" width="20" height="12" rx="2" fill="${color}" stroke="#ffffff" stroke-width="1.5"/><rect x="4" y="8" width="6" height="4" fill="#ffffff" opacity="0.9"/><rect x="11" y="8" width="6" height="4" fill="#ffffff" opacity="0.9"/><circle cx="7" cy="18" r="1.6" fill="#333333"/><circle cx="17" cy="18" r="1.6" fill="#333333"/></svg>`;
  const icon = L.divIcon({ iconAnchor: [18, 18], html: `<div class='bus-icon'>${inline}</div>`, className: 'divMarker' });
  getBusIcon.cache = icon;
  getBusIcon.cacheColor = color;
  return icon;
}

  if (routeParams != "all" && route.code != 3) {
    $("#op-detail").text(
      `${data.length} Bus | ${
        route.datahalte.a.length + route.datahalte.b.length
      } Halte`
    );
  }

  // schedule updates via a short debounce to batch DOM changes
  if (!window._pendingUpdates) window._pendingUpdates = {};
  window._pendingUpdates[route.code] = { route, data };
  if (window._applyTimer) clearTimeout(window._applyTimer);
  window._applyTimer = setTimeout(async () => {
    const updates = Object.assign({}, window._pendingUpdates);
    window._pendingUpdates = {};
    for (const rc of Object.keys(updates)) {
      const upd = updates[rc];
      const r = upd.route;
      const vehicles = upd.data;

      // prepare cluster for this route if needed
      if (!markers.clusters[r.code]) {
        markers.clusters[r.code] = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 40, spiderfyOnMaxZoom: true, showCoverageOnHover: false,
          iconCreateFunction: function(cluster) {
            const children = cluster.getAllChildMarkers();
            const counts = {}; let total = 0;
            children.forEach(ch => { const c = (ch.options && ch.options.routeColor) || ch.routeColor || '#999999'; counts[c] = (counts[c]||0)+1; total++; });
            let start = 0; const cx=22,cy=22,radius=18; const svgs = [];
            Object.keys(counts).forEach(col => { const val = counts[col]/total; const end = start+val; const sa = start*Math.PI*2 - Math.PI/2; const ea = end*Math.PI*2 - Math.PI/2; const x1 = cx + radius*Math.cos(sa); const y1 = cy + radius*Math.sin(sa); const x2 = cx + radius*Math.cos(ea); const y2 = cy + radius*Math.sin(ea); const large = val>0.5?1:0; svgs.push(`<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z" fill="${col}" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>`); start = end; });
            const svg = `<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">${svgs.join('')}<circle cx="22" cy="22" r="10" fill="rgba(0,0,0,0.35)"/><text x="22" y="26" text-anchor="middle" font-size="12" fill="#fff">${total}</text></svg>`;
            return L.divIcon({ html: svg, className: 'cluster-marker', iconSize: L.point(44,44) });
          }
        });
        map.addLayer(markers.clusters[r.code]);
        overlaysControl.addOverlay(markers.clusters[r.code], r.name);
      }

      if (!markers[r.code]) markers[r.code] = {};
      const existing = markers[r.code];
      const seen = {};
      const protoIcon = await getBusIcon(r.color);
      for (const vehicle of vehicles) {
        seen[vehicle.info] = true;
        if (existing[vehicle.info]) {
          try {
            existing[vehicle.info]
              .setLatLng([vehicle.lat, vehicle.lng])
              .setRotationAngle(vehicle.direction || 0)
              .setOpacity(getSpeedOpacity(vehicle.speed))
              .bindPopup(buildPopupHtml(vehicle, pill));
            existing[vehicle.info].vehicleData = vehicle;
          } catch (e) {}
        } else {
          const m = L.marker([vehicle.lat, vehicle.lng], { icon: protoIcon, rotationAngle: vehicle.direction, routeColor: r.color })
            .bindPopup(buildPopupHtml(vehicle, pill));
          m.routeColor = r.color;
          m.vehicleData = vehicle;
          m.setOpacity(getSpeedOpacity(vehicle.speed));
          m.on('click', function () { openSidePanel(vehicle.info, vehicle.lat, vehicle.lng, vehicle); });
          markers.clusters[r.code].addLayer(m);
          markers[r.code][vehicle.info] = m;
        }
      }
      // remove stale markers
      Object.keys(existing).forEach(k => { if (!seen[k]) { try { markers.clusters[r.code].removeLayer(existing[k]); } catch (e){} delete markers[r.code][k]; }});
    }
    applyRouteFilter();
  }, 350);
  setTimeout(() => {
    setVehicleMarker(route, URL);
  }, 5000);

  // side panel helpers
  window.openSidePanel = function (id, lat, lon, vehicle) {
    const panel = document.getElementById('side-panel');
    if (!panel) return;
    window.lastSelected = id;
    // if mobile, show as bottom sheet
    if (window.innerWidth <= 600) panel.classList.add('bottom');
    panel.classList.add('open');
    document.getElementById('panel-title').innerText = 'Kendaraan ' + id;
    const body = document.getElementById('panel-body');
    const lastSeen = vehicle && (vehicle.timestamp || vehicle.last_update) ? new Date(vehicle.timestamp || vehicle.last_update) : new Date();
    const timeStr = lastSeen.toLocaleString();
    body.innerHTML = `
      <div class="vehicle-head">
        <img src="/images/bus-front.svg" alt="bus" class="vehicle-img" width="64" height="64" />
        <div class="vehicle-meta">
          <h4>${id}</h4>
          <div class="muted">Rute: ${route.name || '-'}</div>
          <div class="muted">Terakhir: ${timeStr}</div>
        </div>
      </div>
      <div class="vehicle-stats">
        <div><strong>Kecepatan:</strong> ${vehicle && vehicle.speed ? vehicle.speed + ' km/h' : '-'}</div>
        <div><strong>Arah:</strong> ${vehicle && vehicle.direction ? vehicle.direction : '-'}</div>
        <div><strong>Lokasi:</strong> ${lat.toFixed(5)}, ${lon.toFixed(5)}</div>
      </div>
      <div class="panel-actions">
        <a class="action-btn" href="https://maps.google.com?saddr=Current+Location&daddr=${lat},${lon}" target="_blank">Navigasi</a>
        <button class="action-btn" onclick="map.setView([${lat}, ${lon}], 17)">Center</button>
        <button class="action-btn" id="follow-btn" onclick="(function(b){b.classList.toggle('active'); window.following = window.following === '${id}' ? null : '${id}'; updateFollowBadge();})(document.getElementById('follow-btn'))">Follow</button>
        <button class="action-btn" onclick="navigator.clipboard && navigator.clipboard.writeText(window.location.origin + window.location.pathname + '?route=' + (route.link || 'all') + '&lat=${lat}&lon=${lon}');">Copy Link</button>
      </div>
    `;
    // update follow button state
    const fb = document.getElementById('follow-btn');
    if (fb) fb.classList.toggle('active', window.following === id);
    updateFollowBadge();
    // center map on marker
    map.setView([lat, lon], Math.max(map.getZoom(), 16));
  };
  window.closeSidePanel = function () {
    const panel = document.getElementById('side-panel');
    if (!panel) return;
    panel.classList.remove('open');
    panel.classList.remove('bottom');
  };

  // bottom-controls interactivity
  document.addEventListener('DOMContentLoaded', function () {
    const locateBtn = document.getElementById('btn-locate');
    const layersBtn = document.getElementById('btn-layers');
    const termBtn = document.getElementById('btn-terminals');
    const followBtn = document.getElementById('btn-follow');
    if (locateBtn) locateBtn.addEventListener('click', getLocation);
    if (termBtn) termBtn.addEventListener('click', function () { window.location = 'terminal.html'; });
    if (followBtn) followBtn.addEventListener('click', function () {
      if (window.following) { window.following = null; followBtn.classList.remove('active'); updateFollowBadge(); Toastify({ text: 'Stopped following', duration: 2000 }).showToast(); }
      else if (window.lastSelected) { window.following = window.lastSelected; followBtn.classList.add('active'); updateFollowBadge(); Toastify({ text: 'Following ' + window.following, duration: 2000 }).showToast(); }
      else { Toastify({ text: 'Pilih kendaraan dulu (tap marker)', duration: 2500 }).showToast(); }
    });
    if (layersBtn) layersBtn.addEventListener('click', function () {
      // toggle halte layer visibility
      if (map.hasLayer(halteMarkersGroup)) {
        map.removeLayer(halteMarkersGroup);
        layersBtn.classList.remove('active');
      } else {
        map.addLayer(halteMarkersGroup);
        layersBtn.classList.add('active');
      }
    });

    // swipe-to-close for side-panel (mobile)
    const panel = document.getElementById('side-panel');
    if (panel) {
      let startY = 0; let currentY = 0; let touching = false;
      panel.addEventListener('touchstart', function (e) { startY = e.touches[0].clientY; touching = true; });
      panel.addEventListener('touchmove', function (e) { if (!touching) return; currentY = e.touches[0].clientY; const dy = currentY - startY; if (dy > 0 && panel.classList.contains('bottom')) { panel.style.transform = `translateY(${dy}px)`; } });
      panel.addEventListener('touchend', function (e) { touching = false; const dy = currentY - startY; panel.style.transform = ''; if (dy > 80 && panel.classList.contains('bottom')) closeSidePanel(); });
    }

    // follow mode auto-center loop: center if following id found
    setInterval(function () {
      if (window.following) {
        // search markers for id
        for (const r in markers) {
          if (!markers[r]) continue;
          if (markers[r][window.following]) {
            try { map.setView(markers[r][window.following].getLatLng(), Math.max(map.getZoom(), 16)); } catch (e) {}
            break;
          }
        }
      }
    }, 2500);
  });
}

// hide and show markers on zoom changes
if (map.getZoom() > markerZoom) {
  map.addLayer(halteMarkersGroup);
}

map.on("zoomend", function () {
  if (trackerState.mapFocus) {
    if (map.hasLayer(halteMarkersGroup)) map.removeLayer(halteMarkersGroup);
    return;
  }
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
  if (userTrack.watchId) {
    stopUserTracking();
    return;
  }
  startUserTracking();
}

function startUserTracking() {
  if (!navigator.geolocation) {
    Toastify({
      text: "Geolocation is not supported by this browser.",
      style: {
        backgroud: "#FF0000",
      },
    }).showToast();
    return;
  }
  userTrack.hasCentered = false;
  userTrack.watchId = navigator.geolocation.watchPosition(showPosition, showError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 10000,
  });
  updateUserTrackBadge(true);
  Toastify({ text: "Tracking lokasi aktif", duration: 2000 }).showToast();
}

function stopUserTracking(silent) {
  if (userTrack.watchId) {
    navigator.geolocation.clearWatch(userTrack.watchId);
    userTrack.watchId = null;
  }
  updateUserTrackBadge(false);
  if (!silent) {
    Toastify({ text: "Tracking lokasi berhenti", duration: 2000 }).showToast();
  }
}

function showPosition(position) {
  const markerOption = {
    radius: 7,
    color: "#FFFFFF",
    weight: 3,
    fillColor: "#4285f4",
    fillOpacity: 1,
  };

  const latlng = [position.coords.latitude, position.coords.longitude];
  if (!markers.gps) {
    markers.gps = L.circleMarker(latlng, markerOption).addTo(map);
  } else {
    markers.gps.setLatLng(latlng);
  }

  if (!userTrack.accuracy) {
    userTrack.accuracy = L.circle(latlng, {
      radius: position.coords.accuracy || 0,
      color: "#60a5fa",
      fillColor: "#93c5fd",
      fillOpacity: 0.2,
      weight: 1,
    }).addTo(map);
  } else {
    userTrack.accuracy.setLatLng(latlng);
    if (position.coords.accuracy) userTrack.accuracy.setRadius(position.coords.accuracy);
  }

  if (!userTrack.path) {
    userTrack.path = L.polyline([latlng], {
      color: "#2563eb",
      weight: 3,
      opacity: 0.7,
    }).addTo(map);
  } else {
    userTrack.path.addLatLng(latlng);
  }

  if (!userTrack.hasCentered) {
    map.setView(latlng, 17);
    userTrack.hasCentered = true;
  }
  updateUserTrackBadge(true);
}

function showError(error) {
  const color = "#FF0000";
  if (userTrack.watchId) stopUserTracking(true);
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
