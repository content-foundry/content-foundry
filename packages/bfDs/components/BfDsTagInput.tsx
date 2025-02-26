import { useState } from "react";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { BfDsPill } from "packages/bfDs/components/BfDsPill.tsx";
import { BfDsIcon } from "packages/bfDs/components/BfDsIcon.tsx";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export interface TagInputProps {
  label: string;
  name: string;
  value: Array<string>;
  onChange?: (tags: Array<string>) => void;
}

export function BfDsTagInput(
  { label, name, value = [], onChange }: TagInputProps,
) {
  const [tags, setTags] = useState<Array<string>>(
    Array.isArray(value) ? value : [],
  );
  const [newTags, setNewTags] = useState<Array<string>>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        const newlyAddedTags = [...newTags, newTag];
        setNewTags(newlyAddedTags);
        setTags(updatedTags);
        onChange &&
          onChange(updatedTags);
        e.currentTarget.value = "";
      }
    }
  };

  const removeTag = (tag: string) => {
    const updatedTags = tags.filter((t: string) => t !== tag);
    setTags(updatedTags);
    onChange &&
      onChange(updatedTags);
  };

  const isNew = (tag: string) => newTags.includes(tag);

  return (
    <label className="flexColumn" htmlFor={name} style={{ marginBottom: 12 }}>
      {label}
      <BfDsInput
        name={name}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag and press enter..."
      />
      {tags.length > 0 && (
        <div className="tags" style={{ marginTop: 8 }}>
          {tags.map((tag: string) => (
            <BfDsPill
              color={isNew(tag) ? "secondaryColor" : "textSecondary"}
              key={tag}
              label={tag}
              action={
                <div
                  className="flexRow"
                  onClick={() => removeTag(tag)}
                >
                  <BfDsIcon
                    name="cross"
                    size={8}
                    color="var(--textSecondary)"
                  />
                </div>
              }
            />
          ))}
        </div>
      )}
    </label>
  );
}

export function Example() {
  const handleTagsChange = (updatedTags: Array<string>) => {
    logger.log("Updated tags:", updatedTags);
  };

  return (
    <BfDsTagInput
      label="Tags"
      name="example-tags"
      value={["initialTag1", "initialTag2"]}
      onChange={handleTagsChange}
    />
  );
}
