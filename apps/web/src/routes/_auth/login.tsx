import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useId } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
  beforeLoad: async ({ search }) => {
    const session = await getUser();

    if (session) {
      throw redirect({
        to: search.redirect || "/room",
      });
    }
  },
});

const formSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const defaultValues: z.infer<typeof formSchema> = {
  email: "",
  password: "",
};

function RouteComponent() {
  const navigate = useNavigate();
  const formId = useId();
  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (result?.error) {
          throw new Error(result.error.message || "Unable to sign in.");
        }

        await navigate({
          to: "/room",
        });
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: {
            form: {
              message: error instanceof Error ? error.message : String(error),
            },
            fields: {},
          },
        });
      }
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  return (
    <div className="container flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue to your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <form.AppField name="email">
                {(field) => (
                  <field.Field>
                    <field.Label>Email</field.Label>
                    <InputGroup>
                      <field.InputGroupInput
                        autoComplete="email"
                        placeholder="name@company.com"
                        type="email"
                      />
                    </InputGroup>
                    <field.ErrorMessage />
                  </field.Field>
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <field.Field>
                    <div className="flex items-center justify-between">
                      <field.Label>Password</field.Label>
                      <Link
                        className="text-muted-foreground text-xs transition hover:text-foreground"
                        to="/forgot-password"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <field.InputPassword />
                    <field.ErrorMessage />
                  </field.Field>
                )}
              </form.AppField>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <form.AppForm>
            <form.ErrorMessage />
            <form.SubmitButton className="w-full" form={formId}>
              {({ isSubmitting }) => (
                <>
                  {isSubmitting ? <Spinner /> : null}
                  <span>Sign in</span>
                </>
              )}
            </form.SubmitButton>
          </form.AppForm>
          <span className="text-muted-foreground text-xs">
            New here?{" "}
            <Link className="text-foreground hover:underline" to="/register">
              Create an account
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
