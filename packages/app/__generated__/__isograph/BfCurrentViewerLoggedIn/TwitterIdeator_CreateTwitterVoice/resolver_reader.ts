import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedIn__TwitterIdeator_CreateTwitterVoice__param } from './param_type.ts';
import { CreateTwitterVoice as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedIn/TwitterIdeator/CreateTwitterVoice.tsx';
import BfCurrentViewerLoggedIn__TwitterIdeator_CreateStep1__resolver_reader from '../../BfCurrentViewerLoggedIn/TwitterIdeator_CreateStep1/resolver_reader.ts';
import BfCurrentViewerLoggedIn__TwitterIdeator_CreateStep2__resolver_reader from '../../BfCurrentViewerLoggedIn/TwitterIdeator_CreateStep2/resolver_reader.ts';

const readerAst: ReaderAst<BfCurrentViewerLoggedIn__TwitterIdeator_CreateTwitterVoice__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
  {
    kind: "Resolver",
    alias: "TwitterIdeator_CreateStep1",
    arguments: null,
    readerArtifact: BfCurrentViewerLoggedIn__TwitterIdeator_CreateStep1__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "TwitterIdeator_CreateStep2",
    arguments: null,
    readerArtifact: BfCurrentViewerLoggedIn__TwitterIdeator_CreateStep2__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedIn__TwitterIdeator_CreateTwitterVoice__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfCurrentViewerLoggedIn.TwitterIdeator_CreateTwitterVoice",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
