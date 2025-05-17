import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class SessionService {
  // private redis = new Redis('redis://localhost:6379');
  private redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

  async createSession(userId: string, ip: string, userAgent: string) {
    try {
      const sessionId = nanoid();
      const sessions = await this.getUserSessions(userId);

      console.log('sessions');
      console.log(sessions);

      if (sessions.length >= Number(process.env.MAX_SESSIONS)) {
        await this.getAndDestroyOldestSession(sessions, sessionId);
      }

      const sessionData = {
        userId,
        ip,
        userAgent,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      await this.redis.set(
        `session:${sessionId}`,
        JSON.stringify(sessionData),
        'EX',
        Number(process.env.SESSION_TTL)
      );

      await this.redis.lpush(`user_sessions:${userId}`, sessionId);

      const allSessions = this.showAllSessions();
      console.log('allSessions');
      console.log(allSessions);

      return sessionId;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getSession(sessionId: string) {
    try {
      const session = await this.redis.get(`session:${sessionId}`);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getUserSessions(userId: string): Promise<string[]> {
    try {
      return (await this.redis.lrange(`user_sessions:${userId}`, 0, -1)) || [];
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateLastActivity(sessionId: string) {
    try {
      const session = await this.getSession(sessionId);
      if (session) {
        session.lastActivity = Date.now();
        await this.redis.set(
          `session:${sessionId}`,
          JSON.stringify(session),
          'EX',
          Number(process.env.SESSION_TTL)
        );
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async validateSession(sessionId: string) {
    try {
      const session = await this.redis.get(`session:${sessionId}`);
      if (!session) return null;

      const data = JSON.parse(session);

      const sessionTimeout = Number(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000;
      const isSessionExpired = Date.now() - data.lastActivity > sessionTimeout;

      if (isSessionExpired) {
        await this.destroySession(sessionId);
        return null;
      }

      await this.updateLastActivity(sessionId);
      return data.userId;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getAndDestroyOldestSession(sessions: string[], sessionId: string) {
    try {
      const sessionDetails = await Promise.all(
        sessions.map(async (sessionId) => {
          const sessionData = await this.getSession(sessionId);
          return { sessionId, createdAt: sessionData?.createdAt };
        })
      );

      const oldestSession = sessionDetails.reduce((oldest, current) => {
        if (!oldest || current.createdAt < oldest.createdAt) {
          return current;
        }
        return oldest;
      }, null);

      if (oldestSession) {
        await this.destroySession(oldestSession.sessionId);
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async destroySession(sessionId: string) {
    try {
      console.log('destroying');
      console.log(sessionId);

      const session = await this.getSession(sessionId);
      if (session) {
        await this.redis.lrem(`user_sessions:${session.userId}`, 0, sessionId);
        await this.redis.del(`session:${sessionId}`);
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async showAllSessions() {
    try {
      const keys = await this.redis.keys('session:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const parsedData = JSON.parse(data);
          console.log(`Key: ${key}, Data:`, parsedData);
        }
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
