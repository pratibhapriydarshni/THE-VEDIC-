'use client';

import { useState } from 'react';
import { useLanguage } from './language-provider';

export default function LanguageTranslator() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  function changeLanguage(value: 'en' | 'hi') {
    setLanguage(value);
    setOpen(false);
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: 9999,
      }}
    >
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: '52px',
            width: '190px',
            padding: '12px',
            background: '#fff',
            border: '1px solid #e7c76f',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          }}
        >
          <strong
            style={{
              display: 'block',
              marginBottom: '8px',
            }}
          >
            {language === 'hi' ? 'भाषा चुनें' : 'Choose Language'}
          </strong>

          <button
            type="button"
            onClick={() => changeLanguage('en')}
            style={languageButton}
          >
            🇬🇧 English {language === 'en' ? '✓' : ''}
          </button>

          <button
            type="button"
            onClick={() => changeLanguage('hi')}
            style={languageButton}
          >
            🇮🇳 हिन्दी {language === 'hi' ? '✓' : ''}
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="Change website language"
        onClick={() => setOpen((value) => !value)}
        style={{
          border: '1px solid #e7c76f',
          borderRadius: '999px',
          padding: '10px 14px',
          background: '#fff',
          cursor: 'pointer',
          fontWeight: 700,
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        }}
      >
        🌐 {language === 'hi' ? 'हिन्दी' : 'English'}
      </button>
    </div>
  );
}

const languageButton: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 10px',
  marginTop: '5px',
  border: 0,
  borderRadius: '7px',
  background: '#fff7df',
  cursor: 'pointer',
  textAlign: 'left',
};