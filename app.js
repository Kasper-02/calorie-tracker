// ====== Data ======
let entries = [];
const STORAGE_KEY = 'calories_data';

// ====== DOM Elements ======
const productInput = document.getElementById('productInput');
const caloriesInput = document.getElementById('caloriesInput');
const addBtn = document.getElementById('addBtn');
const tableBody = document.getElementById('tableBody');
const totalSpan = document.getElementById('totalCalories');
const clearBtn = document.getElementById('clearBtn');
const panicSection = document.getElementById('panic-section');

// ====== Load data on start ======
loadData();
renderTable();
updateTotal();

// ====== Add product ======
addBtn.addEventListener('click', function() {
    const name = productInput.value.trim();
    const calories = caloriesInput.value.trim();

    if (name === '' || calories === '') {
        alert('Please fill in both fields!');
        return;
    }

    const caloriesNum = Number(calories);
    if (isNaN(caloriesNum) || caloriesNum <= 0) {
        alert('Calories must be a positive number!');
        return;
    }

    const entry = {
        id: Date.now(),
        name: name,
        calories: caloriesNum,
        date: new Date().toLocaleDateString('en-GB')
    };

    entries.push(entry);
    saveData();
    renderTable();
    updateTotal();
    checkPanic();

    productInput.value = '';
    caloriesInput.value = '';
    productInput.focus();
});

// ====== Render table ======
function renderTable() {
    tableBody.innerHTML = '';

    if (entries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#999;">Nothing eaten yet :(</td></tr>';
        return;
    }

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.calories}</td>
            <td>${entry.date}</td>
            <td><button class="delete-btn" data-id="${entry.id}">🗑</button></td>
        `;
        tableBody.appendChild(tr);
    }

    document.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = Number(this.getAttribute('data-id'));
            deleteEntry(id);
        });
    });
}

// ====== Delete entry ======
function deleteEntry(id) {
    entries = entries.filter(function(entry) {
        return entry.id !== id;
    });
    saveData();
    renderTable();
    updateTotal();
    checkPanic();
}

// ====== Update total ======
function updateTotal() {
    let total = 0;
    for (let i = 0; i < entries.length; i++) {
        total += entries[i].calories;
    }
    totalSpan.textContent = total;
    return total;
}

// ====== Check panic ======
function checkPanic() {
    const total = updateTotal();
    panicSection.innerHTML = '';

    if (total > 2000 && total <= 3000) {
        panicSection.innerHTML = `
            <div class="panic-box">
                <h3>⚠️ Warning!</h3>
                <p>You've exceeded 2000 kcal! Your belly demands a ransom — 500 push-ups!</p>
            </div>
        `;
    } else if (total > 3000) {
        panicSection.innerHTML = `
            <div class="panic-box">
                <h3>🚨 PANIC!</h3>
                <p>You ate ${total} kcal! Run to the gym now! The coach is on the way!</p>
                <button onclick="alert('SAVE YOURSELF! Run to the treadmill! 🏃')" style="margin-top:10px; background:#d63031;">
                    🏃 Panic Button
                </button>
            </div>
        `;
    }
}

// ====== Clear all ======
clearBtn.addEventListener('click', function() {
    if (confirm('Delete all entries? This cannot be undone!')) {
        entries = [];
        saveData();
        renderTable();
        updateTotal();
        checkPanic();
    }
});

// ====== Save to localStorage ======
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ====== Load from localStorage ======
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        entries = JSON.parse(data);
    }
}

// ====== Enter key support ======
productInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        caloriesInput.focus();
    }
});

caloriesInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

console.log('App loaded successfully!');