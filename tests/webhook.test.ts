import { describe, it, expect } from "vitest";
import { verifyFathomSignature, parseTranscript } from "../lib/fathom/webhook";
import crypto from "crypto";

describe("Fathom Webhook", () => {
  describe("verifyFathomSignature", () => {
    it("should verify valid HMAC signature", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";
      
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(payload);
      const signature = hmac.digest("hex");

      const result = verifyFathomSignature(payload, signature, secret);
      expect(result).toBe(true);
    });

    it("should reject invalid signature", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";
      const badSignature = "invalid-signature-123";

      expect(() => {
        verifyFathomSignature(payload, badSignature, secret);
      }).toThrow();
    });

    it("should reject signature with wrong secret", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";
      const wrongSecret = "wrong-secret";
      
      const hmac = crypto.createHmac("sha256", wrongSecret);
      hmac.update(payload);
      const signature = hmac.digest("hex");

      expect(() => {
        verifyFathomSignature(payload, signature, secret);
      }).toThrow();
    });
  });

  describe("parseTranscript", () => {
    it("should parse transcript array into formatted string", () => {
      const transcript = [
        { text: "Hello, how are you?", speaker: "John" },
        { text: "I'm doing great, thanks!", speaker: "Jane" },
      ];

      const result = parseTranscript(transcript);
      expect(result).toContain("John: Hello, how are you?");
      expect(result).toContain("Jane: I'm doing great, thanks!");
    });

    it("should handle missing speaker names", () => {
      const transcript = [
        { text: "Hello", speaker: undefined },
      ];

      const result = parseTranscript(transcript);
      expect(result).toContain("Unknown: Hello");
    });

    it("should return empty string for empty transcript", () => {
      const result = parseTranscript([]);
      expect(result).toBe("");
    });

    it("should return empty string for undefined transcript", () => {
      const result = parseTranscript(undefined);
      expect(result).toBe("");
    });
  });
});

