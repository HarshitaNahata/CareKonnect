//script.js
let map; // Global map variable
let directionsService;
let directionsRenderer;
let trafficLayer; // Traffic layer variable
let trafficLayerVisible = false; // State for traffic layer visibility
let routesTableVisible = false;
let allMarkers = []; // to dynamically handle markers
let areAmbulanceMarkersVisible = false;

function initMap() {
    var bangalore = { lat: 12.9716, lng: 77.5946 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: bangalore
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Initialize traffic layer but don't display it by default
    trafficLayer = new google.maps.TrafficLayer();
}

document.getElementById('imgRoutes').addEventListener('click', function () {
    displayContent('Routes');
    showMap();  // Show map for Routes
    loadAndDisplayRoute();
    displayTrafficToggleButton(); // Add the traffic toggle button
});

document.getElementById('imgAmbulance').addEventListener('click', function () {
    displayContent('Ambulances');
    showMap();  // Show map for Ambulances
    //loadAndDisplayAmbulances();

    // Get the dynamic content div
    const dynamicContent = document.getElementById('dynamic-content');

    // Create the download button
    const downloadLink = document.createElement('a');
    downloadLink.href = "/ambulances.json"; // Replace with the actual path
    downloadLink.download = "ambulances.json";

    const downloadButton = document.createElement('button');
    downloadButton.innerText = "Download Ambulance Data";
    downloadButton.style.display = 'inline-block'; // Keep button inline
    downloadButton.style.marginLeft = '10px'; // Add some space between text and button

    // Append the button to the link and the link to the dynamicContent
    downloadLink.appendChild(downloadButton);

    // Create a new div for content
    const newDiv = document.createElement('div');
    newDiv.className = 'new-content';
    newDiv.innerText = "Ambulances"; // Set the content type text
    newDiv.appendChild(downloadLink); // Add the link to the newDiv

    dynamicContent.innerHTML = ''; // Clear previous content
    dynamicContent.appendChild(newDiv); // Append the newDiv to dynamicContent

    if (areAmbulanceMarkersVisible) {
        // Toggle logic
        removeMarkers();
    } else {
        loadAndDisplayAmbulances();
    }

    // Toggle the visibility flag
    areAmbulanceMarkersVisible = !areAmbulanceMarkersVisible;
});


document.getElementById('imgHospitals').addEventListener('click', function () {
    displayContent('Hospitals');
    showMap();  // Show map for Hospitals
    loadAndDisplayHospitals();

    // Get the dynamic content div
    const dynamicContent = document.getElementById('dynamic-content');

    // Create the download button
    const downloadLink = document.createElement('a');
    downloadLink.href = "/hospitals.json"; // Replace with the actual path
    downloadLink.download = "hospitals.json";

    const downloadButton = document.createElement('button');
    downloadButton.innerText = "Download Hospital Data";
    downloadButton.style.display = 'inline-block'; // Keep button inline
    downloadButton.style.marginLeft = '10px'; // Add some space between text and button

    // Append the button to the link
    downloadLink.appendChild(downloadButton);

    // Create a new div for content
    const newDiv = document.createElement('div');
    newDiv.className = 'new-content';
    newDiv.innerText = "Hospitals"; // Set the content type text
    newDiv.appendChild(downloadLink); // Add the link to the newDiv

    dynamicContent.innerHTML = ''; // Clear previous content
    dynamicContent.appendChild(newDiv); // Append the newDiv to dynamicContent
});


document.getElementById('imgFirstAid').addEventListener('click', function () {
    displayFirstAid();
    hideMap();  // Hide map for First Aid
});

document.getElementById('imgPatients').addEventListener('click', function () {
    displayPatientDetails();
    hideMap();  // Hide map for Patients
});

document.getElementById('imgSettings').addEventListener('click', function () {
    displaySettings();
    hideMap();  // Hide map for Settings
});

function displayContent(contentType) {
    const dynamicContent = document.getElementById('dynamic-content');
    dynamicContent.innerHTML = '';

    const newDiv = document.createElement('div');
    newDiv.className = 'new-content';
    newDiv.innerText = contentType;
    dynamicContent.appendChild(newDiv);
}

// Hide the map when not needed
function hideMap() {
    document.getElementById('map').style.display = 'none';
}

// Show the map when it's required
function showMap() {
    document.getElementById('map').style.display = 'block';
}

// Load and display route from a JSON file
function loadAndDisplayRoute() {
    fetch('route.json')
        .then(response => response.json())
        .then(routeData => {
            const start = new google.maps.LatLng(routeData.start.lat, routeData.start.lng);
            const end = new google.maps.LatLng(routeData.end.lat, routeData.end.lng);
            const waypoints = routeData.waypoints.map(point => ({
                location: new google.maps.LatLng(point.lat, point.lng),
                stopover: true
            }));

            const request = {
                origin: start,
                destination: end,
                waypoints: waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true // Enable alternative routes
            };

            directionsService.route(request, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                    displayAlternativeRoutes(result.routes); // Display alternatives
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            });
        })
        .catch(error => console.error('Error loading route:', error));
}
// Display the traffic toggle button and the alternative routes toggle button
function displayTrafficToggleButton() {
    const dynamicContent = document.getElementById('dynamic-content');

    // Traffic Button
    let trafficButton = document.getElementById('toggleTrafficButton');
    if (!trafficButton) {
        trafficButton = document.createElement('div');
        trafficButton.id = 'toggleTrafficButton';
        trafficButton.classList.add('toggleButton');
        trafficButton.innerHTML = `
            <span class="traffic-toggle-text">Show Real Time Traffic</span>
            <span class="traffic-toggle-switch">
                <span class="traffic-toggle-knob"></span>
            </span>
        `;
        dynamicContent.appendChild(trafficButton);

        // Toggle functionality
        trafficButton.addEventListener('click', function () {
            toggleTrafficLayer();
            trafficButton.classList.toggle('active');
        });
    }

    // Alternative Routes Button
    let routesButton = document.getElementById('toggleRoutesButton');
    if (!routesButton) {
        routesButton = document.createElement('div');
        routesButton.id = 'toggleRoutesButton';
        routesButton.classList.add('toggleButton');
        routesButton.innerHTML = `
            <span class="traffic-toggle-text">Show Alternative Routes</span>
            <span class="traffic-toggle-switch">
                <span class="traffic-toggle-knob"></span>
            </span>
            `;
        dynamicContent.appendChild(routesButton);

        // Toggle functionality for showing/hiding the routes table
        routesButton.addEventListener('click', function () {
            toggleRoutesTable();
            routesButton.classList.toggle('active');
        });
    }
}

