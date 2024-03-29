// Config

var jwt = ""
var apiBaseURL = "https://loginkey-api.herokuapp.com"

if (window.location.hostname === "localhost") {
    apiBaseURL = "http://localhost:3000"
}

// Timeouts

var expirationTimers = []

function clearExpirationTimers() {
    expirationTimers.forEach(timer => clearTimeout(timer))
    expirationTimers = []
}

// HTML

const markExpired = function(group){
    document.getElementById(`group-info-expires-${group._id}`).classList.add("expired")
}

const watchExpiration = function(group){
    var now = new Date() / 1000
    if (group.timeout <= 86400) {
        var expirationTimer
        expirationTimer = setTimeout(markExpired,group.timeout*1000,group)
        expirationTimers.push(expirationTimer)
        return expirationTimer
    } else if (group.timeout < now) {
        markExpired(group)
    } else {
        var expiration = group.timeout - now 
        var expirationTimer = setTimeout(markExpired,expiration*1000,group)
        expirationTimers.push(expirationTimer)
        return expirationTimer
    }
}


const generateGroupHTML = function({name, partnerId, partnerUserId, loginKey, timeout, agentJoin, glanceClient, _id}) {
    var expires = new Date(parseInt(loginKey.split("$")[2])*1000)
    var expiration = expires.toString()
    var expirationHover = expires.toLocaleString()

    return `
    <div class="group" id="group-${_id}">
            <h2 class="group-h2">${name}</h2>
            <p><span class="group-info-label">Partner ID</span>: <span class="partner-id">${partnerId}</span></p>
            <p><span class="group-info-label">Partner User ID</span>: <span class="group-puid">${partnerUserId}<span></p>
            <p><span class="group-info-label">Timeout</span>: <span id="group-info-timeout-${_id}">${timeout}</span></p>
            <p class="tooltip" onclick="copyToClipboard('loginKey','${_id}')"><span class="group-info-label">Login Key</span>: <code><span id="group-info-loginkey-${_id}">${loginKey}</span></code><span class="tooltiptext" id="tooltiptext-${_id}">Click to copy.</span></p>
            <p><span class="group-info-label">Expires</span>: <span title="${expirationHover}" id="group-info-expires-${_id}">${expiration}</span></p>
            <div class="auth-links">
                <div class="agent-join-link" id="agent-join-link-${_id}"><a href="${agentJoin}" target="_blank">Agent Join Page</a></div>
                <div class="glance-client-link" id="glance-client-link-${_id}"><a href="${glanceClient}">Glance Client</a></div>
            </div>
            <div class="btn-group">
                <button class="delete-this-group" id="delete-${_id}">Delete Card</button> 
                <button class="edit-this-group" id="edit-${_id}">Edit Card</button> 
                <button class="refresh-key" id="refresh-${_id}">Refresh Key</button> 
            </div>
        </div>
    `
}

