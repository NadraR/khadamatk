import React, { useState, useEffect, useRef } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaUsers, FaHandshake, FaRocket, FaAward, FaStar, FaQuoteLeft, 
  FaLightbulb, FaCode, FaHeart, FaLinkedin, FaGithub, FaGlobe, 
  FaGraduationCap, FaPython, FaReact, FaDatabase, FaDocker, FaUserFriends
} from 'react-icons/fa';
import { SiDjango, SiPostgresql, SiJavascript, SiHtml5, SiCss3 } from 'react-icons/si';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const About = () => {
  const injected = useRef(false);
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (injected.current) return;
    const css = `
    :root {
      --primary:#0077ff;
      --primary-dark:#0056b3;
      --gradient:linear-gradient(135deg, #0077ff, #4da6ff);
      --bg:#f9fbff;
      --muted:#6b7280;
      --dark-bg:#1a1a1a;
      --dark-card:#2d2d2d;
      --dark-text:#e5e5e5;
      --dark-muted:#a0a0a0;
    }
    body { background:var(--bg); color:#0f172a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

    /* Dark Mode */
    body.dark-mode { background:var(--dark-bg) !important; color:var(--dark-text) !important; }

    /* About Page Specific Styles */
    .about-hero { 
      background: var(--gradient); 
      color: white; 
      padding: 120px 0 80px 0; 
      text-align: center; 
      border-radius: 0 0 2rem 2rem; 
      margin-bottom: 3rem;
    }
    .about-hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1.5rem; }
    .about-hero p { font-size: 1.3rem; opacity: 0.9; max-width: 800px; margin: 0 auto; }
    
    /* Cards */
    .about-card { 
      background: #fff; 
      border-radius: 1rem; 
      padding: 2rem; 
      box-shadow: 0 6px 18px rgba(0,0,0,.05); 
      transition: .3s; 
      height: 100%;
    }
    .about-card:hover { transform: translateY(-6px); box-shadow: 0 10px 25px rgba(0,0,0,.1); }
    
    /* Dark mode cards */
    body.dark-mode .about-card { 
      background: var(--dark-card); 
      color: var(--dark-text); 
      box-shadow: 0 6px 18px rgba(0,0,0,.3); 
    }
    body.dark-mode .about-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,.4); }
    
    /* Stats */
    .stat-card { 
      background: #fff; 
      border-radius: 1rem; 
      padding: 2rem; 
      text-align: center; 
      box-shadow: 0 6px 18px rgba(0,0,0,.05); 
      transition: .3s; 
    }
    .stat-card:hover { transform: translateY(-5px); }
    .stat-icon { font-size: 3rem; color: var(--primary); margin-bottom: 1rem; }
    .stat-number { font-size: 2.5rem; font-weight: 900; color: var(--primary); }
    .stat-label { color: var(--muted); font-weight: 500; }
    
    /* Dark mode stats */
    body.dark-mode .stat-card { 
      background: var(--dark-card); 
      color: var(--dark-text); 
      box-shadow: 0 6px 18px rgba(0,0,0,.3); 
    }
    body.dark-mode .stat-label { color: var(--dark-muted); }
    
    /* Team Cards */
    .team-card { 
      background: #fff; 
      border-radius: 1rem; 
      padding: 1.5rem; 
      box-shadow: 0 6px 18px rgba(0,0,0,.05); 
      transition: .3s; 
      text-align: center;
    }
    .team-card:hover { transform: translateY(-6px); box-shadow: 0 10px 25px rgba(0,0,0,.1); }
    .team-avatar { 
      width: 80px; 
      height: 80px; 
      border-radius: 50%; 
      background: var(--gradient); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-size: 1.5rem; 
      font-weight: bold; 
      margin: 0 auto 1rem; 
    }
    
    /* Dark mode team cards */
    body.dark-mode .team-card { 
      background: var(--dark-card); 
      color: var(--dark-text); 
      box-shadow: 0 6px 18px rgba(0,0,0,.3); 
    }
    body.dark-mode .team-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,.4); }
    
    /* Tech Cards */
    .tech-card { 
      background: #fff; 
      border-radius: 1rem; 
      padding: 1.5rem; 
      text-align: center; 
      box-shadow: 0 6px 18px rgba(0,0,0,.05); 
      transition: .3s; 
    }
    .tech-card:hover { transform: translateY(-6px); box-shadow: 0 10px 25px rgba(0,0,0,.1); }
    .tech-icon { font-size: 3rem; margin-bottom: 1rem; }
    
    /* Dark mode tech cards */
    body.dark-mode .tech-card { 
      background: var(--dark-card); 
      color: var(--dark-text); 
      box-shadow: 0 6px 18px rgba(0,0,0,.3); 
    }
    body.dark-mode .tech-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,.4); }
    
    /* Buttons */
    .btn-cta {
      background: var(--gradient);
      color: #fff !important;
      border:none;
      padding:.75rem 2rem;
      border-radius:50px;
      font-weight:600;
      transition:.3s;
    }
    .btn-cta:hover { opacity:.9; transform:scale(1.05); }
    
    
    /* Text colors in dark mode */
    body.dark-mode .text-muted { color: var(--dark-muted) !important; }
    body.dark-mode .text-primary { color: #60a5fa !important; }
    body.dark-mode h1, body.dark-mode h2, body.dark-mode h3, body.dark-mode h4, body.dark-mode h5, body.dark-mode h6 { color: var(--dark-text) !important; }
    `;
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    injected.current = true;
  }, []);

  // Load saved dark mode state and apply to body
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-mode', savedDarkMode);
  }, []);

  // Apply dark mode class to body when state changes
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);


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
    <div>
      <Navbar />
      

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>{t('Welcome to')} <span className="fw-bold">Khadamatk</span></h1>
          <p>
                {t('We are a team of web developers dedicated to providing the best digital services for our clients.')}
              </p>
          <div className="row g-3 justify-content-center mt-4">
            <div className="col-auto">
              <div className="d-flex align-items-center gap-2">
                <FaUsers className="fs-4" />
                <div>
                  <div className="fw-bold fs-4">6</div>
                  <small>{t('Developers')}</small>
                </div>
              </div>
                </div>
            <div className="col-auto">
              <div className="d-flex align-items-center gap-2">
                <FaGraduationCap className="fs-4" />
                <div>
                  <div className="fw-bold fs-4">100%</div>
                  <small>{t('graduates')}</small>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex align-items-center gap-2">
                <FaRocket className="fs-4" />
                <div>
                  <div className="fw-bold fs-4">2025</div>
                  <small>{t('batch')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="container my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-3">{t('Our Story')}</h2>
          <p className="text-muted">
            {t('We started our journey in 2025 as a team of ITI graduates, aiming to provide top-notch digital solutions.')}
          </p>
          </div>
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <div className="about-card">
              <p className="mb-3">
                {t('All of us are Full-Stack developers focused on quality, innovation, and client satisfaction.')}
              </p>
              <p>
                {t('When we started, we noticed a big challenge: clients had difficulty finding reliable service providers who offered fair prices, were nearby, and had trustworthy ratings. Our goal with this website is to bridge that gap—connecting clients with the best providers based on location, reviews, and quality, making the process simple, transparent, and efficient.')}
              </p>
            </div>
              </div>
          <div className="col-lg-6">
            <div className="about-card text-center">
              <FaGraduationCap className="display-1 text-primary mb-3" />
              <h4 className="fw-bold text-primary">ITI Graduates 2025</h4>
              <p className="text-muted">Information Technology Institute</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-3">{t('Our Achievements in Numbers')}</h2>
          <p className="text-muted">{t('Real impact, real growth — thanks to our clients and partners.')}</p>
          </div>
        <div className="row g-4">
            {stats.map((stat, index) => (
            <div key={index} className="col-sm-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
              </div>
            ))}
        </div>
      </section>

      {/* Technologies Section */}
      <section className="container my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-3">{t('Our Technologies')}</h2>
          <p className="text-muted">
            {t('We leverage modern technologies to build high-quality, scalable, and user-friendly applications.')}
          </p>
          </div>
        <div className="row g-4">
            {technologies.map((tech, index) => (
            <div key={index} className="col-sm-6 col-lg-4">
              <div className="tech-card">
                <div className="tech-icon" style={{ color: tech.color }}>
                  {tech.icon}
                </div>
                <h5 className="fw-bold mb-2">{tech.name}</h5>
                <p className="text-muted small mb-0">{tech.description}</p>
              </div>
              </div>
            ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="container my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-3">{t('about.team.title') || 'Meet Our Team'}</h2>
          <p className="text-muted">{t('about.team.subtitle') || 'Talented developers working together to create amazing solutions'}</p>
          </div>
        <div className="row g-4">
            {team.map((member, index) => (
            <div key={index} className="col-sm-6 col-lg-4">
              <div className="team-card">
                <div className="team-avatar">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                <h5 className="fw-bold mb-1">{member.name}</h5>
                <p className="text-primary small fw-bold mb-2">{member.role}</p>
                <div className="d-flex align-items-center justify-content-center gap-1 mb-3">
                  <FaGraduationCap className="text-primary" />
                  <small className="text-muted">ITI {member.iti}</small>
                </div>
                <p className="text-muted small mb-3">{member.bio}</p>
                <div className="d-flex flex-wrap gap-1 justify-content-center mb-3">
                      {member.skills.map((skill, i) => (
                    <span key={i} className="badge bg-light text-primary small">
                          {skill}
                        </span>
                      ))}
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <a href={member.social.linkedin} className="btn btn-sm btn-outline-primary">
                      <FaLinkedin />
                    </a>
                  <a href={member.social.github} className="btn btn-sm btn-outline-dark">
                      <FaGithub />
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="container my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-3">{t('about.values.title') || 'Our Values'}</h2>
          <p className="text-muted">{t('about.values.subtitle') || 'The principles that guide our work and relationships'}</p>
          </div>
        <div className="row g-4">
            {values.map((value, index) => (
            <div key={index} className="col-lg-4">
              <div className="about-card text-center">
                <div className="text-primary mb-3" style={{ fontSize: '3rem' }}>
                  {value.icon}
                </div>
                <h4 className="fw-bold mb-3">{value.title}</h4>
                <p className="text-muted">{value.description}</p>
              </div>
              </div>
            ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container my-5 text-center">
        <div className="about-card">
          <h2 className="fw-bold text-primary mb-3">{t('Join Our Community!')}</h2>
          <p className="text-muted mb-4">{t('Sign Up Now! and be part of our family')}</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button className="btn btn-cta" onClick={handleJoinAsProvider}>
              {t('join As Provider')}
            </button>
            <button className="btn btn-outline-primary" onClick={handleExploreServices}>
              {t('explore Services')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;