import diamondIcon from "../../assets/icons/diamond-icon.svg";

const baseItems = ["ART", "MUSIC", "SCULPTURE", "HANDMADE", "PAINTING"];

const items = [...baseItems, ...baseItems, ...baseItems, ...baseItems];

function ScrollingRow({ hidden = false }) {
  return (
    <div
      className="flex shrink-0 animate-[marquee_89.1s_linear_infinite] flex-row items-center gap-8 pr-8"
      aria-hidden={hidden}
    >
      {items.map((text, index) => (
        <div key={index} className="flex items-center gap-8">
          <span className="text-white text-2xl font-bold uppercase hover:opacity-80 transition-all">
            {text}
          </span>
          <img src={diamondIcon} alt="" className="h-6 w-auto" />
        </div>
      ))}
    </div>
  );
}

const ScrollingText = () => {
  return (
    <div className="bg-black py-6 border-y border-gray-800 overflow-hidden flex">
      <ScrollingRow />
      <ScrollingRow hidden />
    </div>
  );
};

export default ScrollingText;
