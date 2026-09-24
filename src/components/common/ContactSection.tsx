import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="brand" icon={<Mail className="w-3.5 h-3.5" />}>
          Contact & Support
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Get in Touch with Scolify Support
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          Have questions about opportunity verification, student profile setup, or technical assistance? We are here to help.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-card-hover space-y-6">
        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Message Received</h3>
            <p className="text-xs text-slate-600">
              Thank you, {name}! Our student support team will respond to {email} shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="University / Contact Email"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can Scolify support team assist you today?"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                required
              />
            </div>
            <Button type="submit" variant="gradient" className="w-full font-bold py-3">
              Send Support Message
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};
