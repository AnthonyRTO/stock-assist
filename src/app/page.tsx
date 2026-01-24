import Link from 'next/link'
import { TrendingUp, BarChart3, Target, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">Stock-Assist</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Learn Stock Trading
            <span className="gradient-text block mt-2">The Smart Way</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
            Practice trading with virtual funds, analyze stocks with 5 powerful
            technical indicators, and get AI-powered predictions to improve
            your trading skills.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Start Learning Free
            </Link>
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="card p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Virtual Portfolio</h3>
            <p className="text-white/60 text-sm">
              Start with virtual funds and practice trading without risking real
              money. Track up to 10 stocks.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">5 Key Indicators</h3>
            <p className="text-white/60 text-sm">
              RSI, MACD, Moving Averages, Bollinger Bands, and Volume analysis
              with visual charts.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Price Predictions</h3>
            <p className="text-white/60 text-sm">
              Get 5-month price projections with buy/sell signals based on
              technical analysis.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">TSX & US Markets</h3>
            <p className="text-white/60 text-sm">
              Access stocks from Toronto Stock Exchange and major US exchanges
              like NYSE and NASDAQ.
            </p>
          </div>
        </div>

        {/* Indicators Preview */}
        <div className="card p-8 mb-20">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Technical Indicators We Analyze
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">RSI</div>
              <p className="text-sm text-white/60">
                Momentum indicator showing overbought/oversold levels
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-green-400 mb-2">MACD</div>
              <p className="text-sm text-white/60">
                Trend-following momentum showing buy/sell signals
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                SMA/EMA
              </div>
              <p className="text-sm text-white/60">
                Moving averages identifying trend direction
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-yellow-400 mb-2">BB</div>
              <p className="text-sm text-white/60">
                Bollinger Bands measuring price volatility
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-red-400 mb-2">VOL</div>
              <p className="text-sm text-white/60">
                Volume analysis confirming price movements
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card p-6 bg-yellow-500/10 border-yellow-500/20">
          <h3 className="font-semibold text-yellow-400 mb-2">
            Educational Purposes Only
          </h3>
          <p className="text-white/60 text-sm">
            Stock-Assist is designed for educational purposes to help you learn
            about technical analysis and stock trading. All predictions are
            based on historical data and technical indicators. This is not
            financial advice. Past performance does not guarantee future
            results. Always do your own research before making investment
            decisions.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 mt-20">
        <div className="max-w-7xl mx-auto text-center text-white/40 text-sm">
          <p>&copy; 2025 Stock-Assist. For educational purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
