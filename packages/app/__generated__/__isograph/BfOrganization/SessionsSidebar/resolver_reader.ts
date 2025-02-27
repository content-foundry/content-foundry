import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__SessionsSidebar__param } from './param_type.ts';
import { SessionsSidebar as resolver } from '../../../../components/BfOrganization/SessionsSidebar.tsx';

const readerAst: ReaderAst<BfOrganization__SessionsSidebar__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__SessionsSidebar__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.SessionsSidebar",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
