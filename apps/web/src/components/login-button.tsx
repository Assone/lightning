import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const LoginButton = () => {
  return (
    <Link
      className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
      to="/login"
    >
      登录
    </Link>
  );
};
