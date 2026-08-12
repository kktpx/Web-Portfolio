import React, { useState, useEffect } from 'react';
import GitHubCalendar from 'react-github-calendar';
import { Users, BookOpen, Star, Github } from 'lucide-react';
import './GithubSection.css';

const GithubSection = () => {
  const username = "kktpx";
  const [userData, setUserData] = useState(null);
  const [repoData, setRepoData] = useState([]);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    // Fetch basic user data
    fetch(`https://api.github.com/users/${username}`)
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(err => console.error(err));

    // Fetch repos for stars calculation
    fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
      .then(res => res.json())
      .then(data => setRepoData(data))
      .catch(err => console.error(err));
  }, [username]);

  const totalStars = repoData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
  
  // Custom theme for the GitHub Calendar to match the purple aesthetic
  const explicitTheme = {
    light: ['#161b22', '#3a2468', '#5b32a3', '#864ce3', '#ab70ff'],
    dark: ['#2d2d2d', '#4c1d95', '#6d28d9', '#8b5cf6', '#a78bfa'],
  };

  return (
    <section className="github-section" id="github-stats">
      <div className="github-container">
        {/* Left Side: Contribution Graph Card */}
        <div className="github-card calendar-card">
          <div className="calendar-header">
            <div className="header-left">
              <div className="github-icon-wrapper">
                <Github size={28} color="#fff" />
              </div>
              <div className="header-text">
                <h3>@{username}</h3>
                <p>Contribution Graph</p>
              </div>
            </div>
          </div>
          
          <div className="calendar-wrapper">
            <GitHubCalendar 
              username={username} 
              colorScheme="dark"
              theme={explicitTheme}
              blockSize={12}
              blockMargin={4}
              fontSize={12}
            />
          </div>
        </div>

        {/* Right Side: Stats Cards */}
        <div className="stats-column">
          {/* Followers Card */}
          <div className="stat-card followers-card">
            <div className="stat-info">
              <p className="stat-label">Followers</p>
              <h2 className="stat-value">{userData ? userData.followers : 0}</h2>
            </div>
            <div className="stat-icon pink-icon">
              <Users size={48} />
            </div>
            {/* Decorative background elements */}
            <div className="dotted-bg"></div>
            <div className="sparkles pink-sparkles"></div>
          </div>

          {/* Public Repos Card */}
          <div className="stat-card repos-card">
            <div className="stat-info">
              <p className="stat-label">Public Repos</p>
              <h2 className="stat-value">{userData ? userData.public_repos : 0}</h2>
            </div>
            <div className="stat-icon green-icon">
              <BookOpen size={48} />
            </div>
            <div className="dotted-bg"></div>
            <div className="sparkles green-sparkles"></div>
          </div>

          {/* GitHub Stars Card */}
          <div className="stat-card stars-card">
            <div className="stat-info">
              <p className="stat-label">GitHub Stars</p>
              <h2 className="stat-value">{totalStars}</h2>
            </div>
            <div className="stat-icon yellow-icon">
              <Star size={48} />
            </div>
            <div className="dotted-bg"></div>
            <div className="sparkles yellow-sparkles"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GithubSection;
