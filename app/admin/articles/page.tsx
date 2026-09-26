'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Article = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  featured_image_url: string | null;
  source: 'ai' | 'admin';
  status: 'draft' | 'published' | 'unpublished';
  created_at: string;
  published_at: string | null;
};

type ArticleStatus = 'draft' | 'published' | 'unpublished';

const emptyForm = {
  title: '',
  category: 'Astrology',
  content: '',
  featured_image_url: '',
  status: 'draft' as ArticleStatus,
};

const inputStyle = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid #d8c9ad',
  borderRadius: 8,
  boxSizing: 'border-box',
} as const;

const buttonStyle = {
  padding: '10px 16px',
  border: '1px solid #b9852d',
  borderRadius: 8,
  cursor: 'pointer',
  background: '#fff8e9',
} as const;

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [generatingAI, setGeneratingAI] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function token() {
    const {
      data: { session },
    } = await supabaseBrowser().auth.getSession();

    return session?.access_token || null;
  }

  async function api(path: string, options: RequestInit = {}) {
    const accessToken = await token();

    if (!accessToken) {
      throw new Error('Please login with your admin account.');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(path, {
      ...options,
      headers,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  }

  async function loadArticles() {
    try {
      setLoading(true);
      setError('');

      const data = await api('/api/admin/articles');

      setArticles(data.articles || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load articles.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadArticles();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and article content are required.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');

      if (editingId) {
        await api('/api/admin/articles', {
          method: 'PATCH',
          body: JSON.stringify({
            id: editingId,
            ...form,
          }),
        });

        setMessage('Article updated successfully.');
      } else {
        await api('/api/admin/articles', {
          method: 'POST',
          body: JSON.stringify(form),
        });

        setMessage('Article inserted successfully.');
      }

      resetForm();
      await loadArticles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save article.'
      );
    } finally {
      setSaving(false);
    }
  }
async function generateDailyAI() {
  const confirmed = window.confirm(
    'Generate today’s 12 Rashifal and Daily Astrology Article using AI?'
  );

  if (!confirmed) return;

  try {
    setGeneratingAI(true);
    setMessage('');
    setError('');

    const data = await api('/api/ai/generate-daily', {
      method: 'POST',
    });

    setMessage(
      `AI generation completed. Rashifal generated: ${
        data.rashifal_generated ?? 0
      }. Daily article generated: ${
        data.article_generated ? 'Yes' : 'Already exists'
      }.`
    );

    await loadArticles();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'AI generation failed.'
    );
  } finally {
    setGeneratingAI(false);
  }
}
  function editArticle(article: Article) {
    setEditingId(article.id);

    setForm({
      title: article.title,
      category: article.category || 'Astrology',
      content: article.content,
      featured_image_url: article.featured_image_url || '',
      status: article.status,
    });

    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function changeStatus(
    id: string,
    status: ArticleStatus
  ) {
    try {
      setMessage('');
      setError('');

      await api('/api/admin/articles', {
        method: 'PATCH',
        body: JSON.stringify({
          id,
          status,
        }),
      });

      setMessage(`Article changed to ${status}.`);
      await loadArticles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Status update failed.'
      );
    }
  }

  async function deleteArticle(article: Article) {
    const confirmed = window.confirm(
      `Delete "${article.title}" permanently?`
    );

    if (!confirmed) return;

    try {
      setMessage('');
      setError('');

      await api(
        `/api/admin/articles?id=${encodeURIComponent(article.id)}`,
        {
          method: 'DELETE',
        }
      );

      if (editingId === article.id) {
        resetForm();
      }

      setMessage('Article deleted successfully.');
      await loadArticles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Delete failed.'
      );
    }
  }

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '30px 20px 60px',
        fontFamily: 'system-ui',
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          Articles Management
        </h1>

        <p style={{ opacity: 0.7 }}>
          THE VEDIC ASTRO — Admin & AI Article Management
        </p>
<button
  type="button"
  onClick={generateDailyAI}
  disabled={generatingAI}
  style={{
    ...buttonStyle,
    marginTop: 12,
    fontWeight: 700,
  }}
>
  {generatingAI
    ? 'Generating Daily AI Content...'
    : 'Generate Daily AI Content'}
</button>
      </div>

      {message && (
        <div
          style={{
            padding: 12,
            border: '1px solid #16803c',
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 12,
            border: '1px solid #b42318',
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          border: '1px solid #ead9b8',
          borderRadius: 14,
          padding: 22,
          marginBottom: 35,
          background: '#fff',
        }}
      >
        <h2>{editingId ? 'Edit Article' : 'Add Article'}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>
              <strong>Article Title</strong>
            </label>

            <input
              style={{ ...inputStyle, marginTop: 7 }}
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Enter article title"
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>
              <strong>Category</strong>
            </label>

            <input
              style={{ ...inputStyle, marginTop: 7 }}
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              placeholder="Astrology"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>
              <strong>Featured Image URL</strong>
            </label>

            <input
              type="url"
              style={{ ...inputStyle, marginTop: 7 }}
              value={form.featured_image_url}
              onChange={(e) =>
                setForm({
                  ...form,
                  featured_image_url: e.target.value,
                })
              }
              placeholder="https://..."
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>
              <strong>Article Content</strong>
            </label>

            <textarea
              style={{
                ...inputStyle,
                marginTop: 7,
                minHeight: 260,
                resize: 'vertical',
              }}
              value={form.content}
              onChange={(e) =>
                setForm({
                  ...form,
                  content: e.target.value,
                })
              }
              placeholder="Write article here..."
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              <strong>Status</strong>
            </label>

            <select
              style={{
                ...inputStyle,
                marginTop: 7,
                maxWidth: 250,
              }}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ArticleStatus,
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={buttonStyle}
          >
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Article'
                : 'Insert Article'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                ...buttonStyle,
                marginLeft: 10,
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>All Articles</h2>

        {loading ? (
          <p>Loading articles...</p>
        ) : articles.length === 0 ? (
          <p>No articles added yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {articles.map((article) => (
              <article
                key={article.id}
                style={{
                  border: '1px solid #ead9b8',
                  borderRadius: 14,
                  padding: 20,
                  background: '#fff',
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {article.title}
                </h3>

                <p>
                  Category:{' '}
                  <strong>
                    {article.category || 'Astrology'}
                  </strong>
                </p>

                <p>
                  Source:{' '}
                  <strong>
                    {article.source === 'ai'
                      ? 'AI Generated'
                      : 'Admin Added'}
                  </strong>
                </p>

                <p>
                  Status: <strong>{article.status}</strong>
                </p>

                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {article.content.length > 350
                    ? `${article.content.slice(0, 350)}...`
                    : article.content}
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    style={buttonStyle}
                    onClick={() => editArticle(article)}
                  >
                    Edit
                  </button>

                  <button
                    style={buttonStyle}
                    onClick={() =>
                      changeStatus(article.id, 'published')
                    }
                  >
                    Publish
                  </button>

                  <button
                    style={buttonStyle}
                    onClick={() =>
                      changeStatus(article.id, 'unpublished')
                    }
                  >
                    Unpublish
                  </button>

                  <button
                    style={buttonStyle}
                    onClick={() =>
                      changeStatus(article.id, 'draft')
                    }
                  >
                    Draft
                  </button>

                  <button
                    style={buttonStyle}
                    onClick={() => deleteArticle(article)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}