import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__Login__param } from './param_type.ts';
import { Mutation__Login__output_type } from './output_type.ts';
import { LoginMutation as resolver } from '../../../../mutations/CompleteLogin.tsx';

const readerAst: ReaderAst<Mutation__Login__param> = [
  {
    kind: "Linked",
    fieldName: "login",
    alias: null,
    arguments: [
      [
        "email",
        { kind: "Variable", name: "email" },
      ],

      [
        "authResp",
        { kind: "Variable", name: "authResp" },
      ],
    ],
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Scalar",
        fieldName: "__typename",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Mutation__Login__param,
  Mutation__Login__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Mutation.Login",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
