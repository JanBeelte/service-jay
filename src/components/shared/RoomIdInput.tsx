import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function RoomIdInput() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (id.length === 6) {
      navigate(`/guest/${id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        maxLength={6}
        placeholder="ENTER CODE"
        className="w-full text-center text-2xl font-mono tracking-[0.3em] uppercase bg-slate-800 border border-slate-600 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
      />
      <button
        type="submit"
        disabled={value.trim().length !== 6}
        className="w-full py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        Join Room
      </button>
    </form>
  );
}
