import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";

import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../index.css?url";

// biome-ignore lint/suspicious/noEmptyInterface: empty interface is useful for future expansion
export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "My App",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <AppHeader />
            <div className="flex justify-center px-4 py-6">
              <Outlet />
            </div>
          </div>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
