import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__HistorySidebar__param } from './param_type.ts';
import { HistorySidebar as resolver } from '../../../../components/BfOrganization/HistorySidebar.tsx';

const readerAst: ReaderAst<BfOrganization__HistorySidebar__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__HistorySidebar__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization.HistorySidebar",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
