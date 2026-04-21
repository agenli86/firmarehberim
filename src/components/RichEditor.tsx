'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Heading2, Heading3, Image as ImageIcon, Code, Undo, Redo, Eye } from 'lucide-react';

export default function RichEditor({
  value,
  onChange,
  placeholder = 'Buraya yazın...',
  height = 300,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const skipNext = useRef(false);

  // Dışarıdan gelen value değişirse senkronize et
  // (örn. başka kayıt açıldığında yeni içerik yüklendiğinde)
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (value !== internalValue) {
      setInternalValue(value || '');
      // contentEditable div'i de güncelle
      if (ref.current && !htmlMode) {
        ref.current.innerHTML = value || '';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // İlk yüklemede div'i set et
  useEffect(() => {
    if (ref.current && !htmlMode && ref.current.innerHTML !== internalValue) {
      ref.current.innerHTML = internalValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlMode]);

  const handleChange = useCallback((newVal: string) => {
    skipNext.current = true; // bizden gelen update, useEffect tetiklemesin
    setInternalValue(newVal);
    onChange(newVal);
  }, [onChange]);

  const exec = (command: string, arg?: string) => {
    if (htmlMode) return;
    document.execCommand(command, false, arg);
    if (ref.current) {
      handleChange(ref.current.innerHTML);
    }
  };

  const onInput = () => {
    if (ref.current) {
      handleChange(ref.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt('Link URL (https://...):', 'https://');
    if (url && url !== 'https://') exec('createLink', url);
  };

  const addImage = () => {
    const url = prompt('Görsel URL:', 'https://');
    if (url && url !== 'https://') exec('insertImage', url);
  };

  const btn = (icon: any, cmd: string, title: string, arg?: string) => {
    const Icon = icon;
    return (
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); exec(cmd, arg); }}
        title={title}
        disabled={htmlMode}
        style={{
          padding: '6px 8px', border: '1px solid #e5e7eb', background: 'white', borderRadius: 4,
          cursor: htmlMode ? 'not-allowed' : 'pointer', color: htmlMode ? '#9ca3af' : '#374151',
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
        }}
      >
        <Icon size={14} />
      </button>
    );
  };

  const toggleHtmlMode = () => {
    if (htmlMode) {
      // HTML'den visual'a dönüyor — div'i güncelle
      // (textarea'da yapılan değişiklikler internalValue'da zaten)
      if (ref.current) {
        ref.current.innerHTML = internalValue;
      }
    } else {
      // Visual'dan HTML'e geçiyor — div'den son halini al
      if (ref.current) {
        handleChange(ref.current.innerHTML);
      }
    }
    setHtmlMode(!htmlMode);
  };

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', background: 'white' }}>
      <div style={{ padding: 6, display: 'flex', gap: 4, flexWrap: 'wrap', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        {btn(Heading2, 'formatBlock', 'H2 Başlık', '<h2>')}
        {btn(Heading3, 'formatBlock', 'H3 Başlık', '<h3>')}
        <div style={{ width: 1, background: '#e5e7eb', margin: '0 2px' }} />
        {btn(Bold, 'bold', 'Kalın')}
        {btn(Italic, 'italic', 'İtalik')}
        {btn(Underline, 'underline', 'Altı çizili')}
        <div style={{ width: 1, background: '#e5e7eb', margin: '0 2px' }} />
        {btn(List, 'insertUnorderedList', 'Madde liste')}
        {btn(ListOrdered, 'insertOrderedList', 'Numaralı liste')}
        <div style={{ width: 1, background: '#e5e7eb', margin: '0 2px' }} />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); addLink(); }} title="Link" disabled={htmlMode}
          style={{ padding: '6px 8px', border: '1px solid #e5e7eb', background: 'white', borderRadius: 4, cursor: htmlMode ? 'not-allowed' : 'pointer', color: htmlMode ? '#9ca3af' : '#374151', display: 'flex', alignItems: 'center', fontSize: 12 }}>
          <LinkIcon size={14} />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); addImage(); }} title="Görsel" disabled={htmlMode}
          style={{ padding: '6px 8px', border: '1px solid #e5e7eb', background: 'white', borderRadius: 4, cursor: htmlMode ? 'not-allowed' : 'pointer', color: htmlMode ? '#9ca3af' : '#374151', display: 'flex', alignItems: 'center', fontSize: 12 }}>
          <ImageIcon size={14} />
        </button>
        <div style={{ width: 1, background: '#e5e7eb', margin: '0 2px' }} />
        {btn(Undo, 'undo', 'Geri al')}
        {btn(Redo, 'redo', 'İleri')}
        <button
          type="button"
          onClick={toggleHtmlMode}
          title={htmlMode ? 'Görsel mod' : 'HTML kod modu'}
          style={{
            padding: '6px 10px', border: '1px solid #e5e7eb',
            background: htmlMode ? '#fbbf24' : 'white',
            borderRadius: 4, cursor: 'pointer',
            color: htmlMode ? '#111827' : '#374151',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
            marginLeft: 'auto',
          }}
        >
          {htmlMode ? <><Eye size={14} /> Görsel</> : <><Code size={14} /> HTML</>}
        </button>
      </div>

      {htmlMode ? (
        <textarea
          value={internalValue}
          onChange={(e) => handleChange(e.target.value)}
          style={{
            width: '100%', padding: 12, border: 'none', outline: 'none',
            fontFamily: 'monospace', fontSize: 13, minHeight: height, resize: 'vertical',
            display: 'block',
          }}
          placeholder="<h2>HTML</h2><p>HTML kodu yaz...</p>"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          onInput={onInput}
          onBlur={onInput}
          data-placeholder={placeholder}
          style={{
            minHeight: height, padding: 12, outline: 'none', fontSize: 14, lineHeight: 1.6,
          }}
          suppressContentEditableWarning
        />
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        [contenteditable] p { margin-bottom: 0.75rem; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        [contenteditable] a { color: #d97706; text-decoration: underline; }
        [contenteditable] img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
}
