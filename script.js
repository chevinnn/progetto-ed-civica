// Inizializzazione Mappa Interattiva con Google Maps API e servizi Geocoder
function initMap() {
    const mapDiv = document.getElementById('map-interactive');
    if (!mapDiv) return;

    const map = new google.maps.Map(mapDiv, {
        center: {lat: 41.8719, lng: 12.5674},
        zoom: 6
    });

    const geocoder = new google.maps.Geocoder();

    const waterSourcesLocations = [
        {name: 'Galvanina', location: {lat: 44.05, lng: 12.45}, element: document.querySelector('#sources-table-body tr:nth-child(1) td:nth-child(3)')},
        {name: 'San Pellegrino', location: {lat: 45.82, lng: 9.68}, element: document.querySelector('#sources-table-body tr:nth-child(2) td:nth-child(3)')},
        {name: 'San Benedetto', location: {lat: 45.53, lng: 7.98}, element: document.querySelector('#sources-table-body tr:nth-child(3) td:nth-child(3)')},
        {name: 'Sant’Anna', location: {lat: 44.25, lng: 7.23}, element: document.querySelector('#sources-table-body tr:nth-child(4) td:nth-child(3)')},
        {name: 'Ferrarelle', location: {lat: 41.23, lng: 14.19}, element: document.querySelector('#sources-table-body tr:nth-child(5) td:nth-child(3)')},
        {name: 'Sangemini', location: {lat: 42.57, lng: 12.64}, element: document.querySelector('#sources-table-body tr:nth-child(6) td:nth-child(3)')},
        {name: 'Panna', location: {lat: 44.01, lng: 11.24}, element: document.querySelector('#sources-table-body tr:nth-child(7) td:nth-child(3)')},
        {name: 'Levissima', location: {lat: 46.45, lng: 10.55}, element: document.querySelector('#sources-table-body tr:nth-child(8) td:nth-child(3)')},
        {name: 'Monte Cimone', location: {lat: 44.20, lng: 10.70}, element: document.querySelector('#sources-table-body tr:nth-child(9) td:nth-child(3)')},
        {name: 'Lete', location: {lat: 41.45, lng: 14.35}, element: document.querySelector('#sources-table-body tr:nth-child(10) td:nth-child(3)')},
        {name: 'Lauretana', location: {lat: 45.53, lng: 7.98}, element: document.querySelector('#sources-table-body tr:nth-child(11) td:nth-child(3)')},
        {name: 'Plose', location: {lat: 46.64, lng: 11.73}, element: document.querySelector('#sources-table-body tr:nth-child(12) td:nth-child(3)')},
        {name: 'Pejo', location: {lat: 46.31, lng: 10.74}, element: document.querySelector('#sources-table-body tr:nth-child(13) td:nth-child(3)')}
    ];

    waterSourcesLocations.forEach(source => {
        new google.maps.Marker({
            position: source.location,
            map: map,
            title: source.name
        });
    });

    document.getElementById('search-city').addEventListener('input', function() {
        const cityName = this.value;
        if(cityName.length > 2) {
            geocodeCity(cityName, geocoder, map, waterSourcesLocations);
        } else {
            resetDistances(waterSourcesLocations);
        }
    });
}

function geocodeCity(cityName, geocoder, map, waterSourcesLocations) {
    geocoder.geocode({ 'address': cityName}, function(results, status) {
        if (status === 'OK' && results && results[0]) {
            const cityLocation = results[0].geometry.location;
            map.setCenter(cityLocation);
            calculateGeodesicDistances(cityLocation, waterSourcesLocations); // Calcola distanze geodetiche
        } else {
            alert('Geocoding non riuscito per: ' + cityName + ', causa: ' + status);
            resetDistances(waterSourcesLocations);
        }
    });
}

function calculateGeodesicDistances(cityLocation, waterSourcesLocations) {
    const cityLat = cityLocation.lat();
    const cityLng = cityLocation.lng();

    let sourcesWithDistances = waterSourcesLocations.map(source => {
        const sourceLat = source.location.lat;
        const sourceLng = source.location.lng;
        const distanceKm = getDistance(cityLat, cityLng, sourceLat, sourceLng); // Calcola distanza geodetica
        return {...source, distance: distanceKm.toFixed(1) + ' km', distanceMeters: distanceKm * 1000}; // Memorizza distanza in km e metri
    });

    sourcesWithDistances.sort((a, b) => a.distanceMeters - b.distanceMeters); // Ordina per distanza geodetica

    updateDistancesInTable(sourcesWithDistances); // Aggiorna tabella con distanze geodetiche
}


function updateDistancesInTable(sourcesWithDistances) {
    const sourcesTableBody = document.getElementById('sources-table-body');
    sourcesTableBody.innerHTML = ''; // Pulisci la tabella

    sourcesWithDistances.forEach(source => {
        let row = sourcesTableBody.insertRow();
        let cellName = row.insertCell(0);
        let cellLocation = row.insertCell(1);
        let cellDistance = row.insertCell(2);
        let cellDetails = row.insertCell(3);

        cellName.textContent = source.name;
        cellLocation.textContent = getSourceLocationText(source.name);
        cellDistance.textContent = source.distance;
        cellDistance.dataset.lat = source.location.lat; // Mantieni lat e lng
        cellDistance.dataset.lng = source.location.lng;
       
    });
}


