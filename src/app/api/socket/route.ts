import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { Server as SocketServer } from "socket.io";

let io: SocketServer;

// simple store of who is typing, not important enough to need to be persisted
// also using a Set because the clients will just keep emitting typing events,
// and each socket ID should only be added here once.
const typingMap = new Set<string>();

export function GET(_req: NextRequest) {
    if (io) {
        console.log("Server already started");
        return Response.json({});
    }

    io = new SocketServer({
        path: "/api/socket_io",
        addTrailingSlash: false,
        cors: { origin: "*" },
    }).listen(parseInt(process.env.PORT!) + 1); // 3001

    io.on("connection", (socket) => {
        console.log(`${JSON.stringify(socket.id)} connect`);

        socket.on("send", async ({ content }) => {
            const message = await prisma.message.create({
                data: { content },
            });

            console.log("emitting", message);

            // broadcast sends to all listeners except sender,
            // to have the original sender get the event too,
            // it must be emitted separately.
            socket.emit("message", message);
            socket.broadcast.emit("message", message);
        });

        socket.on("disconnect", () => {
            console.log(`${JSON.stringify(socket.id)} disconnect`);
        });

        socket.on("typing", async () => {
            typingMap.add(socket.id);
            await typingSend();
        });

        socket.on("typing_end", async () => {
            typingMap.delete(socket.id);
            await typingSend();
        });
    });

    return Response.json({});

    async function typingSend() {
        const connected = await io.fetchSockets();

        for (const c of connected) {
            // if this user is also typing they'll be included in the map
            // so subtract them out before sending this data
            c.emit(
                "users_typing",
                typingMap.has(c.id) ? typingMap.size - 1 : typingMap.size
            );
        }
    }
}
