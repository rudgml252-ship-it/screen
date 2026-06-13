import React, { useState } from 'react';
import styles from './EggStamp.module.css';

// Egg SVG
const EggIcon = () => (
  <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.eggSvg}>
    <ellipse cx="20" cy="26" rx="16" ry="20" fill="#FFF9C4" stroke="#F9C84A" strokeWidth="2"/>
    <ellipse cx="14" cy="20" rx="3" ry="4" fill="rgba(255,255,255,0.5)"/>
  </svg>
);

// Chick SVG (cute baby chick)
const ChickIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chickSvg}>
    {/* Body */}
    <ellipse cx="24" cy="32" rx="14" ry="12" fill="#FFEB3B"/>
    {/* Head */}
    <circle cx="24" cy="18" r="10" fill="#FFEB3B"/>
    {/* Eyes */}
    <circle cx="20" cy="16" r="2.5" fill="#333"/>
    <circle cx="28" cy="16" r="2.5" fill="#333"/>
    {/* Eye shine */}
    <circle cx="21" cy="15" r="1" fill="white"/>
    <circle cx="29" cy="15" r="1" fill="white"/>
    {/* Beak */}
    <path d="M21 21 L24 24 L27 21" fill="#FF8F00" stroke="#FF8F00" strokeWidth="0.5"/>
    {/* Wings */}
    <ellipse cx="10" cy="32" rx="5" ry="7" fill="#FFC107" transform="rotate(-15 10 32)"/>
    <ellipse cx="38" cy="32" rx="5" ry="7" fill="#FFC107" transform="rotate(15 38 32)"/>
    {/* Feet */}
    <path d="M18 43 L16 47 M18 43 L20 47" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 43 L28 47 M30 43 L32 47" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round"/>
    {/* Cheeks */}
    <ellipse cx="16" cy="20" rx="3" ry="2" fill="rgba(255,150,130,0.5)"/>
    <ellipse cx="32" cy="20" rx="3" ry="2" fill="rgba(255,150,130,0.5)"/>
    {/* Tuft on head */}
    <path d="M20 9 Q24 4 28 9" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const EggStamp = ({ isHatched, index, onHatch, readonly = false }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [justHatched, setJustHatched] = useState(false);

  const handleClick = () => {
    if (readonly || isHatched) return;
    // Shake animation before hatch
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setJustHatched(true);
      onHatch(index);
      setTimeout(() => setJustHatched(false), 600);
    }, 400);
  };

  return (
    <div
      className={`${styles.stampWrapper} ${isHatched ? styles.hatched : styles.unhatched} ${isShaking ? styles.shaking : ''} ${!readonly && !isHatched ? styles.clickable : ''}`}
      onClick={handleClick}
      title={isHatched ? '병아리 🐣' : '계란 🥚 (클릭하면 병아리가 태어나요!)'}
    >
      {isHatched ? (
        <div className={justHatched ? styles.chickPop : ''}>
          <ChickIcon />
        </div>
      ) : (
        <EggIcon />
      )}
    </div>
  );
};

export default EggStamp;
