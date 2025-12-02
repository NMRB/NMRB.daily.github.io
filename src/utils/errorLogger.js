/**
 * Global Error Logger Utility
 * Logs errors for debugging purposes only - controlled by environment variables
 */

import log from "loglevel";

class ErrorLogger {
  constructor() {
    this.enabled =
      import.meta.env.VITE_ENABLE_ERROR_LOGGING === "true" ||
      import.meta.env.DEV;
    this.errorCount = 0; // Counter for unique file names
    this.errorLog = []; // In-memory error log for fallback
    this.logBuffer = []; // Buffer for batch file operations

    if (this.enabled) {
      // Configure loglevel
      log.setLevel(import.meta.env.DEV ? "debug" : "error");
      this.initializeGlobalHandlers();
      this.setupLogBuffer();
    }
  }

  /**
   * Setup log buffer for efficient file operations
   */
  setupLogBuffer() {
    // Flush buffer every 5 seconds or when it reaches 10 entries
    this.bufferInterval = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flushLogBuffer();
      }
    }, 5000);

    // Flush on page unload
    window.addEventListener("beforeunload", () => {
      if (this.logBuffer.length > 0) {
        this.flushLogBuffer();
      }
    });
  }

  /**
   * Initialize global error handlers (only in debug mode)
   */
  initializeGlobalHandlers() {
    if (!this.enabled) return;

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.logError("Unhandled Promise Rejection", {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack,
      });
    });

    // Handle general JavaScript errors
    window.addEventListener("error", (event) => {
      this.logError("JavaScript Error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Handle React component errors (will be caught by Error Boundary)
    this.setupReactErrorHandler();
  }

  /**
   * Setup React error handler integration
   */
  setupReactErrorHandler() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a React error
      if (args.length > 0 && typeof args[0] === "string") {
        const message = args[0];
        if (message.includes("React") || message.includes("component")) {
          this.logError("React Component Error", {
            message: args.join(" "),
            timestamp: new Date().toISOString(),
          });
        }
      }
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * Log an error with details (debug mode only)
   * @param {string} type - Type of error
   * @param {Object} errorDetails - Error details object
   * @param {Error} error - Optional Error object
   */
  logError(type, errorDetails, error = null) {
    if (!this.enabled) {
      // Only log to console in production if error logging is disabled
      if (import.meta.env.PROD) {
        console.error(`${type}:`, errorDetails, error);
      }
      return;
    }

    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    const url = window.location.href;

    const logEntry = {
      timestamp,
      type,
      url,
      userAgent,
      errorDetails,
      stack: error?.stack || errorDetails?.stack || "No stack trace available",
    };

    const logMessage = this.formatLogEntry(logEntry);

    // Use loglevel for better console logging
    log.error("Error logged:", logEntry);

    // Add to buffer for batch file operations
    this.logBuffer.push({ logMessage, logEntry });

    // Flush buffer immediately if it gets too large (10+ errors)
    if (this.logBuffer.length >= 10) {
      log.info("Buffer full, flushing immediately");
      this.flushLogBuffer();
    }

    // Save to file (debug mode only)
    this.saveToFile(logMessage, logEntry);

    // Optional: Send to external service in production
    if (import.meta.env.PROD) {
      this.sendToExternalService(logEntry);
    }
  }

  /**
   * Format log entry for file output
   * @param {Object} logEntry - Log entry object
   * @returns {string} Formatted log message
   */
  safeStringify(obj, replacer, spaces) {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      function (key, value) {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular Reference]";
          }
          seen.add(value);
        }
        return replacer ? replacer.call(this, key, value) : value;
      },
      spaces
    );
  }

  safeStringify(obj, replacer, spaces) {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      function (key, value) {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular Reference]";
          }
          seen.add(value);
        }
        return replacer ? replacer.call(this, key, value) : value;
      },
      spaces
    );
  }

  formatLogEntry(logEntry) {
    return `
=== ERROR LOG ENTRY ===
Timestamp: ${logEntry.timestamp}
Type: ${logEntry.type}
URL: ${logEntry.url}
User Agent: ${logEntry.userAgent}

Error Details:
${this.safeStringify(logEntry.errorDetails, null, 2)}

Stack Trace:
${logEntry.stack}

========================

`;
  }

  /**
   * Save log message to individual error log file
   * @param {string} logMessage - Formatted log message
   * @param {Object} logEntry - Structured log entry
   */
  async saveToFile(logMessage, logEntry) {
    if (!this.enabled) return;

    try {
      // Add to in-memory log as fallback
      this.errorLog.push(logEntry);

      // Increment error counter for unique file names
      this.errorCount++;

      // Create individual log file for this error
      await this.createIndividualLogFile(logMessage, logEntry);
    } catch (error) {
      console.warn("Failed to save error log to file:", error);
      // Fallback: keep in memory for later download
    }
  }

  /**
   * Create individual log file for each error
   * @param {string} logMessage - Formatted log message
   * @param {Object} logEntry - Structured log entry
   */
  async createIndividualLogFile(logMessage, logEntry) {
    if (!this.enabled) return;

    try {
      // Generate unique filename based on timestamp and error count
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const errorType = logEntry.type.replace(/\s+/g, "_").toLowerCase();
      const filename = `error_${timestamp}_${errorType}_${this.errorCount}.log`;

      // Try to use File System Access API for direct file creation
      if ("showSaveFilePicker" in window) {
        await this.createFileWithSystemAPI(filename, logMessage);
      } else {
        // Fallback: automatically download the individual error file
        this.downloadIndividualErrorFile(filename, logMessage);
      }
    } catch (error) {
      console.warn("Failed to create individual log file:", error);
      // Error will remain in memory for batch download
    }
  }

  /**
   * Create file using File System Access API
   * @param {string} filename - Name of the log file
   * @param {string} content - Content to write
   */
  async createFileWithSystemAPI(filename, content) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Log files",
            accept: { "text/plain": [".log"] },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      log.info("Error logged to individual file:", filename);
    } catch (error) {
      if (error.name === "AbortError") {
        // User cancelled, fallback to auto-download
        this.downloadIndividualErrorFile(filename, content);
      } else {
        throw error;
      }
    }
  }

  /**
   * Download individual error file automatically
   * @param {string} filename - Name of the log file
   * @param {string} content - Content to download
   */
  downloadIndividualErrorFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    log.info("Error log downloaded:", filename);
  }

  /**
   * Flush log buffer to file
   */
  flushLogBuffer() {
    if (!this.enabled || this.logBuffer.length === 0) return;

    try {
      const bufferLength = this.logBuffer.length;

      // Create combined log file from buffer
      const combinedContent = this.logBuffer
        .map((item) => item.logMessage)
        .join(""); // Don't add extra newlines since logMessage already has them

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `error_batch_${timestamp}_${bufferLength}_errors.log`;

      // Try to create single file with all buffered errors
      if ("showSaveFilePicker" in window) {
        this.createBatchFileWithSystemAPI(filename, combinedContent);
      } else {
        this.downloadIndividualErrorFile(filename, combinedContent);
      }

      // Clear buffer after flushing
      this.logBuffer = [];
      log.info(`Flushed ${bufferLength} errors to batch log file: ${filename}`);
    } catch (error) {
      log.error("Failed to flush log buffer:", error);
    }
  }

  /**
   * Create batch file using File System Access API
   * @param {string} filename - Name of the log file
   * @param {string} content - Content to write
   */
  async createBatchFileWithSystemAPI(filename, content) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Log files",
            accept: { "text/plain": [".log"] },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      log.info("Batch error log created:", filename);
    } catch (error) {
      if (error.name === "AbortError") {
        // User cancelled, fallback to auto-download
        log.info("User cancelled file picker, downloading instead");
        this.downloadIndividualErrorFile(filename, content);
      } else {
        log.error("Error creating batch file:", error);
        // Fallback to download on any other error
        this.downloadIndividualErrorFile(filename, content);
      }
    }
  }

  /**
   * Download accumulated error logs as a file
   */
  downloadAccumulatedLogs() {
    if (!this.enabled || this.errorLog.length === 0) return;

    const logContent = this.errorLog
      .map((entry) => this.formatLogEntry(entry))
      .join("");

    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error_log_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Clear the accumulated logs after download
    this.errorLog = [];
    log.info("Error logs downloaded and cleared");
  }

  /**
   * Download current log file (alias for compatibility)
   */
  downloadLogFile() {
    this.downloadAccumulatedLogs();
  }

  /**
   * Send error to external logging service (placeholder for production)
   * @param {Object} logEntry - Log entry object
   */
  async sendToExternalService(logEntry) {
    // Placeholder for external logging service integration
    // Example: Sentry, LogRocket, or custom endpoint
    try {
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
    } catch (error) {
      console.warn("Failed to send error to external service:", error);
    }
  }

  /**
   * Manually log an error (debug mode only)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @param {Error} error - Optional Error object
   */
  log(message, details = {}, error = null) {
    this.logError("Manual Log", { message, ...details }, error);
  }

  /**
   * Log Firebase errors specifically (debug mode only)
   * @param {string} operation - Firebase operation that failed
   * @param {Object} error - Firebase error object
   */
  logFirebaseError(operation, error) {
    this.logError(
      "Firebase Error",
      {
        operation,
        code: error.code,
        message: error.message,
        details: error.details || {},
      },
      error
    );
  }

  /**
   * Log network/API errors (debug mode only)
   * @param {string} url - Request URL
   * @param {Object} error - Error object
   */
  logNetworkError(url, error) {
    this.logError(
      "Network Error",
      {
        url,
        status: error.status,
        statusText: error.statusText,
        message: error.message,
      },
      error
    );
  }

  /**
   * Clear error logs (debug mode only)
   */
  clearLogs() {
    if (!this.enabled) return;

    // Flush any remaining buffer before clearing
    if (this.logBuffer.length > 0) {
      this.flushLogBuffer();
    }

    this.errorLog = [];
    this.logBuffer = [];
    this.errorCount = 0; // Reset error counter

    // Clear the interval if it exists
    if (this.bufferInterval) {
      clearInterval(this.bufferInterval);
      this.bufferInterval = null;
    }

    log.info("Error logs cleared");
  }

  /**
   * Get current log data (debug mode only)
   * @returns {string} Current log data
   */
  getLogs() {
    if (!this.enabled) return "Error logging disabled";
    if (this.errorLog.length === 0) return "No logs available";

    return this.errorLog.map((entry) => this.formatLogEntry(entry)).join("");
  }

  /**
   * Get error log statistics
   * @returns {Object} Log statistics
   */
  getLogStats() {
    if (!this.enabled) return { enabled: false };

    return {
      enabled: true,
      totalErrors: this.errorLog.length,
      bufferedErrors: this.logBuffer.length,
      totalFilesCreated: this.errorCount,
      errorTypes: this.errorLog.reduce((acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {}),
      loggingMethod: "individual_files_with_buffer",
      logLevel: log.getLevel(),
    };
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;

// Export individual methods for convenience
export const {
  log: logError,
  logFirebaseError,
  logNetworkError,
  clearLogs,
  getLogs,
  downloadLogFile,
} = errorLogger;