const generateUpdateGroupHTML = function({_id}) {
    return `
        <div id="update-group-${_id}">
        <h2>Edit Card</h2>
        <form>
            <p class="edit-group-label">Group Name:</p>
            <input type="text" id="update-group-name" name="update-group-name" placeholder="Group name"><br>
            <p class="edit-group-label">Partner ID:</p>
            <input type="number" id="update-group-partnerID" name="update-group-partnerID" placeholder="Partner ID"><br>
            <p class="edit-group-label">API Key:</p>
            <input type="password" id="update-group-ApiKey" name="update-group-ApiKey" placeholder="API Key" autocomplete="none"><br>
            <p class="edit-group-label">Partner User ID:</p>
            <input type="text" id="update-group-PUID" name="update-group-PUID" placeholder="Partner User ID"><br>
            <p class="edit-group-label">Timeout:</p>
            <input type="number" id="update-group-timeout" name="update-group-timeout" placeholder="Seconds from now or absolute time (UTC)"><br>
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
    filter()
}

// Copy to clipboard

var copyToClipboard = function(str, id) {
    const el = document.createElement('textarea');
    el.value = str;
    if (str === "loginKey") {
        el.value = $(`group-info-loginkey-${id}`).innerText
    }
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    document.getElementById(`tooltiptext-${id}`).textContent = "Copied!"
    document.getElementById(`group-info-loginkey-${id}`).addEventListener("mouseleave", ()=> document.getElementById(`tooltiptext-${id}`).textContent = "Click to copy.")
}


// Create a group

const createGroup = async function(e) {
    e.preventDefault()
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
    try {
        document.querySelector("body").classList.add("loading")
        const newGroup = await superagent.post(`${apiBaseURL}/groups`).send(payload).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        $("new-group-name").value = ""
        $("new-group-partnerID").value = ""
        $("new-group-ApiKey").value = ""
        $("new-group-PUID").value = ""
        $("new-group-timeout").value = ""
        alert('Card created!')
        hide("new-group")
        getGroups()
    } catch(e) {
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem creating the card: ', e)
        alert(`Problem creating card: ${e}`)
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
        document.querySelector("body").classList.add("loading")
        const groups = await superagent.get(`${apiBaseURL}/groups`).set('Authorization', 'Bearer ' + jwt)
        // if 0 groups, show new group div
        document.querySelector("body").classList.remove("loading")
        if (groups.body.length === 0) {
            // show new group div
            alert('You have no cards. Try creating one!')
            show("new-group")
        }
        // if >0 groups, show groups div
        if (groups.body.length > 0) {
            show('searchArea')
            // show groups div
            showFlex("groups")
            // Sort groups array alphabetical by group name
            groups.body.sort(sortGroups)
            // Clear out HTML of groups div
            $("groups").innerHTML=''
            // Generate html for each group and add to groups div
            clearExpirationTimers()
            groups.body.forEach(group => {
                var groupHTML = generateGroupHTML(group)
                $("groups").insertAdjacentHTML("beforeend", groupHTML);
            // Add event listeners
                var expirationTimer = watchExpiration(group)
                // if (expirationTimer){
                //     expirationTimers.push(expirationTimer)
                // }
                $(`delete-${group._id}`)
                    .addEventListener(
                        "click",
                        e => {
                        deleteGroup(group._id)
                        },
                        false
                    );
                $(`edit-${group._id}`)
                    .addEventListener(
                        "click",
                        e => {
                            editGroup(group)
                        },
                        false
                    );
                $(`refresh-${group._id}`)
                    .addEventListener(
                        "click",
                        e => {
                            refreshGroup(group, expirationTimer).then(data => {
                                expirationTimer = data
                            })
                        },
                        false
                    );
            
            });
        }
        filter()
        createPartnerIdSelectList()
    } catch(e) {
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem retrieving cards: ', e)
        alert(`Problem retrieving cards: ${e}`)
    }
    
}

// Delete Group

const deleteGroup = async function(groupId) {
    if (confirm("Delete card? This cannot be undone.")){
        try {
            document.querySelector("body").classList.add("loading")
            await superagent.delete(`${apiBaseURL}/groups/${groupId}`).set('Authorization', 'Bearer ' + jwt)
            document.querySelector("body").classList.remove("loading")
            $(`group-${groupId}`).remove()
            var partnerIdSelected = document.getElementById("partner-id-select-list").value
            filter()
            filter() // Need to run this twice in case this is the last card of that partner ID.
            alert('Card deleted.')
        } catch(e) {
            document.querySelector("body").classList.remove("loading")
            console.log('There was a problem deleting the card: ', e)
            alert(`Problem deleting card: ${e}`)
        }
    }
}

// Edit Card

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
        document.querySelector("body").classList.add("loading")
        const updatedGroup = await superagent.patch(`${apiBaseURL}/groups/${groupid}`).send(payload).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        $(`update-group-${groupid}`).remove()
        getGroups()
    } catch(e){
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem saving changes: ', e)
        alert(`Problem saving changes: ${e}`)
    }
}

var cloneGroupSave = async function(groupid) {
    var payload = getUpdatePayload()
    if(!window.confirm('Clone card with changes?')){
        return
    }
    try {
        document.querySelector("body").classList.add("loading")
        const clonedGroup = await superagent.post(`${apiBaseURL}/groups/clone/${groupid}`).send(payload).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        $(`update-group-${groupid}`).remove()
        // Hide update div
        hide("update-group")
        // Show Groups Div
        showFlex("groups")
        getGroups()
    } catch(e){
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem cloning the card: ', e)
        alert(`Problem cloning the card: ${e}`)
    }
}

var apiKeyCheck = async function(groupid) {
    var payload = {
        apiKey: window.prompt('Enter API Key:')
    }
    if (payload.apiKey === "") {
        return alert('No API Key entered.')
    }
    if (payload.apiKey === null) {
        return
    }
    try {
        document.querySelector("body").classList.add("loading")
        var checkResult = await superagent.post(`${apiBaseURL}/groups/apikey/confirm/${groupid}`).send(payload).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        if (checkResult.body.match){
            alert('API Key matches!')
        }
        if(!checkResult.body.match){
            alert('API Key does not match.')
        }
    } catch(e) {
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem checking the API Key: ', e)
        alert(`Problem checking the API Key: ${e}`)
    }
}

const editGroup = function(group) {
    // Hide the Groups Div
    hide("groups")
    hide("searchArea")
    // Show the Edit card div
    show("update-group")
    var updateGroupHTML = generateUpdateGroupHTML(group)
    $("update-group").innerHTML = ""
    document
    .getElementById("update-group")
    .insertAdjacentHTML("beforeend", updateGroupHTML)
    // Update values of input fields
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
                $(`update-group-${group._id}`).remove()
                // Hide update div
                hide("update-group")
                // Show Groups Div
                showFlex("groups")
                show('searchArea')
            },
            false
          );
    $(`update-group-save-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
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
                cloneGroupSave(group._id)
            },
            false
          );
    $(`update-group-check-key-button-${group._id}`)
        .addEventListener(
            "click",
            e => {
                e.preventDefault()
                // TO Check key
                apiKeyCheck(group._id)
            },
            false
          );
}

