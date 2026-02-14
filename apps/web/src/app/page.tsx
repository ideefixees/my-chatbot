export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Chatbot Dashboard
          </h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Conversations</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">128</dd>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Products Recommended</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">342</dd>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Now</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">3</dd>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Installation
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>
                  To install the chatbot on your store, add the following script tag to your site's header.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="font-medium text-yellow-800">Your Shop ID: <span className="font-bold">my-store-123</span></p>
                  <p className="text-xs text-yellow-700 mt-1">Use this ID when configuring your WordPress or Shopify plugin.</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="rounded-md bg-gray-50 p-4 border border-gray-200 overflow-x-auto">
                  <pre className="text-sm text-gray-700">
                    {`<script src="https://your-domain.com/widget.js" defer></script>
<script>
  window.ChatbotConfig = {
    shopId: "my-store-123",
    apiUrl: "https://your-domain.com/api/chat"
  };
</script>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
