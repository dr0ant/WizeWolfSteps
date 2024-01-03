function initMap() {
    const mapOptions = {
        zoom: 20,
        mapId: 'f37f8b353c8cb73d',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zIndex: 0, // Place it below the wolf image
    };

    const defaultLocation = { lat: 48.291920, lng: 0.623910 };
    const fallbackDefaultLocation = { lat: 41.291920, lng: 0.823910 };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    let userMarker;
    let isCreatingMarker = false;

    function createUserMarker(location, heading) {
        userMarker = new google.maps.Marker({
            position: location,
            map,
            title: 'Your Location',
            animation: google.maps.Animation.DROP,
            icon: {
                url: '/static/Assets/wolf_no_BG.png',
                size: new google.maps.Size(50, 50),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(25, 25), // Adjust the anchor point
                scaledSize: new google.maps.Size(50, 50),
                rotation: heading,
            },
            zIndex: 3, // Place it below the wolf image
        });

        // Add a red arrow symbol below the wolf image
        const arrowSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 10,
            rotation: heading,
            fillColor: 'red',
            fillOpacity: 0.8,
            strokeColor: 'red',
            strokeWeight: 2,
        };

        const arrowMarker = new google.maps.Marker({
            position: location,
            map: map,
            icon: arrowSymbol,
            zIndex: 2, // Place it below the wolf image
        });

        arrowMarker.addListener("click", () => {
            const markerPosition = arrowMarker.getPosition();
            const isWithinRadius = isMarkerWithinRadius(markerPosition);

            if (isWithinRadius) {
                // Handle click on the arrow marker if needed
            } else {
                showCustomPopup('Get closer from the step, you can only interact with steps within a 100m radius');
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
            clickable: false , // Make the circle not clickable
            zIndex: 2, // Place it below the wolf image
        });
    }

    // Your existing code for updateExistingUserMarker, isMarkerWithinRadius, showCustomPopup, and createMarkersFromServerData

    // Function to handle user location
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

    // Function to handle location error
    function handleLocationError(error) {
        console.error('Error getting user location:', error);
        map.setCenter(fallbackDefaultLocation);
    }

    // Fetch server markers
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
                animation: google.maps.Animation.DROP,
                zIndex: 1, // Place it below the wolf image
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
                animation: google.maps.Animation.DROP,
                zIndex: 1, // Place it below the wolf image
            });

            tooFarMarker.addListener("click", () => {
                tooFarInfoWindow.open(map, tooFarMarker);
            });

            tooFarInfoWindow.addListener("closeclick", () => {
                isCreatingMarker = false;
            });
        }
    }

    // Watch user's geolocation
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(handleUserLocation, handleLocationError);
    } else {
        map.setCenter(fallbackDefaultLocation);
    }

    const markerIconSize = new google.maps.Size(38, 31);
}
