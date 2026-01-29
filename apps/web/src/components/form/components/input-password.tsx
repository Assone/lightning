import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useFieldContext } from "../hooks/context";

type InputPasswordProps = React.ComponentProps<typeof InputGroupInput>;

export const InputPassword: React.FC<InputPasswordProps> = (props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <InputGroup>
      <InputGroupInput
        aria-invalid={isInvalid}
        aria-required
        autoComplete="off"
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        type={isPasswordVisible ? "text" : "password"}
        value={field.state.value}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          size="icon-xs"
        >
          {isPasswordVisible ? <Eye /> : <EyeClosed />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};
