import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedIn__TwitterIdeator_Home__param } from './param_type.ts';
import { Home as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedIn/TwitterIdeator/Home.tsx';
import BfCurrentViewerLoggedIn__TwitterIdeator_CurrentEvent__resolver_reader from '../../BfCurrentViewerLoggedIn/TwitterIdeator_CurrentEvent/resolver_reader.ts';

const readerAst: ReaderAst<BfCurrentViewerLoggedIn__TwitterIdeator_Home__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
  {
    kind: "Resolver",
    alias: "TwitterIdeator_CurrentEvent",
    arguments: null,
    readerArtifact: BfCurrentViewerLoggedIn__TwitterIdeator_CurrentEvent__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedIn__TwitterIdeator_Home__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfCurrentViewerLoggedIn.TwitterIdeator_Home",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
