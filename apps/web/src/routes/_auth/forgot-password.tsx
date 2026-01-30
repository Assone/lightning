import { createFileRoute, Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useId, useState } from "react";
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
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
});

const formSchema = z.object({
  email: z.email("Enter a valid email"),
});

const defaultValues: z.infer<typeof formSchema> = {
  email: "",
};

function RouteComponent() {
  const [requestSent, setRequestSent] = useState(false);
  const formId = useId();
  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await authClient.requestPasswordReset({
          email: value.email,
        });

        if (result?.error) {
          throw new Error(result.error.message || "Unable to send reset link.");
        }

        setRequestSent(true);
      } catch (error) {
        setRequestSent(false);
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
    <div className="container flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            We will send a reset link to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <form.AppField name="email">
                {(field) => (
                  <field.Field>
                    <field.Label>Email address</field.Label>
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
                  <span>Send reset link</span>
                </>
              )}
            </form.SubmitButton>
          </form.AppForm>
          {requestSent ? (
            <span className="text-muted-foreground text-xs">
              If the email exists, a reset link is on the way.
            </span>
          ) : null}
          <span className="text-muted-foreground text-xs">
            Remembered your password?{" "}
            <Link className="text-foreground hover:underline" to="/login">
              Back to sign in
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