// Toggle the visibility of the alternative routes table
function toggleRoutesTable() {
    const routesTable = document.getElementById('alternativeRoutesTable');
    if (routesTable) {
        if (routesTableVisible) {
            routesTable.style.display = 'none'; // Hide the table
            map.setZoom(13);
        } else {
            routesTable.style.display = 'table'; // Show the table
            map.setZoom(11);
        }
        routesTableVisible = !routesTableVisible; // Toggle the state
    }
}


// Toggle traffic layer visibility
function toggleTrafficLayer() {
    if (trafficLayerVisible) {
        trafficLayer.setMap(null); // Hide traffic layer
    } else {
        trafficLayer.setMap(map); // Show traffic layer
    }
    trafficLayerVisible = !trafficLayerVisible; // Toggle the state
}

// Display alternative routes in a table
function displayAlternativeRoutes(routes) {
    const dynamicContent = document.getElementById('dynamic-content');

    // Check if table exists
    let routesTable = document.getElementById('alternativeRoutesTable');
    if (!routesTable) {
        routesTable = document.createElement('table');
        routesTable.id = 'alternativeRoutesTable';
        routesTable.innerHTML = `
            <thead>
                <tr>
                    <th>Route Option</th>
                    <th>Distance</th>
                    <th>Duration</th>
                    <th>Select</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        dynamicContent.appendChild(routesTable);
        routesTable.style.display = 'none';
    }

    // Populate table with alternative routes
    const tbody = routesTable.querySelector('tbody');
    tbody.innerHTML = ''; // Clear previous entries

    routes.forEach((route, index) => {
        const distance = route.legs[0].distance.text;
        const duration = route.legs[0].duration.text;
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>Route ${index + 1}</td>
            <td>${distance}</td>
            <td>${duration}</td>
            <td><button onclick="selectRoute(${index})">Select</button></td>
        `;

        tbody.appendChild(row);
    });
}

// Select a specific route to display
function selectRoute(routeIndex) {
    directionsRenderer.setRouteIndex(routeIndex);

}

