'use strict'

var apiBaseURL = ""

if (window.location.hostname === "localhost") {
    apiBaseURL = "http://localhost:3000/"
}

var authToken = ''

export default {apiBaseURL, authToken}