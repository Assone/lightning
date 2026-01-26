import { FieldError } from "../../ui/field";
import { useFieldContext } from "../hooks/context";

type FieldErrorMessageProps = React.ComponentProps<typeof FieldError>;

export const FieldErrorMessage: React.FC<FieldErrorMessageProps> = (props) => {
  const field = useFieldContext();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    isInvalid && <FieldError errors={field.state.meta.errors} {...props} />
  );
};
