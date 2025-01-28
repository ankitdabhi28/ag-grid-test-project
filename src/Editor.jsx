import React, { useRef, useEffect, useState } from "react";
import { CKEditor, CKEditorContext } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Context,
  ContextWatchdog,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Image,
  ImageInline,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  Indent,
  Italic,
  Link,
  List,
  Paragraph,
  RemoveFormat,
  Strikethrough,
  Subscript,
  Superscript,
  TodoList,
  Underline,
} from "ckeditor5";
import { useDebounce } from "./useDebounce";

import "./custom-ckeditor-translations";

function Editor() {
  const [editorData, setEditorData] = useState("");
  const debouncedEditorData = useDebounce(editorData, 1500);

  // const topToolbarRef = useRef(null);
  // const bottomToolbarRef = useRef(null);

  const handleChange = (debouncedEditorData) => {
    // ? Perform any additional actions with the debounced data here
    console.log("debouncedEditorData: ", debouncedEditorData);
  };

  useEffect(() => {
    if (debouncedEditorData) {
      handleChange(debouncedEditorData);
    }
  }, [debouncedEditorData]);

  // useEffect(() => {
  //   const observer = new MutationObserver((mutations) => {
  //     mutations.forEach((mutation) => {
  //       if (
  //         mutation.type === "childList" &&
  //         mutation.addedNodes.length &&
  //         mutation.addedNodes[0].classList.contains("ck-toolbar")
  //       ) {
  //         if (!topToolbarRef.current.firstChild) {
  //           topToolbarRef.current.appendChild(mutation.addedNodes[0]);
  //         } else {
  //           bottomToolbarRef.current.appendChild(mutation.addedNodes[0]);
  //         }
  //       }
  //     });
  //   });

  //   const editorContainer = document.querySelector(".ck-editor");
  //   observer.observe(editorContainer, { childList: true });

  //   return () => {
  //     observer.disconnect();
  //   };
  // }, []);

  return (
    <div className="container">
      <CKEditorContext context={Context} contextWatchdog={ContextWatchdog}>
        <CKEditor
          editor={ClassicEditor}
          config={{
            plugins: [
              Essentials,
              Bold,
              Italic,
              Underline,
              Paragraph,
              FontSize,
              FontBackgroundColor,
              Heading,
              Alignment,
              FindAndReplace,
              Strikethrough,
              FontColor,
              FontFamily,
              Subscript,
              Superscript,
              Code,
              CodeBlock,
              List,
              BlockQuote,
              TodoList,
              Indent,
              Image,
              ImageInline,
              ImageInsert,
              ImageToolbar,
              ImageStyle,
              ImageResize,
              Base64UploadAdapter,
              RemoveFormat,
              Link,
            ],
            toolbar: {
              items: [
                "undo",
                "redo",
                "|",
                "fontfamily",
                "fontsize",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "|",
                "subscript",
                "superscript",
                "|",
                "findAndReplace",
                "|",
                "code",
                "|",
                "fontColor",
                "fontBackgroundColor",
                "removeFormat",
                "|",
                "bulletedList",
                "numberedList",
                "todoList",
                "outdent",
                "indent",
                "heading",
                "|",
                "blockQuote",
                "codeBlock",
                "|",
                "alignment:left",
                "alignment:right",
                "alignment:center",
                "alignment:justify",
                "|",
                "link", // Added link toolbar item
                "unlink", // Added unlink toolbar item
                "|",
                "insertImage",
              ],
              shouldNotGroupWhenFull: true,
            },
            fontSize: {
              options: [
                {
                  title: "Small",
                  model: "small",
                  view: {
                    name: "span",
                    styles: {
                      "font-size": "0.8em",
                    },
                  },
                },
                {
                  title: "medium",
                  model: "default",
                  view: {
                    name: "span",
                    styles: {
                      "font-size": "1em",
                    },
                  },
                },
                {
                  title: "large",
                  model: "big",
                  view: {
                    name: "span",
                    styles: {
                      "font-size": "1.4em",
                    },
                  },
                },
                {
                  title: "Extra Large",
                  model: "huge",
                  view: {
                    name: "span",
                    styles: {
                      "font-size": "1.6em",
                    },
                  },
                },
              ],
            },
            image: {
              toolbar: [
                "toggleImageCaption",
                "imageTextAlternative",
                "ckboxImageEdit",
              ],
            },
            link: {
              decorators: {
                addTargetToExternalLinks: {
                  mode: "automatic",
                  callback: (url) => /^(https?:)?\/\//.test(url),
                  attributes: {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                },
              },
            },
          }}
          data=""
          onReady={(editor) => {
            console.log("Editor 1 is ready to use!", editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setEditorData(data);
          }}
        />
      </CKEditorContext>
    </div>
  );
}

export default Editor;
