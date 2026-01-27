import { Link } from "@tanstack/react-router";
import { LoginButton } from "@/components/login-button";
import { ProfileSummary } from "@/components/profile-summary";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "./ui/spinner";

const appTitle = "Lightning";

export const AppHeader = () => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const profileName = user?.name ?? user?.email ?? "Account";
  const profileSubtitle = user?.name ? user?.email : undefined;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link className="font-semibold text-foreground text-sm" to="/room">
          {appTitle}
        </Link>
        <div className="flex items-center gap-3">
          {isPending ? <Spinner /> : null}
          {!isPending && user ? (
            <ProfileSummary name={profileName} subtitle={profileSubtitle} />
          ) : null}
          {isPending || user ? null : <LoginButton />}
        </div>
      </div>
    </header>
  );
};
