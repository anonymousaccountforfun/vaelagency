import ApolloSearch from './ApolloSearch'

export const metadata = {
  title: 'Apollo Search',
  description: 'Search Apollo for e-commerce decision makers',
}

export default function ApolloSearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apollo Search</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search Apollo for e-commerce decision makers and import them to your CRM
          </p>
        </div>
        <ApolloSearch />
      </div>
    </div>
  )
}