// Load and display ambulances from a JSON file
function loadAndDisplayAmbulances() {
    removeMarkers();
    fetch('ambulances.json')
        .then(response => response.json())
        .then(ambulancesData => {
            ambulancesData.ambulances.forEach(ambulance => {
                var icon_ambi = {
                    url: "images/ambicon.png",
                    scaledSize: new google.maps.Size(40, 40),
                };
                const marker = new google.maps.Marker({
                    position: new google.maps.LatLng(ambulance.lat, ambulance.lng),
                    map: map,
                    icon: icon_ambi,
                    title: ambulance.name
                });

                allMarkers.push(marker);

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <h3>${ambulance.name}</h3>
                            <p>Available: ${ambulance.available ? 'Yes' : 'No'}</p>
                        </div>
                    `
                });

                marker.addListener('mouseover', function () {
                    infoWindow.open(map, marker);
                });

                marker.addListener('mouseout', function () {
                    infoWindow.close();
                });
            });
        })
        .catch(error => console.error('Error loading ambulances:', error));
}

// Load and display hospitals from a JSON file
function loadAndDisplayHospitals() {
    removeMarkers();
    fetch('hospitals.json')
        .then(response => response.json())
        .then(hospitalsData => {
            hospitalsData.hospitals.forEach(hospital => {
                var icon_hospi = {
                    url: "images/hospitals.jpg",
                    scaledSize: new google.maps.Size(40, 40),
                };
                const marker = new google.maps.Marker({
                    position: new google.maps.LatLng(hospital.lat, hospital.lng),
                    map: map,
                    icon: icon_hospi,
                    title: hospital.name
                });

                allMarkers.push(marker);

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <h3>${hospital.name}</h3>
                            <p>Specialty: ${hospital.specialty}</p>
                        </div>
                    `
                });

                marker.addListener('mouseover', function () {
                    infoWindow.open(map, marker);
                });

                marker.addListener('mouseout', function () {
                    infoWindow.close();
                });
            });
        })
        .catch(error => console.error('Error loading hospitals:', error));
}

// Hide map and display First Aid details
function displayFirstAid() {
    const dynamicContent = document.getElementById('dynamic-content');
    dynamicContent.innerHTML = '<h2>First Aid Details</h2>';

    const select = document.createElement('select');
    select.id = 'ambulanceSelect';
    const option1 = document.createElement('option');
    option1.text = 'Ambulance 1';
    const option2 = document.createElement('option');
    option2.text = 'Ambulance 2';

    select.add(option1);
    select.add(option2);
    dynamicContent.appendChild(select);

    const detailsDiv = document.createElement('div');
    detailsDiv.id = 'firstAidDetails';
    dynamicContent.appendChild(detailsDiv);

    detailsDiv.innerHTML = 'Ambulance 1 First Aid Details: Bandages, Oxygen Tank';

    select.addEventListener('change', function () {
        detailsDiv.innerHTML = `${this.value} First Aid Details: Updated list...`;
    });
}

// Hide map and display Patient details
function displayPatientDetails() {
    const dynamicContent = document.getElementById('dynamic-content');
    dynamicContent.innerHTML = '<h2>Patient Details</h2>';

    const select = document.createElement('select');
    select.id = 'patientAmbulanceSelect';
    const option1 = document.createElement('option');
    option1.text = 'Ambulance 1';
    const option2 = document.createElement('option');
    option2.text = 'Ambulance 2';

    select.add(option1);
    select.add(option2);
    dynamicContent.appendChild(select);

    const table = document.createElement('table');
    table.id = 'patientTable';
    table.innerHTML = `
        <tr>
            <th>Time of Call</th>
            <th>Time to Reach</th>
            <th>Time Taken</th>
        </tr>
        <tr>
            <td>10:00 AM</td>
            <td>10:15 AM</td>
            <td>15 minutes</td>
        </tr>
    `;
    dynamicContent.appendChild(table);

    select.addEventListener('change', function () {
        table.innerHTML = `
            <tr>
                <th>Time of Call</th>
                <th>Time to Reach</th>
                <th>Time Taken</th>
            </tr>
            <tr>
                <td>Updated Time of Call</td>
                <td>Updated Time to Reach</td>
                <td>Updated Time Taken</td>
            </tr>
        `;
    });
}

