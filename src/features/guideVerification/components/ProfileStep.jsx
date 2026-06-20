const ProfileStep = ({
  profile,
  profileSkips,
  experienceOptions,
  interestOptions,
  onBioChange,
  onExperienceChange,
  onToggleProfileSkip,
  onToggleInterest,
}) => {
  const bioCount = profile.bio.length;

  return (
    <div className="space-y-8">
      <section className="rounded-[18px] border border-[#c7c6dc] bg-white p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-[38px] font-semibold text-[#111041]">
            Bio / About
          </h2>
          <button
            type="button"
            onClick={() => onToggleProfileSkip("bio")}
            className={`rounded-full border px-4 py-2 text-sm ${
              profileSkips.bio
                ? "border-[#17169d] bg-[#f1f0ff] text-[#17169d]"
                : "border-[#bebdd2] text-[#35345d]"
            }`}
          >
            {profileSkips.bio ? "Skipped" : "Skip"}
          </button>
          <p className="text-[24px] text-[#8888a4]">{bioCount} / 400</p>
        </div>

        <textarea
          value={profile.bio}
          onChange={(event) => onBioChange(event.target.value.slice(0, 400))}
          placeholder="Born and raised in Cairo, I love taking travelers beyond the pyramids - into the alleys of Islamic Cairo, hidden Nile cafes, and family run koshary spots ..."
          className="h-48 w-full rounded-[18px] border border-[#c8c8da] px-5 py-4 text-[18px] text-[#181746] outline-none placeholder:text-[#b1b1c3] focus:border-[#7070ad]"
        />
      </section>

      <section className="rounded-[18px] border border-[#c7c6dc] bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[38px] font-semibold text-[#111041]">
            Experiences
          </h2>
          <button
            type="button"
            onClick={() => onToggleProfileSkip("yearsOfExperience")}
            className={`rounded-full border px-4 py-2 text-sm ${
              profileSkips.yearsOfExperience
                ? "border-[#17169d] bg-[#f1f0ff] text-[#17169d]"
                : "border-[#bebdd2] text-[#35345d]"
            }`}
          >
            {profileSkips.yearsOfExperience ? "Skipped" : "Skip"}
          </button>
        </div>
        <label className="mt-4 block text-[24px] font-medium text-[#232252]">
          Years of Experience
        </label>
        <select
          className="mt-3 w-full max-w-xl rounded-[16px] border border-[#cbcbdd] px-5 py-4 text-[18px] text-[#171646]"
          value={profile.yearsOfExperience}
          onChange={(event) => onExperienceChange(event.target.value)}
        >
          <option value="">Choose years of experience</option>
          {experienceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-[18px] border border-[#c7c6dc] bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[38px] font-semibold text-[#111041]">
            Interests
          </h2>
          <button
            type="button"
            onClick={() => onToggleProfileSkip("interests")}
            className={`rounded-full border px-4 py-2 text-sm ${
              profileSkips.interests
                ? "border-[#17169d] bg-[#f1f0ff] text-[#17169d]"
                : "border-[#bebdd2] text-[#35345d]"
            }`}
          >
            {profileSkips.interests ? "Skipped" : "Skip"}
          </button>
        </div>
        <p className="mt-1 text-[17px] text-[#33325b]">
          Pick your interests to help us match travelers to your style.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {interestOptions.map((interest) => {
            const active = profile.interests.includes(interest);

            return (
              <button
                key={interest}
                type="button"
                onClick={() => onToggleInterest(interest)}
                className={`rounded-full border px-5 py-2 text-[16px] transition ${
                  active
                    ? "border-[#17169d] bg-[#17169d] text-white"
                    : "border-[#bdbdcf] bg-white text-[#2b2a52]"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ProfileStep;
