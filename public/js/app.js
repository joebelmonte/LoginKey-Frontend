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
            <p><span class="group-info-label">Partner User ID</span>: ${partnerUserId}</p>
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
        </div>
        </form>
    `
}

// Create a group

const createGroup = async function(e) {
    e.preventDefault()
    console.log("In create group")
    var payload = {
        name: document.getElementById("new-group-name").value,
        partnerId: document.getElementById("new-group-partnerID").value,
        apiKey: document.getElementById("new-group-ApiKey").value,
        partnerUserId: document.getElementById("new-group-PUID").value,
        timeout: document.getElementById("new-group-timeout").value
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
        document.getElementById("new-group-name").value = ""
        document.getElementById("new-group-partnerID").value = ""
        document.getElementById("new-group-ApiKey").value = ""
        document.getElementById("new-group-PUID").value = ""
        document.getElementById("new-group-timeout").value = ""
        alert('Group created!')
        getGroups()
    } catch(e) {
        alert(e)
    }
}

const createGroupClear = function(e) {
    e.preventDefault()
    document.getElementById("new-group-name").value = ""
    document.getElementById("new-group-partnerID").value = ""
    document.getElementById("new-group-ApiKey").value = ""
    document.getElementById("new-group-PUID").value = ""
    document.getElementById("new-group-timeout").value = ""
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
    const groups = await superagent.get(`${apiBaseURL}/groups`).set('Authorization', 'Bearer ' + jwt)
    console.log('groups is ', groups)
    // if 0 groups, show new group div
    if (groups.body.length === 0) {
        // show new group div
        // TODO
    }
    // if >0 groups, show groups div
    if (groups.body.length > 0) {
        // TODO: show groups div
        // Sort groups array alphabetical by group name
        groups.body.sort(sortGroups)
        // Clear out HTML of groups div
        document.getElementById("groups").innerHTML=''
        // Generate html for each group and add to groups div
        groups.body.forEach(group => {
            var groupHTML = generateGroupHTML(group)
            document
                .getElementById("groups")
                .insertAdjacentHTML("beforeend", groupHTML);
        // Add event listeners
            document
                .getElementById(`delete-${group._id}`)
                .addEventListener(
                    "click",
                    e => {
                      console.log('delete button clicked for ', group._id);
                      deleteGroup(group._id)
                    },
                    false
                );
            document
                .getElementById(`edit-${group._id}`)
                .addEventListener(
                    "click",
                    e => {
                        console.log('edit button clicked for ', group._id);
                        editGroup(group)
                    },
                    false
                );
            // TODO: Hook up event listener functions
            document
                .getElementById(`refresh-${group._id}`)
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
}

// Delete Group

const deleteGroup = async function(groupId) {
    if (confirm("Delete group? This cannot be undone.")){
        try {
            await superagent.delete(`${apiBaseURL}/groups/${groupId}`).set('Authorization', 'Bearer ' + jwt)
            document.getElementById(`group-${groupId}`).remove()
            alert('Group deleted.')
        } catch(e) {
            alert(e)
        }
    }
}

// Edit Group

var getUpdatePayload = function() {
    var payload = {
        name: document.getElementById("update-group-name").value,
        partnerId: document.getElementById("update-group-partnerID").value,
        apiKey: document.getElementById("update-group-ApiKey").value,
        partnerUserId: document.getElementById("update-group-PUID").value,
        timeout: document.getElementById("update-group-timeout").value
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
        document.getElementById(`update-group-${groupid}`).remove()
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
        document.getElementById(`update-group-${groupid}`).remove()
        getGroups()
    } catch(e){
        alert(e)
    }
}

const editGroup = function(group) {
    // TODO: Hide the Groups Div
    // TODO: Show the Edit group div
    var updateGroupHTML = generateUpdateGroupHTML(group)
    document.getElementById("update-group").innerHTML = ""
    document
    .getElementById("update-group")
    .insertAdjacentHTML("beforeend", updateGroupHTML)
    // TODO: Update values of input fields
    console.log('in editGroup and group is ', group)
    document.getElementById("update-group-name").value = group.name
    document.getElementById("update-group-partnerID").value = group.partnerId
    document.getElementById("update-group-PUID").value = group.partnerUserId
    document.getElementById("update-group-timeout").value = group.timeout
    // TODO: Add event listeners
    document.getElementById(`update-group-cancel-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                console.log('cancel edit button clicked for ', group._id);
                document.getElementById(`update-group-${group._id}`).remove()
                // TODO: Hide update div
                // TODO: Show Groups Div
            },
            false
          );
    document.getElementById(`update-group-save-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                console.log('save edit button clicked for ', group._id);
                editGroupSave(group._id)
                // TODO: Hide update div
                // TODO: Show Groups Div
            },
            false
          );
    document.getElementById(`update-group-clone-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                console.log('clone button clicked for ', group._id);
                cloneGroupSave(group._id)
                // TODO: Hide update div
                // TODO: Show Groups Div
            },
            false
          );
}

