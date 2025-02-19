import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization_Research__Topic__param } from './param_type.ts';
import { Topic as resolver } from '../../../../components/BfOrganization/Topic.tsx';

const readerAst: ReaderAst<BfOrganization_Research__Topic__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization_Research__Topic__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization_Research.Topic",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
