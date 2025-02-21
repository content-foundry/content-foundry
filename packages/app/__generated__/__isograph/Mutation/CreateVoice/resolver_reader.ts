import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__CreateVoice__param } from './param_type.ts';
import { Mutation__CreateVoice__output_type } from './output_type.ts';
import { CreateVoiceMutation as resolver } from '../../../../mutations/CreateVoice.tsx';

const readerAst: ReaderAst<Mutation__CreateVoice__param> = [
  {
    kind: "Linked",
    fieldName: "createVoice",
    alias: null,
    arguments: [
      [
        "handle",
        { kind: "Variable", name: "handle" },
      ],
    ],
    condition: null,
    selections: [
      {
        kind: "Scalar",
        fieldName: "__typename",
        alias: null,
        arguments: null,
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Mutation__CreateVoice__param,
  Mutation__CreateVoice__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
