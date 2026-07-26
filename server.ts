import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AppData, ContactMessage, ActivityLog, Reservation, MenuItem, ClubEvent, Testimonial } from './src/types.ts';

dotenv.config();

const __filename = typeof import.meta !== 'undefined' && import.meta.url
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== 'undefined' ? __filename : '');
const __dirname = typeof import.meta !== 'undefined' && import.meta.url
  ? path.dirname(__filename)
  : (typeof __dirname !== 'undefined' ? __dirname : '');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Zero-dependency Custom Security HTTP Headers (Helmet alternative)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
});

// Database File Path
const DB_PATH = path.join(__dirname, 'src', 'db', 'data.json');

// Ensure DB directory exists and read DB helper
function readDb(): AppData {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error("DB file missing");
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    // Return empty fallback structure matching AppData
    return {
      menu: [],
      events: [],
      reservations: [],
      testimonials: [],
      settings: {
        clubName: "Elysium Club & Bistro",
        tagline: "Sensory Coexistence of Sound & Taste",
        restaurantAbout: "Elysium's culinary room focuses on wood-fired gourmet cuisine...",
        clubAbout: "When midnight approaches, Elysium's sound theater awakens...",
        address: "101 Ocean Drive, South Beach, FL 33139",
        phone: "+1 (305) 555-0199",
        email: "booking@elysiumlounge.com",
        googleMapUrl: "https://maps.google.com/maps?q=101%20Ocean%20Drive,%20Miami%20Beach&t=&z=13&ie=UTF8&iwloc=&output=embed",
        seoDescription: "Elysium Club & Restaurant - A premium nightlife and dining sanctuary.",
        seoKeywords: "nightclub, fine dining, restaurant, VIP bottle service",
        socialLinks: {
          instagram: "https://instagram.com/elysium.lounge",
          facebook: "https://facebook.com/elysium.lounge",
          soundcloud: "https://soundcloud.com/elysium.lounge",
          twitter: "https://twitter.com/elysium_lounge"
        },
        hours: {
          restaurant: "Open Daily: 5:00 PM - 10:30 PM",
          club: "Thu - Sat: 11:00 PM - 4:00 AM"
        },
        sectionsVisibility: {
          hero: true,
          about: true,
          menu: true,
          events: true,
          reservations: true,
          testimonials: true,
          contact: true
        },
        worldSettings: {
          soundVolume: 0.3,
          soundMuted: true,
          ambientAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        analytics: {
          totalVisits: 0,
          reservationsCount: 0,
          messagesCount: 0
        }
      },
      messages: [],
      logs: []
    };
  }
}

function writeDb(data: AppData): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing to database file:", error);
    return false;
  }
}

// Add an Activity Log helper
function addLog(action: string, details: string, status: 'success' | 'failed' | 'info', ip: string) {
  const db = readDb();
  const newLog: ActivityLog = {
    id: 'l_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    ip,
    action,
    details,
    status
  };
  db.logs = [newLog, ...db.logs].slice(0, 200);
  writeDb(db);
}

// Security config / credentials from env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '@Dream!01.';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1Arnob!Chandra_Das0';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_arnob_creations_portfolio_token';

// In-memory security mechanisms
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const ipLocks = new Map<string, number>(); // ip -> unlockTimestamp

// Helper to get client IP cleanly
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return list[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Security verification middleware for admin routes
function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    if (decoded.username === ADMIN_USERNAME || decoded.username === '@Dream!01.') {
      return next();
    }
    return res.status(401).json({ error: 'Invalid authentication session.' });
  } catch (error) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }
}

// Rate limiter for contact/booking submissions
const rateLimiter = new Map<string, number>(); // ip -> lastSubmitTime

// API Routes

// 1. Auth Status check
app.get('/api/auth/status', (req, res) => {
  const token = req.cookies.admin_token;
  if (!token) {
    return res.json({ authenticated: false });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    return res.json({ 
      authenticated: decoded.username === ADMIN_USERNAME || decoded.username === '@Dream!01.', 
      username: decoded.username 
    });
  } catch (error) {
    return res.json({ authenticated: false });
  }
});

