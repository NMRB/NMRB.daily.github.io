import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AccountPage = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError("");
    setLoading(true);

    const { error } = await logout();

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate("/login");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
            Account Settings
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Manage your account and preferences
          </p>
        </div>

        {/* Navigation */}
        <div
          style={{
            padding: "20px 30px",
            borderBottom: "1px solid #eee",
            display: "flex",
            gap: "20px",
          }}
        >
          <Link
            to="/"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ← Back to Daily Planner
          </Link>
          <Link
            to="/weekly"
            style={{
              color: "#007bff",
              textDecoration: "none",
            }}
          >
            Weekly Analytics
          </Link>
        </div>

        <div style={{ padding: "30px" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#fee",
                color: "#c33",
                padding: "15px",
                borderRadius: "4px",
                marginBottom: "20px",
                border: "1px solid #fcc",
              }}
            >
              {error}
            </div>
          )}

          {/* Profile Information */}
          <div style={{ marginBottom: "40px" }}>
            <h2
              style={{
                marginBottom: "20px",
                color: "#333",
                fontSize: "20px",
                borderBottom: "2px solid #007bff",
                paddingBottom: "10px",
              }}
            >
              Profile Information
            </h2>

            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 15px 0",
                    color: "#495057",
                    fontSize: "16px",
                  }}
                >
                  Account Details
                </h3>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Email:</strong> {currentUser?.email || "N/A"}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Display Name:</strong>{" "}
                  {currentUser?.displayName || "Not set"}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>User ID:</strong>{" "}
                  {currentUser?.uid
                    ? currentUser.uid.substring(0, 16) + "..."
                    : "N/A"}
                </div>
                <div>
                  <strong>Email Verified:</strong>{" "}
                  {currentUser?.emailVerified ? "Yes" : "No"}
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 15px 0",
                    color: "#495057",
                    fontSize: "16px",
                  }}
                >
                  Account Activity
                </h3>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Account Created:</strong>{" "}
                  {formatDate(currentUser?.metadata?.creationTime)}
                </div>
                <div>
                  <strong>Last Sign In:</strong>{" "}
                  {formatDate(currentUser?.metadata?.lastSignInTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          {currentUser?.providerData && currentUser.providerData.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h2
                style={{
                  marginBottom: "20px",
                  color: "#333",
                  fontSize: "20px",
                  borderBottom: "2px solid #007bff",
                  paddingBottom: "10px",
                }}
              >
                Sign-in Methods
              </h2>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                }}
              >
                {currentUser.providerData.map((provider, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom:
                        index < currentUser.providerData.length - 1
                          ? "15px"
                          : "0",
                      padding: "10px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    {provider.providerId === "google.com" && (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          style={{ marginRight: "10px" }}
                        >
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Google Account</span>
                      </>
                    )}
                    {provider.providerId === "password" && (
                      <>
                        <span
                          style={{
                            marginRight: "10px",
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#6c757d",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                          }}
                        >
                          @
                        </span>
                        <span>Email & Password</span>
                      </>
                    )}
                    <span
                      style={{
                        marginLeft: "auto",
                        color: "#6c757d",
                        fontSize: "14px",
                      }}
                    >
                      {provider.email}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <h2
              style={{
                marginBottom: "20px",
                color: "#333",
                fontSize: "20px",
                borderBottom: "2px solid #dc3545",
                paddingBottom: "10px",
              }}
            >
              Account Actions
            </h2>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff5f5",
                borderRadius: "6px",
                border: "1px solid #fed7d7",
              }}
            >
              <p
                style={{
                  margin: "0 0 20px 0",
                  color: "#721c24",
                  lineHeight: "1.5",
                }}
              >
                Signing out will log you out of your account. You'll need to
                sign in again to access your data.
              </p>

              <button
                onClick={handleLogout}
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  backgroundColor: loading ? "#ccc" : "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
