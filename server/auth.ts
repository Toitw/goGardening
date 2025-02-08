import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from 'memorystore';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      body: req.body,
      headers: req.headers
    });
    next();
  });

  const MemoryStoreInstance = MemoryStore(session);

  const sessionSettings: session.SessionOptions = {
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreInstance({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      try {
        console.log('Authenticating user:', username);
        const user = await storage.getUserByUsername(username);
        console.log('Found user:', user);
        if (!user) {
          console.log('User not found');
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log('Verifying password...');
        const isValid = await storage.verifyPassword(password, user.password);
        console.log('Password valid:', isValid);
        if (!isValid) {
          console.log('Invalid password');
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log('Authentication successful');
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: Express.User, done) => {
    console.log('Serializing user:', user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    console.log('Deserializing user:', id);
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username: req.body.username,
        password: req.body.password,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        res.status(201).json(user);
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: err.message || "Internal server error" });
      }
      if (!user) {
        console.log('Login failed:', info?.message);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('Session error:', err);
          return res.status(500).json({ message: err.message || "Error during login" });
        }
        console.log('Login successful for user:', user.username);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}