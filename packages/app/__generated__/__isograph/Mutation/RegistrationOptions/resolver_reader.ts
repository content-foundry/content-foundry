import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__RegistrationOptions__param } from './param_type.ts';
import { Mutation__RegistrationOptions__output_type } from './output_type.ts';
import { RegistrationOptions as resolver } from '../../../../mutations/EntrypointRegistrationOptions.tsx';

const readerAst: ReaderAst<Mutation__RegistrationOptions__param> = [
  {
    kind: "Scalar",
    fieldName: "registrationOptions",
    alias: null,
    arguments: [
      [
        "email",
        { kind: "Variable", name: "email" },
      ],
    ],
    isUpdatable: false,
  },
];

const artifact: EagerReaderArtifact<
  Mutation__RegistrationOptions__param,
  Mutation__RegistrationOptions__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Mutation.RegistrationOptions",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
