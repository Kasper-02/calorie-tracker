// ====== Data ======
let entries = [];
const STORAGE_KEY = 'calories_data';

// ====== Chart.js ======
let chartInstance = null;

// ====== Встроенная база продуктов (ккал на 100 г) ======
const foodDB = {
    "курица": 165,
    "chicken": 165,
    "говядина": 250,
    "beef": 250,
    "свинина": 320,
    "pork": 320,
    "баранина": 280,
    "lamb": 280,
    "рыба": 110,
    "fish": 110,
    "минтай": 70,
    "pollock": 70,
    "треска": 75,
    "cod": 75,
    "рис": 130,
    "rice": 130,
    "гречка": 110,
    "buckwheat": 110,
    "овсянка": 88,
    "oats": 88,
    "макароны": 131,
    "pasta": 131,
    "хлеб": 265,
    "bread": 265,
    "багет": 300,
    "baguette": 300,
    "картофель": 77,
    "potato": 77,
    "морковь": 41,
    "carrot": 41,
    "лук": 40,
    "onion": 40,
    "помидор": 18,
    "tomato": 18,
    "огурец": 15,
    "cucumber": 15,
    "капуста": 28,
    "cabbage": 28,
    "яблоко": 52,
    "apple": 52,
    "банан": 89,
    "banana": 89,
    "апельсин": 47,
    "orange": 47,
    "груша": 57,
    "pear": 57,
    "молоко": 64,
    "milk": 64,
    "творог": 121,
    "cottage cheese": 121,
    "сыр": 350,
    "cheese": 350,
    "кефир": 40,
    "kefir": 40,
    "яйцо": 155,
    "egg": 155,
    "масло сливочное": 748,
    "butter": 748,
    "масло подсолнечное": 899,
    "sunflower oil": 899,
    "оливковое масло": 884,
    "olive oil": 884,
    "сахар": 387,
    "sugar": 387,
    "мёд": 304,
    "honey": 304,
    "шоколад": 546,
    "chocolate": 546,
    "грецкий орех": 654,
    "walnut": 654,
    "миндаль": 579,
    "almond": 579,
    "кофе": 2,
    "coffee": 2,
    "чай": 1,
    "tea": 1
};

// ====== DOM Elements ======
const productInput = document.getElementById('productInput');
const weightInput = document.getElementById('weightInput');
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
renderChart();

// ====== Add product ======
addBtn.addEventListener('click', function() {
    const name = productInput.value.trim().toLowerCase();
    const weight = Number(weightInput.value.trim());
    const manualCalories = Number(caloriesInput.value.trim());

    if (name === '' || isNaN(weight) || weight <= 0) {
        alert('Please enter a product name and a valid weight!');
        return;
    }

    let totalCalories = 0;
    let source = '';

    if (foodDB[name]) {
        const caloriesPer100g = foodDB[name];
        totalCalories = Math.round((caloriesPer100g * weight) / 100);
        source = `${caloriesPer100g} kcal/100g`;
    } else if (!isNaN(manualCalories) && manualCalories > 0) {
        totalCalories = Math.round(manualCalories);
        source = 'manual input';
    } else {
        alert('Product not found in database. Please enter calories manually!');
        return;
    }

    const entry = {
        id: Date.now(),
        name: name,
        calories: totalCalories,
        weight: weight,
        source: source,
        date: new Date().toLocaleDateString('en-GB')
    };

    entries.push(entry);
    saveData();
    renderTable();
    updateTotal();
    checkPanic();
    renderChart();

    productInput.value = '';
    weightInput.value = '';
    caloriesInput.value = '';
    productInput.focus();
});

// ====== Render table ======
function renderTable() {
    tableBody.innerHTML = '';

    if (entries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Nothing eaten yet :(</td></tr>';
        return;
    }

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.calories}</td>
            <td>${entry.weight}g</td>
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
    renderChart();
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
        renderChart();
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
        weightInput.focus();
    }
});

weightInput.addEventListener('keypress', function(e) {
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

// ====== Dark theme ======
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark');

    if (document.body.classList.contains('dark')) {
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
}

// ====== Render Chart ======
function renderChart() {
    const ctx = document.getElementById('caloriesChart');
    if (!ctx) return;

    const days = [];
    const totals = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-GB');
        days.push(dateStr);

        const dayTotal = entries
            .filter(e => e.date === dateStr)
            .reduce((sum, e) => sum + e.calories, 0);
        totals.push(dayTotal);
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Calories per day',
                data: totals,
                backgroundColor: 'rgba(230, 126, 34, 0.6)',
                borderColor: 'rgba(230, 126, 34, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ====== Export CSV ======
function exportCSV() {
    if (entries.length === 0) {
        alert('No data to export!');
        return;
    }

    let csv = 'Food,kcal,Weight,Date\n';

    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        csv += `${e.name},${e.calories},${e.weight},${e.date}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calories_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ====== Кнопка экспорта ======
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', exportCSV);
}
