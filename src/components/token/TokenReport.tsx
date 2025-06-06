'use client';

import React, { useState } from 'react';
import { TokenReport, TokenRiskFactor } from '@/types/token';
import { RiskScore } from './RiskScore';
import { RiskIndicator } from './RiskIndicator';
import { formatAddress, formatDate, formatTokenAmount } from '@/lib/utils';
import { useTokenAnalysis } from '@/contexts/TokenAnalysisContext';
import Image from 'next/image';
import { useNotifications } from '@/contexts/NotificationContext';

interface TokenReportProps {
  report: TokenReport;
  isLoading?: boolean;
}

export const TokenReportComponent: React.FC<TokenReportProps> = ({
  report,
  isLoading = false,
}) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useTokenAnalysis();
  const { addNotification } = useNotifications();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Handle watchlist toggle
  const handleWatchlistToggle = () => {
    try {
      const tokenAddress = report.metadata.address;
      
      if (isInWatchlist(tokenAddress)) {
        removeFromWatchlist(tokenAddress);
        addNotification({
          type: 'system',
          title: 'Removed from Watchlist',
          message: `${report.metadata.symbol} has been removed from your watchlist`,
          priority: 'low',
        });
      } else {
        addToWatchlist(tokenAddress, {
          mint: tokenAddress,
          owner: '',
          amount: '0',
          decimals: report.metadata.decimals,
          uiAmount: 0,
          symbol: report.metadata.symbol,
          name: report.metadata.name,
          logoURI: report.metadata.logoURI,
          riskScore: report.riskScore.score,
          riskLevel: report.riskScore.level,
        });
        addNotification({
          type: 'system',
          title: 'Added to Watchlist',
          message: `${report.metadata.symbol} has been added to your watchlist`,
          priority: 'low',
        });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      addNotification({
        type: 'system',
        title: 'Watchlist Error',
        message: 'Failed to update watchlist',
        priority: 'medium',
      });
    }
  };

  // Handle copy to clipboard
  const handleCopyAddress = (address: string, type: 'token' | 'deployer') => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy address:', err);
        addNotification({
          type: 'system',
          title: 'Copy Failed',
          message: 'Failed to copy address to clipboard',
          priority: 'low',
        });
      });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-60 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {/* Token logo */}
          <div className="w-12 h-12 mr-4 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-700">
            {report.metadata.logoURI ? (
              <Image
                width={50}
                height={50}
                src={report.metadata.logoURI}
                alt={report.metadata.symbol || 'Token'}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/gray/white?text=' + (report.metadata.symbol || '?').charAt(0);
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xl font-bold text-gray-500">
                {(report.metadata.symbol || '?').charAt(0)}
              </div>
            )}
          </div>
          
          {/* Token info */}
          <div>
            <h2 className="text-xl font-bold flex items-center">
              {report.metadata.name || 'Unknown Token'}{' '}
              <span className="ml-2 text-gray-500">({report.metadata.symbol || '???'})</span>
              
              {report.rugCheckVerified && (
                <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </h2>
            <div className="mt-1 text-sm text-gray-500 flex items-center">
              {formatAddress(report.metadata.address, 8)}
              <button 
                className="ml-2 text-primary-600 hover:text-primary-700 flex items-center"
                onClick={() => handleCopyAddress(report.metadata.address, 'token')}
                title="Copy address"
              >
                {copySuccess === 'token' ? (
                  <span className="text-green-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Risk score */}
        <div className="flex items-center space-x-4">
          <RiskScore
            score={report.riskScore.score}
            level={report.riskScore.level}
            size="lg"
          />
          
          <button
            className={`p-2 rounded-full ${
              isInWatchlist(report.metadata.address)
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={handleWatchlistToggle}
            title={isInWatchlist(report.metadata.address) ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isInWatchlist(report.metadata.address) ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Alert for high risk tokens */}
      {(report.riskScore.level === 'high' || report.riskScore.level === 'critical') && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">High Risk Token Warning</h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                <p>This token has been identified as high risk. Exercise extreme caution before investing.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Token metadata */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500">Token Supply</h3>
          <p className="mt-1 text-lg font-semibold">
            {report.metadata.totalSupply 
              ? formatTokenAmount(report.metadata.totalSupply, report.metadata.decimals)
              : 'Unknown'}
          </p>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500">Creation Date</h3>
          <p className="mt-1 text-lg font-semibold">
            {report.creationDate ? formatDate(new Date(report.creationDate).getTime() / 1000) : 'Unknown'}
          </p>
          {report.creationDate && (
            <p className="mt-1 text-xs text-gray-500">
              {new Date(report.creationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500">Token Holders</h3>
          <p className="mt-1 text-lg font-semibold">
            {report.holders ? report.holders.toLocaleString() : 'Unknown'}
          </p>
          {report.holders > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {report.holders < 10 && 'Very few holders - potential concentration risk'}
              {report.holders >= 10 && report.holders < 100 && 'Limited holder distribution'}
              {report.holders >= 100 && report.holders < 1000 && 'Moderate holder distribution'}
              {report.holders >= 1000 && 'Wide holder distribution'}
            </p>
          )}
        </div>
      </div>
      
      {/* Risk summary */}
      <div className="p-6 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold">Risk Analysis</h3>
        <div className="mt-2 text-gray-700 dark:text-gray-300">
          <p>{report.riskScore.summary}</p>
          
          {report.riskScore.recommendations && report.riskScore.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">Recommendations</h4>
              <ul className="mt-2 ml-5 space-y-1 list-disc">
                {report.riskScore.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Risk factors */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Risk Factors</h3>
        
        {report.riskScore.factors.length === 0 ? (
          <p className="text-gray-500">No specific risk factors identified.</p>
        ) : (
          <div className="space-y-4">
            {report.riskScore.factors.map((factor, index) => (
              <RiskFactorItem key={index} factor={factor} />
            ))}
          </div>
        )}
      </div>
      
      {/* Deployer info */}
      {report.deployerAddress && (
        <div className="p-6 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Deployer Information</h3>
          <div className="mt-2">
            <div className="flex items-center">
              <span className="text-gray-500">Address:</span>
              <span className="ml-2 font-mono text-sm">{formatAddress(report.deployerAddress, 12)}</span>
              <button 
                className="ml-2 text-primary-600 hover:text-primary-700 flex items-center"
                onClick={() => handleCopyAddress(report.deployerAddress, 'deployer')}
                title="Copy address"
              >
                {copySuccess === 'deployer' ? (
                  <span className="text-green-500 flex items-center text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-4 flex space-x-2">
              <a 
                href={`https://solscan.io/account/${report.deployerAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-md text-sm flex items-center dark:bg-primary-900/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Solscan
              </a>
              <a 
                href={`https://solana.fm/address/${report.deployerAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-md text-sm flex items-center dark:bg-primary-900/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Solana FM
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Risk factor item component
const RiskFactorItem: React.FC<{ factor: TokenRiskFactor }> = ({ factor }) => {
  const [expanded, setExpanded] = React.useState(factor.severity === 'high' || factor.severity === 'critical');
  
  // Generate border color based on severity
  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 dark:border-red-700';
      case 'high':
        return 'border-orange-500 dark:border-orange-700';
      case 'medium':
        return 'border-yellow-500 dark:border-yellow-700';
      case 'low':
        return 'border-green-500 dark:border-green-700';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };
  
  // Generate background color based on severity
  const getBackgroundColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/10';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/10';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/10';
      case 'low':
        return 'bg-green-50 dark:bg-green-900/10';
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };
  
  return (
    <div className={`p-4 border-l-4 rounded-lg ${getBorderColor(factor.severity)} ${getBackgroundColor(factor.severity)}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <h4 className="font-medium">{factor.category}</h4>
            <RiskIndicator level={factor.severity} size="xs" className="ml-2" />
          </div>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{factor.description}</p>
        </div>
        
        {/* Expand button - only show if there's evidence or impact */}
        {(factor.evidence || factor.impact) && (
          <button
            className="p-1 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`w-5 h-5 transition-transform ${expanded ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {factor.evidence && (
            <div className="mb-2">
              <h5 className="text-sm font-medium text-gray-500">Evidence</h5>
              <p className="mt-1 text-sm">{factor.evidence}</p>
            </div>
          )}
          
          {factor.impact && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Impact</h5>
              <p className="mt-1 text-sm">{factor.impact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};