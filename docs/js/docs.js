// Docs script for Flint UI Library
// Handles mobile menu toggle and basic interactions

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuButton = document.querySelector('.menu-button');
    const nav = document.querySelector('.nav');
    
    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('nav--open');
        });
    }

    // Copy code button functionality
    const codeBlocks = document.querySelectorAll('.docs-code code');
    codeBlocks.forEach(block => {
        const wrapper = block.closest('.docs-code');
        if (wrapper) {
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
            
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                    }, 2000);
                });
            });
            
            wrapper.appendChild(copyBtn);
        }
    });
});