// Global variables to store original order and check setting
let originalOrder = [];
let checkEnabled = false;
let solutionHash = '';

// Simple hash function to create a verification code
function createHash(str) {
    return btoa(str).substring(0, 6);
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
    
    // Store original order indices
    originalOrder = Array.from({ length: lines.length }, (_, i) => i);
    
    // Create a hash of the original solution for verification
    const solutionHash = createHash(lines.join(''));
    
    // Shuffle the lines
    const shuffledLines = shuffleArray([...lines]);
    
    // Encode the shuffled content
    let encoded = btoa(shuffledLines.join("\n"));
    encoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    // Get check setting from UI
    const checkSetting = document.getElementById('checkCorrectness') ? 
                         document.getElementById('checkCorrectness').checked : false;
    
    // Build the URL with parameters
    const curPage = window.location.toString();
    const startPage = curPage.substring(0, curPage.lastIndexOf('/') + 1);
    const link = `${startPage}?code=${encoded}&check=${checkSetting}&hash=${solutionHash}`;
    
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

// Compare current order with original order
function isCorrectOrder() {
    if (!checkEnabled || originalOrder.length === 0) return null;
    
    const currentItems = document.querySelectorAll('#codeLines .list-group-item');
    if (currentItems.length !== originalOrder.length) return false;
    
    // Check if lines are in correct order
    for (let i = 0; i < currentItems.length; i++) {
        const currentIndex = parseInt(currentItems[i].getAttribute('data-index'));
        if (currentIndex !== originalOrder[i]) {
            return false;
        }
    }
    return true;
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
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '50%';
    indicator.style.width = '50px';
    indicator.style.height = '50px';
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.justifyContent = 'center';
    indicator.style.fontSize = '24px';
    
    if (isCorrect === true) {
        indicator.style.backgroundColor = '#28a745'; // Green
        indicator.innerHTML = '✓';
    } else {
        indicator.style.backgroundColor = '#dc3545'; // Red
        indicator.innerHTML = '✗';
    }
    
    document.body.appendChild(indicator);
}

document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let code = urlParams.get('code');
    
    // Get check parameter and hash
    checkEnabled = urlParams.get('check') === 'true';
    solutionHash = urlParams.get('hash') || '';
    
    if (code) {
        code = code.replace(/-/g, '+').replace(/_/g, '/');
        let decoded = atob(code);
        // escape html characters
        decoded = decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const lines = decoded.split('\n');
        const codeLines = document.getElementById('codeLines');
        
        // Populate original order based on data-index
        originalOrder = Array.from({ length: lines.length }, (_, i) => i);
        
        lines.forEach((line, index) => {
            const item = document.createElement('div');
            item.className = 'list-group-item draggable';
            // escape ` and $ characters
            line = line.replace(/`/g, '\\`').replace(/\$/g, '\\$');
            item.innerHTML = `<i class="fa-solid fa-grip-lines"></i> ${line.trim()}`;
            console.log(line.trim());
            item.setAttribute('data-index', index);
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

    // format with prettier
    const code = Array.from(lines).map(line => line.textContent).join('\n');

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
