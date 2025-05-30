// Global variables to store hash and checking state
let solutionHash = '';
let checkEnabled = false;

// Create hash of lines using CryptoJS SHA-256 and take first 6 characters
function createHash(lines) {
    // Join lines and create hash
    return CryptoJS.SHA256(lines.join('')).toString().substring(0, 6);
}

// Strip whitespace from lines
function stripLines(lines) {
    return lines.map(line => line.trim());
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateLink() {
    const code = document.getElementById('inputCode').value;
    const lines = code.split("\n");
    
    // Strip whitespace from lines before processing
    const strippedLines = stripLines(lines);
    
    // Create a hash of the CORRECT solution (before scrambling)
    const solutionHash = createHash(strippedLines);
    
    // Shuffle the lines
    const shuffledLines = shuffleArray([...strippedLines]);
    
    // Encode the shuffled content
    let encoded = btoa(shuffledLines.join("\n"));
    encoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    // Get check setting from UI
    const checkSetting = document.getElementById('checkCorrectness') ? 
                         document.getElementById('checkCorrectness').checked : false;
    
    // Build the URL with parameters - only include hash if checking is enabled
    const curPage = window.location.toString();
    const startPage = curPage.substring(0, curPage.lastIndexOf('/') + 1);
    let link = `${startPage}?code=${encoded}`;
    
    // Only add hash parameter if correctness checking is enabled
    if (checkSetting) {
        link += `&hash=${solutionHash}`;
    }
    
    document.getElementById('generatedLink').value = link;
}

function updateLinkAndHighlight() {
    generateLink();
    const code = document.getElementById('inputCode').value;
    document.getElementById('codeMirror').textContent = code; // Display raw code
    Prism.highlightElement(document.getElementById('codeMirror'));
}

function copyToClipboard(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        return;
    }

    navigator.clipboard.writeText(element.value || element.textContent)
        .then(() => console.log('Copy command was successful'))
        .catch(err => console.error('Oops, unable to copy', err));
}

// Compare current order with correct solution
function isCorrectOrder() {
    if (!checkEnabled || !solutionHash) return null;
    
    // Get current lines and extract only the code content (not the grip icon)
    const currentItems = document.querySelectorAll('#codeLines .list-group-item');
    const currentLines = Array.from(currentItems).map(item => item.getAttribute('data-content'));
    
    // Create hash of current arrangement and compare with stored hash
    const currentHash = createHash(currentLines);
    return currentHash === solutionHash;
}

// Update or create correctness indicator
function updateCorrectnessIndicator(isCorrect) {
    if (!checkEnabled) return;
    
    // Remove existing indicator if any
    const existingIndicator = document.getElementById('correctnessIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.id = 'correctnessIndicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '20px';
    indicator.style.right = '20px';
    indicator.style.padding = '15px'; // Increased padding for larger size
    indicator.style.borderRadius = '50%';
    indicator.style.width = '70px'; // Increased width
    indicator.style.height = '70px'; // Increased height
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.justifyContent = 'center';
    indicator.style.fontSize = '36px'; // Larger font size
    indicator.style.zIndex = '1000'; // Ensure it's on top
    indicator.style.cursor = 'help'; // Show help cursor on hover
    
    if (isCorrect === true) {
        indicator.style.backgroundColor = '#28a745'; // Green
        indicator.innerHTML = '✓';
        indicator.title = 'Well done, the code is in the correct order'; // Hover text for correct
    } else {
        indicator.style.backgroundColor = '#dc3545'; // Red
        indicator.innerHTML = '✗';
        indicator.title = 'The code is not yet in the correct order'; // Hover text for incorrect
    }
    
    document.body.appendChild(indicator);
}

document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let code = urlParams.get('code');
    
    // Get hash parameter - if present, checking is enabled
    solutionHash = urlParams.get('hash') || '';
    checkEnabled = solutionHash !== '';
    
    if (code) {
        code = code.replace(/-/g, '+').replace(/_/g, '/');
        let decoded = atob(code);
        // escape html characters
        decoded = decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const lines = decoded.split('\n');
        const codeLines = document.getElementById('codeLines');
        
        lines.forEach((line, index) => {
            const item = document.createElement('div');
            item.className = 'list-group-item draggable';
            // escape ` and $ characters
            const cleanLine = line.trim().replace(/`/g, '\\`').replace(/\$/g, '\\$');
            
            // Store the clean line content in a data attribute for correctness checking
            item.setAttribute('data-content', cleanLine);
            item.setAttribute('data-index', index);
            
            // Set the HTML with the grip icon and the line
            item.innerHTML = `<i class="fa-solid fa-grip-lines"></i> ${cleanLine}`;
            console.log(cleanLine);
            
            codeLines.appendChild(item);
        });

        new Sortable(codeLines, {
            animation: 150,
            onSort: () => updateCodeDisplay()
        });

        updateCodeDisplay();
    }
    
    // Initialize UI for new_scramble.html if needed
    const checkboxContainer = document.getElementById('checkboxContainer');
    if (checkboxContainer) {
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check mt-3';
        checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" id="checkCorrectness">
            <label class="form-check-label" for="checkCorrectness">
                Show correctness indicator
                <p class="text-muted small mt-1">Adds a visual indicator showing if code is in correct order</p>
            </label>
        `;
        checkboxContainer.appendChild(checkbox);
        
        // Update link when checkbox changes
        document.getElementById('checkCorrectness').addEventListener('change', generateLink);
    }
});

async function updateCodeDisplay() {
    const codeBlock = document.getElementById('displayCode');
    const lines = document.querySelectorAll('#codeLines .list-group-item');
    codeBlock.innerHTML = '';

    // Extract clean code content from data-content attributes
    const code = Array.from(lines).map(line => line.getAttribute('data-content')).join('\n');

    let formattedCode = '';
    try {
        formattedCode = await prettier.format(code, {
            parser: 'babel',
            plugins: prettierPlugins,
        });
    } catch (e) {
        try {
            formattedCode = await prettier.format("function " + code, {
                parser: 'babel',
                plugins: prettierPlugins,
            });
            formattedCode = formattedCode.substring(9);
        } catch (e) {
            formattedCode = code;
        }
    }
    codeBlock.textContent = formattedCode;
    Prism.highlightElement(codeBlock);
    
    // Check correctness and update indicator
    if (checkEnabled) {
        const isCorrect = isCorrectOrder();
        updateCorrectnessIndicator(isCorrect);
    }
}
