import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedIn__TwitterIdeator__param } from './param_type.ts';
import { TwitterIdeator as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedIn/TwitterIdeator.tsx';
import BfCurrentViewerLoggedIn__TwitterIdeator_CreateTwitterVoice__resolver_reader from '../../BfCurrentViewerLoggedIn/TwitterIdeator_CreateTwitterVoice/resolver_reader.ts';
import BfCurrentViewerLoggedIn__TwitterIdeator_Home__resolver_reader from '../../BfCurrentViewerLoggedIn/TwitterIdeator_Home/resolver_reader.ts';

const readerAst: ReaderAst<BfCurrentViewerLoggedIn__TwitterIdeator__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
  {
    kind: "Resolver",
    alias: "TwitterIdeator_CreateTwitterVoice",
    arguments: null,
    readerArtifact: BfCurrentViewerLoggedIn__TwitterIdeator_CreateTwitterVoice__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "TwitterIdeator_Home",
    arguments: null,
    readerArtifact: BfCurrentViewerLoggedIn__TwitterIdeator_Home__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedIn__TwitterIdeator__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfCurrentViewerLoggedIn.TwitterIdeator",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