// Refresh Group

var refreshGroup = async function(group, expirationTimer){
    if (parseInt($(`group-info-timeout-${group._id}`).innerHTML) > 86400){
        return alert('Timeout is specified in absolute time. Nothing to refresh.')
    }
    try {
        document.querySelector("body").classList.add("loading")
        const refreshedGroup = await superagent.get(`${apiBaseURL}/groups/${group._id}`).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        var refreshedExpiration = new Date(parseInt(refreshedGroup.body.loginKey.split("$")[2])*1000).toString()
    
        $(`group-info-loginkey-${group._id}`).innerHTML = refreshedGroup.body.loginKey
        $(`group-info-expires-${group._id}`).innerHTML = refreshedExpiration
        $(`agent-join-link-${group._id}`).innerHTML = `<a href="${refreshedGroup.body.agentJoin}" target="_blank">Agent Join Page</a>`
        $(`glance-client-link-${group._id}`).innerHTML = `<a href="${refreshedGroup.body.glanceClient}" target="_blank">Glance Client</a>`
        clearTimeout(expirationTimer)
        document.getElementById(`group-info-expires-${group._id}`).classList.remove("expired")
        return watchExpiration(refreshedGroup.body)
    } catch(e) {
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem refreshing the key: ', e)
        alert(`Problem refreshing the key: ${e}`)
        return expirationTimer
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
        document.querySelector("body").classList.add("loading")
        const response = await superagent.post(`${apiBaseURL}/users`).send(payload)
        document.querySelector("body").classList.remove("loading")
        // Set the auth token
        jwt = response.body.token
        // clear sign up fields
        $("sign-up-email").value = ""
        $("sign-up-password").value = ""
        $("confirm-password").value = ""
        hide("sign-up")
        show('nav-bar')
        getGroups()
    } catch(e){
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem signing up: ', e)
        alert(`Problem signing up: ${e}`)
    }
}

var signUpCancel = (e) => {
    e.preventDefault()
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
        document.querySelector("body").classList.add("loading")
        const response = await superagent.post(`${apiBaseURL}/users/login`).send(payload)
        document.querySelector("body").classList.remove("loading")
        // Set the auth token
        jwt = response.body.token
        // clear sign in fields
        $("sign-in-email").value = ""
        $("sign-in-password").value = ""
        // hide sign in div
        hide("sign-in")
        show("nav-bar")
        // request groups
        getGroups()
    } catch(e){
        document.querySelector("body").classList.remove("loading")
        alert(`Problem signing in: ${e}`)
        console.log('Problem signing in: ', e)
    }
}

var clearSignIn = (e) => {
    e.preventDefault()
    // clear sign in fields
    $("sign-in-email").value = ""
    $("sign-in-password").value = ""
}

var createAccount = (e) => {
    e.preventDefault()
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
        document.querySelector("body").classList.add("loading")
        await superagent.delete(`${apiBaseURL}/users/me`).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        alert('Account deleted.')
        $("groups").innerHTML=''
        hideAll()
        hide("nav-bar")
        jwt = ''
        show("sign-in")
    } catch(e){
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem deleting your account: ', e)
        alert(`Problem deleting account: ${e}`)
    }
}

