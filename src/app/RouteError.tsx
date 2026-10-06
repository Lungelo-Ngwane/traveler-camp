import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
export function RouteError() {
  const error = useRouteError();
  return (
    <main className="feedback">
      <h1>Something interrupted the journey</h1>
      <p role="alert">
        {isRouteErrorResponse(error) && error.status === 404
          ? 'This page does not exist.'
          : 'We could not open this page. Reload to try again.'}
      </p>
      <button onClick={() => window.location.reload()}>
        Reload application
      </button>
      <Link to="/">Return to discovery</Link>
    </main>
  );
}
