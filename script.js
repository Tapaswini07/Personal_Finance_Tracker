const API_BASE = '';

async function apiRegister({ name, email, age, password }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, age, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text(); // server currently returns text
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // server returns { id, name, age }
}

async function apiGetTransactions(userId) {
  const res = await fetch(`${API_BASE}/transactions/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiCreateTransaction(tx) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

async function apiGetBudgets(userId) {
  const res = await fetch(`${API_BASE}/budgets/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiCreateBudget(budget) {
  const res = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

async function apiGetUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Utility functions
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getTransactions(userId) {
    return JSON.parse(localStorage.getItem(`transactions_${userId}`)) || [];
}

function setTransactions(userId, transactions) {
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
}

function getBudgets(userId) {
    return JSON.parse(localStorage.getItem(`budgets_${userId}`)) || [];
}

function setBudgets(userId, budgets) {
    localStorage.setItem(`budgets_${userId}`, JSON.stringify(budgets));
}

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const user = await apiLogin(email, password);
      setCurrentUser(user); // keep your storage for session
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert(err.message);
    }
  });
}

// Register
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;
        const password = document.getElementById('password').value;
        const users = await apiGetUsers();
        if (users.find(u => u.email === email)) {
            alert('Email already exists');
            return;
        }
        try {
            await apiRegister({ name, email, age, password });
            const user = await apiLogin(email, password);
            setCurrentUser(user);
            window.location.href = 'dashboard.html';
        } catch (err) {
            alert(err.message);
        }
    });
} 

// Dashboard
if (document.querySelector('.dashboard-header')) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    document.getElementById('userGreeting').textContent = `Hello, ${user.name}!`;
    updateDashboard(); // this now calls an async function
}

async function updateDashboard() {
    const user = getCurrentUser();
    try {
        const transactions = await apiGetTransactions(user.id);
        const incomes = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        const totalIncome = incomes.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const balance = totalIncome - totalExpenses;
        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
        const recentList = document.getElementById('recentList');
        if (recentList) {
            recentList.innerHTML = '';
            transactions.slice(-5).reverse().forEach(t => {
                const li = document.createElement('li');
                const date = new Date(t.date);
                const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                li.textContent = `${formattedDate} - ${t.type}: $${parseFloat(t.amount).toFixed(2)} (${t.category || t.source})`;
                recentList.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Failed to load transactions:', err);
        alert('Error loading dashboard');
    }
}

// Expense Form
if (document.getElementById('expenseForm')) {
    document.getElementById('expenseForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        try {
            await apiCreateTransaction({
                user_id: user.id,
                type: 'expense',
                amount,
                category,
                date,
                description
            });
            alert('Expense added!');
            window.location.href = 'dashboard.html';
        } catch (err) {
            alert(err.message);
        }
    });
}

// Income Form
if (document.getElementById('incomeForm')) {
    document.getElementById('incomeForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        const amount = parseFloat(document.getElementById('amount').value);
        const source = document.getElementById('source').value;
        const frequency = document.getElementById('frequency').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        try {
            await apiCreateTransaction({
                user_id: user.id,
                type: 'income',
                amount,
                source,
                frequency,
                date,
                description
            });
            alert('Income added!');
            window.location.href = 'dashboard.html';
        } catch (err) {
            alert(err.message);
        }
    });
}

// Budget Form
if (document.getElementById('budgetForm')) {
    document.getElementById('budgetForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const deadline = document.getElementById('deadline').value;
        try {
            await apiCreateBudget({
                user_id: user.id,
                category,
                amount,
                deadline
            });
            alert('Budget set!');
            loadBudgetsFromDB(); // reload from database
        } catch (err) {
            alert(err.message);
        }
    });
    loadBudgetsFromDB(); // load on page init
}

async function loadBudgetsFromDB() {
    const user = getCurrentUser();
    try {
        const budgets = await apiGetBudgets(user.id);
        updateBudgetList(budgets);
    } catch (err) {
        console.error('Failed to load budgets:', err);
    }
}

