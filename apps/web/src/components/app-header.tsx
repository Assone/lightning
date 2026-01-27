import { Link } from "@tanstack/react-router";
import { UserProfile } from "@/components/user-profile";
import { ThemeToggle } from "./theme-toggle";

const appTitle = "Lightning";

export const AppHeader = () => {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link className="font-semibold text-foreground text-sm" to="/room">
          {appTitle}
        </Link>
        <div className="flex items-center gap-3">
          <UserProfile />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
