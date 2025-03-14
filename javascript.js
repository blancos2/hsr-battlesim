
let characters = [];

// Function to load characters from the JSON file
async function loadCharacterData() {
    try {
        const response = await fetch('assets/hsr_collections.json');
        characters = await response.json();

        // Debugging: log the fetched character data
        console.log(characters);
        
        populateSelect();
    } catch (error) {
        console.error('Error loading character data:', error);
    }
}

// Populate the select dropdowns with character names
function populateSelect() {
    // Debugging: check if the data is loaded
    if (characters.length === 0) {
        console.error("No characters found in JSON.");
        return;
    }

    // Loop through each profile (chr1, chr2, etc.)
    for (let i = 1; i <= 4; i++) {
        let select = document.getElementById(`chr${i}-select`);
        // Clear any existing options in the dropdown
        select.innerHTML = '<option value="">Select a character</option>';

        // Populate the dropdown with character names
        characters.forEach(character => {
            let option = document.createElement('option');
            option.value = character.name;
            option.textContent = character.name;
            select.appendChild(option);
        });
    }
}


// Update the base SPD for the selected character
function updateCharacterSPD(profile) {
    let select = document.getElementById(`chr${profile}-select`);
    let selectedName = select.value;
    let character = characters.find(char => char.name === selectedName);
    let filepath = character.imgpath;
    
    if (character) {
        document.getElementById(`chr${profile}-bSPD`).textContent = character.bSPD;
       // Properly embed the Google Drive file in an iframe
    //let iframe = document.createElement("iframe");
    //iframe.src = `https://drive.google.com/file/d/${filepath}/preview`;
    //iframe.width = "640";
    //iframe.height = "480";
    //iframe.allow = "autoplay";

    // Replace the existing content inside the image container
    //let imgContainer = document.getElementById(`chr${profile}-img`);
    //imgContainer.innerHTML = ""; // Clear previous content
    //imgContainer.appendChild(iframe);
    
    } else {
        document.getElementById(`chr${profile}-bSPD`).textContent = " - ";
    }
}
// updates the character name 
function updateCharacterName(profile){
    let select = document.getElementById(`chr${profile}-select`);
    let selectedName = select.value;
    document.getElementById(`chr${profile}-name`).textContent = selectedName;

}


// Ensure the DOM is loaded before executing the script
window.onload = loadCharacterData;

// AV CALCULATIONS 
let totalAVElapsed = 0; // Track total AV elapsed
let totalCycles = 0; // Track total cycles 

function getTurnOrder() {
     // Get the values from the inputs
     let cycleValue = document.getElementById("cycleInput").value;
     let totalAVValue = document.getElementById("totalAVInput").value;
     let enemyChecked = document.getElementById("enemyCheckbox").checked;
     let enemySPDValue = document.getElementById("enemySPDInput").value;
 
    
     console.log("Cycle:", cycleValue);
     console.log("Total AV:", totalAVValue);
     console.log("Enemy?:", enemyChecked ? "Yes" : "No");
     console.log("Enemy SPD:", enemySPDValue);

    updateCharacterName(1);
    updateCharacterName(2);
    updateCharacterName(3);
    updateCharacterName(4);

    // Reset total AV elapsed
    totalAVElapsed = 0;
    
    let AVLimit = parseFloat(document.getElementById("totalAVInput").value) || 0; // get total AV limit

    // Initial AV for all characters
    let initialAV = 10000;

    // Get character speeds
    let chr1SPD = parseFloat(document.getElementById("chr1_vSPDInput").value) || 0;
    let chr2SPD = parseFloat(document.getElementById("chr2_vSPDInput").value) || 0;
    let chr3SPD = parseFloat(document.getElementById("chr3_vSPDInput").value) || 0;
    let chr4SPD = parseFloat(document.getElementById("chr4_vSPDInput").value) || 0;

    let chr1Name = document.getElementById('chr1-select').value;
    let chr2Name = document.getElementById('chr2-select').value;
    let chr3Name = document.getElementById('chr3-select').value;
    let chr4Name = document.getElementById('chr4-select').value;

    // Check if the enemy is included
    let enemySPD = enemyChecked ? parseFloat(document.getElementById("enemySPDInput").value) || 0 : null;

    // Store all participants with their computed AV turns
    let participants = [
        { name: chr1Name, AV: initialAV / chr1SPD, SPD: chr1SPD, elementId: "chr1-select", avElement: "chr1-AV", actionsTaken: 0 },
        { name: chr2Name, AV: initialAV / chr2SPD, SPD: chr2SPD, elementId: "chr2-select", avElement: "chr2-AV", actionsTaken: 0 },
        { name: chr3Name, AV: initialAV / chr3SPD, SPD: chr3SPD, elementId: "chr3-select", avElement: "chr3-AV", actionsTaken: 0 },
        { name: chr4Name, AV: initialAV / chr4SPD, SPD: chr4SPD, elementId: "chr4-select", avElement: "chr4-AV", actionsTaken: 0 }
    ];

    // Add enemy if applicable
    if (enemyChecked) {
        participants.push({ name: "Enemy", AV: initialAV / enemySPD, SPD: enemySPD, elementId: "enemy-select", avElement: "enemy-AV", actionsTaken: 0});
    }

    // Remove invalid participants (SPD = 0)
    participants = participants.filter(p => p.SPD > 0);

    // Clear previous turn log
    let logContainer = document.getElementById("turn-log");
    logContainer.innerHTML = "";

    let turnLog = [];
    
    while (totalAVElapsed < AVLimit) {
        // Sort participants by AV in ascending order (first move is the one with smallest AV)
        participants.sort((a, b) => a.AV - b.AV);

        let nextTurn = participants[0]; // First character to act
        let avThisTurn = nextTurn.AV;

        // Update AV elapsed
        totalAVElapsed += avThisTurn;

        // Update participant's action count
        nextTurn.actionsTaken++;

        // Update cycle count
        let cycle = totalAVElapsed <= 150 ? Math.floor(totalAVElapsed / 150) : 1 + Math.floor((totalAVElapsed - 150) / 100);

        // Log the action
        let logEntry = `[Cycle: ${cycle}] ${nextTurn.name} acts at ${totalAVElapsed.toFixed(3)} AV`;
        turnLog.push(logEntry);

        // Update all participants' AV
        participants.forEach(p => p.AV -= avThisTurn);

        // Reset the AV of the acting character
        nextTurn.AV = initialAV / nextTurn.SPD;

        // Update the HTML
       
        

        // Display log in HTML
        let newLogEntry = document.createElement("p");
        newLogEntry.textContent = logEntry; 
        logContainer.appendChild(newLogEntry);
    }
}