const deleteAllGroups = async function(e) {
    e.preventDefault()
    if(!confirm("Delete ALL cards associated with this account? This cannot be undone.")) {
        return
    }
    try {
        document.querySelector("body").classList.add("loading")
        await superagent.delete(`${apiBaseURL}/groups`).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        alert('All cards deleted.')
        $("groups").innerHTML = ''
    } catch(e) {
        document.querySelector("body").classList.remove("loading")
        console.log('Problem deleting all groups: ', e)
        alert(`Problem deleting groups: ${e}`)
    }
}

const logoutAll = async function(e) {
    e.preventDefault()
    try {
        document.querySelector("body").classList.add("loading")
        await superagent.post(`${apiBaseURL}/users/logoutAll`).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
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
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem logging out all: ', e)
        alert(`Problem logging out all: ${e}`)
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
    try {
        document.querySelector("body").classList.add("loading")
        const updatedUser = await superagent.patch(`${apiBaseURL}/users/me`).send(payload).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
        // clear update user fields
        $("update-username").value = ""
        $("update-password").value = ""
        $("update-password-confirm").value = ""
        alert('Account updated.')
    } catch(e){
        document.querySelector("body").classList.remove("loading")
        console.log('There was a problem updating: ', e)
        alert(`Problem updating: ${e}`)
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
    hide('searchArea')
}

const showGroups = function() {
    hideAll()
    getGroups()
    document.getElementById("searchBox").value = ""
    document.getElementById("searchBoxPUID").value = ""
    createPartnerIdSelectList()
}

const showNewGroup = function() {
    hideAll()
    show("new-group")
}

const showProfile = function() {
    hideAll()
    show("user-profile")
}

const logOut = async function() {
    hideAll()
    hide("nav-bar")
    try {
        document.querySelector("body").classList.add("loading")
        const clonedGroup = await superagent.post(`${apiBaseURL}/users/logout`).set('Authorization', 'Bearer ' + jwt)
        document.querySelector("body").classList.remove("loading")
    } catch(e) {
        document.querySelector("body").classList.remove("loading")
        console.log('Problem logging out: ', e)
        alert(`Problem logging out: ${e}`)
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
    var cards = document.getElementsByClassName("group")
    var cardNames = document.getElementsByClassName("group-h2")
    var PUIDs = document.getElementsByClassName("group-puid")
    var filterForCardName = document.getElementById("searchBox").value.toUpperCase()
    var filterForPUID = document.getElementById("searchBoxPUID").value.toUpperCase()
    var partnerIdSelected = document.getElementById("partner-id-select-list").value

    for (i = 0; i < cards.length; i++) {
        cards[i].style.display = "none"
        a = cardNames[i].textContent.toUpperCase()
        if (a.indexOf(filterForCardName) > -1) {
            if (PUIDs[i].textContent.toUpperCase().indexOf(filterForPUID) > -1) {
                var partnerIdOfCard = cards[i].getElementsByClassName("partner-id")[0].textContent
                var selectedPartnerId = document.getElementById("partner-id-select-list").value
                if (partnerIdOfCard === selectedPartnerId || selectedPartnerId === "All" || !selectedPartnerId) {
                    cards[i].style.display = "block"
                }
            }
        } 
    }
    createPartnerIdSelectList(partnerIdSelected)
}




// Create Partner ID Select List

function createPartnerIdSelectList(partnerIdSelected){

    var partnerIdSpans = Array.from(document.getElementsByClassName("partner-id"))
    var partnerIdSpansDisplayed = partnerIdSpans.filter(x => x.offsetParent)
    var partnerIds = partnerIdSpansDisplayed.map(x => x.textContent)

    // De-dupe the Partner IDs
    var uniquePartnerIds = [...new Set(partnerIds)]
    uniquePartnerIds.sort()

    var partnerIdselectList = document.getElementById("partner-id-select-list")
    partnerIdselectList.innerHTML=""

    //Create and append the options
    var option = document.createElement("option");
    option.value = "All";
    option.text = "All";
    partnerIdselectList.appendChild(option);

    for (var i = 0; i < uniquePartnerIds.length; i++) {
        var option = document.createElement("option");
        option.value = uniquePartnerIds[i];
        option.text = uniquePartnerIds[i];
        partnerIdselectList.appendChild(option);
    }

    // Select the previously selected element, if applicable
    if (partnerIdSelected) {
        for (var i = 0; i < partnerIdselectList.options.length; i++) {
            if (partnerIdSelected === partnerIdselectList.options[i].textContent) {
                partnerIdselectList.selectedIndex = i
            } 
        }
    }
}

