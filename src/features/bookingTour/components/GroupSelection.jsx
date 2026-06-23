import { useState, useEffect } from 'react';
import { Users, Minus, Plus, Upload, Loader2, CheckCircle2, X } from 'lucide-react';
// Import your direct Cloudinary upload utility
import { uploadProfilePhotoToCloudinary } from '@/features/touristProfile/services/cloudinaryUpload'; 

export default function GroupSelection({ 
  isOpen, 
  onClose, 
  onSave, 
  initialGroupSize = 2, 
  initialMembers = [],
  tourPrice = 50 // Default fallback price matching your UI card snippet
}) {
  const [groupSize, setGroupSize] = useState(initialGroupSize);
  const [members, setMembers] = useState([]);

  // 1. Sync values on initialization when the modal opens
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
    }
  }, [isOpen, initialGroupSize]); 

  // 2. Dynamic Scaling: Add/remove empty guest rows when clicking + or - without resetting typed names
  useEffect(() => {
    if (!isOpen) return;
    
    const additionalNeeded = Math.max(0, groupSize - 1);
    
    setMembers(prev => {
      if (prev.length < additionalNeeded) {
        const updated = [...prev];
        while (updated.length < additionalNeeded) {
          updated.push({
            id: Math.random().toString(),
            fullName: '',
            idDocument: null,
            uploading: false
          });
        }
        return updated;
      } else if (prev.length > additionalNeeded) {
        return prev.slice(0, additionalNeeded);
      }
      return prev;
    });
  }, [groupSize, isOpen]);

  // Dynamic values helper to update your Top Badge Card on the fly
  const getBadgeMeta = () => {
    if (groupSize === 1) {
      return { tier: "Private", label: "1 Guest" };
    } else if (groupSize <= 4) {
      return { tier: "Small group", label: "2-4 Guest" };
    } else {
      return { tier: "Large group", label: "5+ Guests" };
    }
  };

  const badgeMeta = getBadgeMeta();

  // Cloudinary image uploader handler
  const handleFileUpload = async (memberId, file) => {
    if (!file) return;

    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, uploading: true } : m));

    try {
      const cloudAsset = await uploadProfilePhotoToCloudinary(file);
      
      // Save { secureUrl, publicId } to conform directly with backend models
      setMembers(prev => prev.map(m => 
        m.id === memberId 
          ? { ...m, idDocument: cloudAsset, uploading: false } 
          : m
      ));
    } catch (error) {
      console.error("ID upload failed:", error);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, uploading: false } : m));
      alert("Failed to upload ID photo. Please try again.");
    }
  };

  const handleMemberNameChange = (memberId, name) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, fullName: name } : m));
  };

  const handleSaveClick = () => {
    // Structural validation formatting to match your backend payload layout perfectly
    const backendMembersArray = members.map(m => ({
      fullName: m.fullName,
      idDocument: m.idDocument 
    }));

    onSave({
      groupSize,
      members: backendMembersArray
    });

    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-xl relative flex flex-col gap-6 my-auto">
        
        {/* Modal Dismiss Trigger Button */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Window Heading Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
    

          {/* Your Top Badge Card - Now Connected and Reactive */}
          <div className="bg-[#000066] text-white rounded-2xl p-4 w-full sm:max-w-xs shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold tracking-widest text-slate-300 uppercase block mb-0.5">
                  {badgeMeta.label}
                </span>
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
        </div>

        {/* Group Counter Input Control */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="font-semibold text-slate-700 text-sm">Total Tour Guests</span>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setGroupSize(prev => Math.max(1, prev - 1))}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40"
              disabled={groupSize <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-lg text-slate-800 w-5 text-center select-none">{groupSize}</span>
            <button 
              type="button"
              onClick={() => setGroupSize(prev => prev + 1)}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Guest Additional Fields List */}
        <div className="flex flex-col gap-3.5 max-h-[260px] overflow-y-auto pr-1">
          {members.map((member, index) => (
            <div key={member.id} className="flex items-center gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="flex-1">
                <input
                  type="text"
                  value={member.fullName}
                  onChange={(e) => handleMemberNameChange(member.id, e.target.value)}
                  placeholder={`Guest #${index + 2} Full Name`}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:border-slate-400 focus:ring-0 outline-none transition-colors"
                />
              </div>

              {/* Cloudinary File Handling Block */}
              <label className="flex items-center gap-2 cursor-pointer group min-w-[120px] justify-end select-none">
                <span className="text-xs font-semibold text-[#4D4D99] group-hover:text-[#333399] transition-colors whitespace-nowrap">
                  {member.idDocument ? "Uploaded" : member.uploading ? "Uploading..." : "Upload ID"}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  member.idDocument ? 'bg-emerald-100 text-emerald-600' : 'bg-[#EAEAF5] hover:bg-[#DEDEEF] text-[#000066]'
                }`}>
                  {member.uploading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : member.idDocument ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Upload size={15} />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  disabled={member.uploading}
                  onChange={(e) => handleFileUpload(member.id, e.target.files[0])}
                />
              </label>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-200/20">
              <p className="text-xs font-medium text-slate-400">Solo Tour Configuration (No extra IDs needed)</p>
            </div>
          )}
        </div>

        {/* Form Action Submit Control Button */}
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={members.some(m => m.uploading)}
          className="w-full py-3.5 bg-[#000066] text-white font-semibold text-sm rounded-xl hover:bg-[#000055] transition-all disabled:opacity-40 shadow-sm"
        >
          Confirm Group Data
        </button>
      </div>
    </div>
  );
}