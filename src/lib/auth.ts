import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { createPrismaClientFactory } from "@/services/prisma/prisma-client.factory";

const { clientOptions } = createPrismaClientFactory({
  connectionString: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV
});

const prisma = new PrismaClient(clientOptions);
export const auth = betterAuth({
  appName: "LifePilot",
  /*
  trustedOrigins: async (request) => {
		// request is undefined during initialization and auth.api calls
		if (!request) {
			return ["https://my-frontend.com"];
		}
		// Dynamic logic based on the request
		return ["https://dynamic-origin.com"];
	}
    trustedOrigins: [
		"https://*.example.com", // trust all HTTPS subdomains of example.com
		"http://*.dev.example.com" // trust all HTTP subdomains of dev.example.com
	]
    secondaryStorage: {
    	// Your implementation here
    },
  */
  secrets: [
    { version: 2, value: "new-secret-key" },
    { version: 1, value: "old-secret-key" }
  ],
  experimental: { joins: true },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id"
    },
    additionalFields: {
      // Additional fields for the session table
      customField: {
        type: "string"
      }
    },
    storeSessionInDatabase: true, // Store session in database when secondary storage is provided (default: `false`)
    cookieCache: {
      enabled: true, // Enable caching session in cookie (default: `false`)
      maxAge: 300 // 5 minutes
    }
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    // onExistingUserSignUp
    // onPasswordReset
    // password
    async sendVerificationEmail({ email, url }, request) {
      console.log("sendVerificationEmail called with:", { email, url, request });
      // En NestJS, podrías llamar a un servicio externo o una cola
      // Ejemplo: disparar y olvidar para no bloquear el Event Loop
      console.log(`Enviando correo a ${email}...`);

      // Simulación de envío (Background Task)
      /*
      myEmailService
        .send({
          to: email,
          subject: "Verifica tu cuenta",
          body: `Haz clic aquí: ${url}`
        })
        .catch((err) => {
          // Es vital capturar el error porque al no haber 'await',
          // si falla, podría tumbar el proceso si no se maneja.
          console.error("Error enviando email en background:", err);
        });*/
    }
    /**
    plugins: [
		emailOTP({
			sendVerificationOTP: async ({ email, otp, type }) => {
				// Send OTP to user's email
			}
		})
	],
  	user: {
		modelName: "users",
		fields: {
			email: "emailAddress",
			name: "fullName"
		},
		additionalFields: {
			customField: {
				type: "string",
			}
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailConfirmation: async ({ user, newEmail, url, token }) => {
				// Send change email confirmation to the old email
			},
			updateEmailWithoutVerification: false // Update email without verification if user is not verified
		},
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url, token }) => {
				// Send delete account verification
			},
			beforeDelete: async (user) => {
				// Perform actions before user deletion
			},
			afterDelete: async (user) => {
				// Perform cleanup after user deletion
			}
		}
	},
  account: {
		modelName: "accounts",
		fields: {
			userId: "user_id"
		},
    updateAccountOnSignIn: true, // Update account data on each sign-in (e.g., last login timestamp)
		encryptOAuthTokens: true, // Encrypt OAuth tokens before storing them in the database
		accountLinking: {
			enabled: true,
			trustedProviders: ["email-password"], // or async (request) => ["google", "github"]
			allowDifferentEmails: false
		}
	},
  secondaryStorage: {
		// your Redis or KV implementation
	},
	verification: {
		disableCleanup: false,
		storeIdentifier: "hashed"
	},
  rateLimit: {
		enabled: true,
		customRules: {
			"/example/path": {
				window: 10,
				max: 100
			}
		},
		modelName: "rateLimit"
	},
  advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
			disableIpTracking: false
		},
		useSecureCookies: true,
		disableCSRFCheck: false,
		disableOriginCheck: false,
		crossSubDomainCookies: {
			enabled: true,
			additionalCookies: ["custom_cookie"],
			domain: "example.com"
		},
		cookies: {
			session_token: {
				name: "custom_session_token",
				attributes: {
					httpOnly: true,
					secure: true
				}
			}
		},
		defaultCookieAttributes: {
			httpOnly: true,
			secure: true
		},
		// OAuth state configuration has been moved to account option
		// Use account.storeStateStrategy and account.skipStateCookieCheck instead
		cookiePrefix: "myapp",
		database: {
			// Use your own custom ID generator,
			// disable generating IDS so your database will generate them,
			// or use "serial" to use your database's auto-incrementing ID, or "uuid" to use a random UUID.
			generateId: (((options: {
				model: LiteralUnion<Models, string>;
				size?: number;
			}) => {
				return "my-super-unique-id";
			})) | false | "serial" | "uuid",
			defaultFindManyLimit: 100,
			experimentalJoins: false,
		},
		backgroundTasks: {
			handler: (promise) => { }
		},
		skipTrailingSlashes: true
	},
  logger: {
		disabled: false,
		disableColors: false,
		level: "warn",
		log: (level, message, ...args) => {
			// Custom logging implementation
			console.log(`[${level}] ${message}`, ...args);
		}
	}, logger: {
		level: "info",
		log: (level, message, ...args) => {
			// Send logs to a custom logging service
			myLoggingService.log({
				level,
				message,
				metadata: args,
				timestamp: new Date().toISOString()
			});
		}
	},
  databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					// Modify user data before creation
					return { data: { ...user, customField: "value" } };
				},
				after: async (user) => {
					// Perform actions after user creation
				}
			},
			update: {
				before: async (userData) => {
					// Modify user data before update
					return { data: { ...userData, updatedAt: new Date() } };
				},
				after: async (user) => {
					// Perform actions after user update
				}
			}
		},
		session: {
			// Session hooks
		},
		account: {
			// Account hooks
		},
		verification: {
			// Verification hooks
		}
	},
  onAPIError: {
		throw: true,
		onError: (error, ctx) => {
			// Custom error handling
			console.error("Auth error:", error);
		},
		errorURL: "/auth/error",
		customizeDefaultErrorPage: {
			colors: {
				background: "#ffffff",
				foreground: "#000000",
				primary: "#0070f3",
				primaryForeground: "#ffffff",
				mutedForeground: "#666666",
				border: "#e0e0e0",
				destructive: "#ef4444",
				titleBorder: "#0070f3",
				titleColor: "#000000",
				gridColor: "#f0f0f0",
				cardBackground: "#ffffff",
				cornerBorder: "#0070f3"
			},
			size: {
				radiusSm: "0.25rem",
				radiusMd: "0.5rem",
				radiusLg: "1rem",
				textSm: "0.875rem",
				text2xl: "1.5rem",
				text4xl: "2.25rem",
				text6xl: "3.75rem"
			},
			font: {
				defaultFamily: "system-ui, sans-serif",
				monoFamily: "monospace"
			},
			disableTitleBorder: false,
			disableCornerDecorations: false,
			disableBackgroundGrid: false
		}
	},
  hooks: {
		before: createAuthMiddleware(async (ctx) => {
			// Execute before processing the request
			console.log("Request path:", ctx.path);
		}),
		after: createAuthMiddleware(async (ctx) => {
			// Execute after processing the request
			console.log("Response:", ctx.context.returned);
		})
	},
  disabledPaths: ["/sign-up/email", "/sign-in/email"],
     */
  }
});
