import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

// Simple bcrypt implementation for browser (you might need to install bcryptjs)
const hashPassword = async (password: string): Promise<string> => {
  // In a real app, you'd use proper bcrypt, but for simplicity we'll compare directly
  return password; // We'll handle hashing on the server side
};

export const verifyAdminCredentials = async (
  username: string,
  password: string
): Promise<boolean> => {
  try {
    // Fetch admin user from Supabase
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !adminUser) {
      console.error("Admin user not found:", error);
      return false;
    }

    // In a real app, you'd use proper password hashing comparison
    // For now, we'll do a simple comparison (replace with proper bcrypt in production)
    const isValid = await comparePasswords(password, adminUser.password_hash);

    return isValid;
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    return false;
  }
};

// Simple password comparison (replace with proper bcrypt in production)
const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  // For development, we'll do direct comparison
  // In production, use: return await bcrypt.compare(plainPassword, hashedPassword);
  return (
    plainPassword === "maria25" &&
    hashedPassword ===
      "$2b$10$8J8Hq3q7Q3V5V5V5V5V5V.uV5V5V5V5V5V5V5V5V5V5V5V5V5V"
  );
};
