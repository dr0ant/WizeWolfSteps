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
                    infoWindow.open(map, marker);
                });
            });
        }
        

    // Example: Add a marker when the map is clicked
    map.addListener('click', (event) => {
        // Check if a marker is currently being created
        if (!isCreatingMarker) {
            // Call the function to add a new marker from the frontend
            addNewMarkerFromFrontend(event.latLng);
            isCreatingMarker = true; // Set the flag to true to indicate marker creation in progress
        }
    });

    // Add this function to your script

    function addNewMarkerFromFrontend(position) {
        // HTML form content
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
                
                    <form action="/create_marker" method="post" enctype="multipart/form-data" onsubmit="submitForm(event)"">
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
    
        // Show the info window when clicking on the new marker
        newMarker.addListener("click", () => {
            infoWindow.open(map, newMarker);
        });
    
        // Close the info window and reset the flag when the submit button is clicked
        infoWindow.addListener("closeclick", () => {
            isCreatingMarker = false;
        });
    }
    
}    