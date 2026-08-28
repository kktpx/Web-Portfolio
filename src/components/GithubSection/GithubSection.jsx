import React, { useState, useEffect, useRef } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import { Users, BookOpen, Star } from 'lucide-react';
import './GithubSection.css';

const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted || end === 0) return;
        let start = 0;
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

    return { count, ref };
};

const GithubSection = () => {
  const username = "kktpx";
  const [userData, setUserData] = useState(null);
  const [repoData, setRepoData] = useState([]);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    // Fetch basic user data
    fetch("https://api.github.com/users/" + username)
      .then(res => {
          if (!res.ok) throw new Error("API limit");
          return res.json();
      })
      .then(data => setUserData(data))
      .catch(err => {
          console.error(err);
          // Fallback data in case of API rate limit
          setUserData({ followers: 4, public_repos: 6 });
      });

    // Fetch repos for stars calculation
    fetch("https://api.github.com/users/" + username + "/repos?per_page=100")
      .then(res => {
          if (!res.ok) throw new Error("API limit");
          return res.json();
      })
      .then(data => setRepoData(data))
      .catch(err => {
          console.error(err);
          setRepoData([{ stargazers_count: 2 }]); // Fallback stars
      });
  }, [username]);

  const totalStars = Array.isArray(repoData) 
    ? repoData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)
    : 0;
  
  const { count: followersCount, ref: followersRef } = useCountUp(userData?.followers || 0);
  const { count: reposCount, ref: reposRef } = useCountUp(userData?.public_repos || 0);
  const { count: starsCount, ref: starsRef } = useCountUp(totalStars);

  // Custom theme for the GitHub Calendar to match the yellow aesthetic
  const explicitTheme = {
    light: ['#161b22', '#4a3f12', '#7a6411', '#c7a312', '#ffcc00'],
    dark: ['#161b22', '#4a3f12', '#7a6411', '#c7a312', '#ffcc00'],
  };

  return (
    <section className="github-section" id="github-stats">
      <div className="github-container">
        {/* Left Side: Contribution Graph Card */}
        <div className="github-card calendar-card">
          <div className="calendar-header">
            <div className="header-left">
              <div className="github-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#fff'}}>
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </div>
              <div className="header-text">
                <h3>@{username}</h3>
                <p>Contribution Graph</p>
              </div>
            </div>
            <div className="header-right">
              <h2>{totalContributions}</h2>
              <p>THIS YEAR TOTAL</p>
            </div>
          </div>
          
          <div className="calendar-wrapper">
            <GitHubCalendar 
              username={username} 
              colorScheme="dark"
              theme={explicitTheme}
              blockSize={10}
              blockMargin={3}
              fontSize={12}
              transformData={(data) => {
                if (!Array.isArray(data)) return data;
                try {
                  const currentYear = new Date().getFullYear().toString();
                  const thisYearTotal = data
                    .filter(day => day && day.date && typeof day.date === 'string' && day.date.startsWith(currentYear))
                    .reduce((sum, day) => sum + (day.count || 0), 0);
                  
                  if (thisYearTotal !== totalContributions) {
                    setTimeout(() => setTotalContributions(thisYearTotal), 0);
                  }
                } catch (e) {
                  console.error("Error in transformData", e);
                }
                return data;
              }}
            />
          </div>
        </div>

        {/* Right Side: Stats Cards */}
        <div className="stats-column">
          {!userData ? (
            <>
              <div className="stat-card skeleton-card">
                  <div className="skeleton-text skeleton-pulse" style={{width: '60px', height: '14px'}} />
                  <div className="skeleton-text skeleton-pulse" style={{width: '40px', height: '28px', marginTop: '8px'}} />
              </div>
              <div className="stat-card skeleton-card">
                  <div className="skeleton-text skeleton-pulse" style={{width: '60px', height: '14px'}} />
                  <div className="skeleton-text skeleton-pulse" style={{width: '40px', height: '28px', marginTop: '8px'}} />
              </div>
              <div className="stat-card skeleton-card">
                  <div className="skeleton-text skeleton-pulse" style={{width: '60px', height: '14px'}} />
                  <div className="skeleton-text skeleton-pulse" style={{width: '40px', height: '28px', marginTop: '8px'}} />
              </div>
            </>
          ) : (
            <>
              {/* Followers Card */}
              <a href={\`https://github.com/\${username}?tab=followers\`} target="_blank" rel="noopener noreferrer" className="stat-card followers-card" ref={followersRef} style={{ textDecoration: 'none' }}>
                <div className="stat-info">
                  <p className="stat-label">Followers</p>
                  <h2 className="stat-value">{followersCount}</h2>
                </div>
                <div className="stat-icon pink-icon">
                  <Users size={36} />
                </div>
                {/* Decorative background elements */}
                <div className="dotted-bg"></div>
                <div className="sparkles pink-sparkles"></div>
              </a>

              {/* Public Repos Card */}
              <a href={\`https://github.com/\${username}?tab=repositories\`} target="_blank" rel="noopener noreferrer" className="stat-card repos-card" ref={reposRef} style={{ textDecoration: 'none' }}>
                <div className="stat-info">
                  <p className="stat-label">Public Repos</p>
                  <h2 className="stat-value">{reposCount}</h2>
                </div>
                <div className="stat-icon green-icon">
                  <BookOpen size={36} />
                </div>
                <div className="dotted-bg"></div>
                <div className="sparkles green-sparkles"></div>
              </a>

              {/* GitHub Stars Card */}
              <a href={\`https://github.com/\${username}\`} target="_blank" rel="noopener noreferrer" className="stat-card stars-card" ref={starsRef} style={{ textDecoration: 'none' }}>
                <div className="stat-info">
                  <p className="stat-label">GitHub Stars</p>
                  <h2 className="stat-value">{starsCount}</h2>
                </div>
                <div className="stat-icon yellow-icon">
                  <Star size={36} />
                </div>
                <div className="dotted-bg"></div>
                <div className="sparkles yellow-sparkles"></div>
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GithubSection;

