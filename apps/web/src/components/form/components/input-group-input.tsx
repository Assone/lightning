import { InputGroupInput as InputGroupInputComponent } from "../../ui/input-group";
import { useFieldContext } from "../hooks/context";

type InputGroupInputProps = React.ComponentProps<
  typeof InputGroupInputComponent
>;

export const InputGroupInput: React.FC<InputGroupInputProps> = (props) => {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <InputGroupInputComponent
      aria-invalid={isInvalid}
      id={field.name}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      value={field.state.value}
      {...props}
    />
  );
};
