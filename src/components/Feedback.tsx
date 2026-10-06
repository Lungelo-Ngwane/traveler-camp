import { Link } from 'react-router-dom';
export function Feedback({
  title,
  children,
  retry,
}: {
  title: string;
  children?: React.ReactNode;
  retry?: () => void;
}) {
  return (
    <div className="feedback" role={retry ? 'alert' : 'status'}>
      <h2>{title}</h2>
      {children}
      {retry && <button onClick={retry}>Try again</button>}
    </div>
  );
}
export function LoadingCards() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading country guides"
      className="country-grid"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}
export function NotFound() {
  return (
    <Feedback title="That path leads somewhere else">
      <p>This destination or page could not be found.</p>
      <Link to="/">Explore destinations</Link>
    </Feedback>
  );
}

export function LoadingPage() {
  return <Feedback title="Opening your next adventure..." />;
}
