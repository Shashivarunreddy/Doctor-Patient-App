import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, Video, Heart, Stethoscope, Apple, Star, 
  ShieldCheck, Shield, CheckCircle2, Pill, Clock, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 border-x max-w-[1400px] mx-auto border-zinc-200/50 shadow-2xl overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-zinc-100">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-zinc-900 cursor-pointer">
          <div className="p-2 bg-primary/10 rounded-xl">
             <Activity className="h-6 w-6 text-primary" />
          </div>
          Docco<span className="text-primary italic">360</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-zinc-600">
          <Link to="#" className="hover:text-primary transition-colors">Home</Link>
          <Link to="#" className="hover:text-primary transition-colors">Doctors</Link>
          <Link to="#" className="hover:text-primary transition-colors">Specialties</Link>
          <Link to="#" className="hover:text-primary transition-colors">About Us</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-zinc-700 hover:text-primary hidden sm:block">Log in</Link>
          <Button asChild className="bg-secondary hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-secondary/20 h-11 px-6 font-bold transition-all active:scale-95">
            <Link to="/register">Consult Now</Link>
          </Button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-20 pb-28 relative">
          <div className="absolute inset-0 z-0 opacity-[0.03] select-none pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at center, #000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
          <div className="absolute right-0 top-[-20%] w-[50%] h-[80%] bg-primary/10 blur-[150px] rounded-full mix-blend-multiply pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div 
              initial="hidden" animate="visible" variants={staggerContainer}
              className="max-w-xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                24/7 Virtual Healthcare
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-[3.5rem] lg:text-[4.5rem] leading-[1.05] font-extrabold tracking-tight mb-6">
                Consult Trusted Doctors Anytime, Anywhere.
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl text-zinc-500 mb-10 leading-relaxed font-medium">
                Expert care across Homeopathy, Ayurveda & Nutrition. Connect instantly with verified specialists.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <Button asChild size="lg" className="w-full sm:w-auto bg-secondary hover:bg-orange-600 h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-secondary/30 transition-all">
                  <Link to="/register">Consult Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl border-zinc-200 hover:bg-zinc-50 hover:text-primary transition-all group">
                  <Link to="/patient-dashboard/doctors">View Doctors <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1" /></Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex gap-8 text-sm font-bold text-zinc-600">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100 text-green-600"><CheckCircle2 className="h-4 w-4" /></div>
                  10K+ Consults
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-blue-100 text-blue-600"><ShieldCheck className="h-4 w-4" /></div>
                  Verified Doctors
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative aspect-square lg:aspect-[4/3] rounded-[2.5rem] bg-white border border-zinc-200 shadow-2xl p-4 overflow-hidden"
            >
              <img src="/hero_image.png" alt="Doctor Consultation AI generated hero" className="w-full h-full object-cover rounded-[2rem] bg-zinc-100" />
              {/* Floating Element */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-10 left-[-20px] bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-4"
              >
                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">Secure Video Call</p>
                  <p className="text-xs text-zinc-500 font-medium pb-1 mt-0.5" >Connecting in 02:44...</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Steps: How it works */}
        <section className="bg-white py-24 border-y border-zinc-100 relative overflow-hidden">
          <div className="px-6 lg:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold mb-4">How Docco360 Works</h2>
              <p className="text-zinc-500 font-medium">Your healthcare journey simplified into rapid steps.</p>
            </div>

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center relative">
              {/* The Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 hidden md:block" />
              <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-primary hidden md:block animate-[pulse_3s_ease-in-out_infinite]" />

              {[
                { step: 1, title: 'Sign Up', desc: 'Create account in 60s' },
                { step: 2, title: 'Choose Doctor', desc: 'Browse specialists' },
                { step: 3, title: 'Consult', desc: 'Video call securely' },
                { step: 4, title: 'Recovery', desc: 'Meds & follow-ups' }
              ].map((s) => (
                <div key={s.step} className="relative z-10 flex flex-col items-center bg-white p-4 text-center md:w-48 mb-6 md:mb-0">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-extrabold mb-4 shadow-xl border border-zinc-100 ${s.step === 1 ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-zinc-400'}`}>
                    0{s.step}
                  </div>
                  <h4 className="font-bold text-zinc-900">{s.title}</h4>
                  <p className="text-sm font-medium text-zinc-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services & Specialties */}
        <section className="py-24 px-6 lg:px-12 relative">
          <div className="mb-16">
             <div className="text-xs font-bold text-primary tracking-widest uppercase mb-4">Services Options</div>
             <h2 className="text-4xl font-extrabold leading-tight mb-4">Holistic care tailored for you.</h2>
          </div>

          <motion.div 
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
             {[
               { icon: <Activity />, title: 'Diagnostics', subtitle: 'Lab test integrations.', color: 'text-blue-600 bg-blue-50 border-blue-100/50' },
               { icon: <Apple />, title: 'Nutrition', subtitle: 'Diet planning experts.', color: 'text-orange-600 bg-orange-50 border-orange-100/50' },
               { icon: <Heart />, title: 'Ayurveda', subtitle: 'Natural chronic healing.', color: 'text-green-600 bg-green-50 border-green-100/50' },
               { icon: <Stethoscope />, title: 'Consultations', subtitle: 'General physician access.', color: 'text-purple-600 bg-purple-50 border-purple-100/50' }
             ].map((svc, i) => (
               <motion.div key={i} variants={fadeInUp} className="group cursor-pointer">
                 <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border mb-6 ${svc.color} group-hover:scale-110 transition-transform`}>
                      {svc.icon}
                    </div>
                    <h3 className="text-xl font-extrabold mb-2 text-zinc-900">{svc.title}</h3>
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">{svc.subtitle}</p>
                 </div>
               </motion.div>
             ))}
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="bg-primary/5 py-24 px-6 lg:px-12 border-y border-primary/10">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-extrabold mb-4">Loved by Patients</h2>
             <p className="text-zinc-500 font-medium">Real reviews from our platform.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {[1,2,3].map((i) => (
               <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
                 <div className="flex gap-1 mb-4 text-secondary">
                   <Star className="h-5 w-5 fill-secondary" />
                   <Star className="h-5 w-5 fill-secondary" />
                   <Star className="h-5 w-5 fill-secondary" />
                   <Star className="h-5 w-5 fill-secondary" />
                   <Star className="h-5 w-5 fill-secondary" />
                 </div>
                 <p className="text-zinc-700 font-medium leading-relaxed mb-6 italic">
                   "Easily the most seamless consulting experience I have ever had. The video was crystal clear and my prescription was immediately available."
                 </p>
                 <div className="flex items-center gap-3">
                   <div className={`h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-500`}>U{i}</div>
                   <div>
                     <p className="font-bold text-sm">Verified Patient</p>
                     <p className="text-xs text-zinc-400 font-medium">Consulted for Nutrition</p>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* App Download Mockup */}
        <section className="py-24 px-6 lg:px-12 relative overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
               initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
               className="lg:w-1/2 space-y-8"
            >
              <h2 className="text-[3rem] font-extrabold leading-[1.1]">Take Docco360<br/>in your pocket.</h2>
              <p className="text-lg text-zinc-500 font-medium max-w-md">Our mobile application provides instant booking, medicine delivery tracking, and holistic care metrics natively on your phone.</p>
              
              <ul className="space-y-4 font-bold text-zinc-700">
                <li className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Shield className="h-4 w-4" /></div> Holistic Care from Home</li>
                <li className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Clock className="h-4 w-4" /></div> Instant Appointment Booking</li>
                <li className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Pill className="h-4 w-4" /></div> Integrated Medicine Delivery</li>
              </ul>

              <div className="flex items-center gap-4 pt-4">
                <button className="h-14 bg-zinc-900 text-white px-8 rounded-xl font-bold hover:bg-zinc-800 transition-colors">Download on App Store</button>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
               className="lg:w-1/2 relative flex justify-center"
            >
              <div className="absolute inset-0 bg-secondary/10 blur-[100px] rounded-full" />
              <img src="/mobile_app.png" alt="Mobile App 3D Mockup" className="relative z-10 w-[300px] lg:w-[400px] object-contain drop-shadow-2xl" />
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 pt-20 pb-10 px-6 lg:px-12 text-zinc-400 font-medium text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white cursor-pointer mb-6">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              Docco<span className="text-primary italic">360</span>
            </div>
            <p className="max-w-sm leading-relaxed text-zinc-500">
              The premium platform connecting you with top-tier medical specialists across various disciplines right from your smartphone.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-base">Company</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-base">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">HIPAA Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Docco360. All rights reserved.</p>
          <div className="flex gap-6 font-bold text-white">
             <Link to="#" className="hover:text-primary">Twitter</Link>
             <Link to="#" className="hover:text-primary">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
