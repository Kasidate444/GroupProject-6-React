import { useState } from "react";
import mainCoverImg from "../../assets/landing-page/cxa.jpg";
import articleOneImg from "../../assets/landing-page/babymonster-monstersกรณีศึกษา.png";
import articleTwoImg from "../../assets/landing-page/indie-artists.jpg";
import ArticleModal from "./ArticleModal";

const mainArticle = {
  img: mainCoverImg,
  title: "Audtlist and Creative Market Announce Strategic Partnership",
  date: "5 June 2026",
  body: [
    "Audtlist and Creative Market have announced a strategic partnership aimed at empowering independent creators worldwide. By bringing together musicians, artists, designers, and makers, the collaboration seeks to create new opportunities for creators to showcase their work, grow their audiences, and generate sustainable income.",
    "Through Audtlist, artists can sell music, merchandise, and receive direct support from fans while maintaining full ownership of their work. Combined with Creative Market's thriving marketplace for digital assets and creative products, the partnership strengthens the creator economy and helps independent talent turn their passion into a profession.",
  ],
};

const sideArticles = [
  {
    img: articleOneImg,
    title: "BABYMONSTER Returns With Highly Anticipated New Single",
    date: "25 May 2026",
    body: [
      "BABYMONSTER is making waves once again with the release of its highly anticipated new single. Showcasing a more mature sound while retaining the group's signature energy, the comeback has quickly captured the attention of fans worldwide and generated strong momentum across streaming platforms and social media.",
    ],
  },
  {
    img: articleTwoImg,
    title: "More Artists Choose Independence Over Traditional Deals",
    date: "10 June 2026",
    body: [
      "A growing number of musicians are choosing independent platforms that allow them to keep ownership of their music and merchandise. With direct fan support, transparent revenue sharing, and greater creative freedom, artists are finding new ways to build successful careers without relying solely on traditional record label models.",
    ],
  },
];

export default function DailyFeed() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openArticle = (article) => {
    setSelectedArticle(article);
    setIsOpen(true);
  };

  const closeArticle = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedArticle(null), 350);
  };

  return (
    <>
      <section className="mx-[5%] mb-8 mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#141420] shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:mx-[10%]">
        <div className="border-b border-white/10 px-8 pb-4 pt-6">
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[20px] font-bold leading-tight text-white md:text-[28px]">
            Audtlist Daily
          </h2>
        </div>

        <div className="flex flex-col md:flex-row">
          <article className="min-w-0 flex-3">
            <button
              className="group relative block w-full cursor-pointer overflow-hidden"
              onClick={() => openArticle(mainArticle)}
              aria-label={`Open ${mainArticle.title}`}
            >
              <img
                className="block aspect-16/10 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={mainArticle.img}
                alt={mainArticle.title}
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </button>
            <div className="px-8 py-6">
              <h2 className="mb-2 w-fit text-[21px] font-bold leading-tight">
                <button
                  className="cursor-pointer bg-transparent p-0 text-left text-white transition-colors duration-150 hover:text-white/60"
                  onClick={() => openArticle(mainArticle)}
                >
                  {mainArticle.title}
                </button>
              </h2>
              <h3 className="mb-3 font-['Plus_Jakarta_Sans',sans-serif] text-sm font-medium tracking-[0.04em] text-white/40">
                {mainArticle.date}
              </h3>
              <p className="max-w-[60ch] text-base leading-[1.7] text-white/60">
                {mainArticle.body[0]}
              </p>
            </div>
          </article>

          <div className="min-w-0 flex-[1.5] border-t border-white/10 md:ml-4 md:border-l md:border-t-0">
            {sideArticles.map((article) => (
              <article
                className="border-b border-white/10 last:border-b-0"
                key={article.title}
              >
                <button
                  className="group relative block w-full cursor-pointer overflow-hidden"
                  onClick={() => openArticle(article)}
                  aria-label={`Open ${article.title}`}
                >
                  <img
                    className="block aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={article.img}
                    alt={article.title}
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                </button>
                <h3 className="px-4 pt-3 text-base font-bold">
                  <button
                    className="cursor-pointer bg-transparent p-0 text-left text-white transition-colors duration-150 hover:text-white/60"
                    onClick={() => openArticle(article)}
                  >
                    {article.title}
                  </button>
                </h3>
                <p className="px-4 pt-1 font-['Plus_Jakarta_Sans',sans-serif] text-xs font-medium tracking-[0.04em] text-white/30">
                  {article.date}
                </p>
                <p className="px-4 py-2 text-sm leading-normal text-white/40">
                  {article.body[0]}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          isOpen={isOpen}
          onClose={closeArticle}
        />
      )}
    </>
  );
}
