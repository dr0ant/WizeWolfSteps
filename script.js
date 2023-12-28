function initMap(){
    map = new google.maps.Map(document.getElementById('map'),{
        center: {lat:47.3942641, lng: 0.6796188},
        zoom: 18,
        mapId: 'f37f8b353c8cb73d',
        mapTypeControl: false,
        fullscreenControl:false,
        streetViewControle: false
    });

    marker = new google.maps.Marker({
        position: {lat:47.3942641, lng: 0.6796188},
        map,
        title: "Hello World",
        icon: {
            url: "/Assets/Step_white.png",
            scaledSize: new google.maps.Size(38,31)
        },
    animation: google.maps.Animation.DROP,
    });

    const infowindow = new google.maps.InfoWindow({
        content: 'Pas de Loup, écris un com ici mdr'
    });

    marker.addListener("click",()=>{
        infowindow.open(map,marker);
    });

}


//https://www.google.com/maps/@47.3942641,0.6796188,16z?entry=ttu