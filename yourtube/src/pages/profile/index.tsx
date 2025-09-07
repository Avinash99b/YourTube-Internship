import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/ThemeContext";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};
const PLAN_LIMITS: Record<string, { downloads: number; watch: number | null }> = {
  free: { downloads: 1, watch: 300 },
  bronze: { downloads: Infinity, watch: 420 },
  silver: { downloads: Infinity, watch: 600 },
  gold: { downloads: Infinity, watch: null },
};
const PLAN_PRICES: Record<string, number> = {
  bronze: 10,
  silver: 50,
  gold: 100,
};

export default function ProfilePage() {
  const { user, refreshUser } = useUser();
  const { theme } = useTheme();
  const [downloadsToday, setDownloadsToday] = useState(0);
  const [watchTimeToday, setWatchTimeToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    axiosInstance.get(`/auth/usage?userId=${user._id}`)
      .then(res => {
        setDownloadsToday(res.data.downloadsToday || 0);
        setWatchTimeToday(res.data.watchTimeToday || 0);
      })
      .catch(() => {
        setDownloadsToday(0);
        setWatchTimeToday(0);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpgradeClick = () => {
    setUpgradeOpen(true);
    setSelectedPlan(null);
    setError(null);
    setSuccess(null);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user?._id) return;
    setPaying(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Create order on backend
      const orderRes = await axiosInstance.post("/payment/create-order", { plan: selectedPlan });
      const { order } = orderRes.data;
      // 2. Load Razorpay script if not loaded
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      // 3. Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "YourTube",
        description: `Upgrade to ${PLAN_LABELS[selectedPlan]}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 4. Notify backend of payment success
            await axiosInstance.post("/payment/payment-success", {
              userId: user._id,
              plan: selectedPlan,
              paymentId: response.razorpay_payment_id,
            });
            setSuccess("Plan upgraded successfully!");
            setUpgradeOpen(false);
              refreshUser && refreshUser();
          } catch (e) {
            setError("Payment succeeded but failed to upgrade plan. Please contact support.");
          }
        },
        prefill: {
          email: user.email,
          name: user.name,
        },
        theme: {
          color: theme === "dark" ? "#18181b" : "#fff",
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPaying(false);
    }
  };

  if (!user) return <div className="p-8">Please log in to view your profile.</div>;

  const plan = user.plan || "free";
    console.log(user)
  const planLabel = PLAN_LABELS[plan] || plan;
  const planLimit = PLAN_LIMITS[plan];
  const planExpiry = user.planExpiry ? new Date(user.planExpiry).toLocaleString() : "-";

  return (
    <div
      className={`max-w-xl mx-auto p-8 rounded shadow mt-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[var(--card)] text-[var(--card-foreground)]"
          : "bg-white text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-4">
        <div><b>Name:</b> {user.name || "-"}</div>
        <div><b>Email:</b> {user.email}</div>
        <div><b>Plan:</b> {planLabel}</div>
        <div><b>Plan Expiry:</b> {planExpiry}</div>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Usage Quotas</h2>
        <div>Downloads today: {downloadsToday} / {planLimit.downloads === Infinity ? "Unlimited" : planLimit.downloads}</div>
        <div>Watch time today: {Math.floor(watchTimeToday/60)} min {watchTimeToday%60}s / {planLimit.watch ? `${Math.floor(planLimit.watch/60)} min` : "Unlimited"}</div>
      </div>
      <div className="mb-4 flex gap-2">
        <Button href="/channel/[id]">Go to My Channel</Button>
        <Button variant="outline" onClick={handleUpgradeClick} disabled={plan === "gold"}>Upgrade Plan</Button>
      </div>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {upgradeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-zinc-900 p-6 rounded shadow-lg min-w-[320px] relative`}>
            <button className="absolute top-2 right-2 text-xl" onClick={() => setUpgradeOpen(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Upgrade Plan</h2>
            <div className="flex flex-col gap-2 mb-4">
              {Object.keys(PLAN_PRICES).map(p => (
                <button
                  key={p}
                  className={`border rounded px-4 py-2 flex justify-between items-center ${selectedPlan === p ? 'bg-blue-100 dark:bg-blue-900' : ''} ${plan === p ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={plan === p}
                  onClick={() => handlePlanSelect(p)}
                >
                  <span>{PLAN_LABELS[p]}</span>
                  <span>₹{PLAN_PRICES[p]}</span>
                </button>
              ))}
            </div>
            <Button onClick={handlePayment} disabled={!selectedPlan || paying} className="w-full">
              {paying ? "Processing..." : "Pay & Upgrade"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
