function initMap() {
    // Create a map centered on a default location
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 47.291920, lng: 0.723910 },
        zoom: 18,
        mapId: 'f37f8b353c8cb73d',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    });

    // Fetch markers from the server
    fetch('/get_markers')
        .then(response => response.json())
        .then(markers => {
            // Create markers dynamically based on the data from MongoDB
            markers.forEach(markerData => {
                const marker = new google.maps.Marker({
                    position: {
                        lat: markerData.position.latitude,
                        lng: markerData.position.longitude
                    },
                    map,
                    title: markerData.title,
                    label: markerData.label,
                    icon: {
                        url: markerData.icon,
                        scaledSize: new google.maps.Size(38, 31)
                    },
                    animation: google.maps.Animation.DROP,
                });

                // Create an info window for each marker
                const infoWindow = new google.maps.InfoWindow({
                    content: markerData.label
                });

                // Show the info window when clicking on the marker
                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });
            });
        })
        .catch(error => console.error('Error fetching markers:', error));

    // ... rest of your code
}
