/**
 * WhiteStores Interactive 3D / Isometric India Network Map
 * Renders complete official India map with state boundaries,
 * handles city selection (Mumbai & Thane) with
 * stable unique IDs, verified locality data, and zero DOM flickering or glitches.
 */
(function () {
  'use strict';

  var NETWORK_DATA = {
    mumbai: {
      id: 'mumbai',
      cityName: 'Mumbai & Thane',
      statusBadge: 'Active Cluster',
      badgeClass: 'bg-[#A6F134]/25 text-[#013125] border-[#A6F134]/40',
      nodesCount: '9 Verified Hubs',
      headerTitle: 'Verified Nodes',
      footerPrompt: 'Select location to view catchment',
      footerText: '9 Verified Nodes',
      footerLiveDot: true,
      pinId: 'ws-pin-mumbai',
      stateSlug: 'maharashtra',
      activeRoutes: [],
      baseCoord: { x: 148.8, y: 318.8 },
      isUpcoming: false,
      locations: [
        { id: '01', name: 'Dahisar', region: 'Western Suburbs (North)', type: 'Cold Fulfilment Node', status: 'Active Node', catchment: '15-Min Quick Commerce & Aggregators', temp: '-18°C Stable', offset: { dx: -8, dy: -18 } },
        { id: '02', name: 'Vakola', region: 'Santacruz East / Airport Hub', type: 'Micro-Fulfilment Node', status: 'Active Node', catchment: 'Central & Western Commuter Belt', temp: '-18°C / +4°C Dual', offset: { dx: 6, dy: 6 } },
        { id: '03', name: 'Santacruz', region: 'Western Suburbs', type: 'Cold Storage & Dispatch', status: 'Active Node', catchment: 'Bandra-Juhu High Consumption Pockets', temp: '-18°C Stable', offset: { dx: -12, dy: 4 } },
        { id: '04', name: 'Chembur', region: 'Eastern Suburbs Corridor', type: 'Central Transit Node', status: 'Active Node', catchment: 'Freeway & Navi Mumbai Corridor', temp: '-18°C Stable', offset: { dx: 14, dy: 10 } },
        { id: '05', name: 'Oshiwara', region: 'Andheri West', type: 'Dark Store Dispatch Hub', status: 'Active Node', catchment: 'Lokhandwala & Link Road High Demand', temp: '-18°C Stable', offset: { dx: -14, dy: -6 } },
        { id: '06', name: 'Hiranandani Estate', region: 'Thane West (Ghodbunder)', type: 'Premium Cluster Node', status: 'Active Node', catchment: 'Thane High-Density Residential Nodes', temp: '-18°C Stable', offset: { dx: 18, dy: -20 } },
        { id: '07', name: 'Khopat (Thane West)', region: 'Central Thane', type: 'Omnichannel Hub', status: 'Active Node', catchment: 'Thane Central & Mulund Catchment', temp: '-18°C Stable', offset: { dx: 16, dy: -8 } },
        { id: '08', name: 'Fort', region: 'South Mumbai (CBD)', type: 'Commercial Dispatch Node', status: 'Active Node', catchment: 'South Mumbai Corporate & Premium D2C', temp: '-18°C Stable', offset: { dx: -4, dy: 22 } },
        { id: '09', name: 'Versova', region: 'Western Coastal Hub', type: 'Quick Kitchen & Storage', status: 'Active Node', catchment: 'Versova & Juhu High Density Zone', temp: '-18°C Stable', offset: { dx: -20, dy: -2 } }
      ]
    }
  };

  function initNetworkMap() {
    var sections = document.querySelectorAll('.ws-network-map-section');
    if (!sections.length) return;

    sections.forEach(function (container) {
      var currentCityId = 'mumbai';
      var activeLocationId = '01';

      // Query elements strictly within this section container
      var listEl = container.querySelector('.ws-map-location-list');
      var floatCard = container.querySelector('.ws-map-float-card');
      var cityPills = container.querySelectorAll('.ws-city-pill');
      var clusterBadge = container.querySelector('.ws-cluster-badge');
      var clusterCount = container.querySelector('.ws-cluster-count');
      var headerTitleEl = container.querySelector('.ws-cluster-header-title');
      var footerPromptEl = container.querySelector('.ws-cluster-prompt-text');
      var footerTextEl = container.querySelector('.ws-cluster-footer-text');
      var footerLiveDotEl = container.querySelector('.ws-cluster-live-dot');
      var subnodesLayer = container.querySelector('#ws-map-subnodes-layer');
      var statePaths = container.querySelectorAll('.ws-state-path');
      var mapPins = container.querySelectorAll('.ws-map-pin');
      var routeLines = container.querySelectorAll('.ws-route-line');

      // Update the Floating Card on the Map
      function updateFloatCard(loc, cityKey) {
        if (!floatCard) return;
        var cityData = NETWORK_DATA[cityKey || currentCityId];
        var badgeEl = floatCard.querySelector('.ws-float-card-badge');
        var tempEl = floatCard.querySelector('.ws-float-card-temp');
        var titleEl = floatCard.querySelector('.ws-float-card-title');
        var regionEl = floatCard.querySelector('.ws-float-card-region');
        // Mumbai & Thane (Active)
        if (badgeEl) {
          badgeEl.textContent = 'ACTIVE NODE';
          badgeEl.className = 'ws-float-card-badge text-[9px] font-extrabold uppercase tracking-widest text-[#013125] bg-[#A6F134]/30 px-2 py-0.5 rounded-full';
        }
        if (loc) {
          if (tempEl) tempEl.textContent = loc.temp;
          if (titleEl) titleEl.textContent = 'WHITE STORE / ' + loc.id + ' - ' + loc.name + ' ↗';
          if (regionEl) regionEl.textContent = loc.region + ' (Mumbai & Thane)';
        }
      }

      // Render Subnode markers cleanly inside SVG
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
          var dotColor = cityData.isUpcoming ? '#013125' : (isActive ? '#A6F134' : '#013125');
          var strokeColor = isActive ? '#013125' : '#FFFFFF';
          var radius = isActive ? '5' : '3.2';

          svgHtml += '<g class="ws-subnode-marker ' + (isActive ? 'is-active' : '') + '" data-id="' + loc.id + '" transform="translate(' + sx + ', ' + sy + ')" role="button" tabindex="0" aria-label="' + loc.name + '">';
          svgHtml += '  <circle cx="0" cy="0" r="' + radius + '" fill="' + dotColor + '" stroke="' + strokeColor + '" stroke-width="1.2" class="transition-all duration-200"/>';
          svgHtml += '</g>';
        });
        subnodesLayer.innerHTML = svgHtml;

        // Attach listeners to subnodes
        var subnodeEls = subnodesLayer.querySelectorAll('.ws-subnode-marker');
        subnodeEls.forEach(function (marker) {
          marker.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = marker.getAttribute('data-id');
            setActiveLocation(id);
          });
        });
      }

      // Set Active Locality inside currently selected city
      function setActiveLocation(id) {
        var cityData = NETWORK_DATA[currentCityId];
        if (!cityData.locations || cityData.locations.length === 0) return;

        activeLocationId = id;
        var loc = cityData.locations.find(function (item) { return item.id === id; });
        if (!loc && cityData.locations.length > 0) {
          loc = cityData.locations[0];
          activeLocationId = loc.id;
        }

        // 1. Update List UI cleanly
        if (listEl) {
          var items = listEl.querySelectorAll('.ws-loc-item');
          items.forEach(function (item) {
            if (item.getAttribute('data-id') === activeLocationId) {
              item.classList.add('is-active');
              item.setAttribute('aria-selected', 'true');
            } else {
              item.classList.remove('is-active');
              item.setAttribute('aria-selected', 'false');
            }
          });
        }

        // 2. Update Subnode markers UI in SVG
        if (subnodesLayer) {
          var markers = subnodesLayer.querySelectorAll('.ws-subnode-marker');
          markers.forEach(function (marker) {
            var mCircle = marker.querySelector('circle');
            if (marker.getAttribute('data-id') === activeLocationId) {
              marker.classList.add('is-active');
              if (mCircle) {
                mCircle.setAttribute('r', '5.5');
                mCircle.setAttribute('fill', cityData.isUpcoming ? '#A6F134' : '#A6F134');
                mCircle.setAttribute('stroke', '#013125');
              }
            } else {
              marker.classList.remove('is-active');
              if (mCircle) {
                mCircle.setAttribute('r', '3.2');
                mCircle.setAttribute('fill', '#013125');
                mCircle.setAttribute('stroke', '#FFFFFF');
              }
            }
          });
        }

        // 3. Update Floating Card
        if (loc) {
          updateFloatCard(loc, currentCityId);
        }
      }

      // Render the right-side information panel based on selected city
      function renderPanel(cityKey) {
        if (!listEl) return;
        var cityData = NETWORK_DATA[cityKey];

        // Mumbai & Thane: Render verified locations list
        var listHtml = '';
        cityData.locations.forEach(function (loc) {
            var isActive = loc.id === activeLocationId;
            var numBg = 'bg-[#F0F4F0] text-[#69736D]';
            listHtml += '<li class="ws-loc-item ' + (isActive ? 'is-active' : '') + '" data-id="' + loc.id + '" role="option" aria-selected="' + (isActive ? 'true' : 'false') + '" tabindex="0">';
            listHtml += '  <div class="flex items-center gap-2.5 min-w-0">';
            listHtml += '    <span class="ws-loc-number w-6 h-6 rounded-md flex items-center justify-center text-[10.5px] font-bold ' + numBg + ' flex-shrink-0 transition-colors">' + loc.id + '</span>';
            listHtml += '    <div class="flex flex-col min-w-0">';
            listHtml += '      <span class="ws-loc-name text-xs sm:text-[13px] font-bold text-[#252C29] transition-colors truncate">' + loc.name + '</span>';
            listHtml += '      <span class="text-[10px] text-[#69736D] truncate leading-tight">' + loc.region + '</span>';
            listHtml += '    </div>';
            listHtml += '  </div>';
            listHtml += '  <span class="ws-loc-arrow text-[#69736D] text-xs font-bold transition-transform flex-shrink-0">↗</span>';
            listHtml += '</li>';
          });
          listEl.innerHTML = listHtml;

          // Attach listeners to items
          var itemEls = listEl.querySelectorAll('.ws-loc-item');
          itemEls.forEach(function (item) {
            item.addEventListener('click', function () {
              var id = item.getAttribute('data-id');
              setActiveLocation(id);
            });
            item.addEventListener('keydown', function (e) {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var id = item.getAttribute('data-id');
                setActiveLocation(id);
              }
            });
          });
      }

      // Core City Switcher: Mumbai & Thane
      function selectCity(cityId) {
        if (!NETWORK_DATA[cityId]) return;
        currentCityId = cityId;
        var cityData = NETWORK_DATA[cityId];

        if (cityData.locations && cityData.locations.length > 0) {
          activeLocationId = cityData.locations[0].id;
        } else {
          activeLocationId = null;
        }

        // 1. Update City Pill buttons
        cityPills.forEach(function (pill) {
          if (pill.getAttribute('data-city') === cityId) {
            pill.classList.add('is-active');
            pill.setAttribute('aria-pressed', 'true');
          } else {
            pill.classList.remove('is-active');
            pill.setAttribute('aria-pressed', 'false');
          }
        });

        // 2. Update Map Pin markers (stable, fixed coordinate highlight)
        mapPins.forEach(function (pin) {
          if (pin.getAttribute('data-city') === cityId) {
            pin.classList.add('is-active');
          } else {
            pin.classList.remove('is-active');
          }
        });

        // 3. Update State Highlight in SVG
        statePaths.forEach(function (path) {
          if (path.getAttribute('data-slug') === cityData.stateSlug) {
            path.classList.add('is-active-state');
          } else {
            path.classList.remove('is-active-state');
          }
        });

        // 4. Update Connecting Route Lines
        routeLines.forEach(function (route) {
          var rId = route.id;
          if (cityData.activeRoutes && cityData.activeRoutes.indexOf(rId) !== -1) {
            route.classList.add('is-active');
            route.setAttribute('stroke', '#A6F134');
            route.setAttribute('stroke-width', '2.2');
          } else {
            route.classList.remove('is-active');
            route.setAttribute('stroke', '#7BA684');
            route.setAttribute('stroke-width', '1.5');
          }
        });

        // 5. Update Metadata Text & Badges
        if (clusterBadge) {
          clusterBadge.textContent = cityData.statusBadge;
          clusterBadge.className = 'ws-cluster-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ' + cityData.badgeClass;
        }
        if (clusterCount) {
          clusterCount.textContent = cityData.nodesCount;
        }
        if (headerTitleEl) {
          headerTitleEl.textContent = cityData.headerTitle;
        }
        if (footerPromptEl) {
          footerPromptEl.textContent = cityData.footerPrompt;
        }
        if (footerTextEl) {
          footerTextEl.textContent = cityData.footerText;
        }
        if (footerLiveDotEl) {
          footerLiveDotEl.style.display = cityData.footerLiveDot ? 'inline' : 'none';
        }

        // 6. Update Subnodes and Right Panel
        updateSubnodes(cityId);
        renderPanel(cityId);

        // 7. Update Floating Card
        var firstLoc = (cityData.locations && cityData.locations.length > 0) ? cityData.locations[0] : null;
        updateFloatCard(firstLoc, cityId);
      }

      // Pill Click Handlers
      cityPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          var targetCity = pill.getAttribute('data-city');
          if (targetCity && targetCity !== currentCityId) {
            selectCity(targetCity);
          }
        });
      });

      // Map Pin Direct Click Handlers
      mapPins.forEach(function (pin) {
        pin.addEventListener('click', function () {
          var targetCity = pin.getAttribute('data-city');
          if (targetCity && targetCity !== currentCityId) {
            selectCity(targetCity);
          }
        });
      });

      // State Boundary Click Handlers (e.g. clicking Maharashtra, Karnataka, or Delhi)
      statePaths.forEach(function (path) {
        path.addEventListener('click', function () {
          var slug = path.getAttribute('data-slug');
          if (slug === 'maharashtra' && currentCityId !== 'mumbai') {
            selectCity('mumbai');
          }
        });
      });

      // Initial Selection: Mumbai & Thane
      selectCity('mumbai');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetworkMap);
  } else {
    initNetworkMap();
  }
})();