console.log('app.js is loaded')

// Config

var jwt = ""
var apiBaseURL = ""

if (window.location.hostname === "localhost") {
    apiBaseURL = "http://localhost:3000"
}


// HTML

const generateGroupHTML = function({name, partnerId, partnerUserId, loginKey, timeout, agentJoin, glanceClient, _id}) {
    var expiration = new Date(parseInt(loginKey.split("$")[2])*1000).toString()
    return `
    <div class="group" id="group-${_id}">
            <h2 class="group-h2">${name}</h2>
            <p><span class="group-info-label">Partner ID</span>: ${partnerId}</p>
            <p><span class="group-info-label">Partner User ID</span>: <span class="group-puid">${partnerUserId}<span></p>
            <p><span class="group-info-label">Timeout</span>: <span id="group-info-timeout-${_id}">${timeout}</span></p>
            <p><span class="group-info-label">Login Key</span>: <code><span id="group-info-loginkey-${_id}">${loginKey}</span></code></p>
            <p><span class="group-info-label">Expires</span>: <span id="group-info-expires-${_id}">${expiration}</span></p>
            <div class="auth-links">
                <div class="agent-join-link"><a href="${agentJoin}" target="_blank">Agent Join Page</a></div>
                <div class="glance-client-link"><a href="${glanceClient}" >Glance Client</a></div>
            </div>
            <div class="btn-group">
                <button class="delete-this-group" id="delete-${_id}">Delete Group</button> 
                <button class="edit-this-group" id="edit-${_id}">Edit Group</button> 
                <button class="refresh-key" id="refresh-${_id}">Refresh Key</button> 
            </div>
        </div>
    `
}

const generateUpdateGroupHTML = function({_id}) {
    return `
        <div id="update-group-${_id}">
        <h2>Edit Group</h2>
        <form>
            <input type="text" id="update-group-name" name="update-group-name" placeholder="Group name"><br>
            <input type="number" id="update-group-partnerID" name="update-group-partnerID" placeholder="Partner ID"><br>
            <input type="password" id="update-group-ApiKey" name="update-group-ApiKey" placeholder="API Key" autocomplete="none"><br>
            <input type="text" id="update-group-PUID" name="update-group-PUID" placeholder="Partner User ID"><br>
            <input type="number" id="update-group-timeout" name="update-group-timeout" placeholder="Timeout in seconds from now or absolute time (UTC)"><br>
        <div class="btn-group">
            <button class="update-group-cancel-button" id="update-group-cancel-button-${_id}">Cancel</button>
            <button class="update-group-save-button" id="update-group-save-button-${_id}">Save</button> 
            <button class="update-group-clone-button" id="update-group-clone-button-${_id}">Clone</button> 
            <button class="update-group-check-key-button" id="update-group-check-key-button-${_id}">Check Key</button> 
        </div>
        </form>
    `
}

// Utilities

const $ = function(element) {
   return document.getElementById(element)
}

const hide = function(element){
    document.getElementById(element).style.display = "none"
}

const show = function(element){
    document.getElementById(element).style.display = "block"
}


const showFlex = function(element){
    document.getElementById(element).style.display = "flex"
}


// Create a group

const createGroup = async function(e) {
    e.preventDefault()
    console.log("In create group")
    var payload = {
        name: $("new-group-name").value,
        partnerId: $("new-group-partnerID").value,
        apiKey: $("new-group-ApiKey").value,
        partnerUserId: $("new-group-PUID").value,
        timeout: $("new-group-timeout").value
    }
    if (!payload.name || !payload.partnerId || !payload.apiKey || !payload.partnerUserId) {
        return alert('All fields required other than timeout.')
    }
    if (payload.timeout === "") {
        delete payload.timeout
    }
    console.log('Payload is ', payload)
    try {
        const newGroup = await superagent.post(`${apiBaseURL}/groups`).send(payload).set('Authorization', 'Bearer ' + jwt)
        console.log('NewGroup is ', newGroup)
        $("new-group-name").value = ""
        $("new-group-partnerID").value = ""
        $("new-group-ApiKey").value = ""
        $("new-group-PUID").value = ""
        $("new-group-timeout").value = ""
        alert('Group created!')
        hide("new-group")
        getGroups()
    } catch(e) {
        alert(e)
    }
}

const createGroupClear = function(e) {
    e.preventDefault()
    $("new-group-name").value = ""
    $("new-group-partnerID").value = ""
    $("new-group-ApiKey").value = ""
    $("new-group-PUID").value = ""
    $("new-group-timeout").value = ""
}


// Group sorting

function sortGroups (a, b) {
    // Use toUpperCase() to ignore character casing
    const groupA = a.name.toUpperCase();
    const groupB = b.name.toUpperCase();
  
    let comparison = 0;
    if (groupA > groupB) {
      comparison = 1;
    } else if (groupA < groupB) {
      comparison = -1;
    }
    return comparison;
  }

