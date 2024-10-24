let map; // Global map variable
let directionsService;
let directionsRenderer;

function initMap() {
    var bangalore = { lat: 12.9716, lng: 77.5946 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: bangalore
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}

document.getElementById('imgRoutes').addEventListener('click', function () {
    displayContent('Routes');
    showMap();  // Show map for Routes
    loadAndDisplayRoute();
});

document.getElementById('imgAmbulance').addEventListener('click', function () {
    displayContent('Ambulances');
    showMap();  // Show map for Ambulances
    loadAndDisplayAmbulances();
});

document.getElementById('imgHospitals').addEventListener('click', function () {
    displayContent('Hospitals');
    showMap();  // Show map for Hospitals
    loadAndDisplayHospitals();
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
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            });
        })
        .catch(error => console.error('Error loading route:', error));
}

// Load and display ambulances from a JSON file
function loadAndDisplayAmbulances() {
    fetch('ambulances.json')
        .then(response => response.json())
        .then(ambulancesData => {
            ambulancesData.ambulances.forEach(ambulance => {
                const marker = new google.maps.Marker({
                    position: new google.maps.LatLng(ambulance.lat, ambulance.lng),
                    map: map,
                    icon: 'images/ambicon.png',
                    title: ambulance.name
                });

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
    fetch('hospitals.json')
        .then(response => response.json())
        .then(hospitalsData => {
            hospitalsData.hospitals.forEach(hospital => {
                const marker = new google.maps.Marker({
                    position: new google.maps.LatLng(hospital.lat, hospital.lng),
                    map: map,
                    icon: 'images/hospitals.jpg',
                    title: hospital.name
                });

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

//Settings 
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

    // Load the CSV file from the root directory
    fetch('data.csv')
        .then(response => response.text())
        .then(csvData => {
            const table = createTableFromCSV(csvData);
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

// Parse CSV data and create a table
function createTableFromCSV(csvData) {
    const rows = csvData.split('\n').map(row => row.split(','));
    const table = document.createElement('table');
    table.border = '1';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table header and add sorting functionality
    const headerRow = document.createElement('tr');
    rows[0].forEach((header, index) => {
        const th = document.createElement('th');
        th.innerText = header;
        th.style.cursor = 'pointer';
        th.addEventListener('click', function () {
            sortTable(table, index);
        });
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    for (let i = 1; i < rows.length; i++) {
        const row = document.createElement('tr');
        rows[i].forEach(cell => {
            const td = document.createElement('td');
            td.innerText = cell;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    return table;
}

// Sort table by column
function sortTable(table, columnIndex) {
    const rowsArray = Array.from(table.rows).slice(1); // Skip header row
    const sortedRows = rowsArray.sort((a, b) => {
        const aText = a.cells[columnIndex].innerText.trim();
        const bText = b.cells[columnIndex].innerText.trim();

        if (!isNaN(aText) && !isNaN(bText)) {
            return Number(aText) - Number(bText);
        }
        return aText.localeCompare(bText);
    });

    // Append sorted rows back into the table
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows
    sortedRows.forEach(row => tbody.appendChild(row));
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
