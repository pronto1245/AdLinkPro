export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Page not found</p>
        <a href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Go Home
        </a>
      </div>
    </div>
  );
}
