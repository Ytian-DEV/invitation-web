import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// RSVP endpoint - stores guest response and sends email
app.post('/make-server-4f8c49ac/rsvp', async (c) => {
  try {
    const { name, attending, message } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    // Check if RSVP deadline has passed (April 1, 2026)
    const now = new Date();
    const deadline = new Date('2026-04-01T23:59:59');
    
    if (now > deadline) {
      return c.json({ error: 'RSVP deadline has passed' }, 400);
    }

    // Store RSVP in database
    const rsvpData = {
      name,
      attending,
      message: message || '',
      timestamp: new Date().toISOString(),
    };

    const key = `rsvp:${Date.now()}:${name.replace(/\s/g, '_')}`;
    await kv.set(key, rsvpData);

    // Send email notification
    try {
      const emailSubject = `New RSVP: ${name} - ${attending ? 'Attending' : 'Not Attending'}`;
      const emailBody = `
New RSVP Received for Maria Chezka's 25th Birthday

Guest Name: ${name}
Response: ${attending ? '✓ Can Attend' : '✗ Cannot Attend'}
${message ? `Message: ${message}` : 'No message'}

Submitted at: ${new Date().toLocaleString()}
      `.trim();

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Birthday RSVP <onboarding@resend.dev>',
          to: ['christianboyles0143@gmail.com'],
          subject: emailSubject,
          text: emailBody,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log(`Email sending error: ${response.status} - ${errorData}`);
      }
    } catch (emailError) {
      console.log(`Email error during RSVP submission from ${name}: ${emailError}`);
      // Don't fail the RSVP if email fails
    }

    return c.json({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    console.log(`Error processing RSVP: ${error}`);
    return c.json({ error: 'Failed to submit RSVP', details: String(error) }, 500);
  }
});

// Get all RSVPs (for admin view if needed)
app.get('/make-server-4f8c49ac/rsvps', async (c) => {
  try {
    const rsvps = await kv.getByPrefix('rsvp:');
    return c.json({ rsvps });
  } catch (error) {
    console.log(`Error fetching RSVPs: ${error}`);
    return c.json({ error: 'Failed to fetch RSVPs', details: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-4f8c49ac/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
