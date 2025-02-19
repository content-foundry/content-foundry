import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__Workshopping__param } from './param_type.ts';
import { Workshopping as resolver } from '../../../../components/BfOrganization/Workshopping.tsx';
import BfOrganization__SessionsSidebar__resolver_reader from '../../BfOrganization/SessionsSidebar/resolver_reader.ts';
import BfOrganization__Sidebar__resolver_reader from '../../BfOrganization/Sidebar/resolver_reader.ts';

const readerAst: ReaderAst<BfOrganization__Workshopping__param> = [
  {
    kind: "Resolver",
    alias: "Sidebar",
    arguments: null,
    readerArtifact: BfOrganization__Sidebar__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "SessionsSidebar",
    arguments: null,
    readerArtifact: BfOrganization__SessionsSidebar__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Linked",
    fieldName: "creation",
    alias: null,
    arguments: null,
    condition: null,
    selections: [
      {
        kind: "Scalar",
        fieldName: "suggestions",
        alias: null,
        arguments: null,
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__Workshopping__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization.Workshopping",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
