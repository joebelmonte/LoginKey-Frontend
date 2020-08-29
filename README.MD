LoginKey Front End
=====
**By Joe Belmonte**

# Table of contents

# About

The *LoginKey Generator* web app is a front-end application built to connect to the back end server found [here](https://github.com/joebelmonte/LoginKey-Backend).

*LoginKey Generator* allows users to sign up and create "cards".  Each card has the following information associated with it:

- Group Name
- Partner ID
- API Key
- Partner User ID
- Timeout

This information is then stored in a database and used to generate LoginKeys, which in turn can be used to authenticate to various services at [Glance Networks](https://ww2.glance.net).  For more information on login keys and how they relate to Glance, see [here](https://help.glance.net/integrations/login-key/). 

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

## Card View

Once at least 1 card has been created, you will be able to view the your cards.  