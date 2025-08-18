import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-12 sm:p-20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Dashboard Header */}
      <header className="row-start-1 w-full max-w-6xl text-center sm:text-left">
        <h1 className="text-3xl font-bold mb-2">📈 Stock Monitor Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Track real-time stock trends and market performance</p>
      </header>

      {/* Main Dashboard Content */}
      <main className="row-start-2 w-full max-w-6xl flex flex-col gap-8">
        {/* Stock Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-sm text-gray-500">AAPL</h2>
            <p className="text-2xl font-semibold text-green-600">+1.45%</p>
            <p className="text-sm text-gray-500">$175.64</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-sm text-gray-500">GOOGL</h2>
            <p className="text-2xl font-semibold text-red-500">-0.78%</p>
            <p className="text-sm text-gray-500">$138.12</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-sm text-gray-500">TSLA</h2>
            <p className="text-2xl font-semibold text-green-600">+2.12%</p>
            <p className="text-sm text-gray-500">$254.89</p>
          </div>
        </section>

        {/* Stock Table */}
        <section className="overflow-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-left">
              <tr>
                <th className="p-4">Symbol</th>
                <th className="p-4">Company</th>
                <th className="p-4">Price</th>
                <th className="p-4">Change</th>
                <th className="p-4">Volume</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {[
                { symbol: "AAPL", name: "Apple Inc.", price: 175.64, change: "+1.45%", volume: "58M" },
                { symbol: "GOOGL", name: "Alphabet Inc.", price: 138.12, change: "-0.78%", volume: "22M" },
                { symbol: "TSLA", name: "Tesla Inc.", price: 254.89, change: "+2.12%", volume: "35M" },
                { symbol: "AMZN", name: "Amazon.com", price: 129.43, change: "+0.91%", volume: "28M" },
              ].map((stock) => (
                <tr key={stock.symbol} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold">{stock.symbol}</td>
                  <td className="p-4">{stock.name}</td>
                  <td className="p-4">${stock.price.toFixed(2)}</td>
                  <td className={`p-4 ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{stock.change}</td>
                  <td className="p-4">{stock.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Footer */}
      <footer className="row-start-3 text-sm text-gray-400 mt-8 text-center">
        © 2025 Stock Monitor. Built with Next.js & Tailwind CSS.
      </footer>
    </div>
  );
}
