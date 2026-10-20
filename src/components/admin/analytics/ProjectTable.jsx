import React from 'react';
import { getProjects } from '../../../services/analyticsApi';
import useAnalytics from './useAnalytics';
import WidgetShell from './WidgetShell';
import { formatNum, formatPct } from './format';

const ProjectTable = ({ from, to, refreshKey }) => {
  const { data, loading, error } = useAnalytics(() => getProjects(from, to), [from, to, refreshKey]);
  const rows = Array.isArray(data) ? data : [];

  return (
    <WidgetShell
      title="Individual Project Engagement"
      subtitle="Opens and outbound clicks per project"
      loading={loading}
      error={error}
      empty={rows.length === 0}
      emptyText="No project activity in this period."
    >
      <div className="an-table-wrap">
        <table className="an-table">
          <thead>
            <tr>
              <th>Project</th>
              <th className="num">Opens</th>
              <th className="num">Visitors</th>
              <th className="num">GitHub</th>
              <th className="num">Demo</th>
              <th className="num">Click rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.project_id || i}>
                <td>{r.title || 'Untitled project'}</td>
                <td className="num">{formatNum(r.opens)}</td>
                <td className="num">{formatNum(r.unique_visitors)}</td>
                <td className="num">{formatNum(r.github)}</td>
                <td className="num">{formatNum(r.demo)}</td>
                <td className="num">{formatPct(r.click_rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
};

export default ProjectTable;
