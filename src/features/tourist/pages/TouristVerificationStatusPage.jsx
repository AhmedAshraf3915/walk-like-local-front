import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { touristApi } from "@/features/touristVerification/api/touristApi";

const STATUS_META = {
  pending: { label: "Pending Review", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-300" },
  approved: { label: "Verified", color: "text-green-700", bg: "bg-green-50", border: "border-green-300" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
};

export default function TouristVerificationStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const fileRef = useRef(null);

  const fetchStatus = () => {
    touristApi.getVerificationStatus()
      .then((data) => setStatus(data?.verificationStatus || data?.status || null))
      .catch(() => setMsg({ type: "error", text: "Failed to load status." }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleResubmit = async () => {
    if (!file) return;
    setUploading(true);
    setMsg({ type: "", text: "" });
    try {
      await touristApi.resubmitPassport(file);
      setMsg({ type: "success", text: "Passport resubmitted. Awaiting review." });
      setFile(null);
      fetchStatus();
    } catch {
      setMsg({ type: "error", text: "Resubmission failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setMsg({ type: "", text: "" });
    try {
      await touristApi.submitPassport(file);
      setMsg({ type: "success", text: "Passport submitted for verification." });
      setFile(null);
      fetchStatus();
    } catch {
      setMsg({ type: "error", text: "Submission failed." });
    } finally {
      setUploading(false);
    }
  };

  const meta = STATUS_META[status] || STATUS_META.pending;

  if (loading) {
    return <div className="min-h-screen bg-[#f3f2fa] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f2fa]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
        <div className="rounded-xl sm:rounded-2xl border border-[#dddced] bg-white p-4 sm:p-6 lg:p-8 shadow-[0_20px_50px_rgba(32,30,88,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-[#7b79a8]">
                Verification
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#100f45]">Identity Verification</h1>
            </div>
            <Link to="/tourist/profile"
              className="rounded-full border border-[#cfcee6] bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-[#323166]">
              Back to Profile
            </Link>
          </div>

          <div className={`rounded-xl border-2 ${meta.border} ${meta.bg} px-4 py-3 sm:py-4 mb-6`}>
            <p className={`text-xs sm:text-sm font-semibold ${meta.color}`}>
              Status: {meta.label}
            </p>
            {status === "approved" && (
              <p className="text-xs text-green-600 mt-1">You are verified! Guides trust verified tourists.</p>
            )}
            {status === "rejected" && (
              <p className="text-xs text-red-600 mt-1">Your previous submission was rejected. Please upload a valid passport and resubmit.</p>
            )}
            {(!status || status === "pending") && (
              <p className="text-xs text-yellow-600 mt-1">Your documents are being reviewed. Check back later.</p>
            )}
          </div>

          {(!status || status === "rejected") && (
            <div className="space-y-4">
              <div
                className={`rounded-xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-colors ${file ? "border-[#010170] bg-[#f4f4f8]" : "border-[#aaaacf] hover:border-[#010170] bg-[#fafaff]"}`}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-[#010170]">{file.name}</p>
                    <p className="text-xs text-[#aaaacf] mt-1">{(file.size / 1024).toFixed(0)} KB — tap to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[#353572]">Upload passport or ID</p>
                    <p className="text-xs text-[#aaaacf] mt-1">JPG, PNG or PDF · max 10 MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              {file && (
                <button
                  onClick={status === "rejected" ? handleResubmit : handleSubmit}
                  disabled={uploading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#010170] to-[#5656a0] px-5 py-2.5 text-xs sm:text-sm font-medium text-white disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : status === "rejected" ? "Resubmit for Verification" : "Submit for Verification"}
                </button>
              )}
            </div>
          )}

          {msg.text && (
            <p className={`mt-4 rounded-xl border px-3 sm:px-4 py-2 text-xs sm:text-sm ${msg.type === "error" ? "border-[#efc2c2] bg-[#fff2f2] text-[#a12121]" : "border-[#bedfb8] bg-[#eefce9] text-[#1f6a21]"}`}>
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
