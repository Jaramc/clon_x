import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTweet } from '../services/tweetService';

// Page to compose and publish a new tweet
function ComposePage() {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    createTweet(content.trim());
    navigate('/feed');
  };

  return (
    <section style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <h1>Crear un nuevo Tweet</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué está pasando?"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccd6dd',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
          required
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#1da1f2',
              color: '#ffffff',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Publicar
          </button>

          <Link
            to="/feed"
            style={{
              color: '#657786',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}

export default ComposePage;