function updateBudgetList(budgets) {
    const budgetList = document.getElementById('budgetList');
    if (budgetList) {
        budgetList.innerHTML = '';
        budgets.forEach(b => {
            const li = document.createElement('li');
            let deadlineText = '';
            if (b.deadline) {
                const date = new Date(b.deadline);
                deadlineText = ' by ' + date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }
            li.textContent = `${b.category}: $${parseFloat(b.amount).toFixed(2)}${deadlineText}`;
            budgetList.appendChild(li);
        });
    }
}

// History
if (document.getElementById('historyList')) {
    const user = getCurrentUser();
    loadHistoryFromDB();

    document.getElementById('search').addEventListener('input', filterHistory);
    document.getElementById('filterCategory').addEventListener('change', filterHistory);
    document.getElementById('filterType').addEventListener('change', filterHistory);
}

async function loadHistoryFromDB() {
    const user = getCurrentUser();
    try {
        const transactions = await apiGetTransactions(user.id);
        updateHistoryList(transactions);
    } catch (err) {
        console.error('Failed to load history:', err);
        alert('Error loading transaction history');
    }
}

function updateHistoryList(transactions) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const li = document.createElement('li');
        const date = new Date(t.date);
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        li.textContent = `${formattedDate} - ${t.type}: $${parseFloat(t.amount).toFixed(2)} (${t.category || t.source}) ${t.description ? '- ' + t.description : ''}`;
        historyList.appendChild(li);
    });
}

async function filterHistory() {
    const user = getCurrentUser();
    try {
        let transactions = await apiGetTransactions(user.id); // ← fetch from DB
        const search = document.getElementById('search').value.toLowerCase();
        const category = document.getElementById('filterCategory').value;
        const type = document.getElementById('filterType').value;
        if (search) {
            transactions = transactions.filter(t => 
                (t.description && t.description.toLowerCase().includes(search)) || 
                (t.category || t.source || '').toLowerCase().includes(search)
            );
        }
        if (category) {
            transactions = transactions.filter(t => t.category === category || t.source === category);
        }
        if (type) {
            transactions = transactions.filter(t => t.type === type);
        }
        updateHistoryList(transactions);
    } catch (err) {
        console.error('Failed to filter history:', err);
    }
}

// Logout
// const logoutBtn = document.getElementById('logout');
// if (logoutBtn) {
//     logoutBtn.addEventListener('click', function(e) {
//         e.preventDefault();
//         e.stopPropagation();
//         console.log('Logout clicked — clearing session and redirecting');
//         // Remove only session data (keep registered users)
//         localStorage.removeItem('currentUser');
//         // Replace location to avoid back navigation to dashboard
//         location.replace('/');
//     });

    // include nav and initialize its handlers
async function includeNav() {
  const container = document.getElementById('sidebar');
  if (!container) return;
  try {
    const res = await fetch('nav.html');
    if (!res.ok) throw new Error('Nav fetch failed: ' + res.status);
    container.innerHTML = await res.text();
    attachNavHandlers(); // attach logout etc.
  } catch (err) {
    console.error('Failed to load nav:', err);
  }
}

function logoutClick(e) {
  e.preventDefault();
  e.stopPropagation();
  localStorage.removeItem('currentUser');
  location.replace('/');
}

function attachNavHandlers() {
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.removeEventListener('click', logoutClick);
    logoutBtn.addEventListener('click', logoutClick);
  }

  // Set active class based on current page and update on click
  function setActiveNav() {
    const links = document.querySelectorAll('#sidebar a[href]');
    // current file (e.g., 'dashboard.html' or 'index.html' for root)
    const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.forEach(link => {
      let href = link.getAttribute('href') || '';
      // ignore hash or javascript links
      if (href.startsWith('#') || href.startsWith('javascript:')) {
        link.classList.remove('active');
        return;
      }
      const linkFile = (href.split('/').pop() || (href === '/' ? 'index.html' : '')).toLowerCase();
      if (linkFile === currentFile || (currentFile === '' && (linkFile === 'index.html' || href === '/'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // update active now
  setActiveNav();

  // update active immediately when a nav link is clicked (for better UX)
  const links = document.querySelectorAll('#sidebar a[href]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', includeNav);

