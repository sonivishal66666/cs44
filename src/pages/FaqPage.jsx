import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  FileText,
  Home,
  Search,
  ChevronDown,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const faqCategories = [
  {
    id: 1,
    name: 'Internship Rules',
    description: 'Guidelines for internship registration, approvals, and academic credits',
    icon: GraduationCap,
    color: 'from-blue-500 to-indigo-500',
    questions: [
      {
        q: 'How do I register an internship for academic credits?',
        a: 'To register your internship for credits, you must submit the official internship offer letter along with an application form to your department\'s Internship Coordinator. This must be done within 7 days of receiving the offer. Once verified, the department will issue an official NOC (No Objection Certificate) and register you under the Internship course code.',
      },
      {
        q: 'What are the eligibility criteria for credit-based internships?',
        a: 'Students must maintain a minimum CGPA of 7.0 (with no active backlogs) to be eligible for full-time semester internships. Additionally, you must have completed all core coursework up to the current semester and have cleared all previous training cell evaluations.',
      },
      {
        q: 'Can I pursue an off-campus internship not listed by the college?',
        a: 'Yes, off-campus internships are allowed, provided the company is registered, has a valid corporate presence, and the internship role aligns with your engineering/academic discipline. You must obtain prior approval from your Head of Department (HOD) and the training cell.',
      },
      {
        q: 'What reports and evaluations must I submit during the internship?',
        a: 'You must submit three items for academic evaluation: 1. Bi-weekly progress reports signed by your industry mentor. 2. A midterm technical review report. 3. A final dissertation report followed by a viva-voce presentation to a panel of department professors at the end of the semester.',
      },
    ],
  },
  {
    id: 2,
    name: 'Placement Guidelines',
    description: 'Campus placement eligibility, policies, and interview code of conduct',
    icon: Briefcase,
    color: 'from-indigo-500 to-purple-500',
    questions: [
      {
        q: 'Who is eligible to participate in campus placement drives?',
        a: 'All final year students with a CGPA of 6.0 and above, and with a maximum of 1 active backlog, are eligible to register with the Placement Cell. Individual recruiting companies may impose stricter CGPA or stream filters.',
      },
      {
        q: 'What is the college "One Student, One Job" policy?',
        a: 'To ensure fair opportunities for all, once a student is placed in a company, they are barred from attending subsequent placement drives. However, exceptions are made if a student gets a "Super Dream" offer (CTC higher than 15 LPA) after having a standard offer.',
      },
      {
        q: 'What documents should I prepare for interview drives?',
        a: 'You must keep a portfolio folder containing: 1. Multiple copies of your resume (approved by the placement cell). 2. Original and photocopies of all semester grade sheets. 3. College ID card and Gov-issued photo ID. 4. Internship certificates, project reports, and achievements folder.',
      },
      {
        q: 'What constitutes a breach of conduct during placement drives?',
        a: 'Punctuality is strictly enforced; arriving late to a drive will result in immediate disqualification. Furthermore, unexcused absence after registering for a company, misbehavior with interviewers, or sharing interview questions online will lead to a permanent debarment from all future campus placement drives.',
      },
    ],
  },
  {
    id: 3,
    name: 'Exam Policies',
    description: 'Grading systems, attendance requirements, re-evaluations, and emergency policies',
    icon: FileText,
    color: 'from-violet-500 to-fuchsia-500',
    questions: [
      {
        q: 'What is the minimum attendance required to sit for end-semester exams?',
        a: 'Students must maintain a minimum of 75% attendance in each registered subject. If your attendance falls between 65% and 75% due to medical reasons, you may submit a medical certificate for condonation to the Dean\'s office. Attendance below 65% will result in a dry-grade (F) and debarment from the exam.',
      },
      {
        q: 'How does the relative grading system work?',
        a: 'We use a relative grading scale where your final grade depends on your performance relative to the class average and standard deviation. The top 5-10% of the class receives an "S" grade (10 points), while other grades ("A", "B", "C", "D", "E", "P") are distributed based on a standard normal distribution curve around the class mean.',
      },
      {
        q: 'How do I apply for paper re-evaluation or photocopy retrieval?',
        a: 'If you are unsatisfied with your exam grade, you can apply for photocopy retrieval within 5 days of result publication. After reviewing the paper, you may formally apply for re-evaluation within 10 days by submitting the re-evaluation form and paying a fee of $25 per course.',
      },
      {
        q: 'What happens if I miss an exam due to a medical emergency?',
        a: 'If you miss a mid-semester or end-semester exam due to an absolute medical emergency or natural disaster, you must submit a formal application along with a government-hospital medical certificate and fitness certificate within 3 days. Upon verification by the Controller of Examinations, you will be permitted to sit for a Make-up Exam.',
      },
    ],
  },
  {
    id: 4,
    name: 'Hostel Rules',
    description: 'Curfew timings, guest permissions, room policies, and code of conduct',
    icon: Home,
    color: 'from-purple-500 to-pink-500',
    questions: [
      {
        q: 'What are the hostel curfew timings?',
        a: 'The main gate curfews are strictly enforced: all residents must return to the hostel by 9:30 PM. Out-pass requests for weekend stays or late outings must be submitted and approved by the Warden via the digital hostel portal before 4:00 PM.',
      },
      {
        q: 'What is the policy regarding guests and visitors?',
        a: 'Day visitors (including classmates and parents) are only allowed in the hostel lobby/canteen area between 9:00 AM and 7:00 PM. Visitors of the opposite gender are strictly prohibited from entering student corridors or individual rooms. Overnight stays for external guests require prior written permission from the Chief Warden and are subject to guest room availability.',
      },
      {
        q: 'Are electrical appliances allowed inside the hostel rooms?',
        a: 'For safety and fire hazard prevention, heavy electrical appliances such as heaters, induction stoves, electric kettles, iron boxes, and personal air conditioners are strictly prohibited. Using unauthorized appliances will result in confiscation and a penalty fee of $50.',
      },
      {
        q: 'What is the college policy on ragging and student misconduct?',
        a: 'We enforce a zero-tolerance policy towards ragging, bullying, harassment, and substance abuse. Any student found guilty of participating in, encouraging, or abetting ragging will be immediately suspended from the hostel and college, and a formal report will be lodged with the local police under the Anti-Ragging Act.',
      },
    ],
  },
];