function removeMarkers() {
    allMarkers.forEach(marker => {
        marker.setMap(null); // Remove marker from map
    });
    allMarkers.length = 0; // Clear the global markers array
}

// Settings
function displaySettings() {
    const dynamicContent = document.getElementById('dynamic-content');
    dynamicContent.innerHTML = '<h2>Settings</h2>';

    const tableDiv = document.createElement('div');
    tableDiv.id = 'csvTableDiv';
    dynamicContent.appendChild(tableDiv);

    const overrideButton = document.createElement('button');
    overrideButton.innerText = 'Override';
    overrideButton.style.display = 'none'; // Hidden until CSV is loaded
    dynamicContent.appendChild(overrideButton);

    // Store selected columns for sorting
    const selectedColumns = new Set();

    // Load the CSV file from the root directory
    fetch('syn_data.csv')
        .then(response => response.text())
        .then(csvData => {
            const table = createTableFromCSV(csvData, selectedColumns);
            tableDiv.innerHTML = ''; // Clear any previous table
            tableDiv.appendChild(table);
            overrideButton.style.display = 'block'; // Show the Override button
        })
        .catch(error => console.error('Error loading CSV:', error));

    // Override the CSV file when button is clicked
    overrideButton.addEventListener('click', function () {
        const table = document.querySelector('#csvTableDiv table');
        const csvData = tableToCSV(table);
        overrideCSV(csvData); // Save the updated CSV
    });
}

// Parse CSV data and create a table with checkboxes for multi-column sorting
function createTableFromCSV(csvData, selectedColumns) {
    const rows = csvData.split('\n').map(row => row.split(','));
    const table = document.createElement('table');
    table.border = '1';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table header with checkboxes for sorting
    const headerRow = document.createElement('tr');
    rows[0].forEach((header, index) => {
        const th = document.createElement('th');
        th.innerText = header;

        // Create a checkbox for multi-column sorting
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('sort-checkbox');
        checkbox.addEventListener('change', (e) => toggleSortColumn(e, index, selectedColumns, table));
        th.appendChild(checkbox);

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    rows.slice(1).forEach(rowData => {
        const row = document.createElement('tr');
        rowData.forEach(cell => {
            const td = document.createElement('td');
            td.innerText = cell;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

// Toggle selected columns for sorting based on checkbox
function toggleSortColumn(event, columnIndex, selectedColumns, table) {
    if (event.target.checked) {
        selectedColumns.add(columnIndex);
    } else {
        selectedColumns.delete(columnIndex);
    }
    sortTable(table, selectedColumns);
}

function sortTable(table, selectedColumns) {
    const rowsArray = Array.from(table.rows).slice(1); // Exclude header row

    Array.from(selectedColumns).forEach(columnIndex => {
        rowsArray.sort((a, b) => {
            const aCell = a.cells[columnIndex];
            const bCell = b.cells[columnIndex];
            const aText = aCell ? aCell.innerText.trim() : '';
            const bText = bCell ? bCell.innerText.trim() : '';

            // Custom sort order for "Road Size" column (replace with the actual column index)
            if (columnIndex === 5) { // Assuming "Road Size" is column index 5
                const customOrder = { "Narrow": 1, "Medium": 2, "Wide": 3 };
                return (customOrder[aText] || 0) - (customOrder[bText] || 0);
            }

            // Descending sort for "Population" column (replace with the actual column index)
            if (columnIndex === 2) { // Assuming "Population" is column index 2
                return isNaN(aText - bText)
                    ? bText.localeCompare(aText)
                    : bText - aText;
            }

            // Default sort (ascending)
            return isNaN(aText - bText)
                ? aText.localeCompare(bText)
                : aText - bText;
        });
    });

    // Reattach sorted rows to the table
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows
    rowsArray.forEach(row => tbody.appendChild(row));
}


// Convert table back to CSV format
function tableToCSV(table) {
    const rows = Array.from(table.rows);
    return rows.map(row => Array.from(row.cells).map(cell => cell.innerText).join(',')).join('\n');
}

// Function to override the CSV file
function overrideCSV(csvData) {
    fetch('save_csv.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csv: csvData })
    })
        .then(response => response.text())
        .then(data => console.log('CSV overridden successfully:', data))
        .catch(error => console.error('Error overriding CSV:', error));
}
