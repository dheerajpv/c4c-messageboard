"use client";

import type { Message } from "@prisma/client";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export default function Home() {
    const [typed, setTyped] = useState(""); // the length of this is already a good proxy of if the user is typing
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket] = useState<Socket>();
    const [typing, setTyping] = useState<number>(0);

    const typingHandler = (n: number) => {
        if (typed.length > 0) setTyping(n - 1);
        else setTyping(n);
    };

    useEffect(() => {
        (async () => {
            await fetch("/api/socket");
            const s = io("http://localhost:3001", {
                path: "/api/socket_io",
            });

            s.on("message", (m: Message) => {
                setMessages((old) => [m, ...old]);
            });

            s.on("users_typing", (n) => {
                typingHandler(n);
            });

            setSocket(s);
        })();
        // this should actually be an empty array, or the socket connection
        // will happen each time the typing field changes!
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    if (typed === "") return;

                    socket.emit("send", { content: typed });
                    socket.emit("typing_end");
                    setTyped("");
                }}
            >
                <input
                    className="text-black rounded-md p-4 text-lg m-4 invalid:border-red invalid:border-4 w-full"
                    maxLength={128}
                    type="text"
                    placeholder="Send a message (enter to send)"
                    value={typed}
                    onChange={(e) => {
                        const value = e.target.value;

                        if (value !== "") {
                            socket.emit("typing");
                        } else {
                            socket.emit("typing_end");
                        }

                        setTyped(value);
                    }}
                />
            </form>
            <p>
                <b>{typing}</b> other users are typing right now!
            </p>

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
