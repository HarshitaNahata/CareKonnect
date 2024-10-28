let map; // Global map variable
let directionsService;
let directionsRenderer;
let trafficLayer; // Traffic layer variable
let trafficLayerVisible = false; // State for traffic layer visibility
let routesTableVisible = false;
let allMarkers = []; // to dynamically handle markers
let areAmbulanceMarkersVisible = false;
let areHospitalMarkersVisible = false;

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
    removeMarkers();
    displayContent('Hospitals');
    showMap();  // Show map for Hospitals
    //loadAndDisplayHospitals();

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

    if (areHospitalMarkersVisible) {
        // Toggle logic
        removeMarkers();
    } else {
        loadAndDisplayHospitals();
    }

    // Toggle the visibility flag
    areHospitalMarkersVisible = !areHospitalMarkersVisible;
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
                    url: "images/hospitals.png",
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
    select.appendChild(option1);
    const option2 = document.createElement('option');
    option2.text = 'Ambulance 2';
    select.appendChild(option2);
    const option3 = document.createElement('option');
    option3.text = 'Ambulance 3';
    select.appendChild(option3);
    const option4 = document.createElement('option');
    option4.text = 'Ambulance 4';
    select.appendChild(option4);
    const option5 = document.createElement('option');
    option5.text = 'Ambulance 5';
    select.appendChild(option5);


    select.add(option1);
    select.add(option2);
    select.add(option3);
    select.add(option4);
    select.add(option5);
    dynamicContent.appendChild(select);

    const table = document.createElement('table');
    table.id = 'patientTable';
    dynamicContent.appendChild(table);

    // Example data for each ambulance
    const ambulanceData = {
        "Ambulance 1": [
            { name: "Ravi Kumar", timeOfCall: "9:00 AM", timeToReach: "9:15 AM", timeTaken: "15 minutes", hospital: "Apollo Hospital" },
            { name: "Priya Singh", timeOfCall: "11:00 AM", timeToReach: "11:20 AM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Arjun Mehta", timeOfCall: "12:30 PM", timeToReach: "12:50 PM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Neha Verma", timeOfCall: "2:15 PM", timeToReach: "2:30 PM", timeTaken: "15 minutes", hospital: "Max Hospital" },
            { name: "Suresh Patel", timeOfCall: "3:00 PM", timeToReach: "3:20 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Anita Yadav", timeOfCall: "4:00 PM", timeToReach: "4:15 PM", timeTaken: "15 minutes", hospital: "Medanta Hospital" },
            { name: "Rajesh Singh", timeOfCall: "5:30 PM", timeToReach: "5:50 PM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Sunita Rao", timeOfCall: "6:45 PM", timeToReach: "7:05 PM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Vijay Sharma", timeOfCall: "7:30 PM", timeToReach: "7:50 PM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Maya Joshi", timeOfCall: "8:15 PM", timeToReach: "8:35 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" }
        ],
        "Ambulance 2": [
            { name: "Amit Patel", timeOfCall: "10:30 AM", timeToReach: "10:50 AM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Sneha Sharma", timeOfCall: "1:00 PM", timeToReach: "1:25 PM", timeTaken: "25 minutes", hospital: "Medanta Hospital" },
            { name: "Vikas Gupta", timeOfCall: "3:00 PM", timeToReach: "3:20 PM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Meena Nair", timeOfCall: "4:30 PM", timeToReach: "4:50 PM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Ashok Reddy", timeOfCall: "5:15 PM", timeToReach: "5:35 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Seema Paul", timeOfCall: "6:20 PM", timeToReach: "6:40 PM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Naveen Das", timeOfCall: "7:30 PM", timeToReach: "7:50 PM", timeTaken: "20 minutes", hospital: "Medanta Hospital" },
            { name: "Rina Chopra", timeOfCall: "8:10 PM", timeToReach: "8:30 PM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Karan Malhotra", timeOfCall: "9:00 PM", timeToReach: "9:20 PM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Rohit Jain", timeOfCall: "10:00 PM", timeToReach: "10:20 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" }
        ],
        "Ambulance 3": [
            { name: "Mohit Chawla", timeOfCall: "8:00 AM", timeToReach: "8:20 AM", timeTaken: "20 minutes", hospital: "Medanta Hospital" },
            { name: "Pooja Bhatt", timeOfCall: "9:15 AM", timeToReach: "9:35 AM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Gopal Sen", timeOfCall: "10:30 AM", timeToReach: "10:50 AM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Soniya Rani", timeOfCall: "11:20 AM", timeToReach: "11:40 AM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Bhavesh Jain", timeOfCall: "12:10 PM", timeToReach: "12:30 PM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Komal Arora", timeOfCall: "1:00 PM", timeToReach: "1:20 PM", timeTaken: "20 minutes", hospital: "Medanta Hospital" },
            { name: "Deepak Shah", timeOfCall: "2:15 PM", timeToReach: "2:35 PM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Sandeep Verma", timeOfCall: "3:30 PM", timeToReach: "3:50 PM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Manju Rana", timeOfCall: "4:45 PM", timeToReach: "5:05 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Rahul Yadav", timeOfCall: "5:50 PM", timeToReach: "6:10 PM", timeTaken: "20 minutes", hospital: "Apollo Hospital" }
        ],
        "Ambulance 4": [
            { name: "Anil Joshi", timeOfCall: "6:00 AM", timeToReach: "6:20 AM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Lata Menon", timeOfCall: "7:10 AM", timeToReach: "7:30 AM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Ramesh Varma", timeOfCall: "8:25 AM", timeToReach: "8:45 AM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Sunil Bansal", timeOfCall: "9:40 AM", timeToReach: "10:00 AM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Meghna Das", timeOfCall: "11:10 AM", timeToReach: "11:30 AM", timeTaken: "20 minutes", hospital: "Medanta Hospital" },
            { name: "Tarun Rao", timeOfCall: "12:15 PM", timeToReach: "12:35 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Priya Reddy", timeOfCall: "1:45 PM", timeToReach: "2:05 PM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Shyam Mishra", timeOfCall: "3:30 PM", timeToReach: "3:50 PM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Isha Kapoor", timeOfCall: "4:20 PM", timeToReach: "4:40 PM", timeTaken: "20 minutes", hospital: "Medanta Hospital" },
            { name: "Rohan Malhotra", timeOfCall: "5:00 PM", timeToReach: "5:20 PM", timeTaken: "20 minutes", hospital: "Max Hospital" }
        ],
        "Ambulance 5": [
            { name: "Shivani Rao", timeOfCall: "7:30 AM", timeToReach: "7:50 AM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Kiran Mehta", timeOfCall: "8:20 AM", timeToReach: "8:40 AM", timeTaken: "20 minutes", hospital: "Medanta Hospital" },
            { name: "Rahul Jain", timeOfCall: "9:10 AM", timeToReach: "9:30 AM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Vivek Roy", timeOfCall: "10:40 AM", timeToReach: "11:00 AM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Shreya Nair", timeOfCall: "11:55 AM", timeToReach: "12:15 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" },
            { name: "Gita Sharma", timeOfCall: "1:05 PM", timeToReach: "1:25 PM", timeTaken: "20 minutes", hospital: "Apollo Hospital" },
            { name: "Manoj Singh", timeOfCall: "2:15 PM", timeToReach: "2:35 PM", timeTaken: "20 minutes", hospital: "Medanta Hospital" },
            { name: "Jyoti Malik", timeOfCall: "3:00 PM", timeToReach: "3:20 PM", timeTaken: "20 minutes", hospital: "AIIMS" },
            { name: "Arvind Tiwari", timeOfCall: "4:10 PM", timeToReach: "4:30 PM", timeTaken: "20 minutes", hospital: "Max Hospital" },
            { name: "Sapna Goel", timeOfCall: "5:30 PM", timeToReach: "5:50 PM", timeTaken: "20 minutes", hospital: "Fortis Hospital" }
        ]
    };


    // Function to display the table for selected ambulance
    function updateTable(ambulance) {
        const data = ambulanceData[ambulance];
        table.innerHTML = `
            <tr>
                <th>Patient Name</th>
                <th>Time of Call</th>
                <th>Time to Reach</th>
                <th>Time Taken</th>
                <th>Destination Hospital</th>
            </tr>
            ${data.map(patient => `
                <tr>
                    <td>${patient.name}</td>
                    <td>${patient.timeOfCall}</td>
                    <td>${patient.timeToReach}</td>
                    <td>${patient.timeTaken}</td>
                    <td>${patient.hospital}</td>
                </tr>
            `).join('')}
        `;
    }

    // Initial display for Ambulance 1
    updateTable('Ambulance 1');

    // Update table based on selected ambulance
    select.addEventListener('change', function () {
        updateTable(select.value);
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
