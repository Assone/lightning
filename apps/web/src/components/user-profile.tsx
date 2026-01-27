import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Spinner } from "./ui/spinner";

export const UserProfile: React.FC = () => {
  const { isPending, data } = authClient.useSession();

  if (isPending) {
    return <Spinner />;
  }

  if (!data) {
    return (
      <Link
        className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
        to="/login"
      >
        登录
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          {data.user.image && <AvatarImage src={data.user.image} />}
          <AvatarFallback>{data.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="p-2">
          <p className="text-sm">{data.user.name}</p>
          {data.user.email ? (
            <p className="text-muted-foreground text-xs">{data.user.email}</p>
          ) : null}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              authClient.signOut();
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
