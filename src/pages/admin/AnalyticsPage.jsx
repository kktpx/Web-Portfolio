import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  getAnalyticsOverview,
  getActivityTimeline,
  getProjectAnalytics,
  getPopularActions,
  getUTMAnalytics,
  getRecentVisitorJourneys
} from '../../services/analytics';
import AnalyticsHeader from '../../components/admin/analytics/AnalyticsHeader';
import DateRangeFilter from '../../components/admin/analytics/DateRangeFilter';
import AnalyticsOverview from '../../components/admin/analytics/AnalyticsOverview';
import ActivityTimeline from '../../components/admin/analytics/ActivityTimeline';
import ProjectEngagement from '../../components/admin/analytics/ProjectEngagement';
import RecruiterIntent from '../../components/admin/analytics/RecruiterIntent';
import PopularActions from '../../components/admin/analytics/PopularActions';
import CampaignChannels from '../../components/admin/analytics/CampaignChannels';
import VisitorJourneys from '../../components/admin/analytics/VisitorJourneys';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [realtimeActive, setRealtimeActive] = useState(false);
  
  const [data, setData] = useState({
    overview: null,
    timeline: null,
    projects: null,
    actions: null,
    utm: null,
    journeys: null
  });
  
  const [loading, setLoading] = useState(true);

  const getDates = (range) => {
    const end = new Date();
    const start = new Date();
    if (range === '1d') start.setDate(start.getDate() - 1);
    else if (range === '7d') start.setDate(start.getDate() - 7);
    else if (range === '30d') start.setDate(start.getDate() - 30);
    else if (range === 'all') start.setFullYear(2020);
    return { start, end };
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const { start, end } = getDates(dateRange);
    
    try {
      const results = await Promise.allSettled([
        getAnalyticsOverview(start, end),
        getActivityTimeline(start, end),
        getProjectAnalytics(start, end),
        getPopularActions(start, end),
        getUTMAnalytics(start, end),
        getRecentVisitorJourneys(start, end),
      ]);
      
      setData({
        overview: results[0].status === 'fulfilled' ? results[0].value : null,
        timeline: results[1].status === 'fulfilled' ? results[1].value : null,
        projects: results[2].status === 'fulfilled' ? results[2].value : null,
        actions: results[3].status === 'fulfilled' ? results[3].value : null,
        utm: results[4].status === 'fulfilled' ? results[4].value : null,
        journeys: results[5].status === 'fulfilled' ? results[5].value : null,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const channel = supabase
      .channel('analytics-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'portfolio_analytics',
      }, () => {
        loadAllData();
      })
      .subscribe((status) => {
        setRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => supabase.removeChannel(channel);
  }, [loadAllData]);

  return (
    <div className="analytics-page">
      <AnalyticsHeader realtimeActive={realtimeActive} onRefresh={loadAllData} loading={loading} />
      <DateRangeFilter value={dateRange} onChange={setDateRange} />
      <AnalyticsOverview data={data.overview} loading={loading} />
      <ActivityTimeline data={data.timeline} loading={loading} />
      <div className="analytics-grid-2col">
        <ProjectEngagement data={data.projects} loading={loading} />
        <RecruiterIntent data={data.overview} loading={loading} />
      </div>
      <PopularActions data={data.actions} loading={loading} />
      <CampaignChannels data={data.utm} loading={loading} />
      <VisitorJourneys data={data.journeys} loading={loading} />
    </div>
  );
};
export default AnalyticsPage;
