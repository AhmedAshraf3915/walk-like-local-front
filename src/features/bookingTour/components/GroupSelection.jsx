import { useState, useEffect } from 'react';
import { Users, Minus, Plus, Upload, Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { uploadProfilePhotoToCloudinary } from '@/features/touristProfile/services/cloudinaryUpload'; 

export default function GroupSelection({ 
  isOpen, 
  onClose, 
  onSave, 
  initialGroupSize = 2, 
  initialMembers = [],
  tourPrice = 50,
  groupType
}) {
  const [groupSize, setGroupSize] = useState(initialGroupSize);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null); // Local error state

  const GROUP_LIMITS = {
    SMALL_GROUP: { min: 2, max: 4 },
    LARGE_GROUP: { min: 5, max: 8 },
  };

  const limits = GROUP_LIMITS[groupType] || { min: 1, max: 1 };

  useEffect(() => {
    if (isOpen) {
      setGroupSize(initialGroupSize);
      const additionalNeeded = Math.max(0, initialGroupSize - 1);
      let startingMembers = [...initialMembers];
      
      if (startingMembers.length < additionalNeeded) {
        while (startingMembers.length < additionalNeeded) {
          startingMembers.push({ id: Math.random().toString(), fullName: '', idDocument: null });
        }
      } else if (startingMembers.length > additionalNeeded) {
        startingMembers = startingMembers.slice(0, additionalNeeded);
      }
      
      setMembers(startingMembers.map((m, i) => ({
        id: m.id || `init-${i}`,
        fullName: m.fullName || '',
        idDocument: m.idDocument || null,
        uploading: false
      })));
      setError(null);
    }
  }, [isOpen, initialGroupSize]);

  useEffect(() => {
    if (!isOpen) return;
    const additionalNeeded = Math.max(0, groupSize - 1);
    setMembers(prev => {
      if (prev.length < additionalNeeded) {
        const updated = [...prev];
        while (updated.length < additionalNeeded) {
          updated.push({ id: Math.random().toString(), fullName: '', idDocument: null, uploading: false });
        }
        return updated;
      } else if (prev.length > additionalNeeded) {
        return prev.slice(0, additionalNeeded);
      }
      return prev;
    });
  }, [groupSize, isOpen]);

  const getBadgeMeta = () => {
    if (groupSize === 1) return { tier: "Private", label: "1 Guest" };
    if (groupSize <= 4) return { tier: "Small group", label: "2-4 Guests" };
    return { tier: "Large group", label: "5+ Guests" };
  };

  const badgeMeta = getBadgeMeta();

  const handleFileUpload = async (memberId, file) => {
    if (!file) return;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, uploading: true } : m));
    try {
      const cloudAsset = await uploadProfilePhotoToCloudinary(file);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, idDocument: cloudAsset, uploading: false } : m));
      setError(null);
    } catch (err) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, uploading: false } : m));
      setError("Failed to upload ID photo. Please try again.");
    }
  };

  const handleMemberNameChange = (memberId, name) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, fullName: name } : m));
  };

  const handleSaveClick = () => {
    // Human-friendly validation
    const isInvalid = members.some(m => !m.fullName.trim() || !m.idDocument);
    if (isInvalid) {
      setError("Please ensure every guest has a name and an uploaded ID document.");
      return;
    }

    onSave({
      groupSize,
      members: members.map(m => ({ fullName: m.fullName, idDocument: m.idDocument }))
    });
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-xl relative flex flex-col gap-6 my-auto">
        <button type="button" onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>

        <div className="bg-[#000066] text-white rounded-2xl p-4 w-full sm:max-w-xs shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-slate-300 uppercase block mb-0.5">{badgeMeta.label}</span>
              <h3 className="text-base font-bold">{badgeMeta.tier}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block mb-0.5">From</span>
              <p className="text-base font-bold text-amber-400">
                ${tourPrice} <span className="text-[10px] font-normal text-slate-300">USD</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="font-semibold text-slate-700 text-sm">Total Tour Guests</span>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setGroupSize(prev => Math.max(limits.min, prev - 1))} className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-600 disabled:opacity-40" disabled={groupSize <= limits.min}>
              <Minus size={16} />
            </button>
            <span className="font-bold text-lg text-slate-800 w-5 text-center">{groupSize}</span>
            <button type="button" onClick={() => setGroupSize(prev => Math.min(limits.max, prev + 1))} className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-600">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 max-h-[260px] overflow-y-auto pr-1">
          {members.map((member, index) => (
            <div key={member.id} className="flex items-center gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">
              <input type="text" value={member.fullName} onChange={(e) => handleMemberNameChange(member.id, e.target.value)} placeholder={`Guest #${index + 2} Full Name`} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-[#4D4D99]">{member.idDocument ? "Uploaded" : "Upload ID"}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.idDocument ? 'bg-emerald-100 text-emerald-600' : 'bg-[#EAEAF5] text-[#000066]'}`}>
                  {member.uploading ? <Loader2 size={15} className="animate-spin" /> : member.idDocument ? <CheckCircle2 size={15} /> : <Upload size={15} />}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(member.id, e.target.files[0])} />
              </label>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button type="button" onClick={handleSaveClick} className="w-full py-3.5 bg-[#000066] text-white font-semibold text-sm rounded-xl hover:bg-[#000055]">
          Confirm Group Data
        </button>
      </div>
    </div>
  );
}