export default function FaqPage() {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Automatically update active category if accessed via specific FAQ ID
  useEffect(() => {
    if (id) {
      const parsedId = parseInt(id, 10);
      const exists = faqCategories.some((cat) => cat.id === parsedId);
      if (exists) {
        setActiveCategory(parsedId);
        setExpandedIndex(null); // Reset expansions when changing categories
      }
    }
  }, [id]);

  const currentCategory = faqCategories.find((cat) => cat.id === activeCategory) || faqCategories[0];
  
  // Filter questions across current category or all categories if searching
  const isSearching = searchQuery.trim() !== '';
  const filteredQuestions = isSearching
    ? faqCategories.flatMap((cat) =>
        cat.questions
          .filter(
            (q) =>
              q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.a.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => ({ ...item, categoryName: cat.name, categoryId: cat.id }))
      )
    : currentCategory.questions;

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Premium Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-violet-950/90 border border-indigo-500/20 shadow-2xl p-8 md:p-12 mb-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Institutional Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            FAQ & Policies
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-3 leading-relaxed">
            Welcome to the AnswerHub Knowledge Repository. Explore comprehensive university rules, placement regulations, internship credit systems, and hostel guidelines.
          </p>

          {/* Premium Glassmorphic Search Bar */}
          <div className="relative mt-8 max-w-lg">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all rules & guidelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 dark:bg-slate-950/30 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner shadow-white/5"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid Layout: Left Categories Navigation / Right Content Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Categories Panel */}
        <nav className="lg:col-span-4 space-y-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl shadow-indigo-500/5 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
              Select Category
            </h3>
            
            {/* Desktop List */}
            <div className="hidden sm:block space-y-2">
              {faqCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id && !isSearching;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery('');
                      setExpandedIndex(null);
                    }}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40 border border-transparent'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                        {cat.name}
                      </p>
                      <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Scrollbar */}
            <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {faqCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id && !isSearching;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery('');
                      setExpandedIndex(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap text-sm shrink-0 transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Right Side: Content Panel */}
        <section className="lg:col-span-8 space-y-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl shadow-indigo-500/5 rounded-2xl p-6 md:p-8">
            
            {/* Header info */}
            <header className="mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-5">
              {isSearching ? (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-500" />
                    Search Results
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Found {filteredQuestions.length} matching guidelines
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentCategory.color} text-white hidden sm:block shadow-md`}>
                    {(() => {
                      const Icon = currentCategory.icon;
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
                      {currentCategory.name}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {currentCategory.description}
                    </p>
                  </div>
                </div>
              )}
            </header>

            {/* Accordion List */}
            {filteredQuestions.length === 0 ? (
              <div className="py-12 text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-800 dark:text-white">No matches found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Try typing keywords like 'credit', 'CGPA', or 'attendance'
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((item, idx) => {
                  const isExpanded = expandedIndex === idx;
                  
                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl transition-all duration-200 ${
                        isExpanded
                          ? 'border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm'
                          : 'border-slate-100 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 hover:border-slate-200 dark:hover:border-slate-600'
                      }`}
                    >
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between text-left p-4 md:p-5 cursor-pointer select-none"
                      >
                        <div className="flex-1 pr-4">
                          {isSearching && item.categoryName && (
                            <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full mb-1 border border-indigo-500/10">
                              {item.categoryName}
                            </span>
                          )}
                          <h4 className={`text-sm md:text-base font-bold transition-colors ${
                            isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'
                          }`}>
                            {item.q}
                          </h4>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-indigo-500' : ''
                          }`}
                        />
                      </button>

                      {/* Accordion Expandable Content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-700/40 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                              <p>{item.a}</p>
                              {isSearching && item.categoryId && (
                                <Link
                                  to={`/faq/${item.categoryId}`}
                                  onClick={() => {
                                    setActiveCategory(item.categoryId);
                                    setSearchQuery('');
                                    setExpandedIndex(null);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline pt-2"
                                >
                                  View entire category <ArrowRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Premium Support / Community Ask Card */}
      <section className="mt-12 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800/40 dark:to-indigo-950/20 border border-indigo-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-indigo-500/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white">
              Can't find your answer?
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Ask your question to our student community. Verified answers will be approved by admins to build the FAQ directory.
            </p>
          </div>
        </div>
        <Link
          to="/ask"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          Ask the Community
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </motion.main>
  );
}
