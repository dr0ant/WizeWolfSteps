function initMap() {
    // Create a map centered on a default location
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 47.291920, lng: 0.723910 },
        zoom: 18,
        mapId: 'f37f8b353c8cb73d',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    });

    // Create a marker for the default location
    marker = new google.maps.Marker({
        position: { lat: 47.291920, lng: 0.723910 },
        map,
        title: "Hello World",
        icon: {
            url: "/static/Assets/Step_white.png",
            scaledSize: new google.maps.Size(38, 31)
        },
        animation: google.maps.Animation.DROP,
    });

    // Create a marker for the user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var userMarker = new google.maps.Marker({
                position: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                map,
                title: "Your Location",
                icon: {
                    url: "/static/Assets/baka.png", // Replace with the path to your user marker icon
                    scaledSize: new google.maps.Size(50, 50)
                },
                animation: google.maps.Animation.DROP,
            });

            // Center the map around the user's location
            map.setCenter(userMarker.getPosition());
        }, function (error) {
            console.error("Error getting user's location:", error);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    // Create an info window for the default location marker
    const defaultLocationInfoWindow = new google.maps.InfoWindow({
        content: 'Pas de Loup, écris un com ici mdr'
    });

    // Show the info window when clicking on the default location marker
    marker.addListener("click", () => {
        defaultLocationInfoWindow.open(map, marker);
    });
}