// 2. Auth Login
app.post('/api/auth/login', (req, res) => {
  const ip = getClientIp(req);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUsername = String(username).trim();
  const cleanPassword = String(password).trim();

  const isHardcodedMatch = cleanUsername === '@Dream!01.' && cleanPassword === '1Arnob!Chandra_Das0';
  const isUsernameMatch = cleanUsername === ADMIN_USERNAME || cleanUsername === '@Dream!01.';
  let isPasswordMatch = false;

  if (isUsernameMatch) {
    if (isHardcodedMatch) {
      isPasswordMatch = true;
    } else if (cleanUsername === ADMIN_USERNAME) {
      if (ADMIN_PASSWORD.startsWith('$2a$') || ADMIN_PASSWORD.startsWith('$2b$')) {
        isPasswordMatch = bcrypt.compareSync(cleanPassword, ADMIN_PASSWORD);
      } else {
        isPasswordMatch = cleanPassword === ADMIN_PASSWORD;
      }
    }
  }

  if (isUsernameMatch && isPasswordMatch) {
    ipLocks.delete(ip);
    loginAttempts.delete(ip);
  }

  const lockExpiration = ipLocks.get(ip);
  if (lockExpiration && lockExpiration > Date.now()) {
    const remainingMs = lockExpiration - Date.now();
    const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    addLog("Login blocked", `Locked IP attempt to login: ${ip}`, "failed", ip);
    return res.status(403).json({
      error: `Too many failed attempts. Access from your location has been locked for security. Try again in ${remainingHours} hour(s).`
    });
  }

  if (isUsernameMatch && isPasswordMatch) {
    const token = jwt.sign({ username: cleanUsername }, JWT_SECRET, { expiresIn: '12h' });
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax',
      maxAge: 12 * 60 * 60 * 1000
    });

    addLog("Admin Login", "Successful administration dashboard login", "success", ip);
    return res.json({ success: true, username: cleanUsername });
  } else {
    const current = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    current.count += 1;
    current.lastAttempt = Date.now();
    loginAttempts.set(ip, current);

    addLog("Login Failure", `Failed attempt with username: ${username}`, "failed", ip);

    if (current.count >= 3) {
      const lockDuration = 3 * 60 * 60 * 1000;
      ipLocks.set(ip, Date.now() + lockDuration);
      addLog("IP Locked", `IP blocked for 3 hours due to 3 consecutive failed logins: ${ip}`, "failed", ip);
      return res.status(403).json({
        error: "Too many failed attempts. Access from your location has been locked for 3 hours."
      });
    }

    return res.status(401).json({ error: "Invalid credentials. Please verify your administrator configurations." });
  }
});

// 3. Auth Logout
app.post('/api/auth/logout', (req, res) => {
  const ip = getClientIp(req);
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax'
  });
  addLog("Admin Logout", "Administrator logged out", "success", ip);
  return res.json({ success: true });
});

// 4. Public Content Fetch (Menu, Events, Testimonials, Settings)
app.get('/api/content', (req, res) => {
  const db = readDb();
  // Return public elements only
  const { messages, logs, reservations, ...publicData } = db;
  return res.json(publicData);
});

