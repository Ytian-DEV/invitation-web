import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Shirt, Heart, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RSVPForm } from './RSVPForm';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function InvitationContent() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-04-13T19:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-900 to-black overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                  opacity: Math.random(),
                }}
                animate={{
                  y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                  opacity: [null, Math.random()],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="mb-8">
              <Heart className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl text-white mb-6 font-serif italic">
              Maria Chezka
            </h1>
            
            <div className="text-3xl md:text-5xl text-white mb-4 tracking-wider font-light">
              Meliz Delima
            </div>

            <div className="relative inline-block my-8">
              <div className="text-7xl md:text-9xl text-red-500 italic" style={{ fontFamily: 'serif' }}>
                twenty-fine
              </div>
              <div className="absolute -top-4 -right-4 text-4xl md:text-6xl text-white">✨</div>
            </div>

            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto my-8"></div>

            <p className="text-xl md:text-2xl text-red-200 tracking-widest">
              JOIN US FOR A SPECTACULAR CELEBRATION
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-red-300 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-red-300 rounded-full"></div>
          </div>
        </motion.div>
      </motion.section>

      {/* Photo Section 1 - Featured Portrait */}
      <section className="relative py-0 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left - Photo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] md:h-[700px] overflow-hidden"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1586024795129-38d4e68bdd0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJsYWNrJTIwZHJlc3MlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjAyNDk2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Maria Chezka"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60"></div>
            </motion.div>

            {/* Right - Quote */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center justify-center p-8 md:p-16 bg-gradient-to-br from-red-950 to-black"
            >
              <div className="text-center max-w-md">
                <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-6" />
                <p className="text-2xl md:text-4xl text-white mb-6 font-serif italic leading-relaxed">
                  "A celebration of life, love, and 25 years of beautiful moments"
                </p>
                <div className="w-20 h-1 bg-red-500 mx-auto"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl mb-4 font-serif italic">Counting Down</h2>
            <div className="w-24 h-1 bg-red-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Minutes' },
              { value: timeLeft.seconds, label: 'Seconds' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gradient-to-br from-red-900 to-red-950 p-6 md:p-8 rounded-2xl border-2 border-red-700 shadow-2xl"
              >
                <div className="text-4xl md:text-6xl mb-2 text-red-300">{item.value}</div>
                <div className="text-sm md:text-base tracking-widest text-red-200">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-gradient-to-b from-black to-red-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4 text-white font-serif italic">Celebrating Maria Chezka</h2>
            <div className="w-24 h-1 bg-red-500 mx-auto"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              'https://images.unsplash.com/photo-1758738180856-7538f9dd4ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tYW4lMjBiaXJ0aGRheSUyMGNlbGVicmF0aW9ufGVufDF8fHx8MTc2MDI0OTY1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
              'https://images.unsplash.com/photo-1758738181955-3f917d756275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGdpcmwlMjBwb3J0cmFpdCUyMGVsZWdhbnR8ZW58MXx8fHwxNzYwMjQ5NjU2fDA&ixlib=rb-4.1.0&q=80&w=1080',
              'https://images.unsplash.com/photo-1755704282977-340323fa52df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwcGFydHklMjBlbGVnYW50fGVufDF8fHx8MTc2MDI0OTY1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
            ].map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative group overflow-hidden rounded-2xl aspect-[3/4] shadow-2xl"
              >
                <ImageWithFallback
                  src={src}
                  alt={`Celebration moment ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details Section - Smaller Cards */}
      <section className="py-20 bg-gradient-to-b from-red-950 via-white to-red-50">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4 text-black font-serif italic">Event Details</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Calendar,
                title: 'Date',
                detail: 'April 13, 2026',
                color: 'text-red-600',
              },
              {
                icon: Clock,
                title: 'Time',
                detail: '7:00 PM',
                color: 'text-red-700',
              },
              {
                icon: MapPin,
                title: 'Venue',
                detail: 'Ritz Tower, Tacloban City',
                color: 'text-red-800',
              },
              {
                icon: Shirt,
                title: 'Dress Code',
                detail: 'Black Attire',
                color: 'text-black',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white p-5 md:p-6 rounded-xl shadow-lg border-2 border-red-100 hover:border-red-300 transition-all hover:shadow-xl hover:scale-105"
              >
                <item.icon className={`w-8 h-8 md:w-10 md:h-10 ${item.color} mb-3 mx-auto`} />
                <h3 className="text-base md:text-lg mb-1 text-black text-center">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-700 text-center">{item.detail}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 text-center bg-gradient-to-r from-red-900 to-black text-white p-8 md:p-12 rounded-2xl max-w-3xl mx-auto shadow-2xl"
          >
            <p className="text-xl md:text-3xl italic font-serif leading-relaxed">
              "Let's celebrate a quarter century of amazing memories and create new ones together!"
            </p>
          </motion.div>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-20 bg-gradient-to-br from-black via-red-950 to-black">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl mb-4 text-white font-serif italic">RSVP</h2>
            <div className="w-24 h-1 bg-red-500 mx-auto mb-6"></div>
            <p className="text-red-200 text-lg">
              Please respond by April 1, 2026
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <RSVPForm />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-200 mb-2">We can't wait to celebrate with you!</p>
          <p className="text-sm text-red-300">Maria Chezka's 25th Birthday Celebration</p>
        </div>
      </footer>
    </div>
  );
}
