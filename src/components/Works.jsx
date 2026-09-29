import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import ScrollClip from "./scroll-clip/ScrollClip";

// Section height 250vh: the first 100vh of scroll slides the scene in, the remaining 150vh keep it pinned.
const TEXT_IN = [0.42, 0.56];

const ProjectScene = ({ index, count, name, description, tags, image, clip, links }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // Smooths coarse mouse-wheel steps so the clip glides between frames.
  const clipProgress = useSpring(scrollYProgress, { stiffness: 180, damping: 36, restDelta: 0.0005 });
  const textOpacity = useTransform(scrollYProgress, TEXT_IN, [0, 1]);
  const textY = useTransform(scrollYProgress, TEXT_IN, [48, 0]);

  return (
    <section ref={ref} className="relative h-[250vh]">
      <div className="clip-stage sticky top-0 w-full overflow-hidden">
        <ScrollClip clip={clip} poster={image} progress={clipProgress} alt={name} />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/4 z-[2] bg-gradient-to-b from-primary to-transparent" />

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className={`${styles.paddingX} absolute inset-x-0 bottom-0 z-[3] pb-16 sm:pb-24`}
        >
          <div className="max-w-7xl mx-auto">
            <p className="sm:text-[18px] text-[14px] text-white-100/80 uppercase tracking-wider">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-white font-black text-[32px] sm:text-[48px] lg:text-[64px] leading-tight max-w-4xl">
              {name}
            </h3>
            <p className="mt-4 text-white-100/90 text-[15px] sm:text-[18px] max-w-2xl leading-relaxed">
              {description}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {tags.map((tag) => (
                <p key={tag.name} className={`text-[14px] sm:text-[16px] ${tag.color}`}>
                  {tag.name}
                </p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] px-4 py-1.5 rounded-full border border-white/40 text-white-100 bg-black/30 backdrop-blur-sm hover:border-white hover:bg-white/10 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const WorksIntro = SectionWrapper(
  () => (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>My work</p>
        <h2 className={styles.sectionHeadText}>Projects</h2>
      </motion.div>
      <div className="w-full flex">
        <motion.p variants={fadeIn("", "", 0.1)} className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]">
          Following projects showcase my skills and experience. Each project includes links to the platform or store where it's available.
        </motion.p>
      </div>
    </>
  ),
  "work",
);

const Works = () => (
  <>
    <WorksIntro />
    <div data-hide-nav>
      {projects.map((project, index) => (
        <ProjectScene key={project.name} index={index} count={projects.length} {...project} />
      ))}
    </div>
  </>
);

export default Works;
