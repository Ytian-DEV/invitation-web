import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Check, X, Loader2 } from 'lucide-react';

export function RSVPForm() {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (attending === null) {
      toast.error('Please select if you can attend');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4f8c49ac/rsvp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            attending,
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      setIsSubmitted(true);
      toast.success(
        attending
          ? "Thank you! We're excited to celebrate with you! 🎉"
          : "Thank you for letting us know. You'll be missed! 💝"
      );

      // Reset form
      setName('');
      setAttending(null);
      setMessage('');
    } catch (error) {
      console.error('RSVP submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if deadline has passed
  const now = new Date();
  const deadline = new Date('2026-04-01T23:59:59');
  const isPastDeadline = now > deadline;

  if (isPastDeadline) {
    return (
      <div className="bg-red-900/30 backdrop-blur-sm p-8 rounded-2xl border-2 border-red-500 text-center">
        <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl text-white mb-2">RSVP Closed</h3>
        <p className="text-red-200">
          The RSVP deadline has passed. Please contact the host directly for any inquiries.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl border-2 border-red-300 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-white mb-2 block text-lg">
            Your Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="bg-white/90 border-red-200 text-black placeholder:text-gray-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label className="text-white mb-4 block text-lg">
            Will you be attending? *
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAttending(true)}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 transition-all ${
                attending === true
                  ? 'bg-green-600 border-green-400 text-white scale-105'
                  : 'bg-white/20 border-red-300 text-white hover:bg-white/30'
              } disabled:opacity-50`}
            >
              <Check className="w-8 h-8 mx-auto mb-2" />
              <div>Yes, I'll be there!</div>
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 transition-all ${
                attending === false
                  ? 'bg-red-600 border-red-400 text-white scale-105'
                  : 'bg-white/20 border-red-300 text-white hover:bg-white/30'
              } disabled:opacity-50`}
            >
              <X className="w-8 h-8 mx-auto mb-2" />
              <div>Can't make it</div>
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="message" className="text-white mb-2 block text-lg">
            Leave a message for Maria Chezka (Optional)
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your birthday wishes..."
            rows={4}
            className="bg-white/90 border-red-200 text-black placeholder:text-gray-500 resize-none"
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-6 text-lg tracking-wider disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit RSVP'
          )}
        </Button>
      </form>

      {isSubmitted && (
        <div className="mt-6 p-4 bg-green-600/20 border-2 border-green-400 rounded-xl text-center">
          <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-white">Your RSVP has been received!</p>
        </div>
      )}
    </div>
  );
}