// GET Groups

const getGroups = async function() {
    try {
        const groups = await superagent.get(`${apiBaseURL}/groups`).set('Authorization', 'Bearer ' + jwt)
        console.log('groups is ', groups)
        // if 0 groups, show new group div
        if (groups.body.length === 0) {
            // show new group div
            alert('You have no groups. Try creating one!')
            show("new-group")
        }
        // if >0 groups, show groups div
        if (groups.body.length > 0) {
            show('searchContainer')
            // show groups div
            showFlex("groups")
            // Sort groups array alphabetical by group name
            groups.body.sort(sortGroups)
            // Clear out HTML of groups div
            $("groups").innerHTML=''
            // Generate html for each group and add to groups div
            groups.body.forEach(group => {
                var groupHTML = generateGroupHTML(group)
                $("groups").insertAdjacentHTML("beforeend", groupHTML);
            // Add event listeners
                $(`delete-${group._id}`)
                    .addEventListener(
                        "click",
                        e => {
                        console.log('delete button clicked for ', group._id);
                        deleteGroup(group._id)
                        },
                        false
                    );
                $(`edit-${group._id}`)
                    .addEventListener(
                        "click",
                        e => {
                            console.log('edit button clicked for ', group._id);
                            editGroup(group)
                        },
                        false
                    );
                $(`refresh-${group._id}`)
                    .addEventListener(
                        "click",
                        e => {
                            console.log('refesh button clicked for ', group._id);
                            refreshGroup(group)
                        },
                        false
                    );
            
            });
        }

    } catch(e) {
        alert(e)
    }
    
}

// Delete Group

const deleteGroup = async function(groupId) {
    if (confirm("Delete group? This cannot be undone.")){
        try {
            await superagent.delete(`${apiBaseURL}/groups/${groupId}`).set('Authorization', 'Bearer ' + jwt)
            $(`group-${groupId}`).remove()
            alert('Group deleted.')
        } catch(e) {
            alert(e)
        }
    }
}

// Edit Group

var getUpdatePayload = function() {
    var payload = {
        name: $("update-group-name").value,
        partnerId: $("update-group-partnerID").value,
        apiKey: $("update-group-ApiKey").value,
        partnerUserId: $("update-group-PUID").value,
        timeout: $("update-group-timeout").value
    }
    Object.keys(payload).forEach((key) => (payload[key] == "") && delete payload[key]);
    return payload
}

var editGroupSave = async function(groupid) {
    var payload = getUpdatePayload()
    if (Object.keys(payload).length === 0) {
        return alert('Nothing to save.')
    }
    if(!window.confirm('Save changes?  This cannot be undone.')){
        return
    }
    try {
        const updatedGroup = await superagent.patch(`${apiBaseURL}/groups/${groupid}`).send(payload).set('Authorization', 'Bearer ' + jwt)
        console.log('Updated group is ', updatedGroup)
        $(`update-group-${groupid}`).remove()
        getGroups()
    } catch(e){
        alert(e)
    }
}

var cloneGroupSave = async function(groupid) {
    var payload = getUpdatePayload()
    if(!window.confirm('Clone group with changes?')){
        return
    }
    try {
        const clonedGroup = await superagent.post(`${apiBaseURL}/groups/clone/${groupid}`).send(payload).set('Authorization', 'Bearer ' + jwt)
        console.log('Cloned group is ', clonedGroup)
        $(`update-group-${groupid}`).remove()
        // Hide update div
        hide("update-group")
        // Show Groups Div
        showFlex("groups")
        getGroups()
    } catch(e){
        alert(e)
    }
}

var apiKeyCheck = async function(groupid) {
    var payload = {
        apiKey: window.prompt('Enter API Key:')
    }

    console.log('payload is ', payload)
    if (!payload.apiKey) {
        return console.log('No API Key entered.')
    }
    try {
        var checkResult = await superagent.post(`${apiBaseURL}/groups/apikey/confirm/${groupid}`).send(payload).set('Authorization', 'Bearer ' + jwt)
        console.log('checkResult is ', checkResult)
        if (checkResult.body.match){
            alert('API Key matches!')
        }
        if(!checkResult.body.match){
            alert('API Key does not match.')
        }
    } catch(e) {
        alert(e)
    }
}

