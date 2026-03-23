import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiTarget, FiCalendar, FiCpu, FiCheck, FiArrowRight, FiZap, FiBarChart2, FiLayers, FiShield, FiGlobe, FiStar, FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useStudyContext } from '../context/StudyContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const Landing = () => {
  const navigate = useNavigate();
  const { login, user } = useStudyContext();

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      login({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
      });
      navigate('/dashboard');
    } catch {
      console.error('Login failed');
    }
  };

  if (user) navigate('/dashboard');

  const features = [
    { icon: <FiBookOpen />, title: 'Subject Organization', desc: 'Organize subjects and topics with color labels, difficulty levels, and progress tracking.' },
    { icon: <FiTarget />, title: 'Smart Study Tasks', desc: 'Create prioritized tasks with deadlines. Track progress and never miss an important topic.' },
    { icon: <FiBarChart2 />, title: 'Analytics Dashboard', desc: 'Visualize your progress with charts, completion rates, and weekly productivity graphs.' },
    { icon: <FiCalendar />, title: 'Revision Planner', desc: 'Schedule revision sessions automatically. Get reminders based on your completion dates.' },
    { icon: <FiCpu />, title: 'AI Study Assistant', desc: 'Generate summaries, practice questions, and flashcards using Google Gemini AI.' },
    { icon: <FiLayers />, title: 'Everything Organized', desc: 'Search, filter, and sort your study materials. Find what you need in seconds.' }
  ];

  const steps = [
    { num: 1, title: 'Add Your Subjects', desc: 'Create subjects and add topics with difficulty levels and notes.' },
    { num: 2, title: 'Plan Your Tasks', desc: 'Create study tasks with priorities, deadlines, and subject links.' },
    { num: 3, title: 'Track Progress', desc: 'Monitor completion rates and identify weak areas from the dashboard.' },
    { num: 4, title: 'AI-Powered Revision', desc: 'Generate summaries and flashcards. Let AI help you study smarter.' }
  ];

  const testimonials = [
    { name: 'Arjun Mehta', role: 'CSE Student, IIT Delhi', text: 'This app completely transformed my study routine. The AI flashcards are incredibly helpful for revision.', initials: 'AM' },
    { name: 'Priya Sharma', role: 'Medical Student', text: 'Finally a study tool that actually helps me organize topics and track what I\'ve covered. The analytics are great.', initials: 'PS' },
    { name: 'Ravi Kumar', role: 'GATE Aspirant', text: 'The revision planner alone saved me hours of planning. Plus the AI summaries are spot on for quick reviews.', initials: 'RK' }
  ];

  const barHeights = [40, 65, 45, 80, 55, 70, 90];

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <FiBookOpen />
          <span>StudyAI</span>
        </div>
        <ul className="landing-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="landing-nav-actions">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            shape="pill"
            text="signin"
            size="medium"
          />
        </div>
      </nav>

      <section className="hero">
        <motion.div className="hero-content" initial="hidden" animate="visible" variants={stagger}>
          <motion.div className="hero-badge" variants={fadeUp}>
            <FiZap /> AI-Powered Study Platform
          </motion.div>
          <motion.h1 variants={fadeUp}>
            Study Smarter,<br />Not <span className="highlight">Harder</span>
          </motion.h1>
          <motion.p variants={fadeUp}>
            Your personal AI study companion that helps you organize subjects, track progress, plan revisions, and generate study materials — all in one place.
          </motion.p>
          <motion.div className="hero-buttons" variants={fadeUp}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              shape="pill"
              text="signin_with"
              size="large"
            />
            <a href="#features" className="btn btn-secondary btn-lg" style={{ borderRadius: 30 }}>
              Learn More <FiArrowRight />
            </a>
          </motion.div>
          <motion.div className="hero-stats" variants={fadeUp}>
            <div className="hero-stat"><h4>10K+</h4><p>Active Students</p></div>
            <div className="hero-stat"><h4>50K+</h4><p>Tasks Completed</p></div>
            <div className="hero-stat"><h4>4.9</h4><p>User Rating</p></div>
          </motion.div>
        </motion.div>

        <motion.div className="hero-visual" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <div className="hero-dashboard">
            <div className="hero-dashboard-header">
              <div className="hero-dashboard-dot" style={{ background: '#ef4444' }} />
              <div className="hero-dashboard-dot" style={{ background: '#f59e0b' }} />
              <div className="hero-dashboard-dot" style={{ background: '#22c55e' }} />
            </div>
            <div className="hero-mini-stats">
              <div className="hero-mini-stat">
                <p>Tasks Completed</p>
                <h4 style={{ color: 'var(--primary)' }}>128</h4>
              </div>
              <div className="hero-mini-stat">
                <p>Completion Rate</p>
                <h4 style={{ color: 'var(--primary)' }}>87%</h4>
              </div>
              <div className="hero-mini-stat">
                <p>Subjects Active</p>
                <h4>6</h4>
              </div>
              <div className="hero-mini-stat">
                <p>Study Streak</p>
                <h4>14 Days</h4>
              </div>
            </div>
            <div className="hero-mini-chart">
              {barHeights.map((h, i) => (
                <motion.div key={i} className="hero-chart-bar"
                  style={{ background: i === 6 ? 'var(--primary)' : 'var(--primary-light)', height: `${h}%` }}
                  initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="landing-section" id="features">
        <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="overline">Features</p>
          <h2>Everything You Need to Excel</h2>
          <p>A comprehensive study management system with AI-powered tools to help you learn faster and retain more.</p>
        </motion.div>
        <motion.div className="features-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {features.map((f, i) => (
            <motion.div className="feature-card" key={i} variants={fadeUp}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="landing-section" id="how-it-works" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', margin: '0 40px' }}>
        <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="overline">How It Works</p>
          <h2>Get Started in Minutes</h2>
          <p>Four simple steps to transform your study workflow.</p>
        </motion.div>
        <motion.div className="steps-container" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {steps.map((s, i) => (
            <motion.div className="step-card" key={i} variants={fadeUp}>
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < 3 && <div className="step-connector" />}
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="landing-section" id="testimonials">
        <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="overline">Testimonials</p>
          <h2>Loved by Students</h2>
          <p>Here's what students have to say about StudyAI.</p>
        </motion.div>
        <motion.div className="testimonials-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {testimonials.map((t, i) => (
            <motion.div className="testimonial-card" key={i} variants={fadeUp}>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, j) => <FiStar key={j} fill="#f59e0b" />)}
              </div>
              <p>"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div className="testimonial-author-info">
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="landing-section" id="pricing">
        <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="overline">Pricing</p>
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that fits your needs.</p>
        </motion.div>
        <motion.div className="pricing-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div className="pricing-card" variants={fadeUp}>
            <h3>Free</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Perfect to get started</p>
            <div className="pricing-price">$0<span>/mo</span></div>
            <ul className="pricing-features">
              <li><FiCheck /> Up to 5 subjects</li>
              <li><FiCheck /> Basic task management</li>
              <li><FiCheck /> Progress dashboard</li>
              <li><FiCheck /> 10 AI queries/day</li>
            </ul>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</button>
          </motion.div>
          <motion.div className="pricing-card featured" variants={fadeUp}>
            <div className="pricing-badge">Most Popular</div>
            <h3>Pro</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>For serious students</p>
            <div className="pricing-price">$9<span>/mo</span></div>
            <ul className="pricing-features">
              <li><FiCheck /> Unlimited subjects</li>
              <li><FiCheck /> Advanced analytics</li>
              <li><FiCheck /> Revision planner</li>
              <li><FiCheck /> Unlimited AI queries</li>
              <li><FiCheck /> Priority support</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Start Free Trial</button>
          </motion.div>
          <motion.div className="pricing-card" variants={fadeUp}>
            <h3>Team</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>For study groups</p>
            <div className="pricing-price">$19<span>/mo</span></div>
            <ul className="pricing-features">
              <li><FiCheck /> Everything in Pro</li>
              <li><FiCheck /> Shared study groups</li>
              <li><FiCheck /> Collaborative notes</li>
              <li><FiCheck /> Admin dashboard</li>
            </ul>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Contact Sales</button>
          </motion.div>
        </motion.div>
      </section>

      <motion.section className="cta-section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h2>Ready to Transform Your Studies?</h2>
        <p>Join thousands of students who are already studying smarter with AI-powered tools.</p>
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            shape="pill"
            text="signup_with"
            size="large"
          />
        </div>
      </motion.section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><FiBookOpen /> StudyAI</h3>
            <p>Your AI-powered study companion. Organize, learn, and ace your exams with intelligent tools.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 StudyAI. All rights reserved.</p>
          <div className="footer-social">
            <a href="#"><FiTwitter /></a>
            <a href="#"><FiGithub /></a>
            <a href="#"><FiLinkedin /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
