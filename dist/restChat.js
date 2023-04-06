/**
 * @author Ricky Alvarez
 * @github https://github.com/raulduk3
 * @create date 2023-03-29 04:55:58
 * @modify date 2023-03-29 04:55:58
 * @desc JavaScript for chat.html
 */
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// ---- Get token (url/localStorage) -----------------------------------------------------
const token = localStorage.getItem('token') ? localStorage.getItem('token') : 
    urlParams.get('token') ? urlParams.get('token') : '';

// ---- Verify token  --------------------------------------------------------------------
fetch(`http://3.22.149.75:5005/?token=${token}`)
    .then((response) => { return response.json() })
    .then((data) => {
        if(data.authed)
        {
            localStorage.setItem('token', token);
        }
        else
        {
            localStorage.clear();
            window.location.replace('http://3.22.149.75/restChat/');
        }
    })
    .catch((err) => {
        console.log(err);
    });

// ---- Initialize Socket ----------------------------------------------------------------
const socket = io('http://3.22.149.75:5005');
let room = '';

// ---- Verify token again ---------------------------------------------------------------
socket.emit('join', { token: token });
socket.on('join', (res) => {
    if(res.status == 'fail')
    {
        localStorage.clear();
        window.location.replace('http://3.22.149.75/restChat/');
    }
    else
    {
        room = res.room;
        $('#chatbox').html(res.messages.map(({message, author, timeStamp})=>{
            return `<p class="d-flex flex-row mt-2 mb-3"><span class="flex-grow-1 d-flex"><span style='font-weight: bold;'>${author.username}:</span> <span class="flex-grow-1 pl-2" style="max-width: 80%; padding-left:5px;">${message}</span><span>${new Date(timeStamp).toLocaleString()}</span></span></p>`
        }).join(''));
        $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
    }
});

// ---- Update user list -----------------------------------------------------------------
socket.on('updateList', ({ users }) => {
    $('#user-list').html(users.map(({username, room})=>{
        return `<li>${username} in ${room}</li>`
    }).join(''));
});

// ---- Update Messges -------------------------------------------------------------------
socket.on('message', ({ message, author, timeStamp }) => {
    console.log(message);
    $('#chatbox').append(`<p class="d-flex flex-row mt-2 mb-3"><span class="flex-grow-1 d-flex"><span style='font-weight: bold;'>${author.username}:</span> <span class="flex-grow-1 pl-2" style="max-width: 80%; padding-left:5px;">${message}</span><span>${new Date(timeStamp).toLocaleString()}</span></span></p>`);
    $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
});

// ---- Send message ---------------------------------------------------------------------
function sendMessage()
{
    let message = $('#message-input').val();

    if(!message || message == '' || message == ' ') { return; }

    socket.emit('message', {
        message: message,
        token: token,
        room: room
    });

    $('#message-input').val('');
}

$('#send-btn').on('click', (e) => {
    e.preventDefault();
    sendMessage();
});

// ---- Enter for message box ------------------------------------------------------------
$("#message-input").on("keydown", (e) => {
    if(e.code == "Enter")
    {
        sendMessage();
    }
});

// ---- Logout ---------------------------------------------------------------------------
$('#logout').on('click', (e) => {
    e.preventDefault();

    fetch(`http://3.22.149.75:5005/chat/logout?token=${token}`)
    .then(() => {
        socket.disconnect();    
        localStorage.clear();
        window.location.replace("http://3.22.149.75/restChat/");
    })
    .catch((err) => {
        localStorage.clear();
        window.location.replace("http://3.22.149.75/restChat/");
    });
});

// Scroll chatbox to latest messages
$('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);