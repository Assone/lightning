import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldComponents: {},
	formComponents: {},
	fieldContext,
	formContext,
});
