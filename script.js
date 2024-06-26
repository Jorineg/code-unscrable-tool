function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateLink() {
    const code = document.getElementById('inputCode').value;
    let encoded = btoa(shuffleArray(code.split("\n")).join("\n"));
    encoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const curPage = window.location.toString();
    const startPage = curPage.substring(0, curPage.lastIndexOf('/') + 1);
    const link = `${startPage}?code=${encoded}`;
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

document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let code = urlParams.get('code');
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
}