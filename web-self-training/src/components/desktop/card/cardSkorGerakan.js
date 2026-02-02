export default function CardSkorGerakan({ namaGerakan = "", skorGerakan = 0 }) {
  return (
    <div className="flex justify-between items-center p-4 m-2 bg-white rounded-xl shadow border border-[#87B5DF] w-full">
      <span className="text-black">{namaGerakan}</span>
      <span className="text-black font-bold">{skorGerakan}</span>
    </div>
  );
}
