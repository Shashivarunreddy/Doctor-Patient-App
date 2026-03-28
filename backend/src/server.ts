import app from "./app";
import { env } from "./config/env";
import { seedAdmin } from "./modules/auth/auth.service";

const startServer = async () => {
  try {
    // Seed the single admin user if it doesn't exist
    await seedAdmin();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();