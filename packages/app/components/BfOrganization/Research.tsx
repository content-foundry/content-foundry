import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const Research = iso(`
  field BfOrganization.Research @component {
    Sidebar
    research {
      SuggestionsPage
    }
  }
`)(
  function Research(
    { data },
  ) {
    const Sidebar = data.Sidebar;
    const SuggestionsPage = data.research?.SuggestionsPage;
    return (
      <div className="flexRow editor-container">
        {Sidebar && <Sidebar />}
        {SuggestionsPage && <SuggestionsPage />}
      </div>
    );
  },
);
