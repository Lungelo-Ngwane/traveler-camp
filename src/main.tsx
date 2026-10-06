import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Roamly</span>
        <h1>
          A little further.
          <br />
          <em>A lot to discover.</em>
        </h1>
        <p>A new foundation for travel discovery and trip planning.</p>
      </div>
      <div className="hero-image">
        <img
          src="/camp-lake.jpg"
          alt="A view from a tent into the forest"
          width="1100"
          height="640"
        />
      </div>
    </main>
  </StrictMode>,
);
