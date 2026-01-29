import { createFormHook } from "@tanstack/react-form";
import { lazy } from "react";
import { fieldContext, formContext } from "./context";

const Field = lazy(() =>
  import("../components/field").then((mod) => ({ default: mod.Field }))
);
const FieldLabel = lazy(() =>
  import("../components/field-label").then((mod) => ({
    default: mod.FieldLabel,
  }))
);
const FieldErrorMessage = lazy(() =>
  import("../components/field-error-message").then((mod) => ({
    default: mod.FieldErrorMessage,
  }))
);

const InputGroupInput = lazy(() =>
  import("../components/input-group-input").then((mod) => ({
    default: mod.InputGroupInput,
  }))
);
const InputPassword = lazy(() =>
  import("../components/input-password").then((mod) => ({
    default: mod.InputPassword,
  }))
);

const FormErrorMessage = lazy(() =>
  import("../components/form-error-message").then((mod) => ({
    default: mod.FormErrorMessage,
  }))
);
const FormSubmitButton = lazy(() =>
  import("../components/form-submit-button").then((mod) => ({
    default: mod.FormSubmitButton,
  }))
);

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    Field,
    Label: FieldLabel,
    ErrorMessage: FieldErrorMessage,
    InputGroupInput,
    InputPassword,
  },
  formComponents: {
    ErrorMessage: FormErrorMessage,
    SubmitButton: FormSubmitButton,
  },
  fieldContext,
  formContext,
});
