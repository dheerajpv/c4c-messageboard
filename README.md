# c4c-messageboard

This project is made for the Code4Community Fall 2023 technical challenge.
It is a small anonymous chat proof of concept.

## Overview

This is a Next.js server to serve trhe react frontend, and also uses
a socket.io server for the realtime functionality - to automatically
render new messages without the need for a page reload.

This submission fulfuills the requirements as follows:

-   Users can type in the input box, and send messages by pressing enter (up to 128 characters)
-   Users cannot send empty messages
-   Messages are sorted from most to least recent
    -   The database query at the beginning returns messages sorted
    -   All subsequent messages will be emitted by the socket in order
-   All connected users should see the same list of messages

### Bonus requirement: Persistence

The server adds all sent messages into a database, so the message list
will persist across server restarts.

This is accomplished using a PostgreSQL docker container that runs in the background on port 5432.

## Running

Please follow these steps to run the server:

Running this app requires node (with npm) and docker.

The database password is written in [docker-compose-dev.yml](docker-compose-dev.yml) and is hardcoded to `"example"` (to be able to push a sensible compose file) -
which should be changed for security reasons, both in that file and
in `.env`.

### Create `.env` file

Create a file named `.env` in the root directory with the following content:

```env
DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432/postgres?schema=public"
```

### Setup

```sh
git clone https://github.com/dheerajpv/c4c-messageboard.git
cd c4c-messageboard

npm i
docker compose -f docker-compose-dev.yml up # to run the database
npx prisma db push
npx prisma generate
```

### Development server

```sh
npm run dev
```

### Production server

```sh
npm run build
npm run start
```

This server needs both port 3000 and 3001 to be open for the HTTP server and WS server respectively.
