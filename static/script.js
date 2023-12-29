function initMap() {
    // Create a map centered on the user's location
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        mapId: 'f37f8b353c8cb73d',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    });

    // Try to get the user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Set the map center to the user's location
                map.setCenter(userLocation);

                // Create a marker for the user's location
                const userMarker = new google.maps.Marker({
                    position: userLocation,
                    map,
                    title: 'Your Location',
                    animation: google.maps.Animation.DROP
                });

                // Create an info window for the user's marker
                const infoWindow = new google.maps.InfoWindow({
                    content: 'Your Location'
                });

                // Show the info window when clicking on the user's marker
                userMarker.addListener("click", () => {
                    infoWindow.open(map, userMarker);
                });
            },
            (error) => {
                console.error('Error getting user location:', error);

                // Fallback to a default location if user location is not available
                const defaultLocation = { lat: 47.291920, lng: 0.723910 };
                map.setCenter(defaultLocation);
            }
        );
    } else {
        // Fallback to a default location if geolocation is not supported
        const defaultLocation = { lat: 47.291920, lng: 0.723910 };
        map.setCenter(defaultLocation);
    }

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
