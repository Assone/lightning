import { useStore } from "@tanstack/react-form";
import { FieldError } from "../../ui/field";
import { useFormContext } from "../hooks/context";

type FormErrorMessageProps = React.ComponentProps<typeof FieldError>;

export const FormErrorMessage: React.FC<FormErrorMessageProps> = (props) => {
  const form = useFormContext();
  const formErrors = useStore(form.store, (formState) => formState.errors);

  return formErrors.length > 0 && <FieldError errors={formErrors} {...props} />;
};
