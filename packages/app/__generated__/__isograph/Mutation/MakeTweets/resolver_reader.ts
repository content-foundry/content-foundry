import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__MakeTweets__param } from './param_type.ts';
import { Mutation__MakeTweets__output_type } from './output_type.ts';
import { MakeTweetsMutation as resolver } from '../../../../mutations/MakeTweets.tsx';

const readerAst: ReaderAst<Mutation__MakeTweets__param> = [
  {
    kind: "Linked",
    fieldName: "makeTweets",
    alias: null,
    arguments: [
      [
        "tweet",
        { kind: "Variable", name: "tweet" },
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
  Mutation__MakeTweets__param,
  Mutation__MakeTweets__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
