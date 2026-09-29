import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6';
import { close, menu } from '../assets';
import { navLinks } from '../constants';
import { styles } from '../styles';

const socialLinks = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/zaeemqureshi/', icon: FaLinkedin },
  { name: 'GitHub', href: 'https://github.com/qzaeem', icon: FaGithub },
  { name: 'Instagram', href: 'https://www.instagram.com/zaeem.q', icon: FaInstagram },
  { name: 'Facebook', href: 'https://www.facebook.com/muhammad.z.qureshi.14', icon: FaFacebook },
  { name: 'X', href: 'https://x.com/zq_zaeem', icon: FaXTwitter },
];

const SocialLinks = ({ className }) => (
  <div className={`flex items-center gap-4 ${className || ''}`}>
    {socialLinks.map(({ name, href, icon: Icon }) => (
      <a
        key={name}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={name}
        className="text-white hover:text-[#915EFF] transition-colors"
      >
        <Icon size={20} />
      </a>
    ))}
  </div>
);

const Navbar = () => {
  const [active, setActive] = useState('');
  const [toggle, setToggle] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const [overScenes, setOverScenes] = useState(false);

  const navRef = useRef(null);
  const containerRef = useRef(null);
  const measureRef = useRef(null);

  const toggleResume = () => {
    const resumeUrl = `${import.meta.env.BASE_URL}Resume.pdf`;
    window.open(resumeUrl);
  };

  useEffect(() => {
    if (toggle) {
      setActive('');
    }
  }, [toggle]);

  // Hide while full-screen content marked with data-hide-nav (the project scenes) sits
  // under the navbar and fills at least half the viewport. The half-viewport rule lets
  // the navbar return at the page bottom, where the last scene can't scroll fully away.
  useEffect(() => {
    const target = document.querySelector('[data-hide-nav]');
    if (!target) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, bottom } = target.getBoundingClientRect();
      setOverScenes(top <= navRef.current.offsetHeight && bottom >= window.innerHeight / 2);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    if (overScenes) setToggle(false);
  }, [overScenes]);

  // The desktop row's required width varies with content (nav links, social
  // icons), so we measure it against the available space instead of relying
  // on a fixed breakpoint, which let items get clipped at in-between widths.
  useLayoutEffect(() => {
    const checkFit = () => {
      const container = containerRef.current;
      const measure = measureRef.current;
      if (!container || !measure) return;
      setIsCompact(measure.scrollWidth > container.clientWidth);
    };

    checkFit();

    const resizeObserver = new ResizeObserver(checkFit);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (measureRef.current) resizeObserver.observe(measureRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const Logo = () => (
    <Link
      to="/"
      className="flex items-center gap-2"
      onClick={() => {
        setActive('');
        window.scrollTo(0, 0);
      }}
    >
      <p className="text-white text-[20px] font-bold cursor-pointer flex whitespace-nowrap">
        ZAEEM&nbsp;
        <span>QURESHI</span>
      </p>
    </Link>
  );

  const renderNavLinks = (isSecondary) => (
    <ul className="list-none flex flex-row gap-6">
      {navLinks.map((link) => (
        <li
          key={link.id}
          className={`${
            active === link.title ? 'text-white' : isSecondary ? 'text-secondary' : 'text-white'
          } hover:text-white text-[20px] font-medium cursor-pointer whitespace-nowrap`}
          onClick={() => {
            setActive(link.title);
            if (isSecondary) {
              setToggle(false);
            }
          }}
        >
          <a href={`#${link.id}`}>{link.title}</a>
        </li>
      ))}
      <li
        className={`text-${
          isSecondary ? 'secondary' : 'white'
        } hover:text-white text-[20px] font-medium cursor-pointer whitespace-nowrap`}
      >
        <button onClick={toggleResume}>Resume</button>
      </li>
    </ul>
  );

  return (
    <>
      <nav
        ref={navRef}
        className={`${styles.paddingX} w-full flex items-center py-3 fixed top-0 z-20 bg-primary transition-opacity duration-500 ${
          overScenes ? 'opacity-0 pointer-events-none focus-within:opacity-100 focus-within:pointer-events-auto' : 'opacity-100'
        }`}
      >
        <div ref={containerRef} className="w-full flex justify-between items-center max-w-7xl mx-auto">
          <Logo />

          {!isCompact && (
            <div className="flex items-center gap-8">
              {renderNavLinks(false)}
              <SocialLinks />
            </div>
          )}

          {isCompact && (
            <div className="flex flex-1 justify-end items-center">
              <img
                src={toggle ? close : menu}
                alt="menu"
                className="w-[28px] h-[18px] object-contain cursor-pointer"
                onClick={() => setToggle(!toggle)}
              />
              <div
                className={`p-4 bg-primary/90 backdrop-blur-md absolute top-14 right-0 mx-2 my-2 min-w-[120px] z-10 rounded-xl flex-col items-end gap-4 ${
                  toggle ? 'flex' : 'hidden'
                }`}
              >
                {renderNavLinks(true)}
                <SocialLinks />
              </div>
            </div>
          )}

          {/* Off-screen replica of the desktop row, used only to measure whether it fits */}
          <div
            ref={measureRef}
            aria-hidden="true"
            className="fixed top-[-9999px] left-[-9999px] invisible flex items-center gap-8"
          >
            <Logo />
            {renderNavLinks(false)}
            <SocialLinks />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
