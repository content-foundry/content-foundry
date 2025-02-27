import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__CheckEmail__param } from './param_type.ts';
import { Mutation__CheckEmail__output_type } from './output_type.ts';
import { CheckEmailMutation as resolver } from '../../../../mutations/CheckEmail.tsx';

const readerAst: ReaderAst<Mutation__CheckEmail__param> = [
  {
    kind: "Scalar",
    fieldName: "checkEmail",
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
  Mutation__CheckEmail__param,
  Mutation__CheckEmail__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Mutation.CheckEmail",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
