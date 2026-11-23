/**
 * WhiteStores Interactive India Network Map
 * City selection: Mumbai Metropolitan, Bengaluru, Delhi NCR
 * Shows live / upcoming store locations only — no expansion promises.
 */
(function () {
  'use strict';

  var TEMP_READY = '-18°C Ready';

  var CITY_LABELS = {
    mumbai: 'Mumbai',
    bangalore: 'Bengaluru',
    delhi: 'Delhi'
  };

  var NETWORK_DATA = {
    mumbai: {
      id: 'mumbai',
      cityName: 'Mumbai Metropolitan',
      nodesCount: '9 stores',
      headerTitle: 'Stores',
      footerPrompt: 'Select a store',
      footerText: '9 stores',
      pinId: 'ws-pin-mumbai',
      stateSlug: 'maharashtra',
      activeRoutes: ['ws-route-mumbai-bangalore', 'ws-route-mumbai-delhi'],
      baseCoord: { x: 148.8, y: 318.8 },
      locations: [
        { id: '01', name: 'Dahisar', region: 'Western Suburbs', live: true, offset: { dx: -8, dy: -18 } },
        { id: '02', name: 'Vakola', region: 'Santacruz East', live: true, offset: { dx: 6, dy: 6 } },
        { id: '03', name: 'Santacruz', region: 'Western Suburbs', live: true, offset: { dx: -12, dy: 4 } },
        { id: '04', name: 'Chembur', region: 'Eastern Suburbs', live: true, offset: { dx: 14, dy: 10 } },
        { id: '05', name: 'Oshiwara', region: 'Andheri West', live: true, offset: { dx: -14, dy: -6 } },
        { id: '06', name: 'Hiranandani Estate', region: 'Thane West', live: true, offset: { dx: 18, dy: -20 } },
        { id: '07', name: 'Khopat', region: 'Thane West', live: true, offset: { dx: 16, dy: -8 } },
        { id: '08', name: 'Fort', region: 'South Mumbai', live: true, offset: { dx: -4, dy: 22 } },
        { id: '09', name: 'Versova', region: 'Western Coastal', live: true, offset: { dx: -20, dy: -2 } }
      ]
    },
    bangalore: {
      id: 'bangalore',
      cityName: 'Bengaluru',
      nodesCount: '6 stores',
      headerTitle: 'Stores',
      footerPrompt: 'Select a store',
      footerText: '6 stores',
      pinId: 'ws-pin-bangalore',
      stateSlug: 'karnataka',
      activeRoutes: ['ws-route-mumbai-bangalore', 'ws-route-delhi-bangalore'],
      baseCoord: { x: 221.1, y: 416.3 },
      locations: [
        { id: '01', name: 'Indiranagar', region: 'East Bengaluru', live: true, offset: { dx: 10, dy: -8 } },
        { id: '02', name: 'Koramangala', region: 'South-East', live: false, offset: { dx: 6, dy: 8 } },
        { id: '03', name: 'HSR Layout', region: 'South', live: false, offset: { dx: 8, dy: 16 } },
        { id: '04', name: 'Whitefield', region: 'East Tech Corridor', live: false, offset: { dx: 20, dy: -4 } },
        { id: '05', name: 'Bellandur', region: 'Outer Ring Road', live: false, offset: { dx: 14, dy: 6 } },
        { id: '06', name: 'Marathahalli', region: 'East', live: false, offset: { dx: 18, dy: 2 } }
      ]
    },
    delhi: {
      id: 'delhi',
      cityName: 'Delhi NCR',
      nodesCount: '6 stores',
      headerTitle: 'Stores',
      footerPrompt: 'Select a store',
      footerText: '6 stores',
      pinId: 'ws-pin-delhi',
      stateSlug: 'delhi',
      activeRoutes: ['ws-route-mumbai-delhi', 'ws-route-delhi-bangalore'],
      baseCoord: { x: 215.2, y: 160.2 },
      locations: [
        { id: '01', name: 'Hauz Khas', region: 'Delhi', live: true, offset: { dx: -4, dy: -6 } },
        { id: '02', name: 'Sector 50', region: 'Noida', live: false, offset: { dx: 14, dy: 2 } },
        { id: '03', name: 'South Extension', region: 'Delhi', live: false, offset: { dx: 2, dy: 10 } },
        { id: '04', name: 'Rajouri Garden', region: 'Delhi', live: false, offset: { dx: -14, dy: 2 } },
        { id: '05', name: 'DLF Phase 4', region: 'Gurgaon', live: false, offset: { dx: -10, dy: 14 } },
        { id: '06', name: 'Sohna Road', region: 'Gurgaon', live: false, offset: { dx: -6, dy: 20 } }
      ]
    }
  };

  function initNetworkMap() {
    var sections = document.querySelectorAll('.ws-network-map-section');
    if (!sections.length) return;

    sections.forEach(function (container) {
      var currentCityId = 'mumbai';
      var activeLocationId = '01';

      var listEl = container.querySelector('.ws-map-location-list');
      var floatCard = container.querySelector('.ws-map-float-card');
      var clusterCount = container.querySelector('.ws-cluster-count');
      var headerTitleEl = container.querySelector('.ws-cluster-header-title');
      var footerPromptEl = container.querySelector('.ws-cluster-prompt-text');
      var footerTextEl = container.querySelector('.ws-cluster-footer-text');
      var locationDropdowns = container.querySelectorAll('.ws-location-dd');
      var subnodesLayer = container.querySelector('#ws-map-subnodes-layer');
      var statePaths = container.querySelectorAll('.ws-state-path');
      var mapPins = container.querySelectorAll('.ws-map-pin');
      var routeLines = container.querySelectorAll('.ws-route-line');
      var mapSvg = container.querySelector('.ws-map-svg');
      var storesToggle = container.querySelector('.ws-map-stores-toggle');
      var storesClose = container.querySelector('.ws-map-stores-close');
      var storesBackdrop = container.querySelector('.ws-map-stores-backdrop');
      var defaultViewBox = { x: 0, y: 0, width: 600, height: 540 };
      var zoomRaf = 0;
      var currentView = { x: 0, y: 0, width: 600, height: 540 };
      var storesScrollY = 0;

      function lockPageScroll() {
        storesScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        document.documentElement.classList.add('ws-menu-locked');
        document.body.classList.add('ws-menu-locked');
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + storesScrollY + 'px';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      }

      function unlockPageScroll() {
        document.documentElement.classList.remove('ws-menu-locked');
        document.body.classList.remove('ws-menu-locked');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        var html = document.documentElement;
        var prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, storesScrollY);
        html.style.scrollBehavior = prev;
      }

      function setStoresOpen(open) {
        var wasOpen = container.classList.contains('is-stores-open');
        container.classList.toggle('is-stores-open', open);
        if (storesToggle) storesToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (storesToggle) {
          var icon = storesToggle.querySelector('.ws-map-stores-toggle-icon');
          if (icon) icon.textContent = open ? 'chevron_right' : 'chevron_left';
        }
        if (storesBackdrop) {
          if (open) storesBackdrop.removeAttribute('hidden');
          else storesBackdrop.setAttribute('hidden', '');
        }
        // Stop background site scroll while mini menu is open
        if (open && !wasOpen) lockPageScroll();
        else if (!open && wasOpen) unlockPageScroll();
      }

      if (storesToggle) {
        storesToggle.addEventListener('click', function () {
          setStoresOpen(!container.classList.contains('is-stores-open'));
        });
      }
      if (storesClose) {
        storesClose.addEventListener('click', function () {
          setStoresOpen(false);
        });
      }
      if (storesBackdrop) {
        storesBackdrop.addEventListener('click', function () {
          setStoresOpen(false);
        });
      }
      // Close drawer on desktop resize
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) setStoresOpen(false);
      });

      function setViewBox(box) {
        if (!mapSvg) return;
        currentView = box;
        mapSvg.setAttribute(
          'viewBox',
          box.x.toFixed(2) + ' ' + box.y.toFixed(2) + ' ' + box.width.toFixed(2) + ' ' + box.height.toFixed(2)
        );
      }

      function animateViewBox(target) {
        if (!mapSvg) return;
        if (zoomRaf) cancelAnimationFrame(zoomRaf);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setViewBox(target);
          return;
        }
        var start = {
          x: currentView.x,
          y: currentView.y,
          width: currentView.width,
          height: currentView.height
        };
        var t0 = null;
        var dur = 420;
        function ease(t) {
          return 1 - Math.pow(1 - t, 3);
        }
        function frame(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var e = ease(p);
          setViewBox({
            x: start.x + (target.x - start.x) * e,
            y: start.y + (target.y - start.y) * e,
            width: start.width + (target.width - start.width) * e,
            height: start.height + (target.height - start.height) * e
          });
          if (p < 1) zoomRaf = requestAnimationFrame(frame);
          else zoomRaf = 0;
        }
        zoomRaf = requestAnimationFrame(frame);
      }

      function getCityFocusBox(cityData) {
        var xs = [];
        var ys = [];
        var statePath = container.querySelector('.ws-state-path[data-slug="' + cityData.stateSlug + '"]');

        if (cityData.locations && cityData.locations.length) {
          cityData.locations.forEach(function (loc) {
            xs.push(cityData.baseCoord.x + loc.offset.dx);
            ys.push(cityData.baseCoord.y + loc.offset.dy);
          });
        }
        xs.push(cityData.baseCoord.x);
        ys.push(cityData.baseCoord.y);

        // Tiny states (Delhi): use state shape so outline fills the frame
        if (statePath) {
          try {
            var bb = statePath.getBBox();
            if (bb.width > 0 && bb.height > 0 && (bb.width < 70 || bb.height < 70)) {
              xs.push(bb.x, bb.x + bb.width);
              ys.push(bb.y, bb.y + bb.height);
            }
          } catch (err) { /* ignore */ }
        }

        var minX = Math.min.apply(null, xs);
        var maxX = Math.max.apply(null, xs);
        var minY = Math.min.apply(null, ys);
        var maxY = Math.max.apply(null, ys);
        var pad = 120;
        var w = Math.max(maxX - minX + pad * 2, 280);
        var h = Math.max(maxY - minY + pad * 2, 280);
        var cx = (minX + maxX) / 2;
        var cy = (minY + maxY) / 2;
        var aspect = defaultViewBox.width / defaultViewBox.height;
        if (w / h > aspect) h = w / aspect;
        else w = h * aspect;

        // Mild zoom — keep more of India visible
        var maxW = 460;
        if (w > maxW) {
          var s = maxW / w;
          w = maxW;
          h = h * s;
        }

        return { x: cx - w / 2, y: cy - h / 2, width: w, height: h };
      }

      function focusCityOnMap(cityData) {
        var target = getCityFocusBox(cityData);
        animateViewBox(target);
        // Keep store dots above state/routes after zoom
        if (subnodesLayer && subnodesLayer.parentNode) {
          subnodesLayer.parentNode.appendChild(subnodesLayer);
        }
      }

      function updateFloatCard(loc) {
        if (!floatCard || !loc) return;
        var tempEl = floatCard.querySelector('.ws-float-card-temp');
        var titleEl = floatCard.querySelector('.ws-float-card-title');
        var regionEl = floatCard.querySelector('.ws-float-card-region');
        var typeEl = floatCard.querySelector('.ws-float-card-type');
        var statusWrap = floatCard.querySelector('.ws-float-card-status-wrapper');

        if (tempEl) tempEl.textContent = TEMP_READY;
        if (titleEl) titleEl.textContent = 'WHITE STORE / ' + loc.id + ' — ' + loc.name;
        if (regionEl) {
          regionEl.textContent = '';
          regionEl.style.display = 'none';
        }
        if (typeEl) typeEl.style.display = 'none';
        if (statusWrap) statusWrap.style.display = 'none';
      }

      function updateSubnodes(cityKey) {
        if (!subnodesLayer) return;
        var cityData = NETWORK_DATA[cityKey];
        if (!cityData.locations || cityData.locations.length === 0) {
          subnodesLayer.innerHTML = '';
          return;
        }

        var svgHtml = '';
        cityData.locations.forEach(function (loc) {
          var sx = cityData.baseCoord.x + loc.offset.dx;
          var sy = cityData.baseCoord.y + loc.offset.dy;
          var isActive = loc.id === activeLocationId;
          var dotColor = isActive ? '#A6F134' : (loc.live ? '#013125' : '#69736D');
          var strokeColor = isActive ? '#013125' : '#FFFFFF';
          var radius = isActive ? '4.2' : '2.8';
          var label = loc.name.replace(/&/g, '&amp;').replace(/</g, '&lt;');

          svgHtml += '<g class="ws-subnode-marker ' + (isActive ? 'is-active' : '') + (loc.live ? ' is-live' : ' is-upcoming') + '" data-id="' + loc.id + '" transform="translate(' + sx + ', ' + sy + ')" role="button" tabindex="0" aria-label="' + loc.name + '">';
          svgHtml += '  <circle cx="0" cy="0" r="' + radius + '" fill="' + dotColor + '" stroke="' + strokeColor + '" stroke-width="1.1"/>';
          svgHtml += '  <text x="0" y="-7.5" text-anchor="middle" class="ws-subnode-label" font-family="Manrope, sans-serif" font-size="5.5" font-weight="700" fill="#013125">' + label + '</text>';
          svgHtml += '</g>';
        });
        subnodesLayer.innerHTML = svgHtml;

        var subnodeEls = subnodesLayer.querySelectorAll('.ws-subnode-marker');
        subnodeEls.forEach(function (marker) {
          marker.addEventListener('click', function (e) {
            e.stopPropagation();
            setActiveLocation(marker.getAttribute('data-id'));
          });
        });
      }

      function setActiveLocation(id) {
        var cityData = NETWORK_DATA[currentCityId];
        if (!cityData.locations || cityData.locations.length === 0) return;

        activeLocationId = id;
        var loc = cityData.locations.find(function (item) { return item.id === id; });
        if (!loc && cityData.locations.length > 0) {
          loc = cityData.locations[0];
          activeLocationId = loc.id;
        }

        if (listEl) {
          var items = listEl.querySelectorAll('.ws-loc-item');
          items.forEach(function (item) {
            var on = item.getAttribute('data-id') === activeLocationId;
            item.classList.toggle('is-active', on);
            item.setAttribute('aria-selected', on ? 'true' : 'false');
          });
        }

        if (subnodesLayer) {
          var markers = subnodesLayer.querySelectorAll('.ws-subnode-marker');
          markers.forEach(function (marker) {
            var mCircle = marker.querySelector('circle');
            var mid = marker.getAttribute('data-id');
            var mLoc = cityData.locations.find(function (l) { return l.id === mid; });
            var on = mid === activeLocationId;
            marker.classList.toggle('is-active', on);
            if (mCircle) {
              mCircle.setAttribute('r', on ? '4.5' : '2.8');
              mCircle.setAttribute('fill', on ? '#A6F134' : (mLoc && mLoc.live ? '#013125' : '#69736D'));
              mCircle.setAttribute('stroke', on ? '#013125' : '#FFFFFF');
            }
          });
        }

        if (loc) updateFloatCard(loc);
        syncCityDropdownActive();

        // Highlight selected store on map graph (bring marker forward)
        if (subnodesLayer && loc) {
          var activeMarker = subnodesLayer.querySelector('.ws-subnode-marker[data-id="' + loc.id + '"]');
          if (activeMarker && activeMarker.parentNode) {
            activeMarker.parentNode.appendChild(activeMarker);
          }
        }

        // Soft focus selected store on map
        if (loc && cityData.baseCoord) {
          var sx = cityData.baseCoord.x + loc.offset.dx;
          var sy = cityData.baseCoord.y + loc.offset.dy;
          var focusSize = window.innerWidth < 1024 ? 220 : 300;
          animateViewBox({
            x: sx - focusSize / 2,
            y: sy - focusSize / 2,
            width: focusSize,
            height: focusSize * (defaultViewBox.height / defaultViewBox.width)
          });
        }

        // Mobile: close stores mini-menu so map + selected pin are visible
        if (window.innerWidth < 1024 && container.classList.contains('is-stores-open')) {
          setStoresOpen(false);
        }
      }

      function renderPanel(cityKey) {
        if (!listEl) return;
        var cityData = NETWORK_DATA[cityKey];
        var listHtml = '';

        cityData.locations.forEach(function (loc) {
          var isActive = loc.id === activeLocationId;
          listHtml += '<li class="ws-loc-item ' + (isActive ? 'is-active' : '') + '" data-id="' + loc.id + '" role="option" aria-selected="' + (isActive ? 'true' : 'false') + '" tabindex="0">';
          listHtml += '  <div class="flex items-center gap-2.5 min-w-0">';
          listHtml += '    <span class="ws-loc-number w-6 h-6 rounded-md flex items-center justify-center text-[10.5px] font-bold bg-[#F0F4F0] text-[#69736D] flex-shrink-0 transition-colors">' + loc.id + '</span>';
          listHtml += '    <div class="flex flex-col min-w-0">';
          listHtml += '      <span class="ws-loc-name text-xs sm:text-[13px] font-bold text-[#252C29] transition-colors truncate">' + loc.name + '</span>';
          listHtml += '      <span class="text-[10px] text-[#69736D] truncate leading-tight">' + loc.region + '</span>';
          listHtml += '    </div>';
          listHtml += '  </div>';
          listHtml += '  <span class="ws-loc-arrow text-[#69736D] text-xs font-bold transition-transform flex-shrink-0">↗</span>';
          listHtml += '</li>';
        });
        listEl.innerHTML = listHtml;

        var itemEls = listEl.querySelectorAll('.ws-loc-item');
        itemEls.forEach(function (item) {
          item.addEventListener('click', function () {
            setActiveLocation(item.getAttribute('data-id'));
          });
          item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveLocation(item.getAttribute('data-id'));
            }
          });
        });
      }

      function selectCity(cityId, options) {
        if (!NETWORK_DATA[cityId]) return;
        options = options || {};
        currentCityId = cityId;
        var cityData = NETWORK_DATA[cityId];

        activeLocationId = (cityData.locations && cityData.locations.length > 0)
          ? cityData.locations[0].id
          : null;

        mapPins.forEach(function (pin) {
          pin.classList.toggle('is-active', pin.getAttribute('data-city') === cityId);
        });

        var statesLayer = container.querySelector('#ws-map-states-layer');
        statePaths.forEach(function (path) {
          var on = path.getAttribute('data-slug') === cityData.stateSlug;
          path.classList.toggle('is-active-state', on);
          // SVG stacking = DOM order — move selected state to top
          if (on && statesLayer) {
            statesLayer.appendChild(path);
          }
        });

        routeLines.forEach(function (route) {
          var on = cityData.activeRoutes && cityData.activeRoutes.indexOf(route.id) !== -1;
          route.classList.toggle('is-active', on);
          route.setAttribute('stroke', on ? '#A6F134' : '#7BA684');
          route.setAttribute('stroke-width', on ? '2.2' : '1.5');
        });

        if (clusterCount) clusterCount.textContent = cityData.nodesCount;
        if (headerTitleEl) headerTitleEl.textContent = cityData.headerTitle;
        if (footerPromptEl) footerPromptEl.textContent = cityData.footerPrompt;
        if (footerTextEl) footerTextEl.textContent = cityData.footerText;

        updateSubnodes(cityId);
        renderPanel(cityId);

        if (options.skipZoom) {
          setViewBox({
            x: defaultViewBox.x,
            y: defaultViewBox.y,
            width: defaultViewBox.width,
            height: defaultViewBox.height
          });
          if (subnodesLayer && subnodesLayer.parentNode) {
            subnodesLayer.parentNode.appendChild(subnodesLayer);
          }
        } else {
          focusCityOnMap(cityData);
        }

        var firstLoc = (cityData.locations && cityData.locations.length > 0) ? cityData.locations[0] : null;
        if (firstLoc) updateFloatCard(firstLoc);
        syncCityDropdownActive();
      }

      function closeAllCityDropdowns() {
        locationDropdowns.forEach(function (dd) {
          dd.classList.remove('is-open');
          var btn = dd.querySelector('.ws-city-dd-btn');
          var menu = dd.querySelector('.ws-city-dd-menu');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          if (menu) menu.setAttribute('hidden', '');
        });
      }

      function syncCityDropdownActive() {
        var label = CITY_LABELS[currentCityId] || 'Location';
        locationDropdowns.forEach(function (dd) {
          var labelEl = dd.querySelector('.ws-location-dd-label');
          if (labelEl) labelEl.textContent = label;
          dd.querySelectorAll('.ws-city-dd-option').forEach(function (opt) {
            var on = opt.getAttribute('data-city') === currentCityId;
            opt.classList.toggle('is-active', on);
            opt.setAttribute('aria-selected', on ? 'true' : 'false');
          });
        });
      }

      locationDropdowns.forEach(function (dd) {
        var btn = dd.querySelector('.ws-city-dd-btn');
        var menu = dd.querySelector('.ws-city-dd-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var willOpen = !dd.classList.contains('is-open');
          closeAllCityDropdowns();
          if (willOpen) {
            dd.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            menu.removeAttribute('hidden');
          }
        });
      });

      container.addEventListener('click', function (e) {
        var opt = e.target.closest('.ws-city-dd-option');
        if (!opt || !container.contains(opt)) return;
        e.preventDefault();
        e.stopPropagation();
        var cityKey = opt.getAttribute('data-city');
        if (!cityKey) return;
        if (cityKey !== currentCityId) selectCity(cityKey);
        else syncCityDropdownActive();
        closeAllCityDropdowns();
      });

      document.addEventListener('click', function (e) {
        if (!e.target.closest('.ws-location-dd')) closeAllCityDropdowns();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAllCityDropdowns();
      });

      mapPins.forEach(function (pin) {
        pin.addEventListener('click', function () {
          var targetCity = pin.getAttribute('data-city');
          if (targetCity && targetCity !== currentCityId) selectCity(targetCity);
        });
      });

      statePaths.forEach(function (path) {
        path.addEventListener('click', function () {
          var slug = path.getAttribute('data-slug');
          if (slug === 'maharashtra' && currentCityId !== 'mumbai') selectCity('mumbai');
          if (slug === 'karnataka' && currentCityId !== 'bangalore') selectCity('bangalore');
          if (slug === 'delhi' && currentCityId !== 'delhi') selectCity('delhi');
        });
      });

      // Default: full India map visible
      selectCity('mumbai', { skipZoom: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetworkMap);
  } else {
    initNetworkMap();
  }
})();
