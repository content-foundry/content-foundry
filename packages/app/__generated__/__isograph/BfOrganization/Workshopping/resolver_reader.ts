import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__Workshopping__param } from './param_type.ts';
import { Workshopping as resolver } from '../../../../components/BfOrganization/Workshopping.tsx';
import BfOrganization__HistorySidebar__resolver_reader from '../../BfOrganization/HistorySidebar/resolver_reader.ts';
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
    alias: "HistorySidebar",
    arguments: null,
    readerArtifact: BfOrganization__HistorySidebar__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Linked",
    fieldName: "creation",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Scalar",
        fieldName: "originalText",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
      {
        kind: "Linked",
        fieldName: "suggestions",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
          {
            kind: "Scalar",
            fieldName: "tweet",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "explanation",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
        ],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__Workshopping__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.Workshopping",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
