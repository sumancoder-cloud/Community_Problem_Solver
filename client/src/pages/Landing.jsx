import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Users, TrendingUp, Zap } from 'lucide-react';
import whatsappHero from '../assets/WhatsApp Image 2026-04-27 at 10.37.14 PM.jpeg';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Navbar */}
      <nav className="bg-white border-b-2 border-[#d1fae5] py-5 sticky top-0 z-50 shadow-sm">
        <div className=" mx-auto px-4 flex items-center justify-between">

          <h1 className="text-[#10b981] text-[2rem] font-bold">
            Community Problem Solver
          </h1>

          {/* keep horizontal on desktop */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 border-2 border-[#10b981] text-[#10b981] rounded-lg font-semibold hover:bg-[#d1fae5] transition"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-[#10b981] text-white rounded-lg font-semibold hover:bg-[#059669] transition"
            >
              Get Started
            </button>

          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left */}
        <div>
          <h1 className="text-[3rem] font-bold text-[#065f46] leading-tight mb-6">
            Solve Community Problems Together
          </h1>

          <p className="text-xl text-gray-500 mb-8 leading-relaxed">
            Report local issues, suggest solutions, and collaborate with your
            community to build a better tomorrow.
          </p>

          {/* buttons should not stretch full width */}
          <div className="flex flex-wrap gap-4">

            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-[#10b981] text-white rounded-lg font-semibold hover:bg-[#059669] transition inline-flex items-center gap-2"
            >
              Start Solving Issues
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-[#10b981] text-[#10b981] rounded-lg font-semibold hover:bg-[#d1fae5] transition"
            >
              View Problems
            </button>

          </div>
        </div>

        {/* Right media */}
        <div className="w-full h-[500px] rounded-xl border-[3px] border-[#10b981]/30 bg-[#ecfdf5] overflow-hidden flex items-center justify-center">
          <img
            src={whatsappHero}
            alt="Community support"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

      </section>

      {/* Features */}
      <section className="bg-gray-100 px-4 py-16">
        <div className="max-w-[1200px] mx-auto">

          <h2 className="text-[2.5rem] md:text-[1.75rem] text-[#065f46] text-center font-bold mb-12">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {[
              {
                icon: <MapPin size={32} />,
                title: 'Location Based',
                text: 'Report problems specific to your locality and view issues near you on an interactive map.',
                color: 'bg-[#10b981]'
              },
              {
                icon: <Users size={32} />,
                title: 'Community Driven',
                text: 'Engage with neighbors, suggest solutions, and vote for the best ideas that make impact.',
                color: 'bg-blue-500'
              },
              {
                icon: <TrendingUp size={32} />,
                title: 'Track Progress',
                text: 'Monitor the status of reported problems from open to completion and celebrate wins together.',
                color: 'bg-[#10b981]'
              },
              {
                icon: <Zap size={32} />,
                title: 'AI Suggestions',
                text: 'Get intelligent suggestions powered by AI to solve problems faster and more effectively.',
                color: 'bg-amber-500'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-xl border-2 border-gray-300 text-center hover:border-[#10b981] hover:shadow-[0_8px_24px_rgba(16,185,129,.15)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-[70px] h-[70px] rounded-xl ${item.color} text-white flex items-center justify-center mx-auto mb-4`}>
                  {item.icon}
                </div>

                <h3 className="text-[1.3rem] font-semibold mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-500 leading-[1.6]">
                  {item.text}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-4 py-16">
        <div className="max-w-[1200px] mx-auto">

          <h2 className="text-[2.5rem] md:text-[1.75rem] text-[#065f46] text-center font-bold mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

            {[
              ['1', 'Register & Verify'],
              ['2', 'Report Issues'],
              ['3', 'Suggest Solutions'],
              ['4', 'Vote & Collaborate'],
              ['5', 'Track Progress'],
              ['6', 'Get Notified']
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white to-[#d1fae5] p-8 rounded-xl border-2 border-[#d1fae5] hover:border-[#10b981] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,185,129,.15)] transition-all duration-300"
              >
                <div className="w-[50px] h-[50px] rounded-full bg-[#10b981] text-white flex items-center justify-center text-[1.5rem] font-bold mb-4">
                  {item[0]}
                </div>

                <h3 className="text-[1.2rem] font-semibold mb-3">
                  {item[1]}
                </h3>

                <p className="text-gray-500 leading-[1.6]">
                  Community collaboration made simple and effective.
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-[#10b981] to-[#065f46] px-4 py-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">

          {[
            ['1000+', 'Issues Reported'],
            ['500+', 'Solutions Proposed'],
            ['250+', 'Problems Resolved'],
            ['5000+', 'Active Users']
          ].map((item, i) => (
            <div key={i}>
              <h3 className="text-[3rem] font-bold mb-2 text-white">
                {item[0]}
              </h3>
              <p className="text-[#d1fae5] text-[1.1rem]">
                {item[1]}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#d1fae5] px-4 py-16 text-center">
        <div className="max-w-[900px] mx-auto">

          <h2 className="text-[2.5rem] md:text-[1.75rem] font-bold text-[#065f46] mb-4">
            Ready to Make a Difference?
          </h2>

          <p className="text-[1.2rem] text-gray-500 mb-8">
            Join thousands of community members working together to solve local problems.
          </p>

          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 text-[1.1rem] bg-[#10b981] border-2 border-[#10b981] text-white rounded-md font-medium hover:bg-[#059669] hover:border-[#059669] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(16,185,129,.3)] transition-all duration-300 inline-flex items-center gap-2"
          >
            Join Now
            <ArrowRight size={20} />
          </button>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white px-4 pt-12 pb-4">

        <div className="max-w-[1200px] mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

            <div>
              <h4 className="text-[#10b981] mb-4 font-semibold">
                About CPS
              </h4>

              <p className="text-gray-300 leading-[1.6]">
                Community Problem Solver is a platform dedicated to empowering communities through collaborative problem-solving and transparent tracking.
              </p>
            </div>

            <div>
              <h4 className="text-[#10b981] mb-4 font-semibold">
                Quick Links
              </h4>

              <ul className="space-y-2 text-gray-300">
                <li><a href="#">Features</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#10b981] mb-4 font-semibold">
                Contact
              </h4>

              <p className="text-gray-300">
                Email: support@communityproblemsolver.com
              </p>
            </div>

          </div>

          {/* <div className="border-t border-gray-700 my-8"></div> */}

          <div className="text-center">

            {/* <h4 className="text-[#10b981] text-[1.3rem] mb-6 font-semibold">
              Developed By
            </h4>

            <div className="flex md:flex-col flex-wrap justify-center gap-4 mb-8">

              {['Suman', 'Charan', 'Dharma Teja', 'Monika', 'Mohan'].map((dev, i) => (
                <span
                  key={i}
                  className="bg-[#10b981] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#065f46] hover:scale-105 transition-all duration-300"
                >
                  {dev}
                </span>
              ))}

            </div> */}

            <div className="border-t border-gray-700 pt-4 text-gray-400">
              © 2026 Community Problem Solver. All rights reserved.
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;