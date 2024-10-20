// ToolbarPlugin Component
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND } from 'lexical';
import { INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { mergeRegister } from '@lexical/utils';

const LowPriority = 1;

function Divider() {
  return <div style={{ width: '1px', height: '100%', backgroundColor: '#e2e8f0', margin: '0 0.5rem' }} className="divider" />;
}

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', backgroundColor: '#e2e8f0', borderRadius: '0.5rem' }} className="toolbar flex space-x-4 bg-slate-200 dark:bg-slate-700 p-2 rounded-t-lg">
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        Undo
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item"
        aria-label="Redo"
      >
        Redo
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
        aria-label="Format Bold"
      >
        Bold
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
        aria-label="Format Italics"
      >
        Italic
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
        aria-label="Format Underline"
      >
        Underline
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
        aria-label="Format Strikethrough"
      >
        Strikethrough
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className={'toolbar-item spaced ' + (isCode ? 'active' : '')}
        aria-label="Format Code"
      >
        Code
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        Left Align
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        Center Align
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        Right Align
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        Justify Align
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item spaced"
        aria-label="Bullet List"
      >
        Bullet List
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
        className="toolbar-item spaced"
        aria-label="Numbered List"
      >
        Numbered List
      </button>
    </div>
  );
};

export default ToolbarPlugin;