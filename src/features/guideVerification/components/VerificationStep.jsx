import {
  Check,
  CheckCircle2,
  Eye,
  FileCheck2,
  Pencil,
  Upload,
  Video,
} from "lucide-react";

const PRIMARY_ICON_CLASS = "h-9 w-9 text-[#1d1c4c] stroke-[1.8]";
const BADGE_ICON_CLASS = "h-5 w-5 text-[#1917a8] stroke-[1.9]";

const VerificationStep = ({
  loadingStatus,
  verificationStatus,
  assets,
  uploadingField,
  openFilePicker,
  nationalIdInputRef,
  licenseInputRef,
  profilePhotoInputRef,
  introVideoInputRef,
  handleUpload,
}) => {
  if (loadingStatus) {
    return (
      <section className="rounded-[18px] border border-[#c7c6dc] bg-white p-10 text-center text-[#161543]">
        Loading verification status...
      </section>
    );
  }

  if (verificationStatus === "pending") {
    return (
      <section className="rounded-[18px] border border-[#c7c6dc] bg-white px-8 py-14 text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[22px] bg-[#17169d] shadow-lg">
          <Check className="h-10 w-10 text-[#e5c655]" />
        </div>
        <h2 className="text-[50px] font-semibold text-[#0e0d3f]">
          Documents under review
        </h2>
        <p className="mx-auto mt-4 max-w-4xl text-[18px] text-[#37365e]">
          You will receive an email within 24-48 hours. In the meantime,
          complete the AI language assessment to speed up your activation.
        </p>
      </section>
    );
  }

  if (verificationStatus === "approved") {
    return (
      <section className="rounded-[18px] border border-[#b9dca0] bg-white px-8 py-14 text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[22px] bg-[#eefbdc] text-[#41651f]">
          <CheckCircle2 className="h-11 w-11" />
        </div>
        <h2 className="text-[50px] font-semibold text-[#0e0d3f]">
          Documents approved
        </h2>
        <p className="mx-auto mt-4 max-w-4xl text-[18px] text-[#37365e]">
          Your verification documents are saved and approved. You can continue
          with the language assessment and profile details.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[18px] border border-[#c7c6dc] bg-white p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-[38px] font-semibold text-[#111041]">
              Identity Documents
            </h2>
            <p className="mt-1 text-[17px] text-[#33325b]">
              Verified guide badge enables you create tours
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-[#f1f1fb] px-4 py-2 text-sm text-[#252451]">
            <CheckCircle2 className={BADGE_ICON_CLASS} />
            Unlocked once your document is reviewed.
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <UploadCard
            title="Upload National ID"
            subtitle="MyID.JPG, PNG or PDF. max 10MB"
            uploadedAsset={assets.nationalId}
            busy={uploadingField === "nationalId"}
            onClick={() => openFilePicker("nationalId")}
          />

          <UploadCard
            title="Tourism / Guide License ID"
            subtitle="Official Ministry of Tourism license"
            uploadedAsset={assets.tourismLicense}
            busy={uploadingField === "tourismLicense"}
            onClick={() => openFilePicker("tourismLicense")}
          />
        </div>
      </section>

      <section className="rounded-[18px] border border-[#c7c6dc] bg-white p-8">
        <h2 className="text-[38px] font-semibold text-[#111041]">
          Media Uploads
        </h2>
        <p className="mt-1 text-[17px] text-[#33325b]">
          A friendly face and short intro help travelers pick you with
          confidence.
        </p>

        <div className="mt-7 grid gap-5 md:grid-cols-[220px_1fr]">
          <UploadCircleCard
            title="Profile image"
            uploadedAsset={assets.profilePhoto}
            busy={uploadingField === "profilePhoto"}
            onClick={() => openFilePicker("profilePhoto")}
          />

          <UploadCard
            icon={<Video className={PRIMARY_ICON_CLASS} />}
            title="Introduction video"
            subtitle="30 - 60 sec self-intro . mp4/mov"
            uploadedAsset={assets.introductionVideo}
            busy={uploadingField === "introductionVideo"}
            onClick={() => openFilePicker("introductionVideo")}
          />
        </div>
      </section>

      <input
        ref={nationalIdInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(event) =>
          handleUpload("nationalId", event.target.files?.[0], "image")
        }
      />
      <input
        ref={licenseInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(event) =>
          handleUpload("tourismLicense", event.target.files?.[0], "image")
        }
      />
      <input
        ref={profilePhotoInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png"
        onChange={(event) =>
          handleUpload("profilePhoto", event.target.files?.[0], "image")
        }
      />
      <input
        ref={introVideoInputRef}
        type="file"
        className="hidden"
        accept="video/mp4,video/quicktime"
        onChange={(event) =>
          handleUpload("introductionVideo", event.target.files?.[0], "video")
        }
      />
    </div>
  );
};

const UploadCard = ({
  icon,
  title,
  subtitle,
  uploadedAsset,
  busy,
  onClick,
}) => {
  if (uploadedAsset?.secureUrl) {
    const isImage = !/\.pdf(?:$|\?)/i.test(uploadedAsset.secureUrl);

    return (
      <div className="overflow-hidden rounded-[14px] border border-[#d5d4e4] bg-[#f7f6fc] p-4">
        <div className="grid h-44 place-items-center overflow-hidden rounded-xl border border-[#d1d0df] bg-white">
          {isImage ? (
            <img
              src={uploadedAsset.secureUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <FileCheck2 className="h-16 w-16 text-[#161594]" />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#141342]">{title}</p>
            <p className="mt-1 truncate text-xs text-[#777594]">
              {uploadedAsset.name ?? uploadedAsset.publicId ?? "Uploaded"}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={`Replace ${title}`}
              onClick={onClick}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#161594] shadow-sm"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <a
              href={uploadedAsset.secureUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${title}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#161594] shadow-sm"
            >
              <Eye className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-56 w-full flex-col items-center justify-center rounded-[14px] border border-dashed border-[#afafc7] bg-[#fbfbff] p-5 text-center">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-col items-center"
      >
        {icon ?? <Upload className={PRIMARY_ICON_CLASS} />}
        <p className="mt-4 text-[25px] font-medium text-[#141342]">{title}</p>
        <p className="mt-1 text-[16px] text-[#9595aa]">{subtitle}</p>
      </button>
      <p className="mt-3 text-sm text-[#161594]">
        {busy
          ? "Uploading..."
          : uploadedAsset?.name
              ? `Uploaded: ${uploadedAsset.name}`
              : "Tap to upload"}
      </p>
    </div>
  );
};

const UploadCircleCard = ({
  title,
  uploadedAsset,
  busy,
  onClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#afafc7] bg-[#fbfbff] p-5 text-center">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center"
      >
        <div className="grid h-36 w-36 place-items-center overflow-hidden rounded-full border border-dashed border-[#afafc7]">
          {uploadedAsset?.secureUrl ? (
            <img
              src={uploadedAsset.secureUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Upload className={PRIMARY_ICON_CLASS} />
          )}
        </div>
        <p className="mt-4 text-[25px] font-medium text-[#141342]">
          {uploadedAsset ? "Replace" : "Upload"}
        </p>
        <p className="mt-1 text-[22px] text-[#131241]">{title}</p>
      </button>
      <p className="mt-3 text-sm text-[#161594]">
        {busy
          ? "Uploading..."
          : uploadedAsset?.name
              ? `Uploaded: ${uploadedAsset.name}`
              : "Tap to upload"}
      </p>
    </div>
  );
};

export default VerificationStep;
