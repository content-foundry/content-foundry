import * as React from "react";
import { BfDsFormNumberInput } from "packages/bfDs/components/BfDsForm/BfDsFormNumberInput.tsx";
import { BfDsFormTextInput } from "packages/bfDs/components/BfDsForm/BfDsFormTextInput.tsx";
import { BfDsFormSubmitButton } from "packages/bfDs/components/BfDsForm/BfDsFormSubmitButton.tsx";
import { BfDsFormToggle } from "packages/bfDs/components/BfDsForm/BfDsFormToggle.tsx";
import { BfDsFormTextArea } from "packages/bfDs/components/BfDsForm/BfDsFormTextArea.tsx";
const { useState, createContext, useContext } = React;

import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

type FormError = {
  message: string;
  field: string;
  type: "error" | "warn" | "info";
};

type BfDsFormErrorRecord<T> = {
  [key in keyof T]: FormError;
};

type BfDsFormCallbacks<T> = {
  onSubmit?: (value: T) => void;
  onChange?: (value: T) => void;
  onError?: (errors: BfDsFormErrorRecord<T>) => void;
};

export type BfDsFormValue<T = Record<string, string | number>> = {
  errors?: BfDsFormErrorRecord<T>;
  data?: T;
} & BfDsFormCallbacks<T>;

// deno-lint-ignore no-explicit-any
const BfDsFormContext = createContext<BfDsFormValue<any>>({});

type BfDsFormProps<T = Record<string, string | number | boolean | null>> =
  & React.PropsWithChildren<BfDsFormCallbacks<T>>
  & {
    initialData: T;
    xstyle?: React.CSSProperties;
  };

export function BfDsForm<T>(
  { initialData, xstyle, children, ...bfDsFormCallbacks }: BfDsFormProps<T>,
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<BfDsFormErrorRecord<T>>(
    {} as BfDsFormErrorRecord<T>,
  );

  function onChange(value: T) {
    setData(value);
    bfDsFormCallbacks.onChange?.(value);
  }

  function onError(errors: BfDsFormErrorRecord<T>) {
    setErrors(errors);
    bfDsFormCallbacks.onError?.(errors);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    logger.debug("form callbacks", bfDsFormCallbacks);
    e.preventDefault();
    bfDsFormCallbacks.onSubmit?.(data);
  }

  return (
    <BfDsFormContext.Provider
      value={{ data, errors, onChange, onError, onSubmit }}
    >
      <form onSubmit={onSubmit} style={xstyle}>{children}</form>
    </BfDsFormContext.Provider>
  );
}

export function useBfDsFormContext<T>() {
  const context = useContext(BfDsFormContext) as BfDsFormValue<T>;
  if (!context) {
    throw new Error("useBfDsForm must be used within a BfDsFormProvider");
  }
  return context;
}

export type BfDsFormElementProps<
  TAdditionalFormElementProps = Record<string, unknown>,
> = TAdditionalFormElementProps & {
  id: string;
  title?: string;
  rows?: string;
  placeholder?: string;
};

/**
 * Example usage of BfDsForm and subsequent fields
 */
type ExampleFormData = {
  name: string;
  email: string;
  number: number;
  checkbox: boolean;
  bio: string;
};

const exampleInitialFormData = {
  name: "Randall",
  email: "rdlnk@example.com",
  number: 42,
  checkbox: true,
  bio: "I am a random person",
};

function exampleOnSubmit(value: ExampleFormData) {
  logger.info(value);
}

export function Example() {
  return (
    <BfDsForm<ExampleFormData>
      onSubmit={exampleOnSubmit}
      initialData={exampleInitialFormData}
    >
      <BfDsFormTextInput id="name" title="What is your name?" />
      <BfDsFormTextInput id="email" title="What is your email?" />
      <BfDsFormNumberInput id="number" title="What is your favorite number?" />
      <BfDsFormToggle id="checkbox" title="Do you like cheese?" />
      <BfDsFormTextArea id="bio" rows="2" title="Tell us about yourself" />
      <BfDsFormSubmitButton text="Submit" />
    </BfDsForm>
  );
}
