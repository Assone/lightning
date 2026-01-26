import type { Discard } from "@lightning/shared/types";
import { Button } from "@/components/ui/button";
import { useFormContext } from "../hooks/context";

type FormSubmitButton = Discard<
	React.ComponentProps<typeof Button>,
	"type" | "children"
> & {
	children?: (props: { isSubmitting: boolean }) => React.ReactNode;
};

export const FormSubmitButton: React.FC<FormSubmitButton> = ({
	children,
	...props
}) => {
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(state) => [state.canSubmit, state.isSubmitting] as const}
		>
			{([canSubmit, isSubmitting]) => (
				<Button disabled={!canSubmit || isSubmitting} type="submit" {...props}>
					{children?.({ isSubmitting })}
				</Button>
			)}
		</form.Subscribe>
	);
};
