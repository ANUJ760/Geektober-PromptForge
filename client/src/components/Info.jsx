const Info = () => {
  return (
    <section className="flex justify-center items-center mt-6">
      <div className="text-white bg-[#0A0F1E] px-6 py-12 md:px-14 lg:px-20 rounded-2xl border border-[#ffffff] max-w-5xl w-full text-center shadow-lg">
  
        <div className="inline-block border border-[#1C2233] rounded-full px-4 py-1 text-xs tracking-widest text-gray-300 mb-6">
          COMMUNITY PROMPT STUDIO & GALLERY
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold leading-snug mb-6">
          Share the{" "}
          <span className="bg-yellow-400 text-[#050A1A] px-3 rounded-md">
            prompts
          </span>{" "}
          behind the art. Discover trending AI images that inspire your next
          creation.
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Banana Prompts is the open gallery where AI artists share their secrets
          and curious fans discover what's possible. Browse the most-loved pieces,
          copy the exact prompts, and track the trends shaping generative art.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="border border-[#1C2233] rounded-3xl p-5 bg-[#0F1526]">
            <h3 className="text-xl font-bold">319+</h3>
            <p className="text-gray-400 text-sm mt-1">Prompts shared this week</p>
          </div>

          <div className="border border-[#1C2233] rounded-3xl p-5 bg-[#0F1526]">
            <h3 className="text-xl font-bold">283+</h3>
            <p className="text-gray-400 text-sm mt-1">Creators contributing</p>
          </div>

          <div className="border border-[#1C2233] rounded-3xl p-5 bg-[#0F1526]">
            <h3 className="text-xl font-bold">5.4K+</h3>
            <p className="text-gray-400 text-sm mt-1">Total likes given</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
