import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
    const messages = await prisma.message.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return Response.json(messages);
}
