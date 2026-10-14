function initLocations() {
  const locationItems = [...document.querySelectorAll('.loc-card')];
  const mapEl = document.getElementById('loc-map');

  if (!locationItems.length) return;

  const isMobileLayout = () =>
    window.matchMedia('(max-width: 899px)').matches;

  let map = null;
  const markers = new Map();

  const PIN_SVG =
    '<svg class="loc-marker__icon" viewBox="0 0 36 46" aria-hidden="true"><path class="loc-marker__shape" d="M18 1C8.6 1 1 8.6 1 18c0 12.5 17 27 17 27s17-14.5 17-27C35 8.6 27.4 1 18 1z"/><circle class="loc-marker__dot" cx="18" cy="18" r="6.5"/></svg>';

  const pinIcon = (active = false) =>
    L.divIcon({
      className: `loc-marker${active ? ' loc-marker--active' : ''}`,
      html: PIN_SVG,
      iconSize: [36, 46],
      iconAnchor: [18, 46],
    });

  function fitVisibleMarkers() {
    if (!map) return;

    const points = [...markers.values()].map((marker) =>
      marker.getLatLng()
    );

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        padding: [40, 40],
      });
    }
  }

  function closeCard(item) {
    item.classList.remove('loc-card--active');

    item
      .querySelector('.loc-card__head')
      ?.setAttribute('aria-expanded', 'false');

    const more = item.querySelector('.loc-card__more');

    if (more) {
      more.hidden = true;
      more.removeAttribute('style');
    }

    const marker = markers.get(item);

    if (marker) {
      marker.setIcon(pinIcon(false));
      marker.setZIndexOffset(0);
    }
  }

  function openCard(item, { scrollToMap = false } = {}) {
    item.classList.add('loc-card--active');

    item
      .querySelector('.loc-card__head')
      ?.setAttribute('aria-expanded', 'true');

    const more = item.querySelector('.loc-card__more');

    if (more) {
      more.hidden = false;
    }

    const marker = markers.get(item);

    if (marker && map) {
      marker.setIcon(pinIcon(true));
      marker.setZIndexOffset(1000);

      map.flyTo(marker.getLatLng(), 14, {
        duration: 0.6,
      });

      if (scrollToMap && mapEl && isMobileLayout()) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function selectCard(item, options) {
    locationItems.forEach(closeCard);
    openCard(item, options);
  }

  function initMap() {
    if (!mapEl || typeof L === 'undefined') return;

    map = L.map(mapEl, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
      tap: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    locationItems.forEach((item) => {
      const lat = parseFloat(item.dataset.lat);
      const lng = parseFloat(item.dataset.lng);

      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const name =
        item.querySelector('.loc-card__name')?.textContent.trim() ||
        'Location';

      const marker = L.marker([lat, lng], {
        icon: pinIcon(false),
        title: name,
        alt: name,
      }).addTo(map);

      marker.on('click', () => {
        selectCard(item, { scrollToMap: false });

        item.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });

      markers.set(item, marker);
    });

    fitVisibleMarkers();

    let resizeTimer;
    let firstResize = true;

    new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize();

        const hasActive = locationItems.some((i) =>
          i.classList.contains('loc-card--active')
        );

        if (!hasActive || firstResize) fitVisibleMarkers();

        firstResize = false;
      }, 100);
    }).observe(mapEl);
  }

  initMap();

  locationItems.forEach((item) => {
    closeCard(item);

    item
      .querySelector('.loc-card__head')
      ?.addEventListener('click', () => {
        const wasOpen = item.classList.contains('loc-card--active');

        locationItems.forEach(closeCard);

        if (wasOpen) {
          fitVisibleMarkers();
        } else {
          openCard(item, { scrollToMap: true });
        }
      });
  });
}

initLocations();