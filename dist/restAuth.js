/**
 * @author Ricky Alvarez
 * @github https://github.com/raulduk3
 * @create date 2023-03-29 04:56:17
 * @modify date 2023-03-29 04:56:17
 * @desc JavaScript for the index.html
 */
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if(urlParams.get("failed") == 1)
{
    $("#login-output").html('Failed to login.');
}
else if((urlParams.get("failed") == 0))
{
    $("#register-output").html('Registered.');
}

if(urlParams.get("token"))
{
    localStorage.setItem("token", urlParams.get("token"));
    window.location.replace("http://3.22.149.75/restChat/chat.html");
}
else if(localStorage.getItem("token"))
{
    window.location.replace("http://3.22.149.75/restChat/chat.html");
}
