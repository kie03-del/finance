"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    job: "",
    wage: "",
    business: "",
  });
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<Array<{ id: string; name: string; balance: number }>>([]);
  const [loading, setLoading] = useState(false);

  const banks = [
    "Halifax",
    "Barclays",
    "Revolut",
    "Monzo",
    "Starling",
    "Lloyd's",
    "HSBC",
    "Tesco Bank",
    "American Express",
    "Santander",
    "NatWest",
    "Nationwide",
    "Virgin Money",
    "Chase"
  ];

  const toggleBank = (bank: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bank)
        ? prev.filter((b) => b !== bank)
        : [...prev, bank]
    );
  };

  const createLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      // Use a dummy user ID since we're in onboarding
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "onboarding-user",
          email: "temp@example.com",
        }),
      });

      if (!response.ok) throw new Error("Failed to create link token");

      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error creating link token:", error);
      alert("Failed to initialize bank linking");
    } finally {
      setLoading(false);
    }
  }, []);

  const onPlaidSuccess = useCallback(
    async (publicToken: string) => {
      setLoading(true);
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "onboarding-user",
            publicToken,
          }),
        });

        if (!response.ok) throw new Error("Failed to link account");

        const data = await response.json();
        setLinkedAccounts(data.accounts);
        alert(`Successfully linked ${data.accounts.length} account(s)!`);
      } catch (error) {
        console.error("Error linking account:", error);
        alert("Failed to link account");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedBanks(selected);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.job || !formData.wage) {
        alert("Please fill in your job and wage!");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedBanks.length === 0) {
        alert("Please select at least one bank!");
        return;
      }
      setStep(3);
      // Create link token for Plaid when entering step 3
      await createLinkToken();
    } else if (step === 3) {
      // Complete setup - navigate to dashboard
      router.push("/");
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#0f172a" : "#dbeafe"
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div
          className="text-center py-8 px-6 rounded-t-2xl shadow-lg transition-colors duration-300 mb-0"
          style={{
            backgroundColor: isDark ? "#0f172a" : "#dbeafe"
          }}
        >
          <h1
            className="text-5xl font-black tracking-tight mb-2"
            style={{
              color: isDark ? "#3b82f6" : "#2563eb"
            }}
          >
            Let's Get Started
          </h1>
          <p
            style={{
              color: isDark ? "#cbd5e1" : "#475569"
            }}
          >
            Step {step} of 3
          </p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-b-2xl shadow-2xl p-12 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff"
          }}
        >
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h2
                className="text-3xl font-black mb-8"
                style={{
                  color: isDark ? "#ffffff" : "#0f172a"
                }}
              >
                Tell us about yourself
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: isDark ? "#cbd5e1" : "#475569"
                    }}
                  >
                    What's your job or occupation?
                  </label>
                  <input
                    type="text"
                    name="job"
                    value={formData.job}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Teacher, Entrepreneur"
                    className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    style={{
                      backgroundColor: isDark ? "#334155" : "#f1f5f9",
                      color: isDark ? "#ffffff" : "#0f172a"
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: isDark ? "#cbd5e1" : "#475569"
                    }}
                  >
                    What's your average annual wage?
                  </label>
                  <input
                    type="number"
                    name="wage"
                    value={formData.wage}
                    onChange={handleInputChange}
                    placeholder="e.g., 50000"
                    className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    style={{
                      backgroundColor: isDark ? "#334155" : "#f1f5f9",
                      color: isDark ? "#ffffff" : "#0f172a"
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: isDark ? "#cbd5e1" : "#475569"
                    }}
                  >
                    Do you own any businesses? (Optional)
                  </label>
                  <input
                    type="text"
                    name="business"
                    value={formData.business}
                    onChange={handleInputChange}
                    placeholder="e.g., My Startup Ltd"
                    className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    style={{
                      backgroundColor: isDark ? "#334155" : "#f1f5f9",
                      color: isDark ? "#ffffff" : "#0f172a"
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Bank Selection */}
          {step === 2 && (
            <div>
              <h2
                className="text-3xl font-black mb-2"
                style={{
                  color: isDark ? "#ffffff" : "#0f172a"
                }}
              >
                Which banks do you use?
              </h2>

              <p
                className="mb-8 text-sm"
                style={{
                  color: isDark ? "#cbd5e1" : "#475569"
                }}
              >
                Click on banks to select them
              </p>

              {/* Bank Bubbles */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {banks.map((bank) => (
                  <button
                    key={bank}
                    onClick={() => toggleBank(bank)}
                    className="p-4 rounded-2xl font-bold text-base transition transform hover:scale-110 duration-200"
                    style={{
                      backgroundColor: selectedBanks.includes(bank)
                        ? "#2563eb"
                        : isDark
                        ? "#334155"
                        : "#f1f5f9",
                      color: selectedBanks.includes(bank)
                        ? "#ffffff"
                        : isDark
                        ? "#cbd5e1"
                        : "#0f172a",
                      border: selectedBanks.includes(bank)
                        ? "3px solid #1d4ed8"
                        : `3px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                      boxShadow: selectedBanks.includes(bank)
                        ? "0 0 20px rgba(37, 99, 235, 0.5)"
                        : "none"
                    }}
                  >
                    {bank}
                    {selectedBanks.includes(bank) && " ✓"}
                  </button>
                ))}
              </div>

              {/* Selected Banks Display */}
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: isDark ? "#334155" : "#f1f5f9"
                }}
              >
                <p
                  className="text-sm font-semibold mb-3"
                  style={{
                    color: isDark ? "#ffffff" : "#0f172a"
                  }}
                >
                  Selected Banks ({selectedBanks.length}):
                </p>
                <div className="flex flex-wrap gap-3">
                  {selectedBanks.length > 0 ? (
                    selectedBanks.map((bank) => (
                      <span
                        key={bank}
                        className="px-4 py-2 rounded-full text-sm font-bold text-white"
                        style={{
                          backgroundColor: "#2563eb"
                        }}
                      >
                        ✓ {bank}
                      </span>
                    ))
                  ) : (
                    <p
                      style={{
                        color: isDark ? "#cbd5e1" : "#475569"
                      }}
                    >
                      Select banks above to get started
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Link Banks with Plaid */}
          {step === 3 && (
            <div>
              <h2
                className="text-3xl font-black mb-2"
                style={{
                  color: isDark ? "#ffffff" : "#0f172a"
                }}
              >
                Link Your Banks
              </h2>

              <p
                className="mb-8 text-sm"
                style={{
                  color: isDark ? "#cbd5e1" : "#475569"
                }}
              >
                Connect your bank accounts to automatically sync transactions
              </p>

              {/* Link Button */}
              <button
                onClick={() => {
                  if (linkToken && ready) {
                    open();
                  } else if (!linkToken) {
                    createLinkToken();
                  }
                }}
                disabled={loading || !ready}
                className="w-full py-4 px-6 rounded-full font-bold text-lg text-white transition mb-6 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#2563eb"
                }}
                onMouseEnter={(e) => {
                  if (!loading && ready) {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
              >
                {loading ? "Initializing..." : linkToken && ready ? "Connect Bank Account" : "Preparing..."}
              </button>

              {/* Linked Accounts */}
              {linkedAccounts.length > 0 && (
                <div
                  className="p-6 rounded-lg mb-6"
                  style={{
                    backgroundColor: isDark ? "#334155" : "#f1f5f9"
                  }}
                >
                  <p
                    className="text-sm font-semibold mb-3"
                    style={{
                      color: isDark ? "#ffffff" : "#0f172a"
                    }}
                  >
                    Linked Accounts ({linkedAccounts.length}):
                  </p>
                  <div className="space-y-2">
                    {linkedAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDark ? "#1e293b" : "#ffffff"
                        }}
                      >
                        <p
                          className="font-semibold"
                          style={{
                            color: isDark ? "#ffffff" : "#0f172a"
                          }}
                        >
                          {account.name}
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: isDark ? "#cbd5e1" : "#475569"
                          }}
                        >
                          Balance: £{account.balance.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p
                className="text-xs text-center"
                style={{
                  color: isDark ? "#cbd5e1" : "#475569"
                }}
              >
                You can link additional accounts later from your dashboard
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-12">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 px-6 rounded-full font-bold text-lg transition transform hover:scale-105"
                style={{
                  backgroundColor: isDark ? "#334155" : "#f1f5f9",
                  color: isDark ? "#ffffff" : "#0f172a"
                }}
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 rounded-full font-bold text-lg text-white transition transform hover:scale-105"
              style={{
                backgroundColor: "#2563eb"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }}
            >
              {step === 3 ? "Complete Setup" : "Continue"}
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className="mt-8 w-full h-2 bg-slate-300 rounded-full overflow-hidden"
            style={{
              backgroundColor: isDark ? "#334155" : "#e2e8f0"
            }}
          >
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${(step / 3) * 100}%`,
                backgroundColor: "#2563eb"
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
