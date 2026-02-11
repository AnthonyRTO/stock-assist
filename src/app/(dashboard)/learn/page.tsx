import {
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  BookOpen,
  DollarSign,
  Activity,
  ArrowUpDown,
} from 'lucide-react'

export default function LearnPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learn Trading</h1>
        <p className="text-white/60">
          Everything you need to understand stock analysis, valuation, and options trading.
        </p>
      </div>

      {/* Stock Market Basics */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold">Stock Market Basics</h2>
        </div>
        <div className="space-y-4 text-white/80 text-sm leading-relaxed">
          <p>
            A <strong className="text-white">stock</strong> represents ownership in a company. When you buy a share of Apple (AAPL), you own a tiny piece of the company. Stock prices change based on supply and demand &mdash; if more people want to buy than sell, the price goes up.
          </p>
          <p>
            Stocks trade on <strong className="text-white">exchanges</strong>. In the US, the two main exchanges are the <strong className="text-white">NYSE</strong> (New York Stock Exchange) and <strong className="text-white">NASDAQ</strong>. In Canada, stocks trade on the <strong className="text-white">TSX</strong> (Toronto Stock Exchange). You can search for TSX stocks using the .TRT suffix (e.g., SHOP.TRT for Shopify).
          </p>
          <p>
            <strong className="text-white">Market cap</strong> (market capitalization) is the total value of all a company&apos;s shares. It&apos;s calculated as share price &times; total shares outstanding. A $3 trillion market cap (like Apple) means the market values the entire company at $3 trillion.
          </p>
        </div>
      </div>

      {/* How to Read Stock Data */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-xl font-bold">How to Read Stock Data</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-1">Price &amp; Change</h3>
            <p className="text-white/70 text-sm">The current trading price. The change shows how much it moved today &mdash; green means up, red means down. A +2.5% move on a $150 stock means it gained $3.75.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-1">Volume</h3>
            <p className="text-white/70 text-sm">How many shares traded today. High volume means lots of activity and interest. A stock that normally trades 5M shares but suddenly trades 20M is getting unusual attention.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-1">P/E Ratio</h3>
            <p className="text-white/70 text-sm">Price-to-Earnings ratio = Stock Price &divide; Earnings Per Share. A P/E of 25 means you&apos;re paying $25 for every $1 of annual profit. Lower P/E can mean cheaper, but growth companies often have higher P/E.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-1">EPS (Earnings Per Share)</h3>
            <p className="text-white/70 text-sm">How much profit the company makes per share. If a company earns $100B with 10B shares outstanding, EPS = $10. Growing EPS year-over-year is a positive sign.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-1">Book Value</h3>
            <p className="text-white/70 text-sm">The company&apos;s net assets (assets minus liabilities) per share. If the stock price is below book value, the company may be undervalued &mdash; you&apos;re paying less than the company&apos;s net worth.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-1">Dividend Yield</h3>
            <p className="text-white/70 text-sm">The annual dividend payment as a percentage of the stock price. A 3% yield on a $100 stock means you receive $3/year per share, paid quarterly ($0.75 each).</p>
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold">Technical Indicators Explained</h2>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Technical analysis looks at price and volume patterns to predict future movements. Here are the 5 indicators used in Stock-Assist:
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-2">RSI (Relative Strength Index)</h3>
            <p className="text-white/70 text-sm mb-2">Measures momentum on a 0&ndash;100 scale over the last 14 days.</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-green-500/10 rounded text-green-400 text-center">Below 30 = Oversold<br />(potential buy)</div>
              <div className="p-2 bg-yellow-500/10 rounded text-yellow-400 text-center">30&ndash;70 = Neutral<br />(no strong signal)</div>
              <div className="p-2 bg-red-500/10 rounded text-red-400 text-center">Above 70 = Overbought<br />(potential sell)</div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-green-400 mb-2">MACD (Moving Average Convergence Divergence)</h3>
            <p className="text-white/70 text-sm mb-2">Tracks the relationship between two moving averages to spot trend changes.</p>
            <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
              <li><strong className="text-white">MACD line crosses above Signal line</strong> = Bullish (buy signal)</li>
              <li><strong className="text-white">MACD line crosses below Signal line</strong> = Bearish (sell signal)</li>
              <li><strong className="text-white">Histogram growing</strong> = Momentum strengthening in that direction</li>
            </ul>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-purple-400 mb-2">Moving Averages (SMA &amp; EMA)</h3>
            <p className="text-white/70 text-sm mb-2">Smooth out price data to reveal the underlying trend.</p>
            <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
              <li><strong className="text-white">Price above SMA 20 &amp; SMA 50</strong> = Uptrend (bullish)</li>
              <li><strong className="text-white">Price below both</strong> = Downtrend (bearish)</li>
              <li><strong className="text-white">Golden Cross</strong> (SMA 20 crosses above SMA 50) = Strong buy signal</li>
              <li><strong className="text-white">Death Cross</strong> (SMA 20 crosses below SMA 50) = Strong sell signal</li>
            </ul>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-yellow-400 mb-2">Bollinger Bands</h3>
            <p className="text-white/70 text-sm mb-2">Creates a price channel using standard deviations around a moving average.</p>
            <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
              <li><strong className="text-white">Price near lower band</strong> = Potentially oversold (buy opportunity)</li>
              <li><strong className="text-white">Price near upper band</strong> = Potentially overbought (sell opportunity)</li>
              <li><strong className="text-white">Bands narrowing (&quot;squeeze&quot;)</strong> = Low volatility, big move likely coming</li>
            </ul>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-red-400 mb-2">Volume</h3>
            <p className="text-white/70 text-sm mb-2">The number of shares traded &mdash; confirms or denies price movements.</p>
            <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
              <li><strong className="text-white">Price up + high volume</strong> = Strong buying pressure (reliable move)</li>
              <li><strong className="text-white">Price up + low volume</strong> = Weak move (could reverse)</li>
              <li><strong className="text-white">Volume spike</strong> = Something significant is happening (earnings, news)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Valuation & Fair Value */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-xl font-bold">Valuation &amp; Fair Value</h2>
        </div>
        <div className="space-y-4 text-white/80 text-sm leading-relaxed">
          <p>
            <strong className="text-white">Fair value</strong> is an estimate of what a stock is actually worth based on the company&apos;s financials. If the stock price is below fair value, it&apos;s considered <strong className="text-green-400">undervalued</strong> (potential bargain). If above, it&apos;s <strong className="text-red-400">overvalued</strong> (potentially overpriced).
          </p>

          <h3 className="font-semibold text-white text-base pt-2">Models Used in Stock-Assist</h3>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-blue-400">Graham Number</h4>
            <p className="text-white/60 text-sm mt-1">Created by Benjamin Graham (Warren Buffett&apos;s mentor). Formula: &radic;(22.5 &times; EPS &times; Book Value). Gives a conservative estimate of what a stock is worth based on earnings and assets.</p>
            <p className="text-white/40 text-xs mt-1">Example: EPS = $6, Book Value = $30 &rarr; Graham Number = &radic;(22.5 &times; 6 &times; 30) = $63.64</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-blue-400">P/E Fair Value</h4>
            <p className="text-white/60 text-sm mt-1">Compares the stock&apos;s P/E ratio to its sector average. If tech stocks average a P/E of 28, a tech stock with EPS of $6 has a P/E fair value of $168 (6 &times; 28).</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-blue-400">Simple DCF (Discounted Cash Flow)</h4>
            <p className="text-white/60 text-sm mt-1">Projects future earnings for 5 years and discounts them back to today&apos;s dollars using the CAPM rate. If earnings grow 10%/year and your discount rate is 9%, future earnings are worth more than the current price suggests.</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-blue-400">Beta &amp; CAPM</h4>
            <p className="text-white/60 text-sm mt-1"><strong>Beta</strong> measures volatility vs. the market. Beta = 1 means the stock moves with the market. Beta = 1.5 means 50% more volatile. <strong>CAPM</strong> uses Beta to calculate the expected return: Risk-Free Rate (4.25%) + Beta &times; Market Premium (5.75%).</p>
            <p className="text-white/40 text-xs mt-1">Example: Beta = 1.3 &rarr; Expected Return = 4.25% + 1.3 &times; 5.75% = 11.7%/year</p>
          </div>
        </div>
      </div>

      {/* Options: Puts & Calls */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <ArrowUpDown className="w-5 h-5 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold">Options: Puts &amp; Calls</h2>
        </div>
        <div className="space-y-4 text-white/80 text-sm leading-relaxed">
          <p>
            An <strong className="text-white">option</strong> is a contract that gives you the <em>right</em> (but not the obligation) to buy or sell a stock at a specific price by a specific date. You pay a <strong className="text-white">premium</strong> for this right.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h3 className="font-bold text-green-400 text-lg mb-2">CALL Option</h3>
              <p className="text-white/70 text-sm mb-3">The right to <strong>BUY</strong> a stock at a set price. You buy calls when you think the stock will go <strong>UP</strong>.</p>
              <div className="p-3 bg-black/20 rounded text-xs space-y-2">
                <p className="text-white/50 font-semibold">Example:</p>
                <p className="text-white/70">AAPL is trading at $180. You buy a <strong className="text-white">$185 call</strong> expiring in 30 days for <strong className="text-white">$3.00 premium</strong> (cost: $300 for 1 contract = 100 shares).</p>
                <p className="text-green-400">If AAPL rises to $195: Your call is worth $10 ($195 - $185). Profit = $10 - $3 = <strong>$7/share ($700 total)</strong>. That&apos;s a 233% return!</p>
                <p className="text-red-400">If AAPL stays below $185: Your call expires worthless. You lose the $300 premium. That&apos;s the maximum you can lose.</p>
                <p className="text-yellow-400">Break-even: $185 + $3 = $188. AAPL needs to be above $188 for you to profit.</p>
              </div>
            </div>

            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <h3 className="font-bold text-red-400 text-lg mb-2">PUT Option</h3>
              <p className="text-white/70 text-sm mb-3">The right to <strong>SELL</strong> a stock at a set price. You buy puts when you think the stock will go <strong>DOWN</strong>.</p>
              <div className="p-3 bg-black/20 rounded text-xs space-y-2">
                <p className="text-white/50 font-semibold">Example:</p>
                <p className="text-white/70">TSLA is trading at $250. You buy a <strong className="text-white">$240 put</strong> expiring in 30 days for <strong className="text-white">$5.00 premium</strong> (cost: $500 for 1 contract).</p>
                <p className="text-green-400">If TSLA drops to $220: Your put is worth $20 ($240 - $220). Profit = $20 - $5 = <strong>$15/share ($1,500 total)</strong>. A 300% return!</p>
                <p className="text-red-400">If TSLA stays above $240: Your put expires worthless. You lose the $500 premium.</p>
                <p className="text-yellow-400">Break-even: $240 - $5 = $235. TSLA needs to be below $235 for you to profit.</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-white text-base pt-2">Key Options Concepts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">Strike Price</p>
              <p className="text-white/60 text-xs">The price at which you can buy (call) or sell (put) the stock. The further the strike from current price, the cheaper but riskier the option.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">Expiration Date</p>
              <p className="text-white/60 text-xs">When the option contract expires. Options lose value as they approach expiration (&quot;time decay&quot;). Longer expiration = more expensive but more time to be right.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">In the Money (ITM)</p>
              <p className="text-white/60 text-xs">A call is ITM when stock price &gt; strike price. A put is ITM when stock price &lt; strike price. ITM options have intrinsic value.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">Out of the Money (OTM)</p>
              <p className="text-white/60 text-xs">The opposite of ITM. OTM options are cheaper but more likely to expire worthless. They&apos;re a higher-risk, higher-reward play.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">Implied Volatility (IV)</p>
              <p className="text-white/60 text-xs">How much the market expects the stock to move. High IV = expensive options. Before earnings, IV rises (people expect a big move), making options pricier.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">The Greeks</p>
              <p className="text-white/60 text-xs"><strong>Delta</strong>: How much the option moves per $1 stock move. <strong>Theta</strong>: How much value you lose per day (time decay). <strong>Vega</strong>: Sensitivity to volatility changes.</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mt-2">
            <p className="text-yellow-400 text-sm font-medium mb-1">Options Warning</p>
            <p className="text-white/60 text-xs">Options are more complex and riskier than stocks. You can lose 100% of your investment (the premium) if the stock doesn&apos;t move in your direction. Never risk money you can&apos;t afford to lose. Start with paper trading to practice.</p>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-xl font-bold">Risk Management</h2>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Never Invest More Than You Can Afford to Lose</h3>
            <p className="text-white/60 text-sm">This is rule #1. Pay your bills and build an emergency fund first. The stock market can drop 30%+ in a crash. Only invest money you won&apos;t need for 5+ years.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Diversify</h3>
            <p className="text-white/60 text-sm">Don&apos;t put all your money in one stock. Spread across different sectors (tech, healthcare, finance) and geographies. If one company fails, you don&apos;t lose everything.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Position Sizing</h3>
            <p className="text-white/60 text-sm">A common rule: never put more than 5&ndash;10% of your portfolio in a single stock. If you have $10,000, that&apos;s max $500&ndash;$1,000 per stock.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Stop Losses</h3>
            <p className="text-white/60 text-sm">Set a price where you&apos;ll sell to limit losses. Example: Buy at $100, set stop loss at $90. If the stock drops 10%, you automatically sell. This prevents emotional decision-making during a crash.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Don&apos;t Chase FOMO</h3>
            <p className="text-white/60 text-sm">If a stock has already jumped 50% on hype, you&apos;re probably too late. The best gains come from researching and buying <em>before</em> the crowd. Use valuation models to find stocks trading below fair value.</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 bg-yellow-500/10 border-yellow-500/20">
        <p className="text-yellow-400 text-sm font-medium mb-1">
          Educational Purposes Only
        </p>
        <p className="text-white/60 text-xs">
          This content is for educational purposes only and should not be considered financial advice. Trading stocks and options involves risk and you can lose money. Always do your own research, understand what you&apos;re investing in, and consult a licensed financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  )
}
