import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfContentCollection__ContentCollection__param } from './param_type.ts';
import { ContentCollection as resolver } from '../../../../components/BfContentCollection/ContentCollection.tsx';
import BfContentItem__ContentItem__resolver_reader from '../../BfContentItem/ContentItem/resolver_reader.ts';

const readerAst: ReaderAst<BfContentCollection__ContentCollection__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Linked",
    fieldName: "items",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Resolver",
        alias: "ContentItem",
        arguments: null,
        readerArtifact: BfContentItem__ContentItem__resolver_reader,
        usedRefetchQueries: [],
      },
      {
        kind: "Scalar",
        fieldName: "id",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfContentCollection__ContentCollection__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfContentCollection.ContentCollection",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
