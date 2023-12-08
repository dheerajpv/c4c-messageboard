import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { Server as SocketServer } from "socket.io";

let io: SocketServer;

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
    });

    return Response.json({});
}
