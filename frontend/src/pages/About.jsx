import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUsers, FaHandshake, FaRocket, FaAward, FaStar, FaQuoteLeft, 
  FaLightbulb, FaCode, FaHeart, FaLinkedin, FaGithub, FaGlobe, 
  FaGraduationCap, FaPython, FaReact, FaDatabase, FaDocker, FaUserFriends,
  FaSun, FaMoon, FaLanguage
} from 'react-icons/fa';
import { SiDjango, SiPostgresql, SiJavascript, SiHtml5, SiCss3 } from 'react-icons/si';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);

    // تهيئة الخلفية المتحركة
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const resizeCanvas = () => {
      // اجعل canvas يغطي الشاشة بشكل ثابت بدون التمرير
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = (window.innerHeight - 200) * dpr;
      canvas.style.width = '100vw';
      canvas.style.height = `calc(100vh - 200px)`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // إعادة تعيين التحويل
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // إنشاء جسيمات متحركة محسنة
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = darkMode ? 'rgba(59, 130, 246, 0.6)' : 'rgba(30, 64, 175, 0.6)';
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;

        // إضافة تأثير نبض للجسيمات
        this.currentSize = this.size + Math.sin(this.pulse) * 0.5;
        this.currentOpacity = this.opacity + Math.sin(this.pulse) * 0.2;

        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }
      }

      draw() {
        // رسم هالة حول الجسيم
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.currentSize * 2
        );
        gradient.addColorStop(0, this.color.replace('0.6', this.currentOpacity.toString()));
        gradient.addColorStop(1, this.color.replace('0.6', '0'));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // رسم الجسيم الأساسي
        ctx.fillStyle = this.color.replace('0.6', this.currentOpacity.toString());
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const createParticles = () => {
      particles = [];
      const particleCount = Math.min(120, Math.floor(canvas.width * canvas.height / 15000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const connectParticles = () => {
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3;
            const lineWidth = (1 - distance / maxDistance) * 1.5;
            
            // خط متدرج
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            const lineColor = darkMode 
              ? `rgba(59, 130, 246, ${opacity})` 
              : `rgba(30, 64, 175, ${opacity})`;
              
            gradient.addColorStop(0, lineColor);
            gradient.addColorStop(1, lineColor);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleJoinAsProvider = () => {
    navigate('/auth');
  };

  const handleExploreServices = () => {
    navigate('/');
  };

  const team = [
    { 
      name: t('Mohamed El-Wally'), 
      role: t('fullStack web developer'), 
      bio: t('about.bios.mohamed'),
      skills: ["Python", "Django", "React", "JavaScript","Figma"],
      social: { linkedin: "#", github: "#" },
      iti: "2025"
    },
    { 
      name: t('Sara Nour Allah'), 
      role: t('fullStack web developer'), 
      bio: t('about.bios.sara'),
      skills: ["Python", "Django", "React", "JavaScript","Figma"],
      social: { linkedin: "#", github: "#" },
      iti: "2025"
    },
    { 
      name: t('Reem Shoman'), 
      role: t('fullStack web developer'), 
      bio: t('about.bios.reem'),
      skills: ["Python", "Django", "React", "JavaScript","Figma"],
      social: { linkedin: "#", github: "#" },
      iti: "2025"
    },
    { 
      name: t('Rawan Azab'), 
      role: t('fullStack web developer'), 
      bio: t('about.bios.rowan'),
      skills: ["Python", "Django", "React", "JavaScript","Figma"],
      social: { linkedin: "#", github: "#" },
      iti: "2025"
    },
    { 
      name: t('Nadra Rahsad'), 
      role: t('fullStack web developer'), 
      bio: t('about.bios.nadra'),
      skills: ["Python", "Django", "React", "JavaScript","Figma"],
      social: { linkedin: "#", github: "#" },
      iti: "2025"
    },
    { 
      name: t('Samer Baher'), 
      role: t('fullStack web developer'), 
      bio: t('about.bios.samer'),
      skills: ["Python", "Django", "React", "JavaScript","Figma"],
      social: { linkedin: "#", github: "#" },
      iti: "2025"
    }
  ];

  const stats = [
    { icon: <FaUsers />, number: "50,000+", label: t('Satisfied Clients') },
    { icon: <FaHandshake />, number: "5,000+", label: t('Service Providers') },
    { icon: <FaRocket />, number: "100+", label: t('Available Services') },
    { icon: <FaAward />, number: "98%", label: t('Positive Ratings') }
  ];

  const values = [
    { icon: <FaHeart />, title: t('Customer Satisfaction'), description: t('We aim to achieve the highest level of client satisfaction through exceptional services.') },
    { icon: <FaLightbulb />, title: t('Innovation'), description: t('We develop creative solutions to make our clients’ daily lives easier.') },
    { icon: <FaCode />, title: t('Quality'), description: t('We commit to the highest quality standards in everything we deliver.') }
  ];

  const technologies = [
    { 
      name: "Python & Django", 
      description: t('about.tech.python'),
      icon: <div className="tech-icons"><FaPython className="tech-icon" /><SiDjango className="tech-icon" /></div>,
      color: "#3776AB"
    },
    { 
      name: "React", 
      description: t('about.tech.react'),
      icon: <FaReact className="tech-icon" />,
      color: "#61DAFB"
    },
    { 
      name: "PostgreSQL", 
      description: t('about.tech.postgresql'),
      icon: <SiPostgresql className="tech-icon" />,
      color: "#336791"
    },
    { 
      name: "JavaScript", 
      description: t('about.tech.javascript'),
      icon: <SiJavascript className="tech-icon" />,
      color: "#F7DF1E"
    },
    { 
      name: "HTML5", 
      description: t('about.tech.html'),
      icon: <SiHtml5 className="tech-icon" />,
      color: "#E34F26"
    },
    { 
      name: "CSS3", 
      description: t('about.tech.css'),
      icon: <SiCss3 className="tech-icon" />,
      color: "#1572B6"
    }
  ];

  return (
    <div className={`about-page ${darkMode ? 'dark-mode' : ''}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* أزرار التحكم */}
      <div className="control-buttons">
        <button className="control-button language-button" onClick={toggleLanguage} title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
          <FaLanguage className="control-icon" />
          <span className="control-text">{i18n.language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>
        <button className="control-button theme-button" onClick={toggleDarkMode} title={darkMode ? t('buttons.lightMode') : t('buttons.darkMode')}>
          {darkMode ? <FaSun className="control-icon" /> : <FaMoon className="control-icon" />}
        </button>
      </div>

      {/* خلفية متحركة محسنة */}
      <canvas 
        ref={canvasRef} 
        className="animated-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100%',
          maxHeight: 'calc(100vh - 80px)', // غطاء كل شيء ما عدا الفوتر (80px مثال لارتفاع الفوتر)
          zIndex: -1, // اجعل الخلفية خلف كل شيء
          pointerEvents: 'none',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)'
        }}
      />

      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>{t('Welcome to')} <span className="brand">Khadamatk</span></h1>
              <p className="hero-description">
                {t('We are a team of web developers dedicated to providing the best digital services for our clients.')}
              </p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="number">6</span>
                  <span className="label">{t('Developers')}</span>
                </div>
                <div className="hero-stat">
                  <span className="number">100%</span>
                  <span className="label">{t('graduates')}</span>
                </div>
                <div className="hero-stat">
                  <span className="number">2025</span>
                  <span className="label">{t('batch')}</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="team-photo-container no-image">
                <div className="team-placeholder">
                  <FaUserFriends className="placeholder-icon" />
                  <span>{t('about.team.ourTeam')}</span>
                </div>
                <div className="photo-overlay">
                  <span>{t('about.team.graduates')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم قصة المنصة */}
      <section className="story-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('Our Story')}</h2>
            <p>{t('We started our journey in 2025 as a team of ITI graduates, aiming to provide top-notch digital solutions.')}</p>
          </div>
          <div className="story-content">
            <div className="story-text">
              <p>{t('All of us are Full-Stack developers focused on quality, innovation, and client satisfaction.')}</p>
              <p>{t('When we started, we noticed a big challenge: clients had difficulty finding reliable service providers who offered fair prices, were nearby, and had trustworthy ratings. Our goal with this website is to bridge that gap—connecting clients with the best providers based on location, reviews, and quality, making the process simple, transparent, and efficient.')}</p>
              <div className="story-highlights">
                <div className="highlight">
                  <span className="highlight-number">2025</span>
                  <span className="highlight-text">{t('Founded')}</span>
                </div>
                <div className="highlight">
                  <span className="highlight-number">ITI</span>
                  <span className="highlight-text">{t('Information Technology Institute')}</span>
                </div>
                <div className="highlight">
                  <span className="highlight-number">6</span>
                  <span className="highlight-text">{t('Team Members')}</span>
                </div>
              </div>
            </div>
            <div className="story-image">
              <div className="team-photo-placeholder">
                <FaGraduationCap className="graduation-icon" />
                <p>{t('about.team.teamPhoto')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم الإحصائيات */}
      <section className="stats-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('Our Achievements in Numbers')}</h2>
            <p>{t('Real impact, real growth — thanks to our clients and partners.')}</p>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم التقنيات */}
      <section className="technologies-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('Our Technologies')}</h2>
            <p>{t('We leverage modern technologies to build high-quality, scalable, and user-friendly applications. Our stack includes Python and Django for powerful backend solutions, React for interactive frontends, and PostgreSQL for reliable data management. By combining these tools with best practices, we ensure our platform is fast, secure, and adaptable to your needs.')}</p>
          </div>
          <div className="technologies-grid">
            {technologies.map((tech, index) => (
              <div key={index} className="technology-card" style={{ '--tech-color': tech.color }}>
                <div className="tech-icon-container">
                  {tech.icon}
                </div>
                <h3>{tech.name}</h3>
                <p>{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم الفريق */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('about.team.title')}</h2>
            <p>{t('about.team.subtitle')}</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="card-header">
                  <div className="member-image">
                    <div className="avatar-placeholder">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="status-indicator"></div>
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p className="role">{member.role}</p>
                    <div className="iti-badge">
                      <FaGraduationCap className="graduation-icon" />
                      <span>{member.iti}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <p className="bio">{member.bio}</p>
                  
                  <div className="skills-section">
                    <h4 className="skills-title">المهارات</h4>
                    <div className="skills">
                      {member.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">
                          <span className="skill-dot"></span>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="social-links">
                    <a href={member.social.linkedin} aria-label="LinkedIn" className="social-link linkedin">
                      <FaLinkedin />
                      <span>LinkedIn</span>
                    </a>
                    <a href={member.social.github} aria-label="GitHub" className="social-link github">
                      <FaGithub />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم القيم */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('about.values.title')}</h2>
            <p>{t('about.values.subtitle')}</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>{t('Join Our Community!')}</h2>
          <p>{t('Sign Up Now! and be part of our family')}</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={handleJoinAsProvider}>{t('join As Provider')}</button>
            <button className="btn-secondary" onClick={handleExploreServices}>{t('explore Services')}</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;