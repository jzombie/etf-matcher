/**
 * Validates a topic name or subscription string to ensure it follows MQTT rules
 * and does not contain any wildcard characters.
 * @param {string} topic - The topic name or subscription string to validate.
 * @returns {boolean} - Returns true if the topic or subscription is valid, false otherwise.
 */
export default function validateTopic(topic: string): boolean {
  // Define a set of undesirable characters including wildcards
  const undesirableChars = new Set(["#", "+", "\u0000"]);

  // Check the length limit
  if (topic.length > 65535) {
    return false;
  }

  // Check for leading or trailing slashes
  if (topic.startsWith("/") || topic.endsWith("/")) {
    return false;
  }

  // Don't allow meta channels
  if (topic.endsWith("/presence") || topic.endsWith("/messages")) {
    return false;
  }

  // Split the topic into levels
  const levels = topic.split("/");

  for (const level of levels) {
    // Check for empty levels
    if (level === "") {
      return false;
    }

    // Check for undesirable characters
    for (const char of level) {
      if (undesirableChars.has(char)) {
        return false;
      }
    }
  }

  // If all checks pass, return true
  return true;
}
