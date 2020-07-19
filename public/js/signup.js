import config from './config.js'

console.log('the config is ', config)

config.authToken = 'i modified the auth token'

console.log('the config is ', config)

var signUp = async (e) => {
    e.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirm-password").value
    if (!email || !password || !confirmPassword) {
        return alert('All fields required.')
    }
    if (password != confirmPassword) {
        return alert("Passwords don't match!")
    }
    if (password.length <6 ) {
        return alert("Password must be at least 6 characters.")
    }
    var payload = {
        email,
        password
    }
    try {
        const response = await superagent.post(`${apiBaseURL}users`).send(payload)
        console.log('it worked and the response is ', response)
        // Need to so something with the token
        // need to redirect to the root page to load the groups
    } catch(e){
        alert(e)
    }
    
}

document.getElementById("sign-up").addEventListener("click",signUp)

