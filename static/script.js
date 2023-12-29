
function initMap() {
    const mapOptions = {
        zoom: 20,
        mapId: 'f37f8b353c8cb73d',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    };
    
    const defaultLocation = { lat: 48.291920, lng: 0.623910 };
    const fallbackDefaultLocation = { lat: 41.291920, lng: 0.823910 };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    let userMarker;

    function handleUserLocation(position) {
        const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        map.setCenter(userLocation);

        if (!userMarker) {
            createUserMarker(userLocation, position.coords.heading);
        } else {
            updateExistingUserMarker(userLocation, position.coords.heading);
        }
    }

    function createUserMarker(location, heading) {
        userMarker = new google.maps.Marker({
            position: location,
            map,
            title: 'Your Location',
            animation: google.maps.Animation.DROP,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                rotation: heading,
                fillColor: 'red',
                fillOpacity: 0.8,
                strokeColor: 'red',
                strokeWeight: 2
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: 'Your Location'
        });

        userMarker.addListener("click", () => {
            infoWindow.open(map, userMarker);
        });
    }

    function updateExistingUserMarker(location, heading) {
        userMarker.setPosition(location);
        userMarker.setIcon({
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            rotation: heading,
            fillColor: 'red',
            fillOpacity: 0.8,
            strokeColor: 'red',
            strokeWeight: 2
        });
    }

    function handleLocationError(error) {
        console.error('Error getting user location:', error);
        map.setCenter(fallbackDefaultLocation);
    }

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(handleUserLocation, handleLocationError);
    } else {
        map.setCenter(fallbackDefaultLocation);
    }

    const markerIconSize = new google.maps.Size(38, 31);

    fetch('/get_markers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(markers => {
            createMarkersFromServerData(markers);
        })
        .catch(error => console.error('Error fetching markers:', error));

    function createMarkersFromServerData(markers) {
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
                    scaledSize: markerIconSize
                },
                animation: google.maps.Animation.DROP,
            });

            const infoWindow = new google.maps.InfoWindow({
                content: markerData.label
            });

            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });
        });
    }

    // Example: Add a marker when the map is clicked
    map.addListener('click', (event) => {
        // Call the function to add a new marker from the frontend
        addNewMarkerFromFrontend(event.latLng);
    });

    // Add this function to your script
    function addNewMarkerFromFrontend(position) {
        const infoWindow = new google.maps.InfoWindow({
            content: '<div><strong>Marker Information</strong><br><input type="text" id="infoInput" placeholder="Enter information"><br><button onclick="saveNewMarkerInfo(\'' + position.lat() + '\', \'' + position.lng() + '\')">Submit</button></div>'
        });

        const newMarker = new google.maps.Marker({
            position: position,
            map: map,
            title: 'New Marker',
            animation: google.maps.Animation.DROP
        });

        // Show the info window when clicking on the new marker
        newMarker.addListener("click", () => {
            infoWindow.open(map, newMarker);
        });
    }
}