// Refresh Group

var refreshGroup = async function(group){
    if (parseInt(document.getElementById(`group-info-timeout-${group._id}`).innerHTML) > 86400){
        return alert('Timeout is specified in absolute time. Nothing to refresh.')
    }
    console.log('in refreshGroup. Need to put stuff here')
    try {
        const refreshedGroup = await superagent.get(`${apiBaseURL}/groups/${group._id}`).set('Authorization', 'Bearer ' + jwt)
        console.log('the refreshedGroup.body is ', refreshedGroup.body)
        var refreshedExpiration = new Date(parseInt(refreshedGroup.body.loginKey.split("$")[2])*1000).toString()
    
        document.getElementById(`group-info-loginkey-${group._id}`).innerHTML = refreshedGroup.body.loginKey
        document.getElementById(`group-info-expires-${group._id}`).innerHTML = refreshedExpiration
    } catch(e) {
        alert(e)
    }
}

// Sign Up

var signUp = async (e) => {
    e.preventDefault()
    const email = document.getElementById("sign-up-email").value
    const password = document.getElementById("sign-up-password").value
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
        const response = await superagent.post(`${apiBaseURL}/users`).send(payload)
        console.log('it worked and the response is ', response)
        // Set the auth token
        jwt = response.body.token
        console.log('jwt is ', jwt)
        // clear sign up fields
        document.getElementById("sign-up-email").value = ""
        document.getElementById("sign-up-password").value = ""
        document.getElementById("confirm-password").value = ""
        // hide sign up div
        // TODO
        // show the enter new group div
        // TODO
        // show the menu bar
        // TODO
    } catch(e){
        alert(e)
    }
}

var signUpCancel = (e) => {
    e.preventDefault()
    console.log('Cancel the sign up')
    // clear sign up fields
    document.getElementById("sign-up-email").value = ""
    document.getElementById("sign-up-password").value = ""
    document.getElementById("confirm-password").value = ""
    // hide sign up div
    // TODO
    // show sign in div
    // TODO
}

// Sign In

var signIn = async (e) => {
    e.preventDefault()
    console.log('Sign in')
    // Sign in and get auth token
    const email = document.getElementById("sign-in-email").value
    const password = document.getElementById("sign-in-password").value
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
        document.getElementById("sign-in-email").value = ""
        document.getElementById("sign-in-password").value = ""
        // TODO: hide sign in div
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
    document.getElementById("sign-in-email").value = ""
    document.getElementById("sign-in-password").value = ""
}

var createAccount = (e) => {
    e.preventDefault()
    console.log('createAccount')
    // clear sign in fields
    document.getElementById("sign-in-email").value = ""
    document.getElementById("sign-in-password").value = ""
    // Hide sign in div
    // TODO
    // Show create account div
    // TODO 
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
        document.getElementById("groups").innerHTML=''
        // TODO: Hide profile
        // TODO: Show sign in page
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
        document.getElementById("groups").innerHTML = ''
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
        document.getElementById("update-username").value = ""
        document.getElementById("update-password").value = ""
        document.getElementById("update-password-confirm").value = ""
        // TODO: Hide this div
        // TODO: Show the sign in div
    } catch(e){
        alert(e)
    }
}

const updateUserSave = async function(e){
    e.preventDefault()
    var payload = {}
    const email = document.getElementById("update-username").value
    const password = document.getElementById("update-password").value
    const confirmPassword = document.getElementById("update-password-confirm").value
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
        document.getElementById("update-username").value = ""
        document.getElementById("update-password").value = ""
        document.getElementById("update-password-confirm").value = ""
        alert('Account updated.')
    } catch(e){
        alert(e)
    }
}

const updateUserCancel = function(e){
    e.preventDefault()
    document.getElementById("update-username").value = ""
    document.getElementById("update-password").value = ""
    document.getElementById("update-password-confirm").value = ""
}


// Event Listeners

// Sign Up 
document.getElementById("sign-up-button").addEventListener("click",signUp)
document.getElementById("cancel-sign-up").addEventListener("click",signUpCancel)

// Sign In
document.getElementById("sign-in-button").addEventListener("click",signIn)
document.getElementById("clear-sign-in").addEventListener("click",clearSignIn)
document.getElementById("create-account").addEventListener("click",createAccount)

// if cancel clicked, clear fields, hide this element, and show sign in

// Create group
document.getElementById("new-group-save-button").addEventListener("click",createGroup)
document.getElementById("new-group-clear-button").addEventListener("click",createGroupClear)

// User Profile
document.getElementById("delete-account").addEventListener("click",deleteAccount)
document.getElementById("delete-all-groups-button").addEventListener("click",deleteAllGroups)
document.getElementById("logout-all").addEventListener("click",logoutAll)
document.getElementById("update-user-save-button").addEventListener("click",updateUserSave)
document.getElementById("update-user-cancel-button").addEventListener("click",updateUserCancel)