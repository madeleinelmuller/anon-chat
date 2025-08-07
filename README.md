# Anonymous Chat

A real-time anonymous chat application built with Node.js, Express, and WebSockets.

## Features

- **Anonymous Chatting:** Chat with others without revealing your identity.
- **Multiple Chat Rooms:** Create unique, shareable chat rooms.
- **Two Anonymity Modes:**
    - **Aliased:** Each user is assigned a unique alias (e.g., "User 1").
    - **Anonymous:** All messages are sent from "Anonymous".
- **Real-time Communication:** Messages are sent and received in real-time using WebSockets.
- **Responsive Design:** The application is designed to work on different screen sizes.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/madeleinelmuller/anon-chat.git
   ```
2. Navigate to the project directory:
   ```sh
   cd anon-chat
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

### Running the Application

To start the application, run the following command:

```sh
npm start
```

The server will start on port 3000. You can access the application by navigating to `http://localhost:3000` in your web browser.
