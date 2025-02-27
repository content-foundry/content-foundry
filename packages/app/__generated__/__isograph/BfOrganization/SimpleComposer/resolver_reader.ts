import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__SimpleComposer__param } from './param_type.ts';
import { SimpleComposer as resolver } from '../../../../components/BfOrganization/SimpleComposer.tsx';
import BfOrganization__Sidebar__resolver_reader from '../../BfOrganization/Sidebar/resolver_reader.ts';

const readerAst: ReaderAst<BfOrganization__SimpleComposer__param> = [
  {
    kind: "Resolver",
    alias: "Sidebar",
    arguments: null,
    readerArtifact: BfOrganization__Sidebar__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__SimpleComposer__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.SimpleComposer",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
