let map;
let markers = [];
let currentFilter = 'all';
let allPlaces = [];

const icons = {
  clinic: L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  hospital: L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048949.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  food_bank: L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  drinking_water: L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/727/727790.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  })
};

// Initialize filter buttons
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Apply filter
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  // Allow Enter key in location search
  document.getElementById('location').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      findResources();
    }
  });
});

async function findResources() {
  const location = document.getElementById('location').value.trim();
  
  if (!location) {
    alert('Please enter a location to search');
    return;
  }

  // Show loading state
  const resultsInfo = document.getElementById('resultsInfo');
  resultsInfo.classList.add('show');
  document.getElementById('resultsText').innerHTML = '🔄 Searching for resources...';

  try {
    const res = await fetch(`/resources?location=${encodeURIComponent(location)}`);
    
    if (!res.ok) {
      throw new Error('Location not found');
    }
    
    const data = await res.json();
    allPlaces = data.places;

    if (!map) {
      map = L.map("map").setView([data.lat, data.lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
      }).addTo(map);
    } else {
      map.setView([data.lat, data.lng], 13);
    }

    // Clear existing markers
    clearMarkers();

    // Add user location marker
    L.marker([data.lat, data.lng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(map).bindPopup("<b>📍 Your Location</b>");

    // Add resource markers
    displayMarkers(allPlaces);

    // Update results info
    const count = allPlaces.length;
    document.getElementById('resourceCount').textContent = count;
    document.getElementById('resultsText').innerHTML = 
      `✅ Found <strong>${count}</strong> resources near ${location}`;

  } catch (error) {
    console.error('Error:', error);
    document.getElementById('resultsText').innerHTML = 
      `❌ Could not find location "${location}". Please try again with a different search.`;
  }
}

function displayMarkers(places) {
  clearMarkers();

  places.forEach(place => {
    const name = place.name.toLowerCase();
    const type = determineType(name);
    
    // Apply current filter
    if (currentFilter !== 'all' && type !== currentFilter) {
      return;
    }

    const marker = L.marker([place.lat, place.lng], { 
      icon: icons[type] 
    })
    .addTo(map)
    .bindPopup(`
      <div style="text-align: center;">
        <strong style="font-size: 1.1em;">${place.name}</strong>
        <div style="margin-top: 8px; color: #667eea;">
          ${getTypeLabel(type)}
        </div>
        <button 
          onclick="getDirections(${place.lat}, ${place.lng})" 
          style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"
        >
          🗺️ Get Directions
        </button>
      </div>
    `);

    markers.push({ marker, type });
  });

  updateFilteredCount();
}

function determineType(name) {
  if (name.includes("hospital")) return "hospital";
  if (name.includes("clinic") || name.includes("health") || name.includes("medical")) return "clinic";
  if (name.includes("food") || name.includes("bank")) return "food_bank";
  if (name.includes("water") || name.includes("drinking")) return "drinking_water";
  return "clinic"; // default
}

function getTypeLabel(type) {
  const labels = {
    hospital: "🏥 Hospital",
    clinic: "⚕️ Clinic",
    food_bank: "🍎 Food Bank",
    drinking_water: "💧 Water Source"
  };
  return labels[type] || "📍 Resource";
}

function applyFilter() {
  displayMarkers(allPlaces);
}

function updateFilteredCount() {
  const visibleMarkers = markers.length;
  if (currentFilter !== 'all') {
    document.getElementById('resultsText').innerHTML = 
      `Showing <strong>${visibleMarkers}</strong> ${getTypeLabel(currentFilter)} locations`;
  }
}

function clearMarkers() {
  markers.forEach(({ marker }) => map.removeLayer(marker));
  markers = [];
}

function getDirections(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
}