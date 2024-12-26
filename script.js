const API_URL = 'https://www.call2all.co.il/ym/api/';
let token = null;

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('נא להזין שם משתמש וסיסמה');
        return;
    }

    try {
        const response = await fetch(`${API_URL}Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.responseStatus === 'OK' && data.token) {
            token = data.token;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('messagesSection').style.display = 'block';
            loadMessages();
        } else {
            alert(data.message || 'שגיאה בהתחברות');
        }
    } catch (error) {
        alert('שגיאה בהתחברות למערכת');
        console.error('Login error:', error);
    }
}

async function logout() {
    if (!token) return;

    try {
        await fetch(`${API_URL}Logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        token = null;
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('messagesSection').style.display = 'none';
        document.getElementById('messagesList').innerHTML = '';
    }
}

async function loadMessages() {
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}GetSmsIncomingLog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                token,
                limit: 100 // מספר ההודעות האחרונות להצגה
            })
        });

        const data = await response.json();

        if (data.responseStatus === 'OK' && data.rows) {
            displayMessages(data.rows);
        } else {
            alert(data.message || 'שגיאה בטעינת ההודעות');
        }
    } catch (error) {
        alert('שגיאה בטעינת ההודעות');
        console.error('Load messages error:', error);
    }
}

function displayMessages(messages) {
    const container = document.getElementById('messagesList');
    const template = document.getElementById('message-template');
    container.innerHTML = '';

    messages.forEach(msg => {
        // יצירת עותק של התבנית
        const messageElement = template.content.cloneNode(true);
        
        // עדכון התוכן
        messageElement.querySelector('.date').textContent = `תאריך: ${new Date(msg.server_date).toLocaleString()}`;
        messageElement.querySelector('.sender').textContent = `מאת: ${msg.phone}`;
        messageElement.querySelector('.message-content').textContent = msg.message;
        messageElement.querySelector('.recipient').textContent = `נשלח אל: ${msg.dest}`;
        
        // הוספה לדף
        container.appendChild(messageElement);
    });
}
