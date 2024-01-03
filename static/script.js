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
    let isCreatingMarker = false;

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

    function sendLogToServer(logData) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ log: logData }),
        })
            .then(response => {
                if (!response.ok) {
                    console.error('Failed to send log to server');
                }
            });
    }

    function handleLocationError(error) {
        console.error('Error getting user location:', error);
        map.setCenter(fallbackDefaultLocation);
    }

    function isMarkerWithinRadius(markerPosition) {
        const userPosition = userMarker.getPosition();
        const distance = google.maps.geometry.spherical.computeDistanceBetween(userPosition, markerPosition);
        return distance <= 100;
    }

    function showCustomPopup(message) {
        const infoWindow = new google.maps.InfoWindow({
            content: message
        });

        infoWindow.setPosition(userMarker.getPosition());
        infoWindow.open(map);
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
            const markerPosition = userMarker.getPosition();
            const isWithinRadius = isMarkerWithinRadius(markerPosition);

            if (isWithinRadius) {
                infoWindow.open(map, userMarker);
            } else {
                showCustomPopup('Get closer from the step, you can only interact with steps within a 100m radius');
            }
        });

        // Add a circle around the user marker
        const userCircle = new google.maps.Circle({
            map,
            center: location,
            radius: 100,
            fillColor: '#B7E6EE',
            fillOpacity: 0.1,
            strokeColor: '#FF0000',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            clickable: false  // Make the circle not clickable
        });

        // Add a second icon on top of the arrow
        const imageIcon = {
            url: 'path/to/your/image.png',
            size: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(16, 16),
            scaledSize: new google.maps.Size(32, 32),
        };

        const overlay = new google.maps.OverlayView();
        overlay.draw = function () {
            const markerPosition = overlay.getProjection().fromLatLngToDivPixel(userMarker.getPosition());
            const imageMarker = document.createElement("div");
            imageMarker.style.position = 'absolute';
            imageMarker.style.width = '32px';
            imageMarker.style.height = '32px';
            imageMarker.style.top = markerPosition.y - 16 + 'px';
            imageMarker.style.left = markerPosition.x - 16 + 'px';
            imageMarker.style.backgroundImage = `url(${imageIcon.url})`;

            this.getPanes().overlayMouseTarget.appendChild(imageMarker);
        };
        overlay.setMap(map);
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

        // Update the circle position
        const userCircle = new google.maps.Circle({
            map,
            center: location,
            radius: 100,
            fillColor: '#B7E6EE',
            fillOpacity: 0.1,
            strokeColor: '#FF0000',
            strokeOpacity: 0.5,
            strokeWeight: 1
        });

        // Update the second icon position
        const overlay = new google.maps.OverlayView();
        overlay.draw = function () {
            const markerPosition = overlay.getProjection().fromLatLngToDivPixel(userMarker.getPosition());
            const imageMarker = document.createElement("div");
            imageMarker.style.position = 'absolute';
            imageMarker.style.width = '32px';
            imageMarker.style.height = '32px';
            imageMarker.style.top = markerPosition.y - 16 + 'px';
            imageMarker.style.left = markerPosition.x - 16 + 'px';
            imageMarker.style.backgroundImage = `url(path/to/your/image.png)`;

            this.getPanes().overlayMouseTarget.appendChild(imageMarker);
        };
        overlay.setMap(map);
    }

    function createMarkersFromServerData(markers) {
        markers.forEach(markerData => {
            const marker = new google.maps.Marker({
                position: {
                    lat: markerData.position.latitude,
                    lng: markerData.position.longitude
                },
                map,
                title: markerData.title,
                label: null,
                icon: {
                    url: markerData.icon,
                    scaledSize: markerIconSize
                },
                animation: google.maps.Animation.DROP,
            });

            const infoWindowContent = `
            <div style="max-width: 300px;">
                <h1>${markerData.title}</h1>
                <p><strong>ID:</strong> ${markerData.id}</p>
                <p><strong>Creation Datetime:</strong> ${markerData.creation_datetime}</p>
                <p><strong>Label:</strong> ${markerData.label}</p>
                <p><strong>User ID:</strong> ${markerData.user_id}</p>
                <p><strong>Position:</strong> Latitude: ${markerData.position.latitude}, Longitude: ${markerData.position.longitude}</p>
                <img style="max-width: 200px;" src="data:image/png;base64, ${markerData.image_base64}" alt="Image">
            </div>
        `;

            const infoWindow = new google.maps.InfoWindow({
                content: infoWindowContent
            });

            marker.addListener("click", () => {
                const markerPosition = marker.getPosition();
                const isWithinRadius = isMarkerWithinRadius(markerPosition);

                if (isWithinRadius) {
                    infoWindow.open(map, marker);
                } else {
                    showCustomPopup('Get closer from the step, you can only interact with steps within a 100m radius');
                }
            });
        });
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

    // Example: Add a marker when the map is clicked
    map.addListener('click', (event) => {
        if (!isCreatingMarker) {
            addNewMarkerFromFrontend(event.latLng);
            isCreatingMarker = true;
        }
    });

    // Add this function to your script
    function addNewMarkerFromFrontend(position) {
        const userPosition = userMarker.getPosition();
        const distance = google.maps.geometry.spherical.computeDistanceBetween(userPosition, position);

        if (distance <= 100) {
            const formContent = `
            <style>
                .step {
                    width: 50px;
                    -webkit-filter: drop-shadow(5px 5px 5px #75c3c3);
                    filter: drop-shadow(5px 5px 5px #85b2b9);
                }

                form {
                    display: flex;
                    flex-direction: column;
                    max-width: 220px;
                    margin: auto;
                }

                .form-box {
                    background-color: white;
                    padding: 0px;
                    border-radius: 0px;
                    color: darkblue;
                }

                button {
                    padding: 10px;
                    background-color: #0b769a;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #0b536b;
                }

                form input {
                    margin-bottom: 0px;
                    padding: 0px;
                    border-radius: 0px;
                    display: inline-block;
                }
            </style>

            <div class="form-box">
                <center>
                    <div class="image-container">
                        <img class="step" src="/static/Assets/Step.png" alt="step">
                    </div>

                    <form action="/create_marker" method="post" enctype="multipart/form-data" onsubmit="submitForm(event)">
                        Latitude: <input type="text" name="latitude" id="latitude" value="${position.lat()}" required><br>
                        Longitude: <input type="text" name="longitude" id="longitude" value="${position.lng()}" required><br>
                        Image (file): <input type="file" name="image" accept="image/*" ><br>
                        Sound (file): <input type="file" name="sound" accept="audio/*" ><br>
                        Name: <textarea name="name" rows="4"></textarea><br>
                        Text: <textarea name="text" rows="4"></textarea><br>
                        User ID: <input type="text" name="user_id" value="dr0ant" required><br>
                        <button type="submit">Create Step</button>
                    </form>
                </div>
            </center>
        `;

            const infoWindow = new google.maps.InfoWindow({
                content: formContent
            });

            const newMarker = new google.maps.Marker({
                position: position,
                map: map,
                title: 'New Marker',
                icon: {
                    url: 'static/Assets/Step_white.png',
                    scaledSize: markerIconSize
                },
                animation: google.maps.Animation.DROP
            });

            newMarker.addListener("click", () => {
                infoWindow.open(map, newMarker);
            });

            infoWindow.addListener("closeclick", () => {
                isCreatingMarker = false;
            });
        } else {
            const tooFarContent = `
            <style>
                .too-far-box {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    color: darkblue;
                    max-width: 220px;
                    margin: auto;
                }

                button {
                    padding: 10px;
                    background-color: #0b769a;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #0b536b;
                }
            </style>

            <div class="too-far-box">
                <p>You are too far away. You can only create Steps within a 100m radius.</p>
            </div>
        `;

            const tooFarInfoWindow = new google.maps.InfoWindow({
                content: tooFarContent
            });

            const tooFarMarker = new google.maps.Marker({
                position: position,

                map: map,
                title: 'Too Far Marker',
                icon: {
                url: 'static/Assets/Step_red.png',  // Adjust the icon URL accordingly
                scaledSize: markerIconSize
            },
            animation: google.maps.Animation.DROP
        });
    
        tooFarMarker.addListener("click", () => {
            tooFarInfoWindow.open(map, tooFarMarker);
        });
    
        tooFarInfoWindow.addListener("closeclick", () => {
            isCreatingMarker = false;
        });

    }

}
}
