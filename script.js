// Utility functions
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
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

// Loggin
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalidd credentials');
        }
    });
}

// Regster
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;
        const password = document.getElementById('password').value;
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            alert('Emaill already exists');
            return;
        }
        const newUser = { id: Date.now(), name, email, age: parseInt(age), password };
        users.push(newUser);
        setUsers(users);
        setCurrentUser(newUser);
        window.location.href = 'dashboard.html';
    });
}

// Dashboard
if (document.querySelector('.dashboard-container')) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    document.getElementById('userGreeting').textContent = `Hello, ${user.name}!`;
    updateDashboard();
}

function updateDashboard() {
    const user = getCurrentUser();
    const transactions = getTransactions(user.id);
    const incomes = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
    const recentList = document.getElementById('recentList');
    if (recentList) {
        recentList.innerHTML = '';
        transactions.slice(-5).reverse().forEach(t => {
            const li = document.createElement('li');
            li.textContent = `${t.date} - ${t.type}: $${t.amount} (${t.category || t.source})`;
            recentList.appendChild(li);
        });
    }
}

// Expense Form
if (document.getElementById('expenseForm')) {
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const transactions = getTransactions(user.id);
        transactions.push({ type: 'expense', amount, category, date, description, id: Date.now() });
        setTransactions(user.id, transactions);
        alert('Expens added!');
        window.location.href = 'dashboard.html';
    });
}

// Income Form
if (document.getElementById('incomeForm')) {
    document.getElementById('incomeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        const amount = parseFloat(document.getElementById('amount').value);
        const source = document.getElementById('source').value;
        const frequency = document.getElementById('frequency').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const transactions = getTransactions(user.id);
        transactions.push({ type: 'income', amount, source, frequency, date, description, id: Date.now() });
        setTransactions(user.id, transactions);
        alert('Incom added!');
        window.location.href = 'dashboard.html';
    });
}

// Budget Form
if (document.getElementById('budgetForm')) {
    document.getElementById('budgetForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const deadline = document.getElementById('deadline').value;
        const budgets = getBudgets(user.id);
        budgets.push({ category, amount, deadline, id: Date.now() });
        setBudgets(user.id, budgets);
        updateBudgetList();
        alert('Budjet set!');
    });
    updateBudgetList();
}

function updateBudgetList() {
    const user = getCurrentUser();
    const budgets = getBudgets(user.id);
    const budgetList = document.getElementById('budgetList');
    if (budgetList) {
        budgetList.innerHTML = '';
        budgets.forEach(b => {
            const li = document.createElement('li');
            li.textContent = `${b.category}: $${b.amount} ${b.deadline ? 'by ' + b.deadline : ''}`;
            budgetList.appendChild(li);
        });
    }
}

// History
if (document.getElementById('historyList')) {
    const user = getCurrentUser();
    const transactions = getTransactions(user.id);
    updateHistoryList(transactions);

    document.getElementById('search').addEventListener('input', filterHistory);
    document.getElementById('filterCategory').addEventListener('change', filterHistory);
    document.getElementById('filterType').addEventListener('change', filterHistory);
}

function updateHistoryList(transactions) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const li = document.createElement('li');
        li.textContent = `${t.date} - ${t.type}: $${t.amount} (${t.category || t.source}) ${t.description ? '- ' + t.description : ''}`;
        historyList.appendChild(li);
    });
}

function filterHistory() {
    const user = getCurrentUser();
    let transactions = getTransactions(user.id);
    const search = document.getElementById('search').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;
    const type = document.getElementById('filterType').value;
    if (search) {
        transactions = transactions.filter(t => t.description.toLowerCase().includes(search) || (t.category || t.source).toLowerCase().includes(search));
    }
    if (category) {
        transactions = transactions.filter(t => t.category === category || t.source === category);
    }
    if (type) {
        transactions = transactions.filter(t => t.type === type);
    }
    updateHistoryList(transactions);
}

// Logout
const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Clear all localStorage data
        localStorage.clear();
        // Force redirect after clearing
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);
    });
}
