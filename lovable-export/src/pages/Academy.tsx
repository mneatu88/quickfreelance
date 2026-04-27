import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreateCourseModal from "@/components/academy/CreateCourseModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  TrendingUp,
  Palette,
  Megaphone,
  Code2,
  Bot,
  Briefcase,
  PenTool,
  Star,
  Clock,
  Users,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEO from "@/components/SEO";
import PublishedCoursesSection from "@/components/academy/PublishedCoursesSection";

import { featuredCourses } from "@/data/featuredCourses";

const categories = [
  { name: "Design", icon: Palette, count: 48, color: "from-amber-500/20 to-orange-500/10" },
  { name: "Marketing", icon: Megaphone, count: 32, color: "from-rose-500/20 to-amber-500/10" },
  { name: "Web Development", icon: Code2, count: 56, color: "from-blue-500/20 to-cyan-500/10" },
  { name: "AI Tools", icon: Bot, count: 24, color: "from-violet-500/20 to-purple-500/10" },
  { name: "Business", icon: Briefcase, count: 38, color: "from-emerald-500/20 to-teal-500/10" },
  { name: "Copywriting", icon: PenTool, count: 21, color: "from-amber-500/20 to-yellow-500/10" },
];

const Academy = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const featuredRef = useRef<HTMLElement | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of categories) {
      counts[c.name] = featuredCourses.filter((course) => course.category === c.name).length;
    }
    return counts;
  }, []);

  const visibleCourses = useMemo(() => {
    if (!activeCategory) return featuredCourses;
    return featuredCourses.filter((course) => course.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryClick = (name: string) => {
    setActiveCategory((prev) => (prev === name ? null : name));
    window.dispatchEvent(new CustomEvent("academy:filter", { detail: { category: name } }));
    setTimeout(() => {
      featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };
  return (
    <div className="min-h-screen relative">
      <CreateCourseModal open={createOpen} onOpenChange={setCreateOpen} />
      {/* Fixed subtle background - same as homepage */}

      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=1080&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "brightness(0.12) blur(3px)",
        }}
      />
      <div className="fixed inset-0 z-[1] bg-background/85" />
      {/* Noise texture */}
      <div className="fixed inset-0 z-[2] pointer-events-none opacity-[0.015]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      {/* Page content */}
      <div className="relative z-10">
        <SEO
          title="Academy – Learn from the best freelancers | QuickFreelance"
          description="Courses created by freelancers, for freelancers. Develop new skills or share your own expertise on QuickFreelance Academy."
          canonical="https://quickfreelance.co.uk/academy"
        />
        <Navbar />

      <main className="pt-28 md:pt-32">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-background to-background dark:from-amber-500/5 dark:via-background dark:to-background pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 py-24 md:py-36 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-8 bg-amber-50 text-amber-900 border border-amber-200/60 hover:bg-amber-50 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20">
                <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                QuickFreelance Academy
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-7 text-foreground leading-[1.05]">
                Academia Freelance – Learn from the best, <span className="text-primary">teach what you know</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
                Courses created by freelancers, for freelancers. Develop your skills or share them with others.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <a href="#courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </a>
                </Button>
                <Button variant="hero-outline" size="lg" onClick={() => setCreateOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Your Course
                </Button>
              </div>

              <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
                {[
                  { label: "Courses", value: "120+" },
                  { label: "Students", value: "8,400+" },
                  { label: "Mentors", value: "85+" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Courses */}
        <section
          id="courses"
          ref={featuredRef}
          className="container mx-auto px-4 sm:px-6 py-32 md:py-40 scroll-mt-28"
        >
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4 max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">Featured Courses</h2>
              <p className="text-muted-foreground text-base md:text-lg">Hand-picked courses from top freelance mentors.</p>
              {activeCategory && (
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Filtered by</span>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium hover:bg-primary/15 transition-colors"
                    aria-label="Clear category filter"
                  >
                    {activeCategory}
                    <span className="ml-0.5 text-base leading-none">×</span>
                  </button>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" asChild>
              <a href="#browse-courses">View all <ArrowRight className="h-4 w-4 ml-1" /></a>
            </Button>
          </div>

          {visibleCourses.length === 0 ? (
            <div className="max-w-6xl mx-auto rounded-3xl border border-dashed border-border/60 bg-card/40 backdrop-blur-sm p-14 text-center">
              <p className="text-foreground font-medium mb-1">No featured courses in {activeCategory} yet</p>
              <p className="text-sm text-muted-foreground mb-6">Check back soon — or explore all featured courses.</p>
              <Button variant="hero-outline" size="sm" onClick={() => setActiveCategory(null)}>
                Show all courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
              {visibleCourses.map((course, i) => {
                const Icon = course.icon;
                return (
                  <motion.div
                    key={course.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link
                      to={`/course/${course.slug}`}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
                    >
                      <Card className="group h-full rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-[0_28px_70px_-22px_hsl(var(--primary)/0.32)] hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden">
                        <div className="relative h-52 bg-gradient-to-br from-amber-100 via-amber-50 to-background dark:from-amber-500/15 dark:via-amber-500/5 dark:to-background flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.14),_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative h-24 w-24 rounded-3xl bg-background/70 backdrop-blur-md shadow-xl shadow-primary/5 border border-border/40 flex items-center justify-center group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-500">
                            <Icon className="h-12 w-12 text-primary" />
                          </div>
                          <Badge variant="secondary" className="absolute top-4 left-4 text-[11px] backdrop-blur-sm bg-background/80 border border-border/60">
                            {course.level}
                          </Badge>
                          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[11px] font-semibold shadow-md shadow-primary/20">
                            {course.price}
                          </Badge>
                        </div>
                        <CardContent className="p-7">
                          <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6">by {course.instructor}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-5 border-t border-border/40">
                            <div className="flex items-center gap-1.5">
                              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                              <span className="font-medium text-foreground">{course.rating}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {course.duration}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              {course.students.toLocaleString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Browse all published courses (real data from DB) */}
        <PublishedCoursesSection />

        {/* Popular Categories */}
        <section className="border-y border-border/30 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 py-32 md:py-40">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">Popular Categories</h2>
              <p className="text-muted-foreground text-base md:text-lg">Explore courses across the most in-demand freelance skills.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-7 max-w-6xl mx-auto">
              {categories.map((cat, i) => {
                const Icon = cat.icon;
                const count = cat.count;
                const isActive = activeCategory === cat.name;
                return (
                  <motion.button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryClick(cat.name)}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
                    aria-pressed={isActive}
                    aria-label={`Filter featured courses by ${cat.name}`}
                  >
                    <Card
                      className={`group relative h-full overflow-hidden cursor-pointer border transition-all duration-500 bg-gradient-to-br ${cat.color} ${
                        isActive
                          ? "border-primary/60 shadow-[0_22px_50px_-20px_hsl(var(--primary)/0.45)] -translate-y-1.5"
                          : "border-border/50 hover:border-primary/40 hover:-translate-y-2 hover:shadow-[0_24px_55px_-22px_hsl(var(--primary)/0.35)]"
                      }`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.22),_transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="relative p-9 md:p-10 text-center">
                        <div className="relative mx-auto mb-6 w-fit">
                          <div className={`absolute inset-0 rounded-2xl bg-primary/30 blur-xl transition-opacity duration-500 ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-50"}`} />
                          <div
                            className={`relative h-20 w-20 rounded-2xl bg-background/85 backdrop-blur-md border border-border/40 shadow-sm flex items-center justify-center transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 ${
                              isActive ? "scale-110 shadow-md shadow-primary/25 ring-1 ring-primary/40" : ""
                            }`}
                          >
                            <Icon className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                        <div className="font-semibold text-foreground text-base tracking-tight">{cat.name}</div>
                        <div className="mt-2.5 inline-flex items-center justify-center text-[11px] font-medium text-muted-foreground bg-background/70 backdrop-blur-sm border border-border/40 rounded-full px-3 py-1">
                          {count} courses
                        </div>
                      </CardContent>
                    </Card>
                  </motion.button>
                );
              })}
            </div>
            {activeCategory && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                >
                  Clear filter and show all courses
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Become a Mentor */}
        <section id="mentor" className="container mx-auto px-4 sm:px-6 py-32 md:py-40 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-gradient-to-br from-amber-50 via-background to-amber-50/30 dark:from-amber-500/10 dark:via-background dark:to-amber-500/5 p-10 md:p-20 text-center shadow-[0_40px_100px_-30px_hsl(var(--primary)/0.35)]"
          >
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.06),_transparent_70%)] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto">
              <Badge className="mb-7 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-3 py-1">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                Become a Mentor
              </Badge>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                Transform your experience into <span className="text-primary">passive income</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                Create your own course and earn from your knowledge. Reach thousands of freelancers ready to learn from real practitioners.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" size="lg" onClick={() => setCreateOpen(true)}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <a href="#courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Courses
                  </a>
                </Button>
              </div>

              <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
                {[
                  { title: "Keep 80% revenue", desc: "Industry-leading mentor split." },
                  { title: "Built-in audience", desc: "Reach our active freelance community." },
                  { title: "Tools included", desc: "Hosting, payments and analytics." },
                ].map((b) => (
                  <div
                    key={b.title}
                    className="group rounded-2xl border border-border/40 bg-background/70 backdrop-blur-md p-5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_hsl(var(--primary)/0.3)] transition-all duration-400"
                  >
                    <div className="font-semibold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors">{b.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
      </div>{/* Close content wrapper */}
    </div>
  );
};

export default Academy;
