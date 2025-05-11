import React from "react";
import Image from "next/image";
import styles from "./HeroBanner.module.css";

import type { StaticImageData } from "next/image";

interface HeroBannerProps {
  photoSrc: string | StaticImageData;
  photoAlt?: string;
  heroTitle: string;
  heroSubtitle?: string;
  children?: React.ReactNode;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  photoSrc,
  photoAlt = "Hero Image",
  heroTitle,
  heroSubtitle,
  children,
}) => {
  return (
    <>
      <div className={styles.heroBanner}>
      <div className={styles.photoWrapper}>
        <Image
          src={photoSrc}
          alt={photoAlt}
          width={120}
          height={120}
          className={styles.photo}
          priority
        />
      </div>
      <div className={styles.textWrapper}>
        <h1 className={styles.heroTitle}>{heroTitle}</h1>
        {heroSubtitle && <p className={styles.heroSubtitle}>{heroSubtitle}</p>}
        {children}
      </div>
      </div>
    </>
  );
};

export default HeroBanner;
