import { useEffect, useRef, useState } from "react";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

type SavedSelection = {
  range: Range;
  textOffset: number;
};

export function BfDsMarkdownTextArea({
  value = "",
  onChange,
  placeholder = "Enter markdown text here...",
  rows = 6,
  className = "",
}: Props) {
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastSelectionRef = useRef<number | null>(null);
  const isFormattingRef = useRef<boolean>(false);

  // Update content when external value changes
  useEffect(() => {
    setContent(value);
    if (editorRef.current && document.activeElement !== editorRef.current) {
      renderMarkdown(value);
    }
  }, [value]);

  // Calculate minimum height
  const minHeight = `${rows * 1.5}rem`;

  // Get text content without HTML
  const getPlainText = (): string => {
    if (!editorRef.current) return "";

    // Create a temporary element to extract text
    const temp = document.createElement("div");
    temp.innerHTML = editorRef.current.innerHTML;

    // Remove placeholder if it exists
    const placeholder = temp.querySelector(".placeholder");
    if (placeholder) {
      placeholder.remove();
      return "";
    }

    // Remove any styling spans but keep their content
    const spans = temp.querySelectorAll("span");
    spans.forEach((span) => {
      const textContent = span.textContent || "";
      span.replaceWith(textContent);
    });

    // Convert <br> and <div> to newlines
    const brs = temp.querySelectorAll("br");
    brs.forEach((br) => br.replaceWith("\n"));

    const divs = temp.querySelectorAll("div");
    divs.forEach((div, i) => {
      if (i < divs.length - 1) {
        div.replaceWith((div.textContent || "") + "\n");
      } else {
        div.replaceWith(div.textContent || "");
      }
    });

    // Clean up non-breaking spaces and trim
    let result = temp.textContent || "";
    result = result.replace(/\u00A0/g, " "); // Replace &nbsp; with regular spaces

    return result;
  };

  // Save current selection range
  const saveSelection = (): SavedSelection | null => {
    if (!globalThis.getSelection) return null;

    const sel = globalThis.getSelection();
    if (!sel || !sel.rangeCount) return null;

    const range = sel.getRangeAt(0);
    if (!editorRef.current) return null;

    // Save text offset position
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preCaretRange.toString().length;

    // Also save end position for selections (not just cursor)
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const endOffset = preCaretRange.toString().length;

    logger.info("Saved selection at positions:", startOffset, endOffset);

    return {
      range: range.cloneRange(),
      textOffset: startOffset,
    };
  };

  // Improved restoreSelection function with better text-based positioning
  const restoreSelection = (savedSel: SavedSelection | null) => {
    if (!savedSel || !editorRef.current) return;

    try {
      logger.info("Restoring selection at position:", savedSel.textOffset);

      // Create a range object
      const range = document.createRange();
      const sel = globalThis.getSelection();
      if (!sel) return;

      // Text-based cursor position restoration
      const textOffset = savedSel.textOffset;

      // Use TreeWalker for more reliable text node traversal
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null,
      );

      let currentNode = walker.nextNode();
      let charCount = 0;
      let foundPosition = false;

      // Walk through text nodes until we find our position
      while (currentNode && !foundPosition) {
        const nodeLength = currentNode.nodeValue?.length || 0;

        if (charCount + nodeLength >= textOffset) {
          // Found the right node, set position
          range.setStart(currentNode, textOffset - charCount);
          range.collapse(true);
          foundPosition = true;
          break;
        }

        // Move to next text node
        charCount += nodeLength;
        currentNode = walker.nextNode();
      }

      // If position found, set the selection
      if (foundPosition) {
        sel.removeAllRanges();
        sel.addRange(range);
        logger.info("Selection restored successfully at offset", textOffset);

        // Ensure the cursor is visible
        if (editorRef.current) {
          const cursorPosition = range.getBoundingClientRect();
          if (cursorPosition) {
            editorRef.current.scrollIntoView({
              block: "nearest",
            });
          }
        }
      } else {
        // Fallback: place cursor at end if exact position not found
        logger.info("Position not found, falling back to end position");
        const lastTextNode = findLastTextNode(editorRef.current);
        if (lastTextNode && lastTextNode.nodeValue) {
          range.setStart(lastTextNode, lastTextNode.nodeValue.length);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } catch (error) {
      logger.error("Error restoring selection:", error);

      // Last resort fallback - try to place cursor somewhere visible
      try {
        if (editorRef.current) {
          const range = document.createRange();
          const sel = globalThis.getSelection();
          if (sel && editorRef.current.firstChild) {
            // Try to find a good place for cursor
            let targetNode = editorRef.current.lastChild || editorRef.current;
            if (
              targetNode.nodeType !== Node.TEXT_NODE &&
              targetNode.childNodes.length > 0
            ) {
              targetNode = targetNode.lastChild || targetNode;
            }

            range.selectNodeContents(targetNode);
            range.collapse(false); // Collapse to end
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } catch (fallbackError) {
        logger.error("Even fallback selection failed:", fallbackError);
      }
    }
  };

  // Helper function to find the last text node (for fallback cursor positioning)
  const findLastTextNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return node;

    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const lastTextNode = findLastTextNode(node.childNodes[i]);
      if (lastTextNode) return lastTextNode;
    }

    return null;
  };

  // Parse and render markdown
  const renderMarkdown = (text: string) => {
    if (!editorRef.current || isFormattingRef.current) return;
    isFormattingRef.current = true;

    try {
      // Debug logging
      logger.info("Rendering markdown for:", JSON.stringify(text));

      // Skip formatting if editor is empty and not focused
      if (!text && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML =
          `<div class="placeholder">${placeholder}</div>`;
        return;
      }

      // Get the current plain text
      const currentText = getPlainText();
      logger.info("Current text:", JSON.stringify(currentText));

      // Format the text to HTML
      const formattedHtml = formatMarkdown(text || "");
      logger.info("Formatted HTML:", formattedHtml.substring(0, 100) + "...");

      // Save current selection
      const selection = document.activeElement === editorRef.current
        ? saveSelection()
        : null;

      // Replace content with formatted HTML
      editorRef.current.innerHTML = formattedHtml;

      // Apply CSS classes to ensure styling takes effect
      const allSyntaxElements = editorRef.current.querySelectorAll(
        ".md-syntax",
      );
      allSyntaxElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.color = "#888";
          el.style.opacity = "0.6";
        }
      });

      // Force re-apply inline styles to all elements with specific classes
      const boldElements = editorRef.current.querySelectorAll(".md-bold span");
      boldElements.forEach((el) => {
        if (el instanceof HTMLElement && !el.classList.contains("md-syntax")) {
          el.style.fontWeight = "bold";
        }
      });

      const italicElements = editorRef.current.querySelectorAll(
        ".md-italic span",
      );
      italicElements.forEach((el) => {
        if (el instanceof HTMLElement && !el.classList.contains("md-syntax")) {
          el.style.fontStyle = "italic";
        }
      });

      const codeElements = editorRef.current.querySelectorAll(".md-code span");
      codeElements.forEach((el) => {
        if (el instanceof HTMLElement && !el.classList.contains("md-syntax")) {
          el.style.fontFamily = "monospace";
          el.style.backgroundColor = "#f3f4f6";
          el.style.padding = "0 2px";
          el.style.borderRadius = "2px";
        }
      });

      const linkElements = editorRef.current.querySelectorAll(".md-link span");
      linkElements.forEach((el) => {
        if (el instanceof HTMLElement && !el.classList.contains("md-syntax")) {
          el.style.color = "#0369a1";
        }
      });

      // Restore selection if editor was focused
      if (selection) {
        setTimeout(() => {
          // Use setTimeout to ensure the DOM is updated
          restoreSelection(selection);
        }, 0);
      }
    } catch (error) {
      logger.error("Error rendering markdown:", error);
    } finally {
      isFormattingRef.current = false;
    }
  };

  // Convert markdown to formatted HTML
  const formatMarkdown = (text: string): string => {
    if (!text) {
      return `<div class="placeholder">${placeholder}</div>`;
    }

    const lines = text.split("\n");
    let html = "";

    lines.forEach((line: string, _index: number) => {
      // Trim the line for regex matching but use original for content
      const trimmedLine = line.trim();

      // Debug logging
      logger.info("Processing line:", JSON.stringify(trimmedLine));

      // Process headers (# Heading) - using a more forgiving regex
      const headerMatch = trimmedLine.match(/^(#{1,6})(\s+)(.+)$/);
      if (headerMatch) {
        logger.info("Header match found:", headerMatch);
        const level = headerMatch[1].length;
        const content = headerMatch[3];
        const fontSize = 2.0 - ((level - 1) * 0.15); // h1: 2.0em, h2: 1.85em, etc.

        html +=
          `<div class="md-line md-heading" data-type="heading" data-level="${level}" style="font-size:${fontSize}em; font-weight:bold;">
          <span class="md-syntax" style="color:#888;">${headerMatch[1]}</span>
          <span style="color:#2563EB;"> ${content}</span>
        </div>`;
        return;
      }

      // Process list items (- Item or * Item)
      const listMatch = trimmedLine.match(/^([-*])(\s+)(.+)$/);
      if (listMatch) {
        html += `<div class="md-line md-list" data-type="list">
          <span class="md-syntax" style="color:#888;">${listMatch[1]}</span>
          <span> ${processInlineMarkdown(listMatch[3])}</span>
        </div>`;
        return;
      }

      // Process code blocks
      if (trimmedLine.startsWith("```")) {
        html +=
          `<div class="md-line md-codeblock" data-type="codeblock" style="font-family:monospace; background-color:#f3f4f6;">
          <span style="color:#6d28d9;">${line}</span>
        </div>`;
        return;
      }

      // Process regular lines with inline formatting or empty lines
      html += trimmedLine
        ? `<div class="md-line" data-type="normal">${
          processInlineMarkdown(line)
        }</div>`
        : `<div class="md-line md-empty" data-type="empty">&nbsp;</div>`;
    });

    return html;
  };

  // Process inline markdown (bold, italic, code, links)
  const processInlineMarkdown = (text: string): string => {
    let processed = text;

    // Process bold (**text**)
    processed = processed.replace(
      /\*\*(.*?)\*\*/g,
      '<span class="md-bold"><span class="md-syntax" style="color:#888;">**</span>' +
        '<span style="font-weight:bold;">$1</span>' +
        '<span class="md-syntax" style="color:#888;">**</span></span>',
    );

    // Process italic (*text*)
    processed = processed.replace(
      /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g,
      '<span class="md-italic"><span class="md-syntax" style="color:#888;">*</span>' +
        '<span style="font-style:italic;">$1</span>' +
        '<span class="md-syntax" style="color:#888;">*</span></span>',
    );

    // Process inline code (`code`)
    processed = processed.replace(
      /`([^`]+)`/g,
      '<span class="md-code"><span class="md-syntax" style="color:#888;">`</span>' +
        '<span style="font-family:monospace; background-color:#f3f4f6; padding:0 2px; border-radius:2px;">$1</span>' +
        '<span class="md-syntax" style="color:#888;">`</span></span>',
    );

    // Process links ([text](url))
    processed = processed.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<span class="md-link"><span class="md-syntax" style="color:#888;">[</span>' +
        '<span style="color:#0369a1;">$1</span>' +
        '<span class="md-syntax" style="color:#888;">]($2)</span></span>',
    );

    return processed || "&nbsp;";
  };

  // Handle input changes
  const handleInput = (_e: React.FormEvent<HTMLDivElement>) => {
    if (isFormattingRef.current) return;

    // Get current selection before anything changes
    const selectionBefore = saveSelection();

    // Get the current text and update state
    const text = getPlainText();
    setContent(text);

    if (onChange) {
      onChange(text);
    }

    // Clear any existing timeout to prevent conflicts
    if (lastSelectionRef.current) {
      clearTimeout(lastSelectionRef.current);
      lastSelectionRef.current = null;
    }

    // Format with a small delay to ensure DOM stability
    if (document.activeElement === editorRef.current) {
      lastSelectionRef.current = globalThis.setTimeout(() => {
        renderMarkdown(text);
        // Restore selection after formatting
        setTimeout(() => {
          restoreSelection(selectionBefore);
        }, 0);
      }, 10) as unknown as number;
    }
  };

  // Handle special keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle tab key
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
      return;
    }

    // Handle Space key explicitly
    if (e.key === " ") {
      e.preventDefault();
      document.execCommand("insertText", false, " ");
      return;
    }

    // Handle backspace explicitly
    if (e.key === "Backspace") {
      // Let the default behavior work but track position afterwards
      setTimeout(() => {
        const text = getPlainText();
        setContent(text);
      }, 0);
      return;
    }

    // Handle Enter key with improved cursor positioning
    if (e.key === "Enter") {
      e.preventDefault();

      // Save cursor position first
      const selection = saveSelection();

      // Insert new line character
      document.execCommand("insertText", false, "\n");

      // Get updated text and update state
      const text = getPlainText();
      setContent(text);

      if (onChange) {
        onChange(text);
      }

      // Apply formatting with immediate cursor positioning
      if (selection) {
        // Calculate the new position (should be +1 from previous position)
        const newPosition = {
          range: selection.range,
          textOffset: selection.textOffset + 1,
        };

        // Render and restore in one go
        setTimeout(() => {
          renderMarkdown(text);
          setTimeout(() => {
            restoreSelection(newPosition);
          }, 0);
        }, 0);
      }

      return;
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // Initial rendering
  useEffect(() => {
    if (editorRef.current) {
      renderMarkdown(content);
    }
  }, []);

  // Apply formatting on blur
  const handleBlur = () => {
    // Get the actual text content before formatting
    const text = getPlainText();

    // Make sure we update the content state to match
    if (text !== content) {
      setContent(text);
      if (onChange) {
        onChange(text);
      }
    }

    // Apply formatting
    renderMarkdown(text);
  };

  // Clear placeholder on focus
  const handleFocus = () => {
    if (editorRef.current) {
      // Clear placeholder if present
      if (editorRef.current.querySelector(".placeholder")) {
        editorRef.current.innerHTML =
          "<div class='md-line' data-type='normal'>&nbsp;</div>";

        // Position cursor at the beginning
        const range = document.createRange();
        const sel = globalThis.getSelection();
        if (sel && editorRef.current.firstChild) {
          range.setStart(editorRef.current.firstChild, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      // Make sure we're ready to format
      const text = getPlainText();
      if (text && text.trim() !== "") {
        renderMarkdown(text);
      }
    }
  };

  return (
    <div className={`bf-markdown-editor ${className}`}>
      <style>
        {`
        .bf-markdown-editor .md-line {
          min-height: 1.5em;
          margin: 0.25em 0;
        }
        .bf-markdown-editor .placeholder {
          color: #9ca3af;
        }
        .bf-markdown-editor .md-heading {
          margin: 0.75em 0;
        }
        .bf-markdown-editor .md-syntax {
          opacity: 0.6;
        }
        .bf-markdown-editor .md-bold span {
          font-weight: bold;
        }
        .bf-markdown-editor .md-italic span {
          font-style: italic;
        }
        .bf-markdown-editor .md-code {
          font-family: monospace;
          background: #f3f4f6;
          padding: 0.1em 0.3em;
          border-radius: 0.2em;
        }
        .bf-markdown-editor .md-list {
          padding-left: 1em;
        }
      `}
      </style>

      <div
        ref={editorRef}
        className="w-full p-3 font-mono border border-gray-300 rounded resize-y overflow-auto"
        style={{
          minHeight: minHeight,
          outline: "none",
        }}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onFocus={handleFocus}
        spellCheck="false"
      />
    </div>
  );
}
