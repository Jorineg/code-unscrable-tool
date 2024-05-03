function generateLink() {
    const code = document.getElementById('inputCode').value;
    const encoded = btoa(code.split("\n").sort(() => Math.random() - 0.5).join("\n"));
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
    const code = urlParams.get('code');
    if (code) {
        const decoded = atob(code);
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
        formattedCode = code;
    }
    codeBlock.textContent = formattedCode;
    Prism.highlightElement(codeBlock);
}