import React, { useState, useEffect } from 'react';

import photo1 from '../assets/photo-1.png';
import photo2 from '../assets/photo-2.png';
import photo3 from '../assets/photo-3.png';
import photo4 from '../assets/photo-4.png';
import photo5 from '../assets/photo-5.png';

const photos = [photo1, photo2, photo3, photo4, photo5];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 6000); // Cycles every 6 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#111111] overflow-hidden">
      {photos.map((photo, index) => (
        <img
          key={index}
          src={photo}
          alt={`Carousel ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[6000ms] ease-out ${
            index === currentIndex ? 'opacity-40 scale-[1.2]' : 'opacity-0 scale-100'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
