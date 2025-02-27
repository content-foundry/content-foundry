import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { BfDsList } from "packages/bfDs/components/BfDsList.tsx";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { useRef, useState } from "react";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";

type Todo = {
  text: string;
  completed?: boolean;
};

type Props = {
  header?: string;
  initialData: Array<Todo>;
};

export function BfDsTodos({ header, initialData }: Props) {
  const [todos, setTodos] = useState<Array<Todo>>(initialData);
  const [newTodo, setNewTodo] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track the index of the todo being edited
  const [editingText, setEditingText] = useState("");
  const clickTimeoutRef = useRef<number | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo(event.target.value);
  };

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([...todos, { text: newTodo, completed: false }]);
      setNewTodo("");
    }
  };

  const toggleComplete = (index: number) => {
    if (clickTimeoutRef.current) {
      globalThis.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    clickTimeoutRef.current = globalThis.setTimeout(() => {
      setTodos(
        todos.map((todo: Todo, i: number) =>
          i === index ? { ...todo, completed: !todo.completed } : todo
        ),
      );
    }, 200);
  };

  const deleteTodo = (index: number) => {
    setTodos(todos.filter((_: Todo, i: number) => i !== index));
  };

  const handleDoubleClick = (index: number) => {
    if (clickTimeoutRef.current) {
      globalThis.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    handleEdit(index); // Prepopulate the editing input with the current text
  };

  const handleEdit = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      return;
    }
    setEditingIndex(index);
    setEditingText(todos[index].text);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      setTodos(
        todos.map((todo: Todo, i: number) =>
          i === editingIndex ? { ...todo, text: editingText } : todo
        ),
      );
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const handleEditingTextChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setEditingText(event.target.value);
  };

  const sortTodos = () => {
    const sortedTodos = [...todos].sort((a, b) => a.text.localeCompare(b.text));
    const sortedAndCompletedTodos = [
      ...sortedTodos.filter((todo) => !todo.completed),
      ...sortedTodos.filter((todo) => todo.completed),
    ];
    setTodos(sortedAndCompletedTodos);
  };

  return (
    <div className="dashboardSection">
      <div className="flexRow flexCenter">
        <h2 style={{ flex: 1 }}>{header}</h2>
        <div>
          <BfDsButton kind="overlay" text="Sort" onClick={sortTodos} />
        </div>
      </div>
      <BfDsList>
        {todos.map((todo: Todo, index: number) => {
          if (!todo.text) return null;
          const content = editingIndex === index
            ? (
              <div className="flexRow gapMedium ignore-internal-click">
                <div style={{ flex: 1 }}>
                  <BfDsInput
                    type="text"
                    value={editingText}
                    onChange={handleEditingTextChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(); // Save on Enter key
                    }}
                    autoFocus
                    style={{ flex: 1 }}
                  />
                </div>
                <BfDsButton
                  kind="secondary"
                  text="Save"
                  onClick={saveEdit}
                />
              </div>
            )
            : (
              <div>
                {todo.text}
              </div>
            );
          return (
            <div key={index}>
              <BfDsListItem
                action={[
                  <BfDsButton
                    iconLeft="pencil"
                    kind="secondary"
                    size="small"
                    onClick={() => handleEdit(index)}
                    key="pencil"
                  />,
                  <BfDsButton
                    iconLeft="trash"
                    kind="alert"
                    size="small"
                    onClick={() => deleteTodo(index)}
                    key="trash"
                  />,
                ]}
                iconLeft={todo.completed ? "checkCircleSolid" : "checkCircle"}
                iconLeftColor={todo.completed
                  ? "var(--success)"
                  : "var(--textSecondary)"}
                content={content}
                onClick={() => toggleComplete(index)}
                onDoubleClick={() => handleDoubleClick(index)} // Enable edit on double-click
                xstyle={todo.completed
                  ? { textDecoration: "line-through" }
                  : {}}
              />
            </div>
          );
        })}
        <BfDsListItem
          action={
            <BfDsButton kind="secondary" text="Add todo" onClick={addTodo} />
          }
          content={
            <BfDsInput
              type="text"
              value={newTodo}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo();
              }}
            />
          }
          iconLeft="plus"
        />
      </BfDsList>
    </div>
  );
}

export function Example() {
  return (
    <BfDsTodos
      header="Todos"
      initialData={[{ text: "Add some todos" }, {
        text: "This one is done",
        completed: true,
      }]}
    />
  );
}
