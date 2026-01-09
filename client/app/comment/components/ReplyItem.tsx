import { Heart } from "lucide-react";
import { Reply } from "../types/types";




// --- Reply Item Component ---
interface ReplyItemProps {
  reply: Reply;
  onLike: () => void;
}

export const ReplyItem = ({ reply, onLike }: ReplyItemProps) => (
  <div className="flex gap-3">
    <img src={reply.userAvatar} className="w-7 h-7 rounded-full bg-slate-800" alt={reply.username} />
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xs text-slate-300">{reply.username}</span>
        <span className="text-[10px] text-slate-600">• Just now</span>
      </div>
      <p className="text-slate-400 text-sm mt-0.5">{reply.content}</p>
      <button
        onClick={onLike}
        className={`mt-2 flex items-center gap-1 text-[10px] transition-colors ${
          reply.isLiked ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-red-400'
        }`}
      >
        <Heart size={10} fill={reply.isLiked ? "currentColor" : "none"} />
        {reply.likes}
      </button>
    </div>
  </div>
);
