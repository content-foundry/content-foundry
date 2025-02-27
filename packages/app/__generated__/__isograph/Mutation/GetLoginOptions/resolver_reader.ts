import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__GetLoginOptions__param } from './param_type.ts';
import { Mutation__GetLoginOptions__output_type } from './output_type.ts';
import { GetLoginOptionsMutation as resolver } from '../../../../mutations/GetLoginOptions.tsx';

const readerAst: ReaderAst<Mutation__GetLoginOptions__param> = [
  {
    kind: "Scalar",
    fieldName: "getLoginOptions",
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
  Mutation__GetLoginOptions__param,
  Mutation__GetLoginOptions__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Mutation.GetLoginOptions",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
