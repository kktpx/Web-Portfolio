import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './AnalyticsChart.css';

const AnalyticsChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="admin-card analytics-chart-container">
        <h3>Visitor Activity</h3>
        <div className="analytics-chart-loading loading-pulse"></div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="admin-card analytics-chart-container">
      <h3>Visitor Activity</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" stroke="#a0a0a0" fontSize={12} tickMargin={10} />
            <YAxis stroke="#a0a0a0" fontSize={12} />
            <Tooltip 
              contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" name="Visitors" dataKey="visitors" stroke="#ffcc00" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Page Views" dataKey="pageViews" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;
