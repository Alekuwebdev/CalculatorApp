(function () {
    const output = document.getElementById('output');
    const historyEl = document.getElementById('history');
    let expr = '';

    function sanitizeForEval(s) {
        // replace unicode operators with JS operators
        s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        // Replace percentage like 50% => (50/100)
        s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
        // only allow digits, basic operators, parentheses, dot and spaces
        if (!/^[-+*/(). 0-9%]+$/.test(s)) {
            throw new Error('Espressione non valida');
        }
        return s;
    }

    function updateDisplay() {
        output.textContent = expr || '0';
    }

    function append(ch) {
        // prevent multiple dots in a single number
        const lastToken = expr.split(/[^0-9.]|\s+/).pop();
        if (ch === '.' && /\./.test(lastToken)) return;
        expr += ch;
        updateDisplay();
    }

    function clearAll() { expr = ''; updateDisplay(); historyEl.textContent = ''; }
    function backspace() { expr = expr.slice(0, -1); updateDisplay(); }

    function compute() {
        try {
            const safe = sanitizeForEval(expr);
            // evaluate using Function (safer than eval in this context)
            const result = Function('return (' + safe + ')')();
            historyEl.textContent = expr + ' =';
            expr = String(Number.parseFloat(result.toPrecision(12))).replace(/\.?0+$/, '');
            updateDisplay();
        } catch (e) {
            output.textContent = 'Errore';
            setTimeout(() => updateDisplay(), 900);
        }
    }

    document.querySelector('.keys').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const val = btn.getAttribute('data-value');
        const action = btn.getAttribute('data-action');
        if (action === 'clear') { clearAll(); }
        else if (action === 'back') { backspace(); }
        else if (action === 'equals') { compute(); }
        else if (action === 'percent') { append('%'); }
        else if (val) { append(val); }
    });

    window.addEventListener('keydown', e => {
        if (e.key >= '0' && e.key <= '9') append(e.key);
        else if (['+', '-', '*', '/', '(', ')', '.'].includes(e.key)) append(e.key);
        else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); compute(); }
        else if (e.key === 'Backspace') backspace();
        else if (e.key === 'Escape') clearAll();
    });

    // init
    updateDisplay();
})();