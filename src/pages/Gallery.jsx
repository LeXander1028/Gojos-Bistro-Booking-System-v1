import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const { category } = useParams();
  
  // Create a robust 18-image dummy array for pagination demonstration
  // In a real scenario, you'd load image paths based on the 'category' parameter.
  const [images] = useState(Array.from({ length: 18 }).map((_, i) => 
    `https://placehold.co/600x400/1a1a1a/c19a6b?text=${category.toUpperCase()}+${i + 1}`
  ));

  const [loadedCount, setLoadedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;
  
  // Calculate pagination
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  // Reset loaded count when page changes to show loader again
  useEffect(() => {
    setLoadedCount(0);
  }, [currentPage, category]);

  const allLoaded = loadedCount >= currentImages.length;

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col pt-24 px-4 md:px-8 pb-12">
      <div className="max-w-7xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 text-sm font-bold tracking-widest uppercase">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="mb-12">
          <span className="text-primary font-serif italic text-sm mb-4 block">Gojo's Bistro Gallery</span>
          <h1 className="font-display font-black text-5xl md:text-6xl text-white uppercase leading-[0.9] tracking-tighter">
            {category}
          </h1>
          <div className="w-12 h-1 bg-primary mt-6"></div>
        </div>

        <div className="relative min-h-[50vh]">
          {!allLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-primary bg-[#111111] z-10">
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="text-xs font-semibold tracking-widest uppercase">Loading Images...</p>
            </div>
          )}

          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 transition-opacity duration-700 ${allLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {currentImages.map((src, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-xl border border-white/5 bg-slate-900/20 group">
                <img 
                  src={src} 
                  alt={`${category} ${indexOfFirstImage + idx + 1}`}
                  onLoad={() => setLoadedCount(prev => prev + 1)}
                  onError={() => setLoadedCount(prev => prev + 1)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button 
              variant="outline" 
              className="bg-transparent border-primary/20 text-primary hover:bg-primary hover:text-[#111111]"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} className="mr-2" /> Previous
            </Button>
            <span className="text-slate-400 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline"
              className="bg-transparent border-primary/20 text-primary hover:bg-primary hover:text-[#111111]"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
