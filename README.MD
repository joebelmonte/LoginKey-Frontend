LoginKey Front End
=====
**By Joe Belmonte**

# Table of contents

- [About](#about)
- [Configuration](#configuration)
- [Glossary of Terms](#glossary-of-terms)
- [Using the App](#using-the-app)
  - [Creating a Card](#creating-a-card)
  - [Viewing Cards](#viewing-cards)
  - [Edit Card](#edit-card)
  - [Profile](#profile)

# About

The *LoginKey Generator* web app is a front-end application built to connect to the back end server found [here](https://github.com/joebelmonte/LoginKey-Backend).

*LoginKey Generator* allows users to sign up and create "cards".  Each card has the following information associated with it:

- Group Name
- Partner ID
- API Key
- Partner User ID
- Timeout

This information is then stored in a database and used to generate login keys, which in turn can be used to authenticate to various services at [Glance Networks](https://ww2.glance.net).  

At least 1 account with Glance is required to use this app.

For more information on login keys and how they relate to Glance, see [here](https://help.glance.net/integrations/login-key/). 

For a deployed example of this app, see [here](https://loginkey-app.herokuapp.com).

# Configuration

The following environment variables must be defined:

| Variable               | Definition                                              |
|------------------------|---------------------------------------------------------|
| PORT                   | Port that the server listens on.                        |



# Glossary of Terms

| Term            | Definition                                                                                                                                                                                                                                                                                                | Value                                         |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| Group Name      | The name of the Glance group.                                                                                                                                                                                                                                                                             | String                                        |
| Partner ID      | The partnerId is the same as your Glance group id. This is assigned by Glance.                                                                                                                                                                                                                            | Numeric                                       |
| API Key         | Secret key for the group. <br><br>The API Key is never returned from the API.                                                                                                                                                                                                                             | String                                        |
| Partner User ID | A unique user identifier.                                                                                                                                                                                                                                                                                 | String                                        |
| Timeout         | Sets the length of time for which the login key will be valid. <br><br>Values of <= 86,400 (1 day) are interpreted as relative, in seconds from now.<br><br>Values of > 86,400 are interpreted as absolute, in UNIX Epoch time. <br><br>The maximum time in the future for a valid expiration is one day. | Numeric (defaults to 3600 seconds, or 1 hour) |
| Login Key       | A time-limited token used to authenticate a user to various Glance services.                                                                                                                                                                                                                              | String (returned from API only)               |
| Agent Join Page | URL which will open and authenticate to the Agent Join page on glance.net.                                                                                                                                                                                                                                | String (returned from API only)               |
| Glance Client   | URL which will open and authenticate to the Glance client (if installed).                                                                                                                                                                                                                                 | String (returned from API only)               |

# Using the App

## Creating a Card

When you first sign up for an account, you will be prompted to create your first "Card".  

![ScreenShot](/screenshots/new_card.png)

Enter the appropriate values and click "Save".

You can create a new card in the future by clicking "New Card" from the navigation menu.

## Viewing Cards

Once at least 1 card has been created, you will be able to view the your cards.  

![ScreenShot](/screenshots/cards.png)

The following actions are available for each card:

- **Delete Card:** This will permanently delete the card.
- **Edit Card:** This takes you to the Edit Card view (see below).
- **Refresh Key:** This will refresh the login key if the timeout is specified in relative time.  If the timeout is specified in absolute time, the app will display a warning message and perform no function.

You can also filter by Card Name, PUID, and Partner ID using the search boxes and select list below the navigation menu.  Cards displayed will meet ALL search criteria specified, with Card Name and PUID being case insensitive.

Cards with expired keys will display the expiration date/time in red font:

![ScreenShot](/screenshots/expired-key.png)

## Edit Card

Edit Card brings up the following view:

![ScreenShot](/screenshots/edit_card.png)

The following actions are available:

- **Cancel:** Will return to the Cards view.
- **Save:** This will update the card with any changes that have been made to the form above.
- **Clone:** This will create a new card and does not modify the card being edited.  The new card has the same attributes as the card being edited, however if the user has made changes to the values in the form then those new values will be used instead.
- **Check Key:** For security reasons, the API Key is never returned from the API.  However, you can use this function to check whether the API Key you are using is the one currently associated with this card in the database.  Click *Check Key* and enter your API Key.  The app will tell you whether or not it is a match with the API Key in the database.  

## Profile

Profile brings up the following view:

![ScreenShot](/screenshots/profile.png)

The following actions are available:

- **Delete Account:** This will permanently delete the user account and log the user out.
- **Delete All Cards:** This will permanently delete all cards associated with the account.
- **Logout From All Devices:** This will delete all of the authentication tokens associated with the account, logging the user out of all devices.
- **Update Email/PW:** This will update the account with the email and/or password specified in the form.