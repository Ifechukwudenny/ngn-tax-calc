import Redis from "ioredis";

const REDIS_KEY = "oduko:user-count";

// Create Redis client with connection from environment variable
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
	if (redisClient) {
		return redisClient;
	}

	const redisUrl = process.env.REDIS_URL;
	if (!redisUrl) {
		console.warn("[user-count] REDIS_URL not configured, user count will not persist");
		return null;
	}

	try {
		redisClient = new Redis(redisUrl, {
			maxRetriesPerRequest: 3,
			retryStrategy: (times: number) => {
				const delay = Math.min(times * 50, 2000);
				return delay;
			},
			connectTimeout: 3000,
			commandTimeout: 2000,
			lazyConnect: false, // Connect immediately but don't block
			enableOfflineQueue: false,
			enableReadyCheck: false, // Don't wait for ready check
		});

		redisClient.on("error", (error: Error) => {
			console.error("[user-count] Redis connection error:", error);
			// Don't throw - just log the error
		});

		redisClient.on("connect", () => {
			console.log("[user-count] Redis connected successfully");
		});

		return redisClient;
	} catch (error) {
		console.error("[user-count] Failed to create Redis client:", error);
		return null;
	}
}

/**
 * Reads the user count from Redis
 */
export async function getUserCount(): Promise<number> {
	const client = getRedisClient();
	if (!client) {
		console.log("[user-count] Redis not available, returning 0");
		return 0;
	}

	try {
		const count = await client.get(REDIS_KEY);
		if (count === null) {
			console.log("[user-count] Key doesn't exist in Redis, starting from 0");
			return 0;
		}
		const numCount = parseInt(count, 10);
		const validCount = !isNaN(numCount) ? numCount : 0;
		console.log("[user-count] Read count from Redis:", validCount);
		return validCount;
	} catch (error) {
		console.error("[user-count] Error reading user count from Redis:", error);
		return 0;
	}
}

/**
 * Saves the user count to Redis (never expires)
 */
export async function saveUserCount(count: number): Promise<void> {
	const client = getRedisClient();
	if (!client) {
		console.warn("[user-count] Redis not available, cannot save count");
		return;
	}

	try {
		const validCount = typeof count === "number" && !isNaN(count) ? count : 0;
		// Set key with no expiration (persist forever)
		await client.set(REDIS_KEY, validCount.toString());
		console.log("[user-count] Saved count to Redis:", validCount);
	} catch (error) {
		console.error("[user-count] Error saving user count to Redis:", error);
		// Don't throw - allow the function to continue even if Redis write fails
	}
}

/**
 * Increments the user count atomically using Redis INCR
 */
export async function incrementUserCount(): Promise<number> {
	const client = getRedisClient();
	if (!client) {
		console.warn("[user-count] Redis not available, returning default count");
		return 1;
	}

	try {
		// Check if client is ready/connected
		if (client.status !== "ready" && client.status !== "connect") {
			console.warn("[user-count] Redis client not ready, status:", client.status);
			return 1;
		}

		// Use INCR for atomic increment - this is the best way to handle counters in Redis
		// INCR automatically creates the key if it doesn't exist and sets it to 1
		const newCount = await Promise.race([
			client.incr(REDIS_KEY),
			new Promise<number>((resolve) => {
				setTimeout(() => {
					console.warn("[user-count] Redis INCR timed out");
					resolve(1);
				}, 1000); // 1 second timeout
			}),
		]);

		console.log("[user-count] Incremented count in Redis to:", newCount);

		// Key created by INCR has no expiration by default, so no need to call persist
		return newCount;
	} catch (error) {
		console.error("[user-count] Error incrementing user count in Redis:", error);
		// If everything fails, return 1 as a safe default
		return 1;
	}
}
