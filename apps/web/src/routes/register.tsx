import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useId } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

const formSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const defaultValues: z.infer<typeof formSchema> = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
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
        const result = await authClient.signUp.email({
          email: value.email,
          name: value.fullName,
          password: value.password,
        });

        if (result?.error) {
          throw new Error(result.error.message || "Unable to sign up.");
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
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Set up your profile to start collaborating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <form.AppField name="fullName">
                {(field) => (
                  <field.Field>
                    <field.Label>Full name</field.Label>
                    <InputGroup>
                      <field.InputGroupInput
                        autoComplete="name"
                        placeholder="Alex Rivera"
                        type="text"
                      />
                    </InputGroup>
                    <field.ErrorMessage />
                  </field.Field>
                )}
              </form.AppField>

              <form.AppField name="email">
                {(field) => (
                  <field.Field>
                    <field.Label>Work email</field.Label>
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
                    <field.Label>Password</field.Label>
                    <InputGroup>
                      <field.InputGroupInput
                        autoComplete="new-password"
                        placeholder="Create a password"
                        type="password"
                      />
                    </InputGroup>
                    <field.ErrorMessage />
                  </field.Field>
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.Field>
                    <field.Label>Confirm password</field.Label>
                    <InputGroup>
                      <field.InputGroupInput
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        type="password"
                      />
                    </InputGroup>
                    <field.ErrorMessage />
                  </field.Field>
                )}
              </form.AppField>

              <form.AppField name="terms">
                {(field) => (
                  <field.Field orientation="horizontal">
                    <Checkbox
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      checked={field.state.value}
                      id={field.name}
                      onCheckedChange={(checked) => {
                        field.handleChange(Boolean(checked));
                      }}
                    />
                    <div className="flex flex-col">
                      <field.Label htmlFor={field.name}>
                        I agree to the terms and privacy policy.
                      </field.Label>
                      <field.ErrorMessage />
                    </div>
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
                  <span>Create account</span>
                </>
              )}
            </form.SubmitButton>
          </form.AppForm>
          <span className="text-muted-foreground text-xs">
            Already have an account?{" "}
            <Link className="text-foreground hover:underline" to="/login">
              Sign in
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
