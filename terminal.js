// terminal.js - list halte yang dianggap terminal (banyak transit)
(async function () {
  function getData(url) {
    var result = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    if (xhr.status === 200) result = JSON.parse(xhr.responseText);
    return result;
  }
  const data = getData('./halte.json').halte;
  const terminals = data.filter(h => h.transit && h.transit.length >= 4);
  const container = document.getElementById('terminal-list');
  container.innerHTML = '';
  if (terminals.length === 0) {
    container.innerHTML = '<p>Tidak ada terminal terdeteksi.</p>';
    return;
  }
  const ul = document.createElement('ul');
  terminals.forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="map.html?route=all&lat=${t.lat}&lon=${t.lon}"><strong>${t.nama}</strong></a><div class="muted">Transits: ${t.transit.length}</div>`;
    ul.appendChild(li);
  });
  container.appendChild(ul);
})();