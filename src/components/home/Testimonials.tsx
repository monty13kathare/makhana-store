"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  X,
  MessageSquarePlus,
  Check,
} from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

/* --------------------------------------------------------------------------
   Review Types & Initial Curated Data (Matching Luxury Theme)
   -------------------------------------------------------------------------- */
type Review = {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  flavor: string;
  date: string;
  helpful: number;
};

type Slide = {
  id: number;
  category: string;
  reviews: Review[];
};

const initialSlides: Slide[] = [
  {
    id: 1,
    category: "Gourmet Flavours",
    reviews: [
      {
        id: "r1",
        quote:
          "The flavor profile is delicate and genuinely gourmet. It feels like enjoying a luxury snack brand rather than a regular bagged lotus seed.",
        name: "Elena M.",
        role: "Verified Buyer",
        location: "New York, USA",
        avatar: "/img/avatar-1.jpg",
        rating: 5,
        flavor: "Truffle & Sea Salt",
        date: "2 days ago",
        helpful: 24,
      },
      {
        id: "r2",
        quote:
          "The best packaging I have seen for makhana. Incredibly crisp, zero greasy feel, and the perfect healthy evening snacking indulgence.",
        name: "Ryan H.",
        role: "Verified Buyer",
        location: "London, UK",
        avatar: "/img/avatar-2.jpg",
        rating: 5,
        flavor: "Himalayan Pink Salt",
        date: "5 days ago",
        helpful: 19,
      },
      {
        id: "r3",
        quote:
          "A smooth online purchase experience and the presentation box exceeded expectations from the moment it arrived. Truly five-star quality.",
        name: "Sophia K.",
        role: "Verified Buyer",
        location: "Dubai, UAE",
        avatar: "/img/avatar-3.jpg",
        rating: 5,
        flavor: "The Gifting Box",
        date: "1 week ago",
        helpful: 31,
      },
    ],
  },
  {
    id: 2,
    category: "Packaging & Delivery",
    reviews: [
      {
        id: "r4",
        quote:
          "Peri Peri has the absolute perfect crunch and spicy kick. Replaced all my junk potato chips with these healthy roasted fox nuts!",
        name: "Marcus V.",
        role: "Verified Buyer",
        location: "Berlin, DE",
        avatar: "/img/avatar-2.jpg",
        rating: 5,
        flavor: "Peri Peri Roast",
        date: "2 weeks ago",
        helpful: 15,
      },
      {
        id: "r5",
        quote:
          "Ordered the luxury sampler for festive gifting. The tin canister looks so regal on the dining table. Guests couldn't stop asking where I got it.",
        name: "Ananya S.",
        role: "Verified Buyer",
        location: "Toronto, CA",
        avatar: "/img/avatar-1.jpg",
        rating: 5,
        flavor: "Luxury Sampler Pack",
        date: "3 weeks ago",
        helpful: 28,
      },
      {
        id: "r6",
        quote:
          "Tracked international shipment took just 4 business days to Singapore. The multi-barrier nitrogen seal kept every single kernel ultra-crunchy.",
        name: "David L.",
        role: "Verified Buyer",
        location: "Singapore",
        avatar: "/img/avatar-3.jpg",
        rating: 5,
        flavor: "Worldwide Express",
        date: "1 month ago",
        helpful: 22,
      },
    ],
  },
  {
    id: 3,
    category: "Ingredients & Craft",
    reviews: [
      {
        id: "r7",
        quote:
          "Zero palm oil, roasted in authentic A2 cow ghee. As a fitness enthusiast, this is the cleanest macro-friendly superfood snack on the market.",
        name: "Priya R.",
        role: "Verified Buyer",
        location: "Sydney, AU",
        avatar: "/img/avatar-1.jpg",
        rating: 5,
        flavor: "A2 Ghee Roasted",
        date: "1 month ago",
        helpful: 37,
      },
      {
        id: "r8",
        quote:
          "The Smoked Paprika & Cheddar is on par with Michelin-star appetizers. Unbelievable rich umami aroma with zero trans fat or artificial nasties.",
        name: "Oliver B.",
        role: "Verified Buyer",
        location: "San Francisco, USA",
        avatar: "/img/avatar-2.jpg",
        rating: 5,
        flavor: "Smoked Paprika & Cheddar",
        date: "2 months ago",
        helpful: 18,
      },
      {
        id: "r9",
        quote:
          "Customer support was incredibly attentive when I needed a custom greeting note. World-class brand experience from checkout to unboxing.",
        name: "Chloe T.",
        role: "Verified Buyer",
        location: "Paris, FR",
        avatar: "/img/avatar-3.jpg",
        rating: 5,
        flavor: "Custom Gift Order",
        date: "2 months ago",
        helpful: 26,
      },
    ],
  },
];

