'use client';

import { useEffect, useState } from 'react';

type Stock = {
  stockSymbol: string;
  companyName: string;
  closingPrice: number;
  previousClosing: number;
  percentChange: number;
  volume: number;
  amount: number;
};

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch(
          'https://www.nepalipaisa.com/api/GetTopMarketMovers?indicator=gainers&sectorCode'
        );
        const data = await res.json();
        if (data.statusCode === 200) {
          setStocks(data.result);
        } else {
          setError('Failed to fetch stock data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">
        📈 Top Gaining Stocks – Nepal Stock Market
      </h1>

      {loading && <p>Loading stock data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg text-sm">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">Symbol</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-right">Closing Price</th>
                <th className="p-3 text-right">Prev. Close</th>
                <th className="p-3 text-right">% Change</th>
                <th className="p-3 text-right">Volume</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.stockSymbol}
                  className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-3 font-semibold">{stock.stockSymbol}</td>
                  <td className="p-3">{stock.companyName}</td>
                  <td className="p-3 text-right">Rs. {stock.closingPrice.toFixed(2)}</td>
                  <td className="p-3 text-right">Rs. {stock.previousClosing.toFixed(2)}</td>
                  <td
                    className={`p-3 text-right font-medium ${
                      stock.percentChange >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {stock.percentChange.toFixed(2)}%
                  </td>
                  <td className="p-3 text-right">{stock.volume.toLocaleString()}</td>
                  <td className="p-3 text-right">Rs. {stock.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
