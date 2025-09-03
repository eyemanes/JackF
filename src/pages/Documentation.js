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
  MessageCircle,
  Link as LinkIcon,
  BarChart3
} from 'lucide-react';

import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Documentation = () => {
  const commands = [
    {
      command: '/start',
      description: 'Start the bot',
      icon: <Bot className="w-4 h-4" />
    },
    {
      command: '/link',
      description: 'Link your Twitter account',
      icon: <LinkIcon className="w-4 h-4" />
    },
    {
      command: '/delete <contract>',
      description: 'Delete a tracked token',
      icon: <TrendingDown className="w-4 h-4" />
    },
    {
      command: '/last',
      description: 'Show your last 5 calls',
      icon: <Clock className="w-4 h-4" />
    },
    {
      command: '/reset_pnl',
      description: 'Reset corrupted PnL values',
      icon: <Calculator className="w-4 h-4" />
    },
    {
      command: '/summarize <contract>',
      description: 'Summarize group conversation about token',
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      command: '/ai_usage',
      description: 'Check AI usage stats',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      command: '/help',
      description: 'Show all commands',
      icon: <Command className="w-4 h-4" />
    }
  ];

  const pnlRules = [
    {
      title: "ATH Lock",
      description: "PnL locked at all-time high",
      example: "$1 → $2 ATH → locked at +100%",
      icon: <Trophy className="w-5 h-5 text-yellow-400" />
    },
    {
      title: "2x Lock", 
      description: "Once 2x, never goes down",
      example: "$1 → $2.50 → locked at +150%",
      icon: <Zap className="w-5 h-5 text-blue-400" />
    },
    {
      title: "10x Cap",
      description: "Max PnL capped at 10x",
      example: "Even 50x = max +900%",
      icon: <TrendingUp className="w-5 h-5 text-green-400" />
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
          <h1 className="text-2xl font-bold text-white">Jack of all Scans</h1>
          <p className="text-gray-400 text-sm">Solana tracker with fair PnL</p>
        </div>
      </div>

      {/* La Liga System */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">La Liga System</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <h3 className="text-white font-semibold mb-2">🏆 Group Promotion & Relegation</h3>
            <p className="text-gray-300 text-sm mb-3">
              Weekly rankings determine who moves up or down between groups.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">Top 10 → Promoted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-400 text-sm font-medium">Worst 10 → Relegated</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-orange-600/10 border border-orange-500/20 rounded">
              <h4 className="text-orange-300 font-medium text-sm mb-1">⚔️ Jack of all Trenches</h4>
              <p className="text-gray-400 text-xs">Entry level - Top 5 climb up weekly</p>
            </div>
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded opacity-60">
              <h4 className="text-blue-300 font-medium text-sm mb-1">🏛️ Jack Lounge</h4>
              <p className="text-gray-400 text-xs">Mid level - 5 up, 5 down weekly</p>
            </div>
            <div className="p-3 bg-purple-600/10 border border-purple-500/20 rounded opacity-60">
              <h4 className="text-purple-300 font-medium text-sm mb-1">🏟️ Jacky FNF</h4>
              <p className="text-gray-400 text-xs">High stakes - Rise or fall</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Commands */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Command className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Commands</h2>
        </div>
        <div className="space-y-2">
          {commands.map((cmd, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
              <div className="flex items-center space-x-3">
                <div className="text-blue-400">{cmd.icon}</div>
                <code className="text-blue-300 font-mono text-sm">{cmd.command}</code>
              </div>
              <span className="text-gray-300 text-sm">{cmd.description}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* PnL Rules */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">PnL Rules</h2>
        </div>
        <div className="space-y-3">
          {pnlRules.map((rule, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded">
              <div className="flex-shrink-0">{rule.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-white font-medium">{rule.title}</h3>
                  <span className="text-gray-400 text-sm">-</span>
                  <span className="text-gray-300 text-sm">{rule.description}</span>
                </div>
                <code className="text-gray-400 text-xs font-mono">{rule.example}</code>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Code Style Info */}
      <Card>
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm font-mono">// Auto-corruption detection</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-blue-400 text-sm font-mono">// Real-time tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-yellow-400 text-sm font-mono">// Fair scoring system</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Documentation;