export default function Testimonials() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});

  // Write Review Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewFlavor, setReviewFlavor] = useState("Truffle Black Pepper");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittedToast, setSubmittedToast] = useState(false);

  // Auto-slide every 6 seconds when not paused
  useEffect(() => {
    if (isPaused || isModalOpen) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, isModalOpen, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Toggle helpful like count
  const handleVoteHelpful = (reviewId: string, initialCount: number) => {
    if (userVoted[reviewId]) return;
    setUserVoted((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] ?? initialCount) + 1,
    }));
  };

  // Submit new review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newReview: Review = {
      id: `user-${Date.now()}`,
      name: reviewName.trim(),
      role: "Verified Buyer",
      location: reviewLocation.trim() || "Global Customer",
      avatar: "/img/avatar-1.jpg",
      rating: reviewRating,
      flavor: reviewFlavor,
      quote: reviewComment.trim(),
      date: "Just now",
      helpful: 1,
    };

    // Prepend new review to the first slide
    setSlides((prev) => {
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        reviews: [newReview, ...updated[0].reviews.slice(0, 2)],
      };
      return updated;
    });

    setCurrentSlide(0);
    setSubmittedToast(true);
    setTimeout(() => {
      setSubmittedToast(false);
      setIsModalOpen(false);
      setReviewName("");
      setReviewLocation("");
      setReviewComment("");
      setReviewRating(5);
    }, 1800);
  };

  const activeReviews = slides[currentSlide]?.reviews || slides[0].reviews;

  return (
    <section
      id="reviews"
      className="relative py-16 lg:py-24 bg-[#0a0a0a] text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background warm golden ambient bloom */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.06)_0%,transparent_70%)] blur-3xl -z-0" />

      <div className="container-x relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16 items-start">
          
          {/* Left Column: Heading, Rating Card, and Functional Slider Controls */}
          <div className="flex flex-col justify-between h-full">
            <Reveal>
              <p className="text-[13.5px] font-medium tracking-wide text-[#8da366]">
                Customer reviews
              </p>

              {/* Title with Josefin Sans */}
              <h2 className="mt-2 text-[32px] sm:text-[44px] font-heading font-medium tracking-tight text-white leading-[1.12]">
                A premium experience people remember.
              </h2>

              {/* Description */}
              <p className="mt-4 max-w-md text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#8e8e8e]">
                Read genuine reviews from over 2,800+ customers worldwide who have upgraded their daily snacking to artisanal lotus seeds.
              </p>

              {/* Overall Score Rating Card (Theme Aligned) */}
              <div className="mt-6 flex items-center gap-4 rounded-[20px] border border-white/10 bg-[#161616] p-4.5 max-w-md shadow-lg">
                <div className="flex flex-col items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 px-3.5 py-2 text-center">
                  <span className="font-heading font-bold text-[28px] leading-none text-amber-400">
                    4.9
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80 mt-0.5">
                    Score
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-1 text-[12.5px] font-medium text-white/90">
                    Based on 2,840+ verified global ratings
                  </p>
                  <p className="text-[11px] text-[#717171]">
                    98.4% recommendation rate across 20+ countries
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Interactive Functional Controls Row */}
            <div className="mt-10 pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 max-w-md">
              
              {/* Interactive Dots Indicator */}
              <div className="flex items-center gap-2" role="tablist" aria-label="Review slide pagination">
                {slides.map((slide, i) => {
                  const isActive = currentSlide === i;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Go to slide ${i + 1}: ${slide.category}`}
                      aria-selected={isActive}
                      role="tab"
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "w-8 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                          : "w-2 bg-white/20 hover:bg-white/50"
                      }`}
                    />
                  );
                })}
                <span className="ml-2 font-mono text-[12px] text-white/40">
                  0{currentSlide + 1} / 0{slides.length}
                </span>
              </div>

              {/* Prev / Next Buttons + Write Review CTA */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-amber-300 transition-all hover:bg-amber-400 hover:text-black active:scale-95 cursor-pointer shadow-sm"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  <span>Review</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Reviews Track with Luxury Graphite Cards */}
          <div className="relative min-h-[460px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex flex-col gap-4"
              >
                {activeReviews.map((t) => {
                  const voteCount = helpfulVotes[t.id] ?? t.helpful;
                  const hasVoted = Boolean(userVoted[t.id]);

                  return (
                    <motion.figure
                      key={t.id}
                      whileHover={{ y: -3 }}
                      className="group relative flex flex-col justify-between rounded-[22px] border border-white/10 bg-[#161616] p-5 sm:p-6 transition-all duration-300 hover:border-amber-400/40 hover:bg-[#1a1a1a] shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                    >
                      <div>
                        {/* Top Metadata: 5 Golden Stars + Product Flavor Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(t.rating)].map((_, idx) => (
                              <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-amber-300/90">
                            {t.flavor}
                          </span>
                        </div>

                        {/* Quote Text in Clean High-Contrast White */}
                        <blockquote className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-white/90">
                          &ldquo;{t.quote}&rdquo;
                        </blockquote>
                      </div>

                      {/* Bottom Row: User Avatar, Name, Verified Badge, Date & Helpful Button */}
                      <figcaption className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/20 bg-neutral-800">
                            <Image
                              src={t.avatar}
                              alt={t.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-[13.5px] sm:text-[14px] font-bold text-white leading-tight">
                              {t.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                                <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                                {t.role}
                              </span>
                              <span className="text-[11px] text-white/30">&bull;</span>
                              <span className="text-[11px] text-[#717171]">{t.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Thumbs Up / Helpful Action */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVoteHelpful(t.id, t.helpful)}
                            disabled={hasVoted}
                            title={hasVoted ? "You marked this as helpful" : "Helpful review"}
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                              hasVoted
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                : "text-white/40 hover:text-amber-400 hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>{voteCount}</span>
                          </button>
                        </div>
                      </figcaption>
                    </motion.figure>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Write Review Modal (Fully Functional Dark Luxury Form)
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/15 bg-[#141414] p-6 sm:p-8 shadow-2xl text-white z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-[11.5px] font-semibold text-amber-300">
                  <Star className="h-3 w-3 fill-amber-400" />
                  Verified Feedback
                </span>
                <h3 className="mt-2.5 font-heading text-[24px] font-bold text-white tracking-tight">
                  Write a Customer Review
                </h3>
                <p className="mt-1 text-[13px] text-[#8e8e8e]">
                  Share your taste and snacking experience with our global makhana community.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star Picker */}
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= (reviewHoverRating || reviewRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/20"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-[12.5px] font-semibold text-amber-400">
                      {reviewRating === 5 ? "5.0 - Exceptional" : `${reviewRating}.0 Stars`}
                    </span>
                  </div>
                </div>

                {/* Name & Location Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena M."
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[13.5px] text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1">
                      City, Country
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New York, USA"
                      value={reviewLocation}
                      onChange={(e) => setReviewLocation(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[13.5px] text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Flavour Choice */}
                <div>
                  <label className="block text-[12px] font-medium text-white/70 mb-1">
                    Product / Flavour Reviewed
                  </label>
                  <select
                    value={reviewFlavor}
                    onChange={(e) => setReviewFlavor(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#1c1c1c] px-3.5 py-2.5 text-[13.5px] text-white focus:border-amber-400 focus:outline-none transition-colors"
                  >
                    <option value="Classic Himalayan Salt">Classic Himalayan Salt</option>
                    <option value="Peri Peri Roast">Peri Peri Roast</option>
                    <option value="Truffle Black Pepper">Truffle Black Pepper</option>
                    <option value="Smoked Paprika & Cheddar">Smoked Paprika & Cheddar</option>
                    <option value="The Gifting Box">The Premium Gifting Box</option>
                    <option value="Variety Sampler">4-Flavour Variety Combo</option>
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[12px] font-medium text-white/70 mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us what you liked about the crunch, freshness, seasoning, or packaging..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 p-3.5 text-[13.5px] text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittedToast}
                    className="w-full rounded-full bg-amber-400 py-3 text-[14px] font-bold text-black transition-all hover:bg-amber-300 hover:shadow-[0_8px_24px_rgba(245,158,11,0.35)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submittedToast ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Review Published!</span>
                      </>
                    ) : (
                      <span>Submit Verified Review</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
