import { useState } from 'react';
import { api } from '../api/client';
import './AIComposer.css';

const PLACEHOLDER = `e.g. "Redesigned the logo for Marlowe Coffee, 6 hours at $85/hr, plus 2 rounds of revisions at $60 flat each. Net 14 payment terms."`;

export default function AIComposer({ onDraft }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const draft = await api.parseInvoice(text);
      onDraft(draft);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="composer" aria-labelledby="composer-heading">
      <div className="composer-eyebrow">
        <span className="composer-dot" aria-hidden="true" />
        AI DRAFTING
      </div>
      <h2 id="composer-heading" className="composer-heading">
        Describe the work. We'll write the invoice.
      </h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="composer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={5}
          disabled={loading}
        />
        <div className="composer-footer">
          <span className="composer-hint">
            Mention the client, tasks, hours or flat fees, and payment terms.
          </span>
          <button type="submit" className="composer-submit" disabled={loading || !text.trim()}>
            {loading ? 'Drafting…' : 'Draft invoice'}
          </button>
        </div>
      </form>
      {error && <p className="composer-error">{error}</p>}
    </section>
  );
}
