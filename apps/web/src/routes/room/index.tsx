import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
	roomName: z.string().optional(),
});

export const Route = createFileRoute("/room/")({
	component: RouteComponent,
	validateSearch: searchSchema,
});

function RouteComponent() {
	return <div>Hello "/room/"!</div>;
}
