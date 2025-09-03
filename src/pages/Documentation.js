import React from 'react';
import { 
  FileText, 
  Bot, 
  Calculator, 
  Command, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Trophy,
  Zap,
  User,
  MessageCircle,
  Link as LinkIcon,
  RefreshCw,
  BarChart3,
  Star,
  Activity
} from 'lucide-react';

import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Documentation = () => {
  const commands = [
    {
      command: '/start',
      description: 'Start the bot and get welcome message',
      icon: <Bot className="w-4 h-4" />
    },
    {
      command: '/link',
      description: 'Link your Twitter account to the bot',
      icon: <LinkIcon className="w-4 h-4" />
    },
    {
      command: '/ca <contract_address>',
      description: 'Track a new token by contract address',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      command: '/refresh <contract_address>',
      description: 'Refresh token data and PnL calculations',
      icon: <RefreshCw className="w-4 h-4" />
    },
    {
      command: '/delete <contract_address>',
      description: 'Delete a tracked token from your calls',
      icon: <TrendingDown className="w-4 h-4" />
    },
    {
      command: '/last',
      description: 'Show your last 5 token calls',
      icon: <Clock className="w-4 h-4" />
    },
    {
      command: '/reset_pnl',
      description: 'Reset corrupted PnL values for accurate calculations',
      icon: <Calculator className="w-4 h-4" />
    },
    {
      command: '/summarize <contract>',
      description: 'Get AI summary of token performance',
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      command: '/ask <question>',
      description: 'Ask Jack AI about tokens or trading',
      icon: <Star className="w-4 h-4" />
    },
    {
      command: '/ai_usage',
      description: 'Check your AI usage statistics',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      command: '/help',
      description: 'Show all available commands',
      icon: <Command className="w-4 h-4" />
    }
  ];

  const pnlRules = [
    {
      title: "ATH Lock Rule",
      description: "If a token reaches its all-time high after your call, your PnL is locked at the ATH performance.",
      example: "Call at $1 → ATH at $2 → PnL locked at +100% even if price drops to $1.50",
      icon: <Trophy className="w-5 h-5 text-yellow-400" />
    },
    {
      title: "2x Lock Rule", 
      description: "Once you reach 2x (100% gain), your PnL is locked at the peak and never goes down.",
      example: "Call at $1 → Price hits $2.50 → PnL locked at +150% even if price crashes",
      icon: <Zap className="w-5 h-5 text-blue-400" />
    },
    {
      title: "10x Cap Rule",
      description: "Maximum PnL is capped at 10x (900%) to prevent unrealistic calculations.",
      example: "Even if a token goes 50x, your PnL is capped at +900%",
      icon: <TrendingUp className="w-5 h-5 text-green-400" />
    },
    {
      title: "Corruption Detection",
      description: "System automatically detects and resets corrupted PnL values for accuracy.",
      example: "If PnL shows 10x but market cap only moved 2%, it gets reset automatically",
      icon: <Activity className="w-5 h-5 text-red-400" />
    }
  ];

  const scoringSystem = [
    {
      factor: "Base Points",
      description: "Calculated from your PnL multiplier (1x = 100 points, 2x = 200 points, etc.)",
      weight: "Primary"
    },
    {
      factor: "Market Cap Multiplier", 
      description: "Higher market cap tokens get bonus points (more impressive calls)",
      weight: "Secondary"
    },
    {
      factor: "Early Call Bonus",
      description: "Earlier calls get bonus points (first to spot the opportunity)",
      weight: "Bonus"
    },
    {
      factor: "Win Rate",
      description: "Consistent winners get bonus points for reliability",
      weight: "Bonus"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <FileText className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Documentation</h1>
          <p className="text-gray-400 text-sm">Complete guide to Jack's Solana Tracker Bot</p>
        </div>
      </div>

      {/* Bot Overview */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">About Jack's Bot</h2>
        </div>
        <div className="space-y-3 text-gray-300">
          <p>
            Jack's Solana Tracker Bot is an advanced Telegram bot that tracks Solana token performance 
            and calculates accurate PnL (Profit and Loss) for your calls. The bot uses sophisticated 
            algorithms to ensure fair and accurate scoring.
          </p>
          <p>
            <strong className="text-white">Key Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Real-time token tracking and PnL calculations</li>
            <li>Advanced ATH (All-Time High) locking system</li>
            <li>Corruption detection and automatic PnL resets</li>
            <li>AI-powered token analysis and summaries</li>
            <li>Leaderboard system with fair scoring</li>
            <li>Twitter account linking for social features</li>
          </ul>
        </div>
      </Card>

      {/* Commands Section */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Command className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Bot Commands</h2>
        </div>
        <div className="space-y-3">
          {commands.map((cmd, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5 text-blue-400">
                {cmd.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <code className="text-blue-300 font-mono text-sm bg-gray-900/50 px-2 py-1 rounded">
                    {cmd.command}
                  </code>
                </div>
                <p className="text-gray-300 text-sm">{cmd.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* PnL Calculation Rules */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">PnL Calculation Rules</h2>
        </div>
        <div className="space-y-4">
          {pnlRules.map((rule, index) => (
            <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {rule.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">{rule.title}</h3>
                  <p className="text-gray-300 text-sm mb-2">{rule.description}</p>
                  <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-400 font-mono">
                    <strong className="text-gray-300">Example:</strong> {rule.example}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scoring System */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Scoring System</h2>
        </div>
        <div className="space-y-3">
          {scoringSystem.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{factor.factor}</h3>
                <p className="text-gray-300 text-sm">{factor.description}</p>
              </div>
              <Badge 
                variant={factor.weight === 'Primary' ? 'success' : factor.weight === 'Secondary' ? 'info' : 'warning'}
                size="sm"
              >
                {factor.weight}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips & Best Practices */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Star className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Tips & Best Practices</h2>
        </div>
        <div className="space-y-3 text-gray-300">
          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <h3 className="text-blue-300 font-semibold mb-2">💡 Pro Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use <code className="bg-gray-800/50 px-1 rounded">/reset_pnl</code> if you see incorrect PnL values</li>
              <li>Link your Twitter account for better social features and leaderboard ranking</li>
              <li>Use <code className="bg-gray-800/50 px-1 rounded">/summarize</code> to get AI insights on your calls</li>
              <li>Check <code className="bg-gray-800/50 px-1 rounded">/last</code> regularly to track your performance</li>
            </ul>
          </div>
          
          <div className="p-3 bg-green-600/10 border border-green-500/20 rounded-lg">
            <h3 className="text-green-300 font-semibold mb-2">🎯 Best Practices</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Always verify contract addresses before tracking</li>
              <li>Use refresh commands to get the latest token data</li>
              <li>Monitor your calls regularly for optimal performance</li>
              <li>Take advantage of the AI features for deeper analysis</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Support & Contact</h2>
        </div>
        <div className="text-gray-300 space-y-2">
          <p>
            Need help? Jack's AI assistant is always available to answer your questions!
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Use:</span>
            <code className="bg-gray-800/50 px-2 py-1 rounded text-blue-300 font-mono text-sm">
              /ask your question here
            </code>
          </div>
          <p className="text-sm text-gray-400">
            Jack can help with token analysis, bot commands, PnL calculations, and general trading advice.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Documentation;
