import { Twitter, Linkedin, Github } from 'lucide-react';

const FooterComponent = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 md:space-x-12">

          <div className="md:w-1/2">
            <span className="text-sm font-bold uppercase tracking-widest text-white bg-black/50 px-2 py-1 rounded-md mb-4 inline-block">
                Community Resources
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Why we share every prompt
            </h2>
            <p className="text-gray-300 text-lg">
              Banana Prompts exists to make the craft behind AI visuals transparent. We 
              publish settings, pacing notes, and lessons learned so everyone—from 
              curious fans to pro directors—can turn inspiration into their own story.
            </p>
          </div>

          <div className="md:w-1/2">
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-400 bg-black/50 px-2 py-1 rounded-md mb-4 inline-block">
                Share Your Art
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Submit your prompt and teach the community
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              Send your latest render with the prompt, settings, and story behind it. We 
              feature the most helpful breakdowns and credit every creator.
            </p>
            <a 
              href="#" 
              className="text-white font-medium text-lg border-b border-white hover:text-yellow-400 hover:border-yellow-400 transition duration-200"
            >
              Submit to the gallery
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">

          <p className="mb-4 md:mb-0">
            © 2025 <span className="text-white font-medium">Banana Prompts</span>
          </p>

          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition duration-200">Terms</a>
            <a href="#" className="hover:text-white transition duration-200">Privacy</a>
            <a href="#" className="hover:text-white transition duration-200">FAQ</a>
            <a href="#" className="hover:text-white transition duration-200">Contact</a>
            
            <div className="flex items-center space-x-4 ml-4">

              <a href="#" aria-label="Twitter" className="hover:text-white transition duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-white transition duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-white transition duration-200">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;