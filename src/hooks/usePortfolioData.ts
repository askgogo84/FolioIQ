"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { demoPortfolio, demoTransactions, demoComparison } from '@/lib/demoData';
import { createClient } from '@/utils/supabase/client';

export function usePortfolioData() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState(demoPortfolio);
  const [transactions, setTransactions] = useState(demoTransactions);
  const [comparison, setComparison] = useState(demoComparison);
  const [hasUpload, setHasUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated || !user) {
        setPortfolio(demoPortfolio);
        setTransactions(demoTransactions);
        setComparison(demoComparison);
        setHasUpload(false);
        setIsDemo(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data: portfolioData, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !portfolioData) {
          setPortfolio(demoPortfolio);
          setTransactions(demoTransactions);
          setComparison(demoComparison);
          setHasUpload(false);
          setIsDemo(true);
        } else {
          setPortfolio(portfolioData.data || demoPortfolio);
          setTransactions(portfolioData.transactions || demoTransactions);
          setComparison(portfolioData.comparison || demoComparison);
          setHasUpload(true);
          setIsDemo(false);
        }
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setPortfolio(demoPortfolio);
        setIsDemo(true);
      }
      
      setIsLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, isAuthenticated, authLoading]);

  return {
    portfolio,
    transactions,
    comparison,
    hasUpload,
    isLoading,
    isDemo,
    isAuthenticated,
    user
  };
}