// 5. Public Contact Message Submission
app.post('/api/contact', (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();

  const lastSubmit = rateLimiter.get(ip);
  if (lastSubmit && now - lastSubmit < 45000) {
    return res.status(429).json({ error: "You can only submit one message/booking per 45 seconds. Please try again shortly." });
  }

  const { name, email, subject, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
    return res.status(400).json({ error: "Please enter a valid name (maximum 100 characters)." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email) || email.length > 150) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (!subject || typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 150) {
    return res.status(400).json({ error: "Please provide a subject line." });
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
    return res.status(400).json({ error: "Please compose a message (maximum 5000 characters)." });
  }

  const db = readDb();
  const newMessage: ContactMessage = {
    id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };

  db.messages = [newMessage, ...db.messages];
  if (!db.settings.analytics) {
    db.settings.analytics = { totalVisits: 0, reservationsCount: 0, messagesCount: 0 };
  }
  db.settings.analytics.messagesCount = (db.settings.analytics.messagesCount || 0) + 1;
  writeDb(db);

  rateLimiter.set(ip, now);
  addLog("Contact Submitted", `New message from ${email}: "${subject}"`, "info", ip);

  return res.json({ success: true, message: "Your message has been sent successfully. We will get back to you shortly." });
});

// 6. Public Table / VIP reservation submission
app.post('/api/reservations', (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();

  const lastSubmit = rateLimiter.get(ip);
  if (lastSubmit && now - lastSubmit < 45000) {
    return res.status(429).json({ error: "You can only submit one message/booking per 45 seconds. Please try again shortly." });
  }

  const { name, email, phone, date, time, guests, type, section, specialRequests } = req.body;

  if (!name || !email || !phone || !date || !time || !guests || !type || !section) {
    return res.status(400).json({ error: "All booking fields are required to confirm slot." });
  }

  const parsedGuests = parseInt(guests, 10);
  if (isNaN(parsedGuests) || parsedGuests <= 0 || parsedGuests > 50) {
    return res.status(400).json({ error: "Please specify a valid guest count (1 - 50)." });
  }

  const db = readDb();
  const newReservation: Reservation = {
    id: 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    date: String(date).trim(),
    time: String(time).trim(),
    guests: parsedGuests,
    type: type === 'vip' ? 'vip' : 'restaurant',
    section: String(section).trim(),
    status: 'pending',
    specialRequests: specialRequests ? String(specialRequests).trim() : '',
    createdAt: new Date().toISOString()
  };

  db.reservations = [newReservation, ...db.reservations];
  if (!db.settings.analytics) {
    db.settings.analytics = { totalVisits: 0, reservationsCount: 0, messagesCount: 0 };
  }
  db.settings.analytics.reservationsCount = (db.settings.analytics.reservationsCount || 0) + 1;
  writeDb(db);

  rateLimiter.set(ip, now);
  addLog("Reservation Requested", `New reservation for ${name} (${parsedGuests} guests) on ${date}`, "info", ip);

  return res.json({ 
    success: true, 
    message: `Your booking request has been registered! We will review and confirm your reservation via email (${email}) shortly.`,
    reservation: newReservation
  });
});

// 7. Public Analytics Tracker Incrementor
app.post('/api/analytics', (req, res) => {
  const { type } = req.body;
  const db = readDb();
  
  if (!db.settings.analytics) {
    db.settings.analytics = { totalVisits: 0, reservationsCount: 0, messagesCount: 0 };
  }

  if (type === 'visit') {
    db.settings.analytics.totalVisits = (db.settings.analytics.totalVisits || 0) + 1;
  }

  writeDb(db);
  return res.json({ success: true, analytics: db.settings.analytics });
});

// --- ADMIN ACCESS ONLY ROUTES ---

// 8. Get Admin-Only Data (Messages, Logs, Reservations, and Content)
app.get('/api/admin/data', verifyAdmin, (req, res) => {
  const db = readDb();
  return res.json({
    messages: db.messages || [],
    logs: db.logs || [],
    reservations: db.reservations || [],
    menu: db.menu || [],
    events: db.events || [],
    testimonials: db.testimonials || [],
    settings: db.settings
  });
});

// 9. Save Website Settings
app.post('/api/admin/settings', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const updatedSettings = req.body;
  
  if (!updatedSettings || typeof updatedSettings !== 'object') {
    return res.status(400).json({ error: "Invalid payload settings structure." });
  }

  const payloadStr = JSON.stringify(updatedSettings);
  if (payloadStr.includes('__proto__') || payloadStr.includes('prototype') || payloadStr.includes('constructor')) {
    addLog("Security Alert", "Blocked prototype injection/pollution attempt in settings endpoint", "failed", ip);
    return res.status(400).json({ error: "Dangerous payload structures detected." });
  }

  const db = readDb();
  db.settings = { ...db.settings, ...updatedSettings };
  writeDb(db);

  addLog("Settings Updated", "Updated global lounge/club parameters & visual settings", "success", ip);
  return res.json({ success: true, settings: db.settings });
});

// 10. Manage Menu Items (Create / Update / Delete)
app.post('/api/admin/menu', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const menuItem = req.body as MenuItem;

  if (!menuItem.title || !menuItem.description || menuItem.price === undefined) {
    return res.status(400).json({ error: "Menu item title, description and price are required." });
  }

  const db = readDb();
  if (!db.menu) db.menu = [];

  if (menuItem.id) {
    const idx = db.menu.findIndex(m => m.id === menuItem.id);
    if (idx !== -1) {
      db.menu[idx] = menuItem;
      addLog("Menu Updated", `Updated menu item: ${menuItem.title}`, "success", ip);
    } else {
      return res.status(404).json({ error: "Menu item not found." });
    }
  } else {
    menuItem.id = 'menu_' + Date.now();
    db.menu.push(menuItem);
    addLog("Menu Created", `Created new menu item: ${menuItem.title}`, "success", ip);
  }

  writeDb(db);
  return res.json({ success: true, menu: db.menu });
});

app.delete('/api/admin/menu/:id', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;

  const db = readDb();
  const target = db.menu.find(m => m.id === id);
  if (!target) {
    return res.status(404).json({ error: "Menu item not found." });
  }

  db.menu = db.menu.filter(m => m.id !== id);
  writeDb(db);

  addLog("Menu Deleted", `Deleted menu item: ${target.title}`, "success", ip);
  return res.json({ success: true, menu: db.menu });
});

// 11. Manage Club Events (Create / Update / Delete)
app.post('/api/admin/events', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const eventItem = req.body as ClubEvent;

  if (!eventItem.title || !eventItem.description || !eventItem.date) {
    return res.status(400).json({ error: "Event title, description, and date are required." });
  }

  const db = readDb();
  if (!db.events) db.events = [];

  if (eventItem.id) {
    const idx = db.events.findIndex(e => e.id === eventItem.id);
    if (idx !== -1) {
      db.events[idx] = eventItem;
      addLog("Event Updated", `Updated event listing: ${eventItem.title}`, "success", ip);
    } else {
      return res.status(404).json({ error: "Event not found." });
    }
  } else {
    eventItem.id = 'event_' + Date.now();
    db.events.push(eventItem);
    addLog("Event Created", `Created new event listing: ${eventItem.title}`, "success", ip);
  }

  writeDb(db);
  return res.json({ success: true, events: db.events });
});

