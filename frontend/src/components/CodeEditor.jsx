import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange }) {
  return (
    <Editor
      height="500px"
      defaultLanguage="python"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 }
      }}
      loading={<div className="flex h-full items-center justify-center bg-surface text-text-muted">Загрузка редактора…</div>}
    />
  );
}
