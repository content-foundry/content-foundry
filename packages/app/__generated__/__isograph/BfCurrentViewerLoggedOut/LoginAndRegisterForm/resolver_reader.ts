import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedOut__LoginAndRegisterForm__param } from './param_type.ts';
import { LoginAndRegisterForm as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedOut/LoginAndRegisterForm.tsx';
import BfCurrentViewerLoggedOut__LoginButton__resolver_reader from '../../BfCurrentViewerLoggedOut/LoginButton/resolver_reader.ts';
import BfCurrentViewerLoggedOut__RegisterButton__resolver_reader from '../../BfCurrentViewerLoggedOut/RegisterButton/resolver_reader.ts';

const readerAst: ReaderAst<BfCurrentViewerLoggedOut__LoginAndRegisterForm__param> = [
  {
    kind: "Resolver",
    alias: "LoginButton",
    arguments: null,
    readerArtifact: BfCurrentViewerLoggedOut__LoginButton__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "RegisterButton",
    arguments: null,
    readerArtifact: BfCurrentViewerLoggedOut__RegisterButton__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedOut__LoginAndRegisterForm__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfCurrentViewerLoggedOut.LoginAndRegisterForm",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
