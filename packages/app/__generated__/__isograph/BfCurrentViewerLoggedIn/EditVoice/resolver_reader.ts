import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedIn__EditVoice__param } from './param_type.ts';
import { EditVoice as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedIn/EditVoice.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedIn__EditVoice__param> = [
  {
    kind: "Linked",
    fieldName: "storyBank",
    alias: null,
    arguments: null,
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

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedIn__EditVoice__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfCurrentViewerLoggedIn.EditVoice",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
