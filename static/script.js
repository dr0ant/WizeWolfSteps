function initMap() {
    // Create a map centered on the user's location
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 20,
        mapId: 'f37f8b353c8cb73d',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    });

    let userMarker; // Declare user marker variable outside the scope

    // Try to get the user's location and heading
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Set the map center to the user's location
                map.setCenter(userLocation);

                // Create a marker for the user's location if it doesn't exist
                if (!userMarker) {
                    userMarker = new google.maps.Marker({
                        position: userLocation,
                        map,
                        title: 'Your Location',
                        animation: google.maps.Animation.DROP,
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 5,
                            rotation: position.coords.heading ,
                            fillColor: 'red',
                            fillOpacity: 0.8,
                            strokeColor: 'red',
                            strokeWeight: 2
                        }
                    });

                    // Create an info window for the user's marker
                    const infoWindow = new google.maps.InfoWindow({
                        content: 'Your Location'
                    });

                    // Show the info window when clicking on the user's marker
                    userMarker.addListener("click", () => {
                        infoWindow.open(map, userMarker);
                    });
                } else {
                    // Update existing user marker position and rotation
                    userMarker.setPosition(userLocation);
                    userMarker.setIcon({
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 5,
                        rotation: position.coords.heading ,
                        fillColor: 'red',
                        fillOpacity: 0.8,
                        strokeColor: 'red',
                        strokeWeight: 2
                    });
                }
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


    // Add a click event listener to the map
    map.addListener('click', function (event) {
        showFormAtPosition(event.latLng);
    });



    // Fetch markers from the server
    fetch('/get_markers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
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

}

function submitForm(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const formData = new FormData(event.target);

    // Send form data to the server for marker creation
    fetch('/marker_creation', {
       method: 'POST',
       body: formData,
    })
       .then(response => response.json())
       .then(data => {
          // Check if marker creation was successful
          if (data.status === 'success') {
             // Clear the form
             event.target.reset();

             // Fetch and update markers on the map
             fetchMarkers();
          } else {
             // Handle error
             console.error('Error creating marker:', data.message);
          }
       })
       .catch(error => console.error('Error:', error));
 }

 function showFormAtPosition(latLng) {
    const formBox = document.getElementById('formBox');
    formBox.style.display = 'block';

    // Set the form position based on the clicked position
    const formTop = latLng.lat();
    const formLeft = latLng.lng();
    formBox.style.top = formTop + 'px';
    formBox.style.left = formLeft + 'px';

    // Fill latitude and longitude fields in the form
    document.getElementById('markerForm').elements['latitude'].value = formTop;
    document.getElementById('markerForm').elements['longitude'].value = formLeft;
}