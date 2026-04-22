import { GoogleGenAI } from "@google/genai";

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: "test-key-just-to-see-initialization" });
    console.log("Initialization successful");
  } catch (e: any) {
    console.error("Initialization error:", e.message);
  }
}

test();
