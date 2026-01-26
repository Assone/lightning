import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), tanstackStart(), viteReact()],
	resolve: {
		alias: [{ find: /^@\/(.*)/, replacement: "/src/$1" }],
	},

	server: {
		port: 3001,
	},
	experimental: {
		enableNativePlugin: true,
	},
});
