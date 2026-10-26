import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const STORAGE_ROWS = [
  ['portfolio_session_id', 'localStorage', 'Random anonymous ID used to count unique visitors. Persists until you clear site data.'],
  ['portfolio_visit', 'localStorage', 'Random ID for the current visit; renewed after 30 minutes of inactivity.'],
  ['portfolio_utm', 'localStorage', 'UTM campaign tags from the link you arrived through (if any), kept for the current visit.'],
  ['analytics_sections_<visit id>', 'sessionStorage', 'Remembers which sections were already counted so they are not logged twice. Cleared when the tab closes.'],
];

function PrivacyPolicy() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Privacy Policy | Kittipop Sanpho';
    window.scrollTo(0, 0);
    return () => { document.title = prev; };
  }, []);

  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <Link to="/" className="privacy-back">&larr; Back to home</Link>
        <h1 className="privacy-title">Privacy <span>Policy</span></h1>
        <p className="privacy-updated">Last updated: 26 October 2026</p>

        <section>
          <h2>Overview</h2>
          <p>
            This is the personal portfolio of Kittipop Sanpho (www.kktp.my). I collect only the minimum
            data needed to understand how the site is used and to reply to messages you send me.
            There are no ads, no cookies, and no third-party analytics or tracking services.
          </p>
        </section>

        <section>
          <h2>What is collected</h2>
          <h3>Anonymous usage analytics</h3>
          <p>While you browse, the site sends small events to my own server (<code>/api/track</code>), which stores them in a Supabase database. Each event may include:</p>
          <ul>
            <li>The event type: page view, section viewed, project opened, GitHub / demo / social / email link clicked, resume downloaded, contact form submitted (the fact only, never its content), or a &quot;heartbeat&quot;</li>
            <li>The page path, the section or project involved, and the time of the event</li>
            <li>The referrer (the page that linked you here) and UTM campaign tags, if present</li>
            <li>A broad device category (mobile, tablet or desktop) based on your window width</li>
            <li>Your approximate country (two-letter code) derived by the hosting provider from your IP address</li>
            <li>Random anonymous IDs (see &quot;Browser storage&quot; below)</li>
          </ul>
          <p>
            A heartbeat is sent every 15 seconds while the tab is visible and you are active, up to a
            maximum per visit, so I can estimate how long visits last.
          </p>
          <p>
            <strong>Your IP address and browser user-agent are not stored</strong> in the analytics
            database. The user-agent is only checked on the fly to ignore bots.
          </p>

          <h3>Contact form</h3>
          <p>
            If you use the contact form, your name, email address, subject and message are sent through
            EmailJS to my email inbox so I can reply. They are not saved in the analytics database.
          </p>
        </section>

        <section>
          <h2>What is not collected</h2>
          <ul>
            <li>No cookies</li>
            <li>No advertising or cross-site tracking, and no browser fingerprinting</li>
            <li>No account or login for visitors</li>
            <li>No stored IP addresses or precise location</li>
          </ul>
        </section>

        <section>
          <h2>Browser storage</h2>
          <p>The site stores the following in your browser. These are not cookies and are never used to identify you personally.</p>
          <div className="privacy-table-wrap">
            <table className="privacy-table">
              <thead><tr><th>Key</th><th>Type</th><th>Purpose</th></tr></thead>
              <tbody>
                {STORAGE_ROWS.map(([key, type, purpose]) => (
                  <tr key={key}><td><code>{key}</code></td><td>{type}</td><td>{purpose}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Third-party services</h2>
          <ul>
            <li><strong>Vercel</strong> hosts the site and may keep standard server logs (including IP addresses) under its own policy.</li>
            <li><strong>Supabase</strong> stores the anonymous analytics data.</li>
            <li><strong>EmailJS</strong> delivers contact form messages to me.</li>
            <li><strong>GitHub</strong>: the GitHub statistics section loads data directly from GitHub&apos;s API in your browser, so GitHub can see your IP address as for any request to its servers.</li>
            <li>Links to LinkedIn, GitHub and project demos lead to external sites with their own policies.</li>
          </ul>
        </section>

        <section>
          <h2>Retention</h2>
          <p>
            Analytics events are kept for up to 12 months and then deleted automatically. Contact
            messages stay in my email inbox until I delete them, or until you ask me to.
          </p>
        </section>

        <section>
          <h2>Who can see the data</h2>
          <p>Only I (the site owner) can access the analytics data, through a password-protected admin area. It is used solely to improve this portfolio and is never sold or shared.</p>
        </section>

        <section>
          <h2>Your choices</h2>
          <ul>
            <li>Clear this site&apos;s data in your browser settings to remove the stored IDs; a new random ID is created on your next visit.</li>
            <li>Block the <code>/api/track</code> request with a content blocker; the site works the same without analytics.</li>
            <li>To have a message you sent deleted, email me at the address below.</li>
          </ul>
        </section>

        <section>
          <h2>Contact</h2>
          <p>Questions about this policy: <a href="mailto:kittipop.sanpho@gmail.com">kittipop.sanpho@gmail.com</a></p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>If what I collect changes, I will update this page and its &quot;Last updated&quot; date.</p>
        </section>
      </div>
    </main>
  );
}

export default PrivacyPolicy;
