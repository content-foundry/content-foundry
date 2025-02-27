import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedOut__LoginButton__param } from './param_type.ts';
import { LoginButton as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedOut/LoginButton.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedOut__LoginButton__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedOut__LoginButton__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfCurrentViewerLoggedOut.LoginButton",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