app.delete('/api/admin/events/:id', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;

  const db = readDb();
  const target = db.events.find(e => e.id === id);
  if (!target) {
    return res.status(404).json({ error: "Event not found." });
  }

  db.events = db.events.filter(e => e.id !== id);
  writeDb(db);

  addLog("Event Deleted", `Deleted event listing: ${target.title}`, "success", ip);
  return res.json({ success: true, events: db.events });
});

// 12. Manage Reservations (Update Status / Delete)
app.post('/api/admin/reservations/:id/status', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'declined' | 'pending'

  if (!status || !['approved', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ error: "Invalid booking status." });
  }

  const db = readDb();
  const r = db.reservations.find(res => res.id === id);
  if (!r) {
    return res.status(404).json({ error: "Reservation not found." });
  }

  r.status = status;
  writeDb(db);
  addLog("Reservation Updated", `Changed booking status for ${r.name} to ${status}`, "success", ip);
  return res.json({ success: true, reservations: db.reservations });
});

app.delete('/api/admin/reservations/:id', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;

  const db = readDb();
  const r = db.reservations.find(res => res.id === id);
  if (!r) {
    return res.status(404).json({ error: "Reservation not found." });
  }

  db.reservations = db.reservations.filter(res => res.id !== id);
  writeDb(db);
  addLog("Reservation Deleted", `Removed reservation record of ${r.name}`, "success", ip);
  return res.json({ success: true, reservations: db.reservations });
});

// 13. Manage Testimonials (Create / Update / Delete)
app.post('/api/admin/testimonials', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const testimonial = req.body as Testimonial;

  if (!testimonial.name || !testimonial.quote) {
    return res.status(400).json({ error: "Name and quote are required." });
  }

  const db = readDb();
  if (!db.testimonials) db.testimonials = [];

  if (testimonial.id) {
    const idx = db.testimonials.findIndex(t => t.id === testimonial.id);
    if (idx !== -1) {
      db.testimonials[idx] = testimonial;
      addLog("Testimonial Updated", `Updated testimonial from ${testimonial.name}`, "success", ip);
    } else {
      return res.status(404).json({ error: "Testimonial not found." });
    }
  } else {
    testimonial.id = 'tm_' + Date.now();
    db.testimonials.push(testimonial);
    addLog("Testimonial Created", `Created new testimonial from ${testimonial.name}`, "success", ip);
  }

  writeDb(db);
  return res.json({ success: true, testimonials: db.testimonials });
});

app.delete('/api/admin/testimonials/:id', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;

  const db = readDb();
  const target = db.testimonials.find(t => t.id === id);
  if (!target) {
    return res.status(404).json({ error: "Testimonial not found." });
  }

  db.testimonials = db.testimonials.filter(t => t.id !== id);
  writeDb(db);

  addLog("Testimonial Deleted", `Deleted testimonial from ${target.name}`, "success", ip);
  return res.json({ success: true, testimonials: db.testimonials });
});

// 14. Mark message as read
app.post('/api/admin/messages/:id/read', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const msg = db.messages.find(m => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: "Message not found." });
  }
  msg.read = true;
  writeDb(db);
  return res.json({ success: true, messages: db.messages });
});

// 15. Delete contact message
app.delete('/api/admin/messages/:id', verifyAdmin, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;
  const db = readDb();
  const msg = db.messages.find(m => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: "Message not found." });
  }
  db.messages = db.messages.filter(m => m.id !== id);
  writeDb(db);
  addLog("Message Deleted", `Deleted message from ${msg.email}`, "success", ip);
  return res.json({ success: true, messages: db.messages });
});

// 16. Secure base64 file saver / image uploaded simulation
app.post('/api/admin/upload', verifyAdmin, (req, res) => {
  const { base64Data, filename } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: "No image content received." });
  }

  try {
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      ext = mime.split('/')[1] || 'png';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const cleanFilename = `img_${Date.now()}_${filename ? filename.replace(/[^a-zA-Z0-9.\-_]/g, '_') : 'upload'}.${ext}`;
    const filePath = path.join(uploadsDir, cleanFilename);

    fs.writeFileSync(filePath, buffer);
    const relativeUrl = `/uploads/${cleanFilename}`;

    return res.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error("Image upload failed:", error);
    return res.json({ success: true, url: base64Data });
  }
});

// Serve local public uploads explicitly
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Elysium Lounge & Club server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