function resetDistances(waterSourcesLocations) {
    waterSourcesLocations.forEach(source => {
        source.element.textContent = '-- km';
    });
}

function getSourceLocationText(sourceName) {
    switch(sourceName) {
        case 'Galvanina': return 'Colline Riminesi, Emilia-Romagna';
        case 'San Pellegrino': return 'Terme di San Pellegrino in Val Brembana, Lombardia';
        case 'San Benedetto': return 'Alpi Biellesi, Piemonte';
        case 'Sant’Anna': return 'Vinadio, Alpi Marittime Piemontesi';
        case 'Ferrarelle': return 'Val d’Assano, Campania';
        case 'Sangemini': return 'Sangemini, Terni, Umbria';
        case 'Panna': return 'Scarperia, Firenze, Toscana';
        case 'Levissima': return 'Parco Naturale dello Stelvio';
        case 'Monte Cimone': return 'Monte Cimone, Emilia-Romagna';
        case 'Lete': return 'Letino, Caserta, Campania';
        case 'Lauretana': return 'Alpi Biellesi, Piemonte';
        case 'Plose': return 'Monte Plose, Alto Adige';
        case 'Pejo': return 'Parco Nazionale dello Stelvio, Trentino-Alto Adige';
        default: return 'Località non disponibile';
    }
}

// Funzione per calcolare la distanza geodetica (linea d'aria) tra due coordinate (latitudine, longitudine) in KM
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in km
    const rad = Math.PI / 180;
    const lat1_rad = lat1 * rad;
    const lon1_rad = lon1 * rad;
    const lat2_rad = lat2 * rad;
    const lon2_rad = lon2 * rad;

    const dLat = lat2_rad - lat1_rad;
    const dLon = lon2_rad - lon1_rad;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1_rad) * Math.cos(lat2_rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

document.addEventListener('DOMContentLoaded', function() {
    // Nascondi tutte le sezioni all'avvio tranne la home
    const sectionContents = document.querySelectorAll('.section-content');
    sectionContents.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('home').style.display = 'block'; // Mostra la home di default

    // Gestisci il click sui link di navigazione
    const sectionToggles = document.querySelectorAll('.section-toggle');
    sectionToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault(); // Previene il comportamento di default del link (es. #)

            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);

            if (section) {
                // Nascondi tutte le sezioni
                sectionContents.forEach(sec => {
                    sec.style.display = 'none';
                    });
                    // Mostra solo la sezione cliccata
                    section.style.display = 'block';
                    }
                    });
                    });
                    });// Aggiungi un gestore di eventi ai link nella tabella
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('sources-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'A') {
                event.preventDefault(); // Impedisce il comportamento predefinito del link
                const sourceId = target.getAttribute('href').substring(1); // Rimuove il '#'
                showSourceDetails(sourceId);
            }
        });
    }
});

function showSourceDetails(sourceId) {
    const selectedSourceDetails = document.getElementById('selected-source-details');
    // Inizializza l'HTML del contenitore
    selectedSourceDetails.innerHTML = "";

    // Esempio: recupera i dettagli dal codice esistente (MIGLIORARE CON UN METODO PIU' SCALABILE SE HAI MOLTI DETTAGLI)
    let detailsElement = document.getElementById(sourceId);
    if(detailsElement){
        selectedSourceDetails.appendChild(detailsElement.cloneNode(true));
        // Imposta ID dinamico per evitare duplicati
        selectedSourceDetails.firstChild.id = "current-source-details";
    }

    // Sezione fonti attiva (se necessario)
    showSection('sources');
    // Aggiorna la visibilità delle sezioni
    updateSectionVisibility();
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.style.display = 'none'); // Nasconde tutte le sezioni

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block'; // Mostra la sezione desiderata
    }
}
// Aggiungi un gestore di eventi ai link nella tabella
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('sources-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'A') {
                event.preventDefault(); // Impedisce il comportamento predefinito del link
                const sourceId = target.getAttribute('href').substring(1); // Rimuove il '#'
                showSourceDetails(sourceId);
            }
        });
    }
});

function showSourceDetails(sourceId) {
    const selectedSourceDetails = document.getElementById('selected-source-details');
    // Inizializza l'HTML del contenitore
    selectedSourceDetails.innerHTML = "";

    // Esempio: recupera i dettagli dal codice esistente (MIGLIORARE CON UN METODO PIU' SCALABILE SE HAI MOLTI DETTAGLI)
    let detailsElement = document.getElementById(sourceId);
    if(detailsElement){
        selectedSourceDetails.appendChild(detailsElement.cloneNode(true));
        // Imposta ID dinamico per evitare duplicati
        selectedSourceDetails.firstChild.id = "current-source-details";
    }

    // Sezione fonti attiva (se necessario)
    showSection('sources');
    // Aggiorna la visibilità delle sezioni
    updateSectionVisibility();
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.style.display = 'none'); // Nasconde tutte le sezioni

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block'; // Mostra la sezione desiderata
    }
}