const editGroup = function(group) {
    // Hide the Groups Div
    hide("groups")
    hide("searchContainer")
    // Show the Edit group div
    show("update-group")
    var updateGroupHTML = generateUpdateGroupHTML(group)
    $("update-group").innerHTML = ""
    document
    .getElementById("update-group")
    .insertAdjacentHTML("beforeend", updateGroupHTML)
    // Update values of input fields
    console.log('in editGroup and group is ', group)
    $("update-group-name").value = group.name
    $("update-group-partnerID").value = group.partnerId
    $("update-group-PUID").value = group.partnerUserId
    $("update-group-timeout").value = group.timeout
    // Add event listeners
    $(`update-group-cancel-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                console.log('cancel edit button clicked for ', group._id);
                $(`update-group-${group._id}`).remove()
                // Hide update div
                hide("update-group")
                // Show Groups Div
                showFlex("groups")
            },
            false
          );
    $(`update-group-save-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                console.log('save edit button clicked for ', group._id);
                editGroupSave(group._id)
                // Hide update div
                hide("update-group")
                // Show Groups Div
                showFlex("groups")
            },
            false
          );
    $(`update-group-clone-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                console.log('clone button clicked for ', group._id);
                cloneGroupSave(group._id)
            },
            false
          );
    $(`update-group-check-key-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                console.log('update-group-check-key-button ', group._id);
                // TO Check key
                apiKeyCheck(group._id)
            },
            false
          );
}

// Refresh Group

var refreshGroup = async function(group){
    if (parseInt($(`group-info-timeout-${group._id}`).innerHTML) > 86400){
        return alert('Timeout is specified in absolute time. Nothing to refresh.')
    }
    console.log('in refreshGroup. Need to put stuff here')
    try {
        const refreshedGroup = await superagent.get(`${apiBaseURL}/groups/${group._id}`).set('Authorization', 'Bearer ' + jwt)
        console.log('the refreshedGroup.body is ', refreshedGroup.body)
        var refreshedExpiration = new Date(parseInt(refreshedGroup.body.loginKey.split("$")[2])*1000).toString()
    
        $(`group-info-loginkey-${group._id}`).innerHTML = refreshedGroup.body.loginKey
        $(`group-info-expires-${group._id}`).innerHTML = refreshedExpiration
    } catch(e) {
        alert(e)
    }
}

// Sign Up

var signUp = async (e) => {
    e.preventDefault()
    const email = $("sign-up-email").value
    const password = $("sign-up-password").value
    const confirmPassword = $("confirm-password").value
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
        const response = await superagent.post(`${apiBaseURL}/users`).send(payload)
        console.log('it worked and the response is ', response)
        // Set the auth token
        jwt = response.body.token
        console.log('jwt is ', jwt)
        // clear sign up fields
        $("sign-up-email").value = ""
        $("sign-up-password").value = ""
        $("confirm-password").value = ""
        hide("sign-up")
        show('nav-bar')
        getGroups()
    } catch(e){
        alert(e)
    }
}

var signUpCancel = (e) => {
    e.preventDefault()
    console.log('Cancel the sign up')
    // clear sign up fields
    $("sign-up-email").value = ""
    $("sign-up-password").value = ""
    $("confirm-password").value = ""
    // hide sign up div
    hide("sign-up")
    // show sign in div
    show("sign-in")
}

// Sign In

var signIn = async (e) => {
    e.preventDefault()
    console.log('Sign in')
    // Sign in and get auth token
    const email = $("sign-in-email").value
    const password = $("sign-in-password").value
    if (!email || !password) {
        return alert('All fields required.')
    }
    if (password.length <6 ) {
        return alert("Password must be at least 6 characters.")
    }
    var payload = {
        email,
        password
    }
    try {
        const response = await superagent.post(`${apiBaseURL}/users/login`).send(payload)
        console.log('it worked and the response is ', response)
        // Set the auth token
        jwt = response.body.token
        console.log('jwt is ', jwt)
        // clear sign in fields
        $("sign-in-email").value = ""
        $("sign-in-password").value = ""
        // hide sign in div
        hide("sign-in")
        show("nav-bar")
        // request groups
        getGroups()
    } catch(e){
        alert(e)
    }
}

var clearSignIn = (e) => {
    e.preventDefault()
    console.log('Clear sign in')
    // clear sign in fields
    $("sign-in-email").value = ""
    $("sign-in-password").value = ""
}

var createAccount = (e) => {
    e.preventDefault()
    console.log('createAccount')
    // clear sign in fields
    $("sign-in-email").value = ""
    $("sign-in-password").value = ""
    // Hide sign in div
    hide("sign-in")
    // Show create account div
    show("sign-up")
}

// User Profile Actions

const deleteAccount = async function(e) {
    e.preventDefault()
    if(!confirm('Delete account? This cannot be undone.')){
        return
    }
    try {
        await superagent.delete(`${apiBaseURL}/users/me`).set('Authorization', 'Bearer ' + jwt)
        alert('Account deleted.')
        $("groups").innerHTML=''
        hideAll()
        hide("nav-bar")
        jwt = ''
        show("sign-in")
    } catch(e){
        alert(e)
    }
}

