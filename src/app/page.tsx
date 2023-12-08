"use client";

import type { Message } from "@prisma/client";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export default function Home() {
    const [typed, setTyped] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        (async () => {
            await fetch("/api/socket");
            const s = io("http://localhost:3001", {
                path: "/api/socket_io",
            });

            s.on("message", (m: Message) => {
                console.log("recieved ", m);
                setMessages((old) => [m, ...old]);
            });

            setSocket(s);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/messages");
            setMessages(await res.json());
        })();
    }, []);

    if (!socket) return <>Loading</>;

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl text-black dark:text-white">
                Chat4Community
            </h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    socket.emit("send", { content: typed });
                    setTyped("");
                }}
            >
                <input
                    className="text-black rounded-md p-4 text-lg m-4 invalid:border-red invalid:border-4 w-full"
                    maxLength={128}
                    type="text"
                    placeholder="Send a message (enter to send)"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                />
            </form>

            <section>
                <p className="text-2xl text-bold text-black dark:text-white mb-2">
                    Past messages:
                </p>
                {messages.map((m) => (
                    <article
                        key={m.id}
                        className="bg-gray-400 dark:bg-gray-800 p-8 rounded-md m-2"
                    >
                        <p className="text-lg">{m.content}</p>
                        <p className="text-sm text-gray-800 dark:text-gray-400">
                            At {new Date(m.createdAt).toLocaleString()}
                        </p>
                    </article>
                ))}
            </section>

            <footer>
                <div className="text text-center text-gray-800 dark:text-gray-400">
                    <p>
                        Remember, all messages are anonymous - treat each other
                        with respect.
                    </p>
                    <p>
                        Made by Ari Prakash - for the Code4Community Technical
                        challenge (Fall 2023)
                    </p>
                </div>
            </footer>
        </main>
    );
}
