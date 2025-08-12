import { NextPageContext } from 'next';

function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong.</h1>
      <div style={{ color: '#555' }}>
        {statusCode ? `HTTP ${statusCode}` : 'Client error'}
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage; 