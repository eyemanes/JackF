import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { User, Twitter, MessageCircle, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const Profile = () => {
  const { ready, authenticated, user, linkTwitter, linkTelegram } = usePrivy();
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="squid-loader"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">Please connect your account to view your profile</div>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-blue px-6 py-3 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🐙 User Profile</h1>
          <p className="text-gray-400 mt-1">Manage your connected accounts and profile</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="squid-card rounded-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {user?.twitter?.username ? `@${user.twitter.username}` : 
               user?.telegram?.username ? `@${user.telegram.username}` : 
               'Anonymous User'}
            </h2>
            <p className="text-gray-400">
              {user?.twitter?.username && user?.telegram?.username ? 'Twitter + Telegram Connected' :
               user?.twitter?.username ? 'Twitter Connected' :
               user?.telegram?.username ? 'Telegram Connected' : 'No social accounts linked'}
            </p>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
          
          {/* Twitter Account */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <Twitter className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">
                  {user?.twitter?.username ? `@${user.twitter.username}` : 'Twitter'}
                </div>
                <div className="text-gray-400 text-sm">
                  {user?.twitter?.username ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user?.twitter?.username ? (
                <span className="text-green-400 text-sm font-medium">✓ Connected</span>
              ) : (
                <button
                  onClick={linkTwitter}
                  className="btn-blue px-4 py-2 rounded-lg text-sm"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Telegram Account */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">
                  {user?.telegram?.username ? `@${user.telegram.username}` : 'Telegram'}
                </div>
                <div className="text-gray-400 text-sm">
                  {user?.telegram?.username ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user?.telegram?.username ? (
                <span className="text-green-400 text-sm font-medium">✓ Connected</span>
              ) : (
                <button
                  onClick={linkTelegram}
                  className="btn-blue px-4 py-2 rounded-lg text-sm"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User ID */}
        <div className="mt-6 pt-6 border-t border-blue-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <LinkIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">User ID</div>
                <div className="text-gray-400 text-sm font-mono">
                  {user?.id?.slice(0, 8)}...{user?.id?.slice(-8)}
                </div>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(user?.id, 'id')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              {copied === 'id' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
