(function () {

    // Logical =r
    const lat = document.querySelector("#lat").value || -12.0702412;
    const lng = document.querySelector("#lng").value || -77.063929;
    const mapa = L.map('mapa').setView([lat, lng], 11);
    let marker;

    // Utilizar Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // El Pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
        .addTo(mapa)

    // Detectar el movimiento del Pin
    marker.on("moveend", function (e) {
        marker = e.target
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // Obtener la información de las calles al soltar el Pin
        geocodeService.reverse().latlng(posicion, 13).run(function (error, resultado) {
            //console.log(resultado)
            marker.bindPopup(resultado.address.LongLabel)

            // LLenar los campos
            document.querySelector(".calle").textContent = resultado?.address?.Address ?? "";
            document.querySelector("#calle").value = resultado?.address?.Address ?? "";
            document.querySelector("#lat").value = resultado?.latlng?.lat ?? "";
            document.querySelector("#lng").value = resultado?.latlng?.lng ?? "";
        })
    })


})()