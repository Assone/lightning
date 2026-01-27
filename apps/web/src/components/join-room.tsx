import { useNavigate } from "@tanstack/react-router";
import { useId } from "react";
import { z } from "zod";
import { setRoomSession } from "@/functions/room";
import { authClient } from "@/lib/auth-client";
import { useAppForm } from "./form";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Empty, EmptyDescription } from "./ui/empty";
import { FieldGroup } from "./ui/field";
import { InputGroup } from "./ui/input-group";
import { Spinner } from "./ui/spinner";

interface JoinRoomProps {
  roomName?: string;
  displayName?: string;
}

const formSchema = z.object({
  roomName: z
    .string()
    .min(1, "Room name is required")
    .max(50, "Room name must be at most 50 characters"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(10, "Display name must be at most 10 characters"),
});

const defaultValues: z.infer<typeof formSchema> = {
  roomName: "",
  displayName: "",
};

export const JoinRoom: React.FC<JoinRoomProps> = ({
  roomName,
  displayName,
}) => {
  const { isPending } = authClient.useSession();
  const navigate = useNavigate();

  const formId = useId();
  const form = useAppForm({
    defaultValues: {
      roomName: roomName ?? defaultValues.roomName,
      displayName: displayName ?? defaultValues.displayName,
    },
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await setRoomSession({ data: { displayName: value.displayName } });
        await navigate({
          to: "/room/$roomName",
          params: { roomName: value.roomName },
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

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card>
      <CardContent>
        {isPending && (
          <Empty>
            <EmptyDescription>
              <Spinner />
            </EmptyDescription>
          </Empty>
        )}
        {!isPending && (
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <form.AppField name="displayName">
                {(field) => {
                  return (
                    <field.Field>
                      <field.Label>Display Name</field.Label>
                      <InputGroup>
                        <field.InputGroupInput />
                      </InputGroup>
                      <field.ErrorMessage />
                    </field.Field>
                  );
                }}
              </form.AppField>

              <form.AppField name="roomName">
                {(field) => {
                  return (
                    <field.Field>
                      <field.Label>Room Name</field.Label>
                      <InputGroup>
                        <field.InputGroupInput />
                      </InputGroup>
                      <field.ErrorMessage />
                    </field.Field>
                  );
                }}
              </form.AppField>
            </FieldGroup>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <form.AppForm>
          <form.ErrorMessage />
          <form.SubmitButton form={formId}>
            {({ isSubmitting }) => {
              return (
                <>
                  {isSubmitting ? <Spinner /> : null}
                  <span>Join Room</span>
                </>
              );
            }}
          </form.SubmitButton>
        </form.AppForm>
      </CardFooter>
    </Card>
  );
};
