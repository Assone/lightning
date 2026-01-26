import { FieldLabel as FieldLabelComponent } from "../../ui/field";
import { useFieldContext } from "../hooks/context";

type FieldLabelProps = React.ComponentProps<typeof FieldLabelComponent>;

export const FieldLabel: React.FC<FieldLabelProps> = (props) => {
	const field = useFieldContext();

	return <FieldLabelComponent htmlFor={field.name} {...props} />;
};
