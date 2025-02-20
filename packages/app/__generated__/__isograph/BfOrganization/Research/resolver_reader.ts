import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__Research__param } from './param_type.ts';
import { Research as resolver } from '../../../../components/BfOrganization/Research.tsx';
import BfOrganization__SessionsSidebar__resolver_reader from '../../BfOrganization/SessionsSidebar/resolver_reader.ts';
import BfOrganization__Sidebar__resolver_reader from '../../BfOrganization/Sidebar/resolver_reader.ts';
import BfOrganization_Research__Topic__resolver_reader from '../../BfOrganization_Research/Topic/resolver_reader.ts';
import BfOrganization_Research__Topics__resolver_reader from '../../BfOrganization_Research/Topics/resolver_reader.ts';

const readerAst: ReaderAst<BfOrganization__Research__param> = [
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
    fieldName: "research",
    alias: null,
    arguments: null,
    condition: null,
    selections: [
      {
        kind: "Resolver",
        alias: "Topics",
        arguments: null,
        readerArtifact: BfOrganization_Research__Topics__resolver_reader,
        usedRefetchQueries: [],
      },
      {
        kind: "Resolver",
        alias: "Topic",
        arguments: null,
        readerArtifact: BfOrganization_Research__Topic__resolver_reader,
        usedRefetchQueries: [],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__Research__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization.Research",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
