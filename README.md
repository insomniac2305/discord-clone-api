# Discord Clone API

<p align="center">
  <img alt="Version" src="https://img.shields.io/github/package-json/v/insomniac2305/discord-clone-api?color=blue&cacheSeconds=2592000" />
  <a href="https://github.com/insomniac2305/discord-clone-api/graphs/commit-activity" target="_blank"><img alt="Commit activity" src="https://img.shields.io/github/commit-activity/t/insomniac2305/discord-clone-api"></a>
  <img alt="Last commit" src="https://img.shields.io/github/last-commit/insomniac2305/discord-clone-api">
  <a href="https://github.com/insomniac2305/discord-clone-api/blob/master/LICENSE" target="_blank"><img alt="License: GPL-3.0" src="https://img.shields.io/github/license/insomniac2305/discord-clone-api?" /></a>
</p>

## Overview

This project is the backend for the Discord clone frontend [found here](https://github.com/insomniac2305/discord-clone). It was built with Node.js and Express and enables user authentication, server and channel management, real-time messaging, and file uploads. Being part of [The Odin Project's curriculum](https://www.theodinproject.com), the project served as an exercise to building a backend and wiring it up to a frontend application to create a full-stack app.

## Features

- 🔐 **User Authentication** – Secure login and registration with JWT-based authentication.
- 🏠 **Server Management** – Create, update, and delete servers with role based permissions.
- 💬 **Channel System** – Support for multiple text channels within servers.
- 📩 **Messaging** – Real-time messaging with websockets
- 📂 **File Uploads** – Upload and serve images for user avatars and server icons.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication:** JWT, Passport.js, bcrypt.js
- **Real-time Communication:** Socket.IO
- **File Handling:** Multer
- **Validation:** express-validator

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MongoDB instance running at `your_db_uri`
- Discord clone frontend running at `your_client_url`
- `.env` file with necessary environment variables:
  ```env
  MONGODB_URI=your_db_uri
  JWT_SECRET=your_secret_key
  BASE_URL=your_server_base_url
  UPLOAD_FOLDER=public/uploads
  CLIENT_URL=your_client_url
  ```

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/insomniac2305/discord-clone-api.git
   cd discord-clone-api
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm run devstart  # For development (with nodemon)
   npm start         # For production
   ```

### API Endpoints

<details>
<summary> Click to expand</summary>

#### Authentication

- `POST /login` – Authenticate a user and return a JWT token.

#### Users

- `GET /api/users` – Retrieve a list of all users.
- `POST /api/users` – Create a new user.
- `GET /api/users/me` – Retrieve the current authenticated user's details.
- `GET /api/users/:userid` – Retrieve a specific user's details.
- `PUT /api/users/:userid` – Update a user's information.
- `DELETE /api/users/:userid` – Delete a user.

#### Servers

- `GET /api/servers` – Retrieve all servers the user is part of.
- `POST /api/servers` – Create a new server.
- `GET /api/servers/:serverid` – Retrieve a specific server's details.
- `PUT /api/servers/:serverid` – Update a server's information.
- `DELETE /api/servers/:serverid` – Delete a server.

#### Server Members

- `GET /api/servers/:serverid/members` – Retrieve members of a server.
- `POST /api/servers/:serverid/members` – Add a user to a server.
- `PUT /api/servers/:serverid/members/:memberid` – Update a member's role.
- `DELETE /api/servers/:serverid/members/:memberid` – Remove a user from a server.

#### Channels

- `GET /api/servers/:serverid/channels` – Retrieve all channels in a server.
- `POST /api/servers/:serverid/channels` – Create a new channel.
- `GET /api/servers/:serverid/channels/:channelid` – Retrieve a specific channel.
- `PUT /api/servers/:serverid/channels/:channelid` – Update a channel's details.
- `DELETE /api/servers/:serverid/channels/:channelid` – Delete a channel.

#### Messages

- `GET /api/servers/:serverid/channels/:channelid/messages` – Retrieve messages from a channel.
- `POST /api/servers/:serverid/channels/:channelid/messages` – Send a new message.
- `GET /api/servers/:serverid/channels/:channelid/messages/:messageid` – Retrieve a specific message.
- `PUT /api/servers/:serverid/channels/:channelid/messages/:messageid` – Update a message.
- `DELETE /api/servers/:serverid/channels/:channelid/messages/:messageid` – Delete a message.

#### File Handling

- `GET /files/:directory/:id/:fileName` – Retrieve a file by its path.
</details>

## License

This project is [GPL-3.0](https://github.com/insomniac2305/discord-clone-api/blob/main/LICENSE) licensed.
