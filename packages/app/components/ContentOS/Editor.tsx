import { LeftSideBar } from "packages/app/components/ContentOS/LeftSideBar.tsx";
import { TextEditor } from "packages/app/components/ContentOS/TextEditor.tsx";
export function Editor() {
  return (
    <div className="flexRow editor-container">
      <LeftSideBar />
      <div className="flexRow editor-workspace">
        <TextEditor />
        <div className="flexColumn right-side-bar">
          {demoText}
        </div>
      </div>
    </div>
  );
}

const demoText =
  "You’re aiming for a voice that is witty, direct, and lightly irreverent—one that breaks away from stale corporate talk but still comes across as knowledgeable and genuine. This approach is casual enough to feel human-friendly, yet firmly grounded in expertise so your audience trusts what you say. You sound like a mix between Richard Feynman (for his ability to make complex concepts accessible with wit and charm) and Anthony Bourdain (for his sharp cultural observations and no-BS authenticity). Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
