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

// ---- Initialize Socket ---------------------------------------------------------------------------
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
            return `<p>${timeStamp} | ${author.username}: ${message}</p>`
        }).join(''));
    }
});

socket.on('updateList', ({ users }) => {
    $('#user-list').html(users.map(({username, room})=>{
        return `<li>${username} in ${room}</li>`
    }).join(''));
});

socket.on('message', ({ message, author, timeStamp }) => {
    console.log(message);
    $('#chatbox').append(`<p>${timeStamp} | ${author.username}: ${message}</p>`);
});

// ---- Send message ---------------------------------------------------------------------
function sendMessage()
{
    let message = $('#message-input').val();

    if(!message) { return; }

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

// ---- Logout ---------------------------------------------------------------------------
$('#logout-btn').on('click', (e) => {
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

// ---- Enter for message box ------------------------------------------------------------
$("#message-input").on("keydown", (e) => {
    if(e.code == "Enter")
    {
        sendMessage();
    }
});