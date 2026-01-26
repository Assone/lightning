import { Field as FieldComponent } from "../../ui/field";
import { useFieldContext } from "../hooks/context";

type FieldProps = React.ComponentProps<typeof FieldComponent>;

export const Field: React.FC<FieldProps> = (props) => {
	const field = useFieldContext();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return <FieldComponent data-invalid={isInvalid} {...props} />;
};
