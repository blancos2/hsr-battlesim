function getInputValues() {
    // Get the values from the inputs
    let cycleValue = document.getElementById("cycleInput").value;
    let totalAVValue = document.getElementById("totalAVInput").value;
    let enemyChecked = document.getElementById("enemyCheckbox").checked;
    let enemySPDValue = document.getElementById("enemySPDInput").value;

   
    console.log("Cycle:", cycleValue);
    console.log("Total AV:", totalAVValue);
    console.log("Enemy?:", enemyChecked ? "Yes" : "No");
    console.log("Enemy SPD:", enemySPDValue);

}let characters = [];

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
    
    if (character) {
        document.getElementById(`chr${profile}-bSPD`).textContent = character.bSPD;
    } else {
        document.getElementById(`chr${profile}-bSPD`).textContent = " - ";
    }
}

function updateCharacterName(profile){
    let select = document.getElementById(`chr${profile}-select`);
    let selectedName = select.value;
    let character = characters.find(char => char.name === selectedName);
    document.getElementById(`chr${profile}-name`).textContent = selectedName;

}

// Ensure the DOM is loaded before executing the script
window.onload = loadCharacterData;

// AV CALCULATIONS 
let totalAVElapsed = 0; // Track total AV elapsed

function getTurnOrder() {
    updateCharacterName(1);
    updateCharacterName(2);
    updateCharacterName(3);
    updateCharacterName(4);

    // Reset total AV elapsed
    totalAVElapsed = 0;

    // Initial AV for all characters
    let initialAV = 10000;

    // Get character speeds
    let chr1SPD = parseFloat(document.getElementById("chr1_vSPDInput").value) || 0;
    let chr2SPD = parseFloat(document.getElementById("chr2_vSPDInput").value) || 0;
    let chr3SPD = parseFloat(document.getElementById("chr3_vSPDInput").value) || 0;
    let chr4SPD = parseFloat(document.getElementById("chr4_vSPDInput").value) || 0;

    // Check if the enemy is included
    let enemyChecked = document.getElementById("enemyCheckbox").checked;
    let enemySPD = enemyChecked ? parseFloat(document.getElementById("enemySPDInput").value) || 0 : null;

    // Store all participants with their computed AV turns
    let participants = [
        { name: "Character 1", AV: initialAV / chr1SPD, SPD: chr1SPD, elementId: "chr1-select", hasMoved: false },
        { name: "Character 2", AV: initialAV / chr2SPD, SPD: chr2SPD, elementId: "chr2-select", hasMoved: false },
        { name: "Character 3", AV: initialAV / chr3SPD, SPD: chr3SPD, elementId: "chr3-select", hasMoved: false },
        { name: "Character 4", AV: initialAV / chr4SPD, SPD: chr4SPD, elementId: "chr4-select", hasMoved: false }
    ];

    // Add enemy if applicable
    if (enemyChecked) {
        participants.push({ name: "Enemy", AV: initialAV / enemySPD, SPD: enemySPD, elementId: "enemy-select", hasMoved: false });
    }

    // Remove invalid participants (SPD = 0)
    participants = participants.filter(p => p.SPD > 0);

    let actionOrderDiv = document.getElementById("action-order-list");
    actionOrderDiv.innerHTML = ""; // Clear previous results

    // Track turn order and only display when a participant takes their first turn
    while (participants.some(p => !p.hasMoved)) {
        // Find the next character to act (lowest AV)
        let nextTurn = participants.reduce((prev, curr) => (curr.AV < prev.AV ? curr : prev));

        // Update total AV elapsed
        totalAVElapsed += nextTurn.AV;

        // Display action only for the first turn
        if (!nextTurn.hasMoved) {
            document.getElementById(nextTurn.nameId).innerText = nextTurn.name;
            document.getElementById(nextTurn.avId).innerText = totalAVElapsed.toFixed(2);

            // Add to action order log
            let turnLog = document.createElement("p");
            turnLog.innerText = `${nextTurn.name} moves at ${totalAVElapsed.toFixed(2)} AV.`;
            actionOrderDiv.appendChild(turnLog);

            nextTurn.hasMoved = true; // Mark as moved
        }

        // Update all AV values (subtracting the elapsed AV)
        participants.forEach(p => p.AV -= nextTurn.AV);

        // Reset the AV of the character that just moved
        nextTurn.AV = initialAV / nextTurn.SPD;
    }
}