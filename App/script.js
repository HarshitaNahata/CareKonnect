document.getElementById('imgRoutes').addEventListener('click', function () {
    displayContent('Routes');
});

document.getElementById('imgAmbulance').addEventListener('click', function () {
    displayContent('Ambulances');
});

document.getElementById('imgHospitals').addEventListener('click', function () {
    displayContent('Hospitals');
});

function displayContent(contentType) {
    // Update the content based on the image clicked
    const dynamicContent = document.getElementById('dynamic-content');

    // Remove the existing content
    dynamicContent.innerHTML = ''; // Clear current content

    // Create new content to display
    const newDiv = document.createElement('div');
    newDiv.className = 'new-content';
    newDiv.innerText = contentType; // Add the corresponding text ("Routes", "Ambulances", or "Hospitals")

    // Create the light grey rectangle
    const greyRectangle = document.createElement('div');
    greyRectangle.className = 'light-grey-rectangle'; // Light grey rectangle with specified height and width

    // Append the text and rectangle to the dynamic content
    dynamicContent.appendChild(newDiv);
    dynamicContent.appendChild(greyRectangle);
}
