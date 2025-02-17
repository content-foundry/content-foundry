import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedIn__TwitterIdeator_CurrentEvent__param } from './param_type.ts';
import { CurrentEvent as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedIn/TwitterIdeator/CurrentEvent.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedIn__TwitterIdeator_CurrentEvent__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedIn__TwitterIdeator_CurrentEvent__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfCurrentViewerLoggedIn.TwitterIdeator_CurrentEvent",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
