import React, { useState, useEffect } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import { Activity, Rocket, BookOpen } from 'lucide-react';
import CoreStack from '../CoreStack/CoreStack';
import SectionHeading from '../common/SectionHeading';
import { GithubIcon } from '../common/BrandIcons';
import { getPublishedProjectCount } from '../../services/projectService';
import './GithubSection.css';

const HEATMAP_MONTHS = 6;

const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted, node]);

  useEffect(() => {
    if (!hasStarted || end === 0) return;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return { count, ref: setNode };
};

// ISO date (YYYY-MM-DD) for the first day shown in the heatmap.
const heatmapStart = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - HEATMAP_MONTHS);
  return d.toISOString().slice(0, 10);
};

const GithubSection = () => {
  const username = "kktpx";
  const [userData, setUserData] = useState(null);
  const [projectCount, setProjectCount] = useState(0);
  const [yearContributions, setYearContributions] = useState(0);
  const [recentContributions, setRecentContributions] = useState(0);

  useEffect(() => {
    fetch("https://api.github.com/users/" + username)
      .then(res => {
        if (!res.ok) throw new Error("API limit");
        return res.json();
      })
      .then(data => setUserData(data))
      .catch(err => {
        console.error(err);
        // Fallback data in case of API rate limit
        setUserData({ public_repos: 6 });
      });

    getPublishedProjectCount()
      .then(setProjectCount)
      .catch(err => console.error('Failed to count projects:', err));
  }, [username]);

  const { count: contributionsCount, ref: contributionsRef } = useCountUp(yearContributions);
  const { count: projectsCount, ref: projectsRef } = useCountUp(projectCount);
  const { count: reposCount, ref: reposRef } = useCountUp(userData?.public_repos || 0);

  // Custom theme for the GitHub Calendar to match the yellow aesthetic
  const explicitTheme = {
    light: ['#161b22', '#4a3f12', '#7a6411', '#c7a312', '#ffcc00'],
    dark: ['#161b22', '#4a3f12', '#7a6411', '#c7a312', '#ffcc00'],
  };

  // Keep only the last HEATMAP_MONTHS months and derive both totals from the data.
  const transformData = (data) => {
    if (!Array.isArray(data)) return data;
    try {
      const currentYear = new Date().getFullYear().toString();
      const start = heatmapStart();
      const recent = data.filter(day => day && typeof day.date === 'string' && day.date >= start);
      const yearTotal = data
        .filter(day => day && typeof day.date === 'string' && day.date.startsWith(currentYear))
        .reduce((sum, day) => sum + (day.count || 0), 0);
      const recentTotal = recent.reduce((sum, day) => sum + (day.count || 0), 0);

      if (yearTotal !== yearContributions || recentTotal !== recentContributions) {
        setTimeout(() => {
          setYearContributions(yearTotal);
          setRecentContributions(recentTotal);
        }, 0);
      }
      return recent;
    } catch (e) {
      console.error("Error in transformData", e);
      return data;
    }
  };

  const stats = [
    {
      key: 'contributions',
      label: `Contributions in ${new Date().getFullYear()}`,
      value: contributionsCount,
      ref: contributionsRef,
      href: "https://github.com/" + username,
      external: true,
      Icon: Activity,
    },
    {
      key: 'projects',
      label: 'Projects shipped',
      value: projectsCount,
      ref: projectsRef,
      href: '#portfolio',
      external: false,
      Icon: Rocket,
    },
    {
      key: 'repos',
      label: 'Public repos',
      value: reposCount,
      ref: reposRef,
      href: "https://github.com/" + username + "?tab=repositories",
      external: true,
      Icon: BookOpen,
    },
  ];

  return (
    <section className="github-section" id="github-stats">
      <div className="github-wrapper">
        <SectionHeading index="02" label="GitHub">
          Activity &amp; <span className="highlight">Stack</span>
        </SectionHeading>

        <div className="github-container">
          <div className="github-main">
            {/* Left Side: Contribution Graph Card */}
            <div className="github-card calendar-card">
              <div className="calendar-header">
                <div className="header-left">
                  <div className="github-icon-wrapper">
                    <GithubIcon size={24} style={{ color: '#fff' }} />
                  </div>
                  <div className="header-text">
                    <h3>@{username}</h3>
                    <p>Contribution Graph</p>
                  </div>
                </div>
                <div className="header-right">
                  <span className="header-total">{recentContributions}</span>
                  <p>Last {HEATMAP_MONTHS} months</p>
                </div>
              </div>

              <div className="calendar-wrapper">
                <GitHubCalendar
                  username={username}
                  colorScheme="dark"
                  theme={explicitTheme}
                  blockSize={13}
                  blockMargin={4}
                  fontSize={12}
                  showTotalCount={false}
                  transformData={transformData}
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-column">
              {!userData ? (
                stats.map(({ key }) => (
                  <div key={key} className="stat-card skeleton-card">
                    <div className="skeleton-text skeleton-pulse" style={{ width: '60px', height: '14px' }} />
                    <div className="skeleton-text skeleton-pulse" style={{ width: '40px', height: '28px', marginTop: '8px' }} />
                  </div>
                ))
              ) : (
                stats.map((stat) => (
                  <a
                    key={stat.key}
                    href={stat.href}
                    ref={stat.ref}
                    className="stat-card"
                    {...(stat.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <div className="stat-info">
                      <p className="stat-label">{stat.label}</p>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                    <div className="stat-icon">
                      <stat.Icon size={36} />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Right Side: Core Stack */}
          <CoreStack />
        </div>
      </div>
    </section>
  );
};

export default GithubSection;
