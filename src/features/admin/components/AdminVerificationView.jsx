import { Check, Eye, ShieldCheck, X } from "lucide-react";
import { VERIFICATION_TYPES } from "@/features/admin/utils/adminConstants";
import {
  formatDate,
  getInitials,
  pillClass,
} from "@/features/admin/utils/adminFormatters";

const AdminVerificationView = ({
  verificationType,
  setVerificationType,
  queue,
  queueLoading,
  queueError,
  selectedRecord,
  setSelectedRecordId,
  recordDetails,
  detailsLoading,
  detailsError,
  actionLoading,
  rejectReason,
  setRejectReason,
  rejectedFieldsText,
  setRejectedFieldsText,
  onVerifyAction,
}) => {
  return (
    <section className="space-y-8">
      <article className="rounded-[24px] border border-[#d9d8ea] bg-white shadow-[0_12px_28px_rgba(25,23,73,0.08)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e3f2] px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#68648a]">
              Approval Queue
            </p>
            <h2 className="text-2xl font-bold text-[#1b1a4f]">
              {verificationType === VERIFICATION_TYPES.guide
                ? "Guide verification"
                : "Tourist verification"}
            </h2>
          </div>
          <div className="inline-flex rounded-full border border-[#cbc9e2] bg-[#f3f2fb] p-1">
            <button
              type="button"
              onClick={() => setVerificationType(VERIFICATION_TYPES.guide)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                verificationType === VERIFICATION_TYPES.guide
                  ? "bg-white text-[#201f63] shadow"
                  : "text-[#6e6b91]"
              }`}
            >
              Guides
            </button>
            <button
              type="button"
              onClick={() => setVerificationType(VERIFICATION_TYPES.tourist)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                verificationType === VERIFICATION_TYPES.tourist
                  ? "bg-white text-[#201f63] shadow"
                  : "text-[#6e6b91]"
              }`}
            >
              Tourists
            </button>
          </div>
        </header>

        {queueError ? (
          <div className="px-6 py-6 text-sm text-[#a42f2f]">{queueError}</div>
        ) : queueLoading ? (
          <div className="px-6 py-8 text-sm text-[#6d6a90]">
            Loading queue...
          </div>
        ) : queue.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#6d6a90]">
            No pending submissions.
          </div>
        ) : (
          <ul className="divide-y divide-[#ecebf7]">
            {queue.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => setSelectedRecordId(record.id)}
                  className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition ${
                    selectedRecord?.id === record.id
                      ? "bg-[#f2f1fc]"
                      : "hover:bg-[#f8f8fe]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#080a8f] text-sm font-bold text-white">
                      {getInitials(record.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[#1c1a4f]">
                        {record.fullName}
                      </p>
                      <p className="truncate text-sm text-[#706d94]">
                        {record.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${pillClass(record.status)}`}
                    >
                      {record.status}
                    </span>
                    <span className="text-xs text-[#7f7ca1]">
                      {formatDate(record.createdAt)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="rounded-[24px] border border-[#d9d8ea] bg-white p-6 shadow-[0_12px_28px_rgba(25,23,73,0.08)]">
        {detailsError ? (
          <div className="mb-4 text-sm text-[#a42f2f]">{detailsError}</div>
        ) : null}
        {detailsLoading ? (
          <p className="text-sm text-[#6d6a90]">
            Loading verification details...
          </p>
        ) : recordDetails ? (
          <>
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-[#1a194e]">
                  {recordDetails.fullName}
                </h3>
                {recordDetails.bio ? (
                  <p className="mt-1 max-w-3xl text-sm text-[#666387]">
                    {recordDetails.bio}
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${pillClass(recordDetails.status)}`}
              >
                {recordDetails.status}
              </span>
            </header>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-[#e3e2f0] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#716e92]">
                  City
                </p>
                <p className="mt-1 font-semibold text-[#23215f]">
                  {recordDetails.city}
                </p>
              </div>
              <div className="rounded-xl border border-[#e3e2f0] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#716e92]">
                  Email
                </p>
                <p className="mt-1 truncate font-semibold text-[#23215f]">
                  {recordDetails.email}
                </p>
              </div>
              <div className="rounded-xl border border-[#e3e2f0] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#716e92]">
                  Phone
                </p>
                <p className="mt-1 font-semibold text-[#23215f]">
                  {recordDetails.phone}
                </p>
              </div>
              <div className="rounded-xl border border-[#e3e2f0] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#716e92]">
                  Submitted
                </p>
                <p className="mt-1 font-semibold text-[#23215f]">
                  {recordDetails.submittedAt}
                </p>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-[#e5e4f1] p-4">
              <h4 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#67638a]">
                Uploaded documents
              </h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {recordDetails.documents.map((doc) => (
                  <article
                    key={doc.key}
                    className="rounded-xl border border-[#e6e5f1] bg-[#fafafe] p-3"
                  >
                    <div className="grid min-h-44 place-items-center rounded-lg border border-[#d8d6eb] bg-[#f1f0f8]">
                      <ShieldCheck className="h-12 w-12 text-[#1a1a50]" />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#22205f]">
                          {doc.label}
                        </p>
                        <p className="text-xs text-[#7a769b]">
                          {doc.sizeLabel || "Document uploaded"}
                        </p>
                      </div>
                      <a
                        href={doc.secureUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[#cdcae2] px-3 py-1 text-xs font-semibold text-[#37357e] hover:bg-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#dfddec] p-3">
                <label
                  htmlFor="rejectReason"
                  className="text-sm font-semibold text-[#2a2868]"
                >
                  Rejection reason
                </label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-[#cfcde4] px-3 py-2 text-sm text-[#1f1d57] outline-none ring-[#5852c5] transition focus:ring"
                  placeholder="Reason shown to the user when rejected"
                />
              </div>
              {verificationType === VERIFICATION_TYPES.guide ? (
                <div className="rounded-xl border border-[#dfddec] p-3">
                  <label
                    htmlFor="rejectedFields"
                    className="text-sm font-semibold text-[#2a2868]"
                  >
                    Rejected fields (optional)
                  </label>
                  <input
                    id="rejectedFields"
                    type="text"
                    value={rejectedFieldsText}
                    onChange={(event) =>
                      setRejectedFieldsText(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-[#cfcde4] px-3 py-2 text-sm text-[#1f1d57] outline-none ring-[#5852c5] transition focus:ring"
                    placeholder="nationalId, profilePhoto"
                  />
                </div>
              ) : null}
            </section>

            <footer className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  void onVerifyAction("approve");
                }}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#b9d89f] bg-[#f7ffed] px-4 py-3 font-semibold text-[#4f7c25] transition hover:bg-[#ecfad8] disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => {
                  void onVerifyAction("reject");
                }}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e2b2b2] bg-[#fff6f6] px-4 py-3 font-semibold text-[#ab3434] transition hover:bg-[#ffecec] disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </footer>
          </>
        ) : (
          <p className="text-sm text-[#6d6a90]">
            Select a record to preview documents.
          </p>
        )}
      </article>
    </section>
  );
};

export default AdminVerificationView;