const deleteAllGroups = async function(e) {
    e.preventDefault()
    if(!confirm("Delete ALL groups associated with this account? This cannot be undone.")) {
        return
    }
    try {
        await superagent.delete(`${apiBaseURL}/groups`).set('Authorization', 'Bearer ' + jwt)
        alert('All groups deleted.')
        $("groups").innerHTML = ''
    } catch(e) {
        alert(e)
    }
}

const logoutAll = async function(e) {
    e.preventDefault()
    try {
        await superagent.post(`${apiBaseURL}/users/logoutAll`).set('Authorization', 'Bearer ' + jwt)
        alert('You have been logged out of all devices.')
        // clear update user fields
        $("update-username").value = ""
        $("update-password").value = ""
        $("update-password-confirm").value = ""
        hideAll()
        hide("nav-bar")
        jwt = ''
        show("sign-in")
    } catch(e){
        alert(e)
    }
}

const updateUserSave = async function(e){
    e.preventDefault()
    var payload = {}
    const email = $("update-username").value
    const password = $("update-password").value
    const confirmPassword = $("update-password-confirm").value
    if (email) {
        payload.email = email
    }
    if (password || confirmPassword){
        if (password != confirmPassword) {
            return alert("Passwords don't match!")
        }
        if (password.length <6 ) {
            return alert("Password must be at least 6 characters.")
        }
        payload.password = password
    }
    console.log('payload is ', payload)

    try {
        const updatedUser = await superagent.patch(`${apiBaseURL}/users/me`).send(payload).set('Authorization', 'Bearer ' + jwt)
        console.log('it worked and the updatedUser is ', updatedUser)
 
        // clear update user fields
        $("update-username").value = ""
        $("update-password").value = ""
        $("update-password-confirm").value = ""
        alert('Account updated.')
    } catch(e){
        alert(e)
    }
}

const updateUserCancel = function(e){
    e.preventDefault()
    $("update-username").value = ""
    $("update-password").value = ""
    $("update-password-confirm").value = ""
}


// Event Listeners

// Sign Up 
$("sign-up-button").addEventListener("click",signUp)
$("cancel-sign-up").addEventListener("click",signUpCancel)

// Sign In
$("sign-in-button").addEventListener("click",signIn)
$("clear-sign-in").addEventListener("click",clearSignIn)
$("create-account").addEventListener("click",createAccount)

// if cancel clicked, clear fields, hide this element, and show sign in

// Create group
$("new-group-save-button").addEventListener("click",createGroup)
$("new-group-clear-button").addEventListener("click",createGroupClear)

// User Profile
$("delete-account").addEventListener("click",deleteAccount)
$("delete-all-groups-button").addEventListener("click",deleteAllGroups)
$("logout-all").addEventListener("click",logoutAll)
$("update-user-save-button").addEventListener("click",updateUserSave)
$("update-user-cancel-button").addEventListener("click",updateUserCancel)

// Nav Bar Events

const hideAll = function(){
    hide("new-group")
    hide("update-group")
    hide("user-profile")
    hide('groups')
    hide('searchContainer')
}

const showGroups = function() {
    console.log('in showGroups')
    hideAll()
    getGroups()

}

const showNewGroup = function() {
    console.log('in showNewGroup')
    hideAll()
    show("new-group")
}

const showProfile = function() {
    console.log('in showProfile')
    hideAll()
    show("user-profile")
}

const logOut = async function() {
    console.log('in LogOut')
    hideAll()
    hide("nav-bar")
    try {
        const clonedGroup = await superagent.post(`${apiBaseURL}/users/logout`).set('Authorization', 'Bearer ' + jwt)
    } catch(e) {
        console.log('Problem logging out: ', e)
    }
    jwt = ''
    show("sign-in")
}

$("show-groups").addEventListener("click",showGroups)
$("show-new-group").addEventListener("click",showNewGroup)
$("show-profile").addEventListener("click",showProfile)
$("show-log-out").addEventListener("click",logOut)

// The Filtering

const filter = function() {
    console.log("I'm filtering")
    var filterTerm = document.getElementById("searchBox").value.toUpperCase()
    var cardNames = document.getElementsByClassName("group-h2")
    var cards = document.getElementsByClassName("group")
    for (i = 0; i < cards.length; i++) {
        a = cardNames[i].textContent.toUpperCase()
        if (a.indexOf(filterTerm) > -1) {
            console.log('display block and a is ', a)
            console.log('cards[i] is ', cards[i])
            cards[i].style.display = "block"
        } else {
            console.log('display none and a is ', a)
            cards[i].style.display = "none"
            console.log('cards[i] is ', cards[i])
        }
    }